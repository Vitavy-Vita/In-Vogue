const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Please provide your name"],
    unique: true,
  },
  email: {
    type: String,
    trim: true,
    required: [true, "Please provide your email"],
    unique: true,
  },
  password: {
    type: String,
    trim: true,
    required: [true, "Please provide your password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    trim: true,
    required: [true, "Please provide the same password"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "Password are not the same",
    },
    minlength: [8, "Password must be at least 8 characters"],
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});
// Regex, "anything that starts with find"
userSchema.pre(/^find/, function (next) {
  // In other words, this query is retrieving documents from the collection where the active field is not equal to false. It will return all documents where the active field is true or where the active field does not exist (as long as it's not explicitly false).
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  passwordEntered,
  userPassword
) {
  // passwordEntered = mot de passe entré par l'utilisateur
  // userPassword = mot de passe stocké dans la base de données

  return await bcrypt.compare(passwordEntered, userPassword);
};

module.exports = mongoose.model.Users || mongoose.model("Users", userSchema);
