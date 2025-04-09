const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');

    const registerUser = async (req, res) => {
      try {
        const { username, password } = req.body;
        if (await User.findOne({ username })) {
          return res.status(400).json({ message: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
      }
    };
    const loginUser = async (req, res) => {
      try {
        const { username, password } = req.body;
    
        // Input validation
        if (!username || !password) {
          return res.status(400).json({ message: 'Username and password are required' });
        }
    
        // Find user
        const user = await User.findOne({ username });
        console.log(user)
        if (!user) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
    
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
    
        // Generate JWT
        const token = jwt.sign(
          { id: user._id, username: user.username }, // Include username in payload
          process.env.JWT_SECRET || 'defaultSecretKey', // Use environment variable
          { expiresIn: '1h', issuer: 'CloudSecure' } // Add issuer for better validation
        );
    
        // Respond with token and user data (exclude password)
        res.json({
          token,
          user: { id: user._id, username: user.username },
          message: 'Logged in successfully',
        });
      } catch (error) {
        console.error('Error in loginUser:', error.message); // Use proper logging
        res.status(500).json({ message: 'Error logging in', error: error.message });
      }
    };
    module.exports = { registerUser, loginUser };
