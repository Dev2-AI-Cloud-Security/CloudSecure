
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');



// Swagger Configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'CloudSecure API',
      version: '1.0.0',
      description: 'API documentation for CloudSecure',
      contact: {
        name: 'CloudSecure Team',
        email: 'support@cloudsecure.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3031',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server.js'], // Path to the API docs
};


AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const app = express();

app.use(cors());

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
console.log('Swagger documentation available at /api-docs');

app.use(express.json());

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const cloudwatchlogs = new AWS.CloudWatchLogs();

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://admin:secret@localhost:27017/cloudsecure?authSource=admin';
    console.log('Connecting to MongoDB at:', mongoURI);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Create Default User
const createDefaultUser = async () => {
  try {
    const defaultUsername = 'admin';
    const defaultPassword = '1234';

    const existingUser = await User.findOne({ username: defaultUsername });
    if (existingUser) {
      console.log('Default user "admin" already exists');
      return;
    }

    const newUser = new User({
      username: defaultUsername,
      password: defaultPassword,
    });
    await newUser.save();
    console.log('Default user "admin" created with password "1234"');
  } catch (error) {
    console.error('Error creating default user:', error.message);
  }
};

// Initialize Database and Default User
const initialize = async () => {
  await connectMongoDB();
  await createDefaultUser();
};
initialize();

// Create Log Group and Stream for CloudWatch Logs
const logGroupName = '/aws/waf/security-logs';
const logStreamName = 'demo-stream';

const setupLogGroupAndStream = async () => {
  try {
    await cloudwatchlogs.createLogGroup({ logGroupName }).promise();
    console.log('Log group created');
  } catch (error) {
    if (error.code !== 'ResourceAlreadyExistsException') throw error;
  }

  try {
    await cloudwatchlogs.createLogStream({
      logGroupName,
      logStreamName,
    }).promise();
    console.log('Log stream created');
  } catch (error) {
    if (error.code !== 'ResourceAlreadyExistsException') throw error;
  }
};

// Generate Dummy WAF Log Data
const generateDummyLogs = async () => {
  const actions = ['BLOCK', 'ALLOW'];
  const rules = ['SQLInjectionRule', 'XSSRule', 'DefaultRule'];
  const uris = ['/login', '/api/users', '/dashboard', '/submit'];
  const methods = ['GET', 'POST', 'PUT'];

  const logEvents = [];
  const now = Date.now();
  const oneDayInMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 100; i++) {
    const timestamp = now - (i * oneDayInMs) / 100;
    const logEntry = {
      timestamp: new Date(timestamp).toISOString(),
      action: actions[Math.floor(Math.random() * actions.length)],
      httpRequest: {
        uri: uris[Math.floor(Math.random() * uris.length)],
        clientIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
        method: methods[Math.floor(Math.random() * methods.length)],
      },
      terminatingRuleId: rules[Math.floor(Math.random() * rules.length)],
    };

    logEvents.push({
      message: JSON.stringify(logEntry),
      timestamp: timestamp,
    });
  }

  logEvents.sort((a, b) => a.timestamp - b.timestamp);

  try {
    await cloudwatchlogs.putLogEvents({
      logGroupName,
      logStreamName,
      logEvents,
    }).promise();
    console.log('Dummy logs sent to CloudWatch');
  } catch (error) {
    console.error('Error sending dummy logs:', error);
  }
};

// Initialize CloudWatch Logs
const initializeCloudWatch = async () => {
  await setupLogGroupAndStream();
  await generateDummyLogs();
};
initializeCloudWatch();

// Middleware to Verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecretKey');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Helper function to run a CloudWatch Logs Insights query
const runInsightsQuery = async (queryString, startTime, endTime) => {
  const params = {
    queryString,
    startTime,
    endTime,
    logGroupNames: [logGroupName],
  };

  try {
    const queryResponse = await cloudwatchlogs.startQuery(params).promise();
    const queryId = queryResponse.queryId;

    let results;
    while (true) {
      const resultResponse = await cloudwatchlogs.getQueryResults({
        queryId,
      }).promise();

      if (resultResponse.status === 'Complete') {
        results = resultResponse.results;
        break;
      } else if (resultResponse.status === 'Failed' || resultResponse.status === 'Cancelled') {
        throw new Error('Query failed or was cancelled');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  } catch (error) {
    console.error('Error running CloudWatch Logs Insights query:', error);
    throw error;
  }
};

// API Endpoints

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Username already exists
 *       500:
 *         description: Error registering user
 */
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (await User.findOne({ username })) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});


/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Error logging in
 */
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'defaultSecretKey',
      { expiresIn: '1h', issuer: 'CloudSecure' }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username },
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error('Error in loginUser:', error.message);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Protected Endpoints
/**
 * @swagger
 * /api/threats:
 *   get:
 *     summary: Get threat data
 *     tags: [Threats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of threats
 *       401:
 *         description: Access token required
 *       500:
 *         description: Failed to fetch threats
 */
app.get('/api/threats', authenticateToken, async (req, res) => {
  try {
    const queryString = `
      fields @timestamp, action
      | filter action = 'BLOCK'
      | stats count(*) as threatCount by bin(1h)
      | sort @timestamp asc
    `;
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - 24 * 60 * 60;
    const results = await runInsightsQuery(queryString, startTime, endTime);

    const threats = results.map(row => {
      const timestampField = row.find(field => field.field === '@timestamp');
      const countField = row.find(field => field.field === 'threatCount');
      return {
        timestamp: timestampField ? timestampField.value : new Date().toISOString(),
        count: countField ? parseInt(countField.value) : 0,
      };
    });
    res.json(threats);
  } catch (error) {
    console.error('Error fetching threats:', error);
    res.status(500).json({ error: 'Failed to fetch threats' });
  }
});

/**
 * @swagger
 * /api/resolved-issues:
 *   get:
 *     summary: Get resolved issues
 *     tags: [Threats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of resolved issues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: string
 *                     description: Timestamp of the resolved issue
 *                   count:
 *                     type: integer
 *                     description: Number of resolved issues
 *       401:
 *         description: Access token required
 *       500:
 *         description: Failed to fetch resolved issues
 */
app.get('/api/resolved-issues', authenticateToken, async (req, res) => {
  try {
    const queryString = `
      fields @timestamp, action
      | filter action = 'ALLOW'
      | stats count(*) as resolvedCount by bin(3month)
      | sort @timestamp asc
    `;
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - 365 * 24 * 60 * 60;
    const results = await runInsightsQuery(queryString, startTime, endTime);

    const resolvedIssues = results.map(row => {
      const timestampField = row.find(field => field.field === '@timestamp');
      const countField = row.find(field => field.field === 'resolvedCount');
      return {
        timestamp: timestampField ? timestampField.value : new Date().toISOString(),
        count: countField ? parseInt(countField.value) : 0,
      };
    });
    res.json(resolvedIssues);
  } catch (error) {
    console.error('Error fetching resolved issues:', error);
    res.status(500).json({ error: 'Failed to fetch resolved issues' });
  }
});

/**
 * @swagger
 * /api/risk-levels:
 *   get:
 *     summary: Get risk levels
 *     tags: [Threats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Risk levels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   level:
 *                     type: string
 *                     description: Risk level (High, Medium, Low)
 *                   count:
 *                     type: integer
 *                     description: Number of occurrences for the risk level
 *       401:
 *         description: Access token required
 *       500:
 *         description: Failed to fetch risk levels
 */
app.get('/api/risk-levels', authenticateToken, async (req, res) => {
  try {
    // Rewrite the query without using 'case'
    const queryString = `
      fields action, terminatingRuleId
      | parse terminatingRuleId "SQL*" as isSQL
      | stats count(*) as riskCount by action, isSQL
      | sort action asc
    `;
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - 24 * 60 * 60;
    const results = await runInsightsQuery(queryString, startTime, endTime);

    // Transform the results into risk levels
    const riskLevels = results.map(row => {
      const actionField = row.find(field => field.field === 'action');
      const isSQLField = row.find(field => field.field === 'isSQL');
      const countField = row.find(field => field.field === 'riskCount');

      const action = actionField ? actionField.value : 'Unknown';
      const isSQL = isSQLField ? isSQLField.value : 'false';
      const count = countField ? parseInt(countField.value) : 0;

      let level = 'Unknown';
      if (action === 'BLOCK' && isSQL === 'true') {
        level = 'High';
      } else if (action === 'BLOCK') {
        level = 'Medium';
      } else if (action === 'ALLOW') {
        level = 'Low';
      }

      return {
        level,
        count,
      };
    });

    // Aggregate counts by level
    const aggregatedRiskLevels = riskLevels.reduce((acc, curr) => {
      const existing = acc.find(item => item.level === curr.level);
      if (existing) {
        existing.count += curr.count;
      } else {
        acc.push({ level: curr.level, count: curr.count });
      }
      return acc;
    }, []);

    res.json(aggregatedRiskLevels);
  } catch (error) {
    console.error('Error fetching risk levels:', error);
    res.status(500).json({ error: 'Failed to fetch risk levels' });
  }
});

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get recent alerts
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recent alerts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   incident:
 *                     type: string
 *                     description: Incident details
 *                   status:
 *                     type: string
 *                     description: Status of the alert (Ongoing or Resolved)
 *       401:
 *         description: Access token required
 *       500:
 *         description: Failed to fetch alerts
 */

app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const queryString = `
      fields @timestamp, action, terminatingRuleId, httpRequest.uri as uri
      | filter action in ['BLOCK', 'ALLOW']
      | stats count(*) as eventCount by action, terminatingRuleId, uri
      | sort @timestamp desc
      | limit 10
    `;
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - 24 * 60 * 60;
    const results = await runInsightsQuery(queryString, startTime, endTime);

    const alerts = results.map(row => {
      const actionField = row.find(field => field.field === 'action');
      const ruleField = row.find(field => field.field === 'terminatingRuleId');
      const uriField = row.find(field => field.field === 'uri');

      const action = actionField ? actionField.value : 'Unknown';
      const rule = ruleField ? ruleField.value : 'Unknown';
      const uri = uriField ? uriField.value : 'Unknown';

      return {
        incident: `${rule} (${uri})`,
        status: action === 'BLOCK' ? 'Ongoing' : 'Resolved',
      };
    });
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * @swagger
 * /save-terraform-config:
 *   post:
 *     summary: Save Terraform configuration
 *     tags: [Terraform]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               config:
 *                 type: string
 *                 description: Terraform configuration content
 *     responses:
 *       200:
 *         description: Terraform configuration saved successfully
 *       400:
 *         description: No configuration provided
 *       500:
 *         description: Failed to save configuration
 */
app.post('/save-terraform-config', (req, res) => {
  const { config } = req.body;

  if (!config) {
    return res.status(400).send('No configuration provided.');
  }

  const filePath = path.join(__dirname, 'terraform-config.tf');
  fs.writeFile(filePath, config, (err) => {
    if (err) {
      console.error('Error saving Terraform config:', err);
      return res.status(500).send('Failed to save configuration.');
    }
    res.send('Terraform configuration saved successfully.');
  });
});


const { exec } = require('child_process');

// Deploy API to run Terraform
/**
 * @swagger
 * /deploy:
 *   post:
 *     summary: Deploy resources using Terraform
 *     tags: [Terraform]
 *     responses:
 *       200:
 *         description: Terraform deployment completed successfully
 *       400:
 *         description: Terraform configuration file not found
 *       500:
 *         description: Failed to deploy resources
 */
app.post('/deploy', async (req, res) => {
  const terraformFilePath = path.join(__dirname, 'terraform-config.tf');

  // Check if the Terraform file exists
  if (!fs.existsSync(terraformFilePath)) {
    return res.status(400).send('Terraform configuration file not found.');
  }

  try {
    // Run Terraform commands
    exec(`terraform init && terraform apply -auto-approve`, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error running Terraform:', error.message);
        return res.status(500).send('Failed to deploy resources.');
      }

      if (stderr) {
        console.error('Terraform stderr:', stderr);
      }

      console.log('Terraform stdout:', stdout);
      res.send('Terraform deployment completed successfully.');
    });
  } catch (error) {
    console.error('Error deploying Terraform:', error.message);
    res.status(500).send('An error occurred while deploying resources.');
  }
});

// Start Server
const PORT = process.env.PORT || 3031;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});