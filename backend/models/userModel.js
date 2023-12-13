const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Please provide your name"],
    unique:true
  },
  email:{
    type:String,
    trim: true,
    required:[true, "Please provide your email"],
    unique:true
  },
  password:{
    type:String,
    trim: true,
    required:[true, "Please provide your password"]
  }
});

module.exports = mongoose.model.Users || mongoose.model('Users', userSchema)