const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const createSendToken = ({ user, statusCode, res }) => {
  // Création d'un token d'authentification pour l'utilisateur.
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

  // stocker le token dans un cookie
  // Pour le nom du cookie on peut utiliser 'authorization' ou 'jwt'
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRATION * 1000 * 60 * 60 * 24
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
    .select("+password -_id")
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
      res.status(err.statusCode).json({
        status: "error",
        message: err.message,
      });
    });
};

exports.getAllUsers = (req, res) => {
  User.find()
    .then((users) => {
      res.status(200).json({
        status: "success",
        results: users.length,
        data: {
          users,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "error",
        statusCode: err.statusCode,
        message: err.message,
      });
    });
};

exports.getUser = (req, res) => {
  User.findById(req.params.id).then((userData) => {
    res
      .status(200)
      .json({
        status: "success",
        data: {
          user: userData,
        },
      })
      .catch((err) => {
        res.status(err.statusCode).json({
          status: "error",
          message: err.message,
        });
      });
  });
};

exports.updateUser = (req, res) => {
  const filterObject = function (object, ...allowFields) {
    // allowedFields = ['name', 'email']
    const newObject = {};
    // ['name', 'email', 'password', '_id', '__v']
    Object.keys(object).forEach((el) => {
      if (allowFields.includes(el)) {
        // si allowedFields contient 'name' ou 'email'
        // On ajoute la clé 'name' ou 'email' à newObj
        // puis on lui assigne la valeur de `object[element]`
        newObject[el] = object[el];
      }
    });
    return newObject;
  };
  const filteredBody = filterObject(req.body, "name", "email");

  User.findByIdAndUpdate(req.params.id, filteredBody, { new: true })
    .then((userData) => {
      res.status(200).json({
        status: "success",
        data: {
          userData,
        },
      });
    })
    .catch((err) => {
      res.status(err.statusCode).json({
        status: "error",
        message: err.message,
      });
    });
};

exports.deleteUser = (req, res) => {
  // findByIdAndDelete va chercher l'utilisateur par son id
  // et le supprimer de la base de données DEFINITIVEMENT !💥
  // pas nécessaire de spécifier son état actif dans ce cas
  User.findByIdAndUpdate(req.params.id, { active: false })
    .then(() => {
      res.status(204).json({
        status: "success",
        data: null,
      });
    })
    .catch((err) => {
      res.status(err.statusCode).json({
        status: "fail",
        message: err.message,
      });
    });
};
