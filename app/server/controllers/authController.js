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
        const user = await User.findOne({ username });
        if (!user) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, 'secretKey', { expiresIn: '1h' });
        res.json({ token, message: 'Logged in successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
      }
    };
    module.exports = { registerUser, loginUser };
