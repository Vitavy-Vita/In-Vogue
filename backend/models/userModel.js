const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require('crypto')

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
  changePasswordAfter: Date,
  passwordResetToken: String,
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

// Verifier si le mot de passe a été modifié après la création du token
userSchema.methods.verifyPasswordChanged = function (JWTTimestamp) {
  if (this.changePasswordAfter) {
    // Convertir la date de changement de mot de passe en timestamp
    const changedTimestamp = parseInt(
      this.changePasswordAfter.getTime() / 1000,
      10
    );
    // Si le token a été créé avant le changement de mot de passe, renvoyer true
    // exemple : 100 < 200
    return JWTTimestamp < changedTimestamp;
  }
};

userSchema.methods.createResetPassword = function () {
  // Creer un token, retourne un string de 32 caracteres aleatoires
  const resetToken = crypto.randomBytes(32).toString("hex");
  // Crypter le token et le stocker dans la base de données
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // Definir la date d'expiration du token
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

  // Retourner le token non crypté
  return resetToken;
};
module.exports = mongoose.model.Users || mongoose.model("Users", userSchema);
