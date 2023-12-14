const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

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
    required:[true, "Please provide your password"],
    minlength:[8,'Password must be at least 8 characters']
  },
  passwordConfirm: {
    type:String,
    trim:true,
    required:[true,'Please provide the same password'],
    validate:{
      validator:function(value){
        return value === this.password
      },
      message: "Password are not the same"
    },
    minlength:[8,'Password must be at least 8 characters']
  }
});

userSchema.pre("save", async function (next){
  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined
  next()
})

module.exports = mongoose.model.Users || mongoose.model('Users', userSchema)