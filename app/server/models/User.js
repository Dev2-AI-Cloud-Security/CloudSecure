// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define EC2 Instance Schema
const ec2InstanceSchema = new mongoose.Schema({
  instanceId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  region: { type: String, required: true },
  ami: { type: String, required: true },
  state: { type: String, required: true }, // Ensure `state` is defined as required
});

// Define User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
  },
  isGoogleLogin: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    required: false,
  },
  contactDetails: {
    type: String,
    required: false,
  },
  awsAccessKeyId: {
    type: String, // AWS Access Key ID
    required: false,
  },
  awsSecretAccessKey: {
    type: String, // AWS Secret Access Key
    required: false,
  },
  ec2Instances: [ec2InstanceSchema], // Embed EC2 instances as an array
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('User', userSchema);
