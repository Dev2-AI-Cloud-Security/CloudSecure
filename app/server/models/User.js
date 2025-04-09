    // models/User.js
    const mongoose = require('mongoose');
    const bcrypt = require('bcryptjs');
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
