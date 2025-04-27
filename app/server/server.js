require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Ensure bcrypt is imported
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const redis = require('redis');
const Counter = require('./models/Counter'); // Import the Counter model

const app = express();

const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    username: user.username,
  };

  const secretKey = process.env.JWT_SECRET || 'defaultSecretKey'; // Use a secure secret key
  const options = {
    expiresIn: '1h', // Token expiration time
  };

  return jwt.sign(payload, secretKey, options);
};

// CORS Configuration
const allowedOrigins = ['http://localhost:3030', 'http://localhost:3000']; // Add all allowed origins here

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      console.error(`CORS error: Origin ${origin} not allowed`);
      callback(new Error('Not allowed by CORS')); // Reject the request
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true, // Allow cookies and credentials
}));

app.use(express.json());

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

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
console.log('Swagger documentation available at /api-docs');



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
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the Authorization header

  if (!token) {
    console.error('No token provided in Authorization header');
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    // Verify the token and attach the decoded user to req.user
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecretKey', {
      algorithms: ['HS256'], // Specify the allowed algorithms
    });
    console.log('Decoded Token:', decoded); // Debug log
    req.user = decoded; // Attach the decoded user information to req.user
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Connect to Redis
(async () => {
  await redisClient.connect();
  console.log('✅ Connected to Redis');
})();

// Helper function to run a CloudWatch Logs Insights query with Redis caching
const runInsightsQueryWithCache = async (queryKey, queryString, startTime, endTime) => {
  const MAX_RETRIES = 5; // Maximum number of retries
  const RETRY_DELAY = 1000; // Initial delay in milliseconds

  try {
    // Check if the data is already cached in Redis
    const cachedData = await redisClient.get(queryKey);
    if (cachedData) {
      console.log(`Cache hit for key: ${queryKey}`);
      return JSON.parse(cachedData); // Return cached data
    }

    console.log(`Cache miss for key: ${queryKey}. Querying AWS CloudWatch Logs...`);

    // Run the CloudWatch Logs Insights query
    const params = {
      queryString,
      startTime,
      endTime,
      logGroupNames: [logGroupName],
    };

    const queryResponse = await cloudwatchlogs.startQuery(params).promise();
    const queryId = queryResponse.queryId;

    let results;
    let retries = 0;

    while (true) {
      try {
        const resultResponse = await cloudwatchlogs.getQueryResults({ queryId }).promise();

        if (resultResponse.status === 'Complete') {
          results = resultResponse.results;
          break;
        } else if (resultResponse.status === 'Failed' || resultResponse.status === 'Cancelled') {
          throw new Error('Query failed or was cancelled');
        }

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retrying
      } catch (error) {
        if (error.code === 'ThrottlingException' && retries < MAX_RETRIES) {
          retries++;
          const delay = RETRY_DELAY * Math.pow(2, retries); // Exponential backoff
          console.warn(`ThrottlingException: Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error; // Rethrow the error if retries are exhausted or it's not a throttling exception
        }
      }
    }

    // Cache the results in Redis with a TTL (e.g., 1 hour)
    await redisClient.set(queryKey, JSON.stringify(results), { EX: 3600 });

    return results;
  } catch (error) {
    console.error('Error running CloudWatch Logs Insights query with cache:', error);
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
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists.' });
  }

  // Create a new user
  const newUser = new User({ username, password });
  await newUser.save();

  res.status(201).json({ message: 'User registered successfully.' });
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
    const { username, password, email, googleId, isGoogleLogin } = req.body;

    if (isGoogleLogin) {
      // Handle Google login
      if (!email || !googleId) {
        return res.status(400).json({ message: 'Email and Google ID are required for Google login.' });
      }

      // Check if the user already exists
      let user = await User.findOne({ email });

      if (!user) {
        // If the user doesn't exist, create a new user
        user = new User({
          email,
          username: email, // Set email generateTokenas the username
          googleId,
          isGoogleLogin: true,
          password: 'xx', // Password is not needed for Google login
        });
        await user.save();
      }

      // Generate a token (you can use JWT or any other method)
      const token = generateToken(user); // Replace with your token generation logic

      return res.status(200).json({ token,
        user: { id: user._id, email: user.email, username: user.username },
        message: 'Logged in successfully', });
    } else {
      // Handle traditional login
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
      }

      const user = await User.findOne({ username });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid username or password.' });
      }

      // Generate a token (you can use JWT or any other method)
      const token = generateToken(user); // Replace with your token generation logic

      return res.json({
        token,
        user: { id: user._id, email: user.email, username: user.username },
        message: 'Logged in successfully',
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to log in.' });
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
app.get('/api/threats', async (req, res) => {
  try {
    const queryString = `
      fields @timestamp, action
      | filter action = 'BLOCK'
      | stats count(*) as threatCount by bin(1h)
      | sort @timestamp asc
    `;
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - 24 * 60 * 60;

    // Use a unique key for caching based on the query and time range
    const queryKey = `threats:${startTime}:${endTime}`;

    const results = await runInsightsQueryWithCache(queryKey, queryString, startTime, endTime);

    const threats = results.map((row) => {
      const timestampField = row.find((field) => field.field === '@timestamp');
      const countField = row.find((field) => field.field === 'threatCount');
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
app.get('/api/resolved-issues', async (req, res) => {
  try {
    const queryString = `
      fields @timestamp, action
      | filter action = 'ALLOW'
      | stats count(*) as resolvedCount by bin(3month)
      | sort @timestamp asc
    `;
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - 365 * 24 * 60 * 60;

    const queryKey = `resolved-issues:${startTime}:${endTime}`;
    const results = await runInsightsQueryWithCache(queryKey, queryString, startTime, endTime);

    const resolvedIssues = results.map((row) => {
      const timestampField = row.find((field) => field.field === '@timestamp');
      const countField = row.find((field) => field.field === 'resolvedCount');
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
app.get('/api/risk-levels', async (req, res) => {
  try {
    const queryString = `
      fields action, terminatingRuleId
      | parse terminatingRuleId "SQL*" as isSQL
      | stats count(*) as riskCount by action, isSQL
      | sort action asc
    `;
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - 24 * 60 * 60;

    const queryKey = `risk-levels:${startTime}:${endTime}`;
    const results = await runInsightsQueryWithCache(queryKey, queryString, startTime, endTime);

    const riskLevels = results.map((row) => {
      const actionField = row.find((field) => field.field === 'action');
      const isSQLField = row.find((field) => field.field === 'isSQL');
      const countField = row.find((field) => field.field === 'riskCount');

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

    const aggregatedRiskLevels = riskLevels.reduce((acc, curr) => {
      const existing = acc.find((item) => item.level === curr.level);
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

app.get('/api/alerts', async (req, res) => {
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

    const queryKey = `alerts:${startTime}:${endTime}`;
    const results = await runInsightsQueryWithCache(queryKey, queryString, startTime, endTime);

    const alerts = results.map((row) => {
      const actionField = row.find((field) => field.field === 'action');
      const ruleField = row.find((field) => field.field === 'terminatingRuleId');
      const uriField = row.find((field) => field.field === 'uri');

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
app.post('/save-terraform-config', async (req, res) => {
  const { userId, config } = req.body;

  if (!userId || !config) {
    return res.status(400).json({ message: 'User ID and Terraform configuration are required.' });
  }

  try {
    // Create a hidden Terraform directory for the user
    const terraformDir = path.join(__dirname, `.terraform-user-${userId}`);
    if (!fs.existsSync(terraformDir)) {
      fs.mkdirSync(terraformDir, { recursive: true });
      console.log(`Created Terraform directory for user: ${terraformDir}`);
    }

    // Save the Terraform configuration to a file
    const configFilePath = path.join(terraformDir, 'main.tf');
    fs.writeFileSync(configFilePath, config);
    console.log(`Terraform configuration saved to: ${configFilePath}`);

    res.status(200).json({ message: 'Terraform configuration saved successfully.' });
  } catch (error) {
    console.error('Error saving Terraform configuration:', error);
    res.status(500).json({ message: 'Failed to save Terraform configuration.' });
  }
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

  const { userId } = req.body;
  const terraformDir = path.join(__dirname, '.terraform-user-' + userId);
  const terraformFileName = 'main.tf';
  const terraformFilePath = path.join(terraformDir, terraformFileName); 

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  // Check if the Terraform file exists
  if (!fs.existsSync(terraformFilePath)) {
    return res.status(400).send('Terraform configuration file not found.');
  }

  try {
    // Run Terraform commands
    exec(`cd ${terraformDir} && terraform init && terraform apply -auto-approve`, (error, stdout, stderr) => {
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


app.get('/api/ec2-instances', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.ec2Instances || user.ec2Instances.length === 0) {
      return res.status(200).json([]); // Return an empty array if no instances are found
    }

    res.status(200).json(user.ec2Instances);
  } catch (error) {
    console.error('Error fetching EC2 instances:', error);
    res.status(500).json({ error: 'Failed to fetch EC2 instances' });
  }
});

app.delete('/api/ec2-instances/:instanceId', async (req, res) => {
  try {
    const { instanceId } = req.params;

    // Find and delete the instance from the user's EC2 instances
    const user = await User.findOneAndUpdate(
      { 'ec2Instances.instanceId': instanceId },
      { $pull: { ec2Instances: { instanceId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Instance not found' });
    }

    res.status(200).json({ message: 'Instance deleted successfully' });
  } catch (error) {
    console.error('Error deleting EC2 instance:', error);
    res.status(500).json({ error: 'Failed to delete EC2 instance' });
  }
});

app.post('/api/ec2-instances', async (req, res) => {
  try {
    const { userId } = req.query;
    const { instanceId, name, type, region, ami, state } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newInstance = { instanceId, name, type, region, ami, state };
    user.ec2Instances.push(newInstance);
    await user.save();

    // Increment the global EC2 instance counter
    const counter = await Counter.findOneAndUpdate(
      { name: 'totalEc2Instances' },
      { $inc: { value: 1 } },
      { new: true, upsert: true } // Create the counter if it doesn't exist
    );

    console.log(`Total EC2 Instances: ${counter.value}`);

    res.status(201).json(newInstance);
  } catch (error) {
    console.error('Error adding EC2 instance:', error);
    res.status(500).json({ error: 'Failed to add EC2 instance' });
  }
});

app.post('/api/delete-ec2-instance', async (req, res) => {

  const { userId } = req.body;
  
  try {
    // Path to the Terraform configuration directory
    const terraformDir = path.join(__dirname, `.terraform-user-${userId}`);

    // Run Terraform commands to delete the instance
    exec(
      `cd ${terraformDir} && terraform destroy -auto-approve -lock=false`,
      async (error, stdout, stderr) => {
        if (error) {
          console.error('Error executing Terraform:', error);
          return res.status(500).json({ message: 'Failed to delete EC2 instance.' });
        }

        console.log('Terraform Output:', stdout);
        try {
          // Clear all EC2 instances for the user
          const user = await User.findByIdAndUpdate(
            userId,
            { $set: { ec2Instances: [] } }, // Clear the ec2Instances array
            { new: true }
          );
      
          if (!user) {
            return res.status(404).json({ message: 'User not found.' });
          }
      
          console.log(`All EC2 instances cleared for user ${userId}.`);
          } catch (error) {
            console.error('Error clearing EC2 instances:', error);
            res.status(500).json({ message: 'Failed to delete EC2 instances.' });
          }
          res.status(200).json({ message: 'EC2 instance deleted successfully.' });
      }
    );
  } catch (error) {
    console.error('Error deleting EC2 instance:', error);
    res.status(500).json({ message: 'Failed to delete EC2 instance.' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    // Calculate the total number of users
    const totalUsers = users.length;

    // Calculate the total number of active EC2 instances
    const totalActiveInstances = users.reduce((count, user) => {
      return count + (user.ec2Instances ? user.ec2Instances.length : 0);
    }, 0);

    // Fetch the total EC2 instances counter
    const counter = await Counter.findOne({ name: 'totalEc2Instances' });
    const totalEc2Instances = counter ? counter.value : 0;

    res.status(200).json({
      totalUsers,
      totalActiveInstances,
      totalEc2Instances, // Include total EC2 instances in the response
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
});

/**
 * @swagger
 * /api/user/update:
 *   post:
 *     summary: Update user details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               address:
 *                 type: string
 *               contactDetails:
 *                 type: string
 *     responses:
 *       200:
 *         description: User details updated successfully
 *       400:
 *         description: No updates provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user details
 */
app.post('/api/user/update', async (req, res) => {
  const { userId, password, address, contactDetails } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const updates = {};

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    if (address) {
      updates.address = address;
    }

    if (contactDetails) {
      updates.contactDetails = contactDetails;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No updates provided.' });
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User details updated successfully.', user });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Failed to update user details.' });
  }
});

app.get('/api/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      address: user.address,
      contactDetails: user.contactDetails,
      isGoogleLogin: user.isGoogleLogin,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Failed to fetch user details.' });
  }
});

app.delete('/api/user/delete', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the user has any active EC2 instances
    if (user.ec2Instances && user.ec2Instances.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete account. Please terminate all EC2 instances before deleting your account.',
      });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

// Start Server
const PORT = process.env.PORT || 3031;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});