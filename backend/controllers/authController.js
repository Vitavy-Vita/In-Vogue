const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const sendEmail = require("../utile/email");
const env = require("../config/env");
const forgetPasswordTemplate = require("../utile/email-templates/forgetPasswordTemplate");
const crypto = require("crypto");

const createSendToken = ({ user, statusCode, res }) => {
  console.log(user);
  // Création d'un token d'authentification pour l'utilisateur.
  const token = jwt.sign({ id: user._id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION,
  });

  // stocker le token dans un cookie
  // Pour le nom du cookie on peut utiliser 'authorization' ou 'jwt'
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + env.JWT_COOKIE_EXPIRATION * 1000 * 60 * 60 * 24
    ),
    httpOnly: true,
  });
  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user,
    },
  });
};

exports.signup = async (req, res) => {
  // Création d'un nouvel utilisateur en utilisant le schéma d'utilisateur
  // et les données provenant du corps de la requête.
  // 'User.create(req.body)' renvoie une promesse qui résout à l'utilisateur créé.
  // L'utilisation de 'await' permet d'attendre que la promesse soit résolue avant de continuer l'exécution du code.
  // Cela signifie que 'user' contiendra l'utilisateur créé une fois que la promesse sera résolue.

  User.create(req.body)
    .then((userData) => {
      // Status 201 = Created (création d'une nouvelle ressource)
      createSendToken({ user: userData, statusCode: 201, res });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        statusCode: err.statusCode,
        message: err.message,
      });
    });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      status: "fail",
      message: "Please provide email and password",
    });
  }

  User.findOne({ email })
    .select("+password")
    .then(async (userData) => {
      const verifyPassword = await userData.correctPassword(
        password,
        userData.password
      );

      if (!userData || !verifyPassword) {
        res.status(401).json({
          status: "fail",
          message: "Incorrect email or password",
        });
      }
      createSendToken({ user: userData, statusCode: 200, res });
    })
    .catch((err) => {
      res.status(err.statusCode || 500).json({
        status: "error",
        message: err.message,
      });
    });
};

exports.logout = (_, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    // 10 secondes
    // httpOnly : Le cookie ne peut pas être accédé ou modifié par le navigateur
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "User logged out successfully",
  });
};

exports.forgetPassword = (req, res) => {
  User.findOne({ email: req.body.email })
    .then(async (userData) => {
      const resetToken = await userData.createResetPassword();
      // Stocker le token dans la base de données
      await userData.save({ validateBeforeSave: false });
      //  Envoyer le token par email à l'utilisateur
      sendEmail({
        to: userData.email,
        subject: "Reset your password 🔐 (Valid for 15min)",
        html: forgetPasswordTemplate(resetToken),
      });

      // Envoie d'une réponse au client
      // StatusCode représente le statut de la réponse qu'on veut envoyer au client (201, 200)
      res.status(200).json({
        status: "success",
        token: resetToken,
        message: "Token sent to email",
      });
    })
    .catch((err) => {
      res.status(err.statusCode || 500).json({
        status: "error",
        message: err.message,
      });
    });
};

exports.resetPassword = (req, res) => {
  // 1) Obtenir l'utilisateur basé sur le token
  // 2) Vérifier si le token n'a pas expiré
  // 3) Mettre à jour le mot de passe
  // 4) Connecter l'utilisateur
  // 5) Envoyer une réponse au client

  // 1) Obtenir l'utilisateur basé sur le token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // 2) Vérifier si le token n'a pas expiré
  User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })
    .then(async (userData) => {
      if (!userData) {
        return res.status(400).json({
          status: "fail",
          message: "Token is invalid or has expired",
        });
      }
      // Mettre à jour le mot de passe
      userData.password = req.body.password;
      userData.passwordConfirm = req.body.passwordConfirm;
      userData.passwordResetToken = undefined;
      userData.passwordResetExpires = undefined;

      await userData.save();
      // Connecter l'utilisateur
      createSendToken({ user: userData, statusCode: 200, res });
    })
    .catch((err) => {
      res.status(err.statusCode || 500).json({
        status: "error",
        message: err.message,
      });
    });
};

exports.protect = async (req, res, next) => {
  // 1) Vérifier si le token existe
  // 2) Vérifier si le token est valide
  // 3) Vérifier si l'utilisateur existe toujours
  // 4) Vérifier si l'utilisateur a changé de mot de passe après la création du token
  // 5) Autoriser l'accès à la route protégée

  // 1) Vérifier si le token existe
  let token;
  // Vérifier si le token existe dans le header de la requête
  // jwt : Bearer 123456789
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // req.headers.authorization = Bearer 123456789
    // req.headers.authorization.split(' ') = ['Bearer', '123456789']
    token = req.headers.authorization.split(" ")[1];
    // Vérifier si le token existe dans le cookie
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return res.status(401).json({
      // 401 = non authorisé
      status: "fail",
      message: "You are not logged in! Please log in to get access.",
    });
  }
  // 2) Vérifier si le token est valide
  // jwt.verify(token, secretOrPublicKey, [callback])
  jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
    console.log(decoded);
    // decoded retourne l'objet {id: '123456789', iat: 123456789}
    // iat : date de création du token
    if (err) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid token",
      });
    }
    // 3) Vérifier si l'utilisateur existe toujours
    User.findById(decoded.id)
      .then((userData) => {
        console.log(userData);
        // 4) Vérifier si l'utilisateur a changé de mot de passe après la création du token
        if (userData.verifyPasswordChanged(decoded.iat)) {
          return res.status(401).json({
            status: "fail",
            message: "User recently changed password! Please log in again.",
          });
        }

        // 5) Autoriser l'accès à la route protégée
        // Envoyer des données de l'utilisateur via la requête pour les utiliser dans les prochains middleware
        // Ainsi éviter de faire des requetes à la base de données pour récupérer les données de l'utilisateur
        // dans les prochains middleware
        req.user = userData;

        next();
      })
      .catch((err) => {
        res.status(err.statusCode || 500).json({
          status: "error",
          message: err.message,
        });
      });
  });
};

exports.restrictTo = (...roles) => {
  // Autorisation par rôle (admin, user)
  // restrictTo('admin', 'moderator')
  // roles = ['admin', 'user']
  return (req, res, next) => {
    // Vérifier si le rôle de l'utilisateur existe dans le tableau des rôles autorisés
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next()
  };
};
