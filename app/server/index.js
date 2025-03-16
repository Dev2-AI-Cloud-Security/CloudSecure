// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db');
const authController = require('./controllers/authController');

const app = express();
const port = 5000;
app.use(cors());
app.use(bodyParser.json());
connectDB();
app.post('/register', authController.registerUser);
app.post('/login', authController.loginUser);
app.listen(port, ()=> {
  console.log(`Server running on port ${port}`);
});
