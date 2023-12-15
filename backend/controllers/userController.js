const jwt = require('jsonwebtoken')
const User =  require('../models/userModel')

exports.signup = async (req, res) => {
  // Création d'un nouvel utilisateur en utilisant le schéma d'utilisateur
  // et les données provenant du corps de la requête.
  // 'User.create(req.body)' renvoie une promesse qui résout à l'utilisateur créé.
  // L'utilisation de 'await' permet d'attendre que la promesse soit résolue avant de continuer l'exécution du code.
  // Cela signifie que 'user' contiendra l'utilisateur créé une fois que la promesse sera résolue.

  User.create(req.body)
    .then((user) => {

      const token = jwt.sign({id:user._id}, process.env.JWT_SECRET,{
        expiresIN:

      })




      // Envoi d'une réponse avec le statut 201 (créé) et les données de l'utilisateur.
      // Cette réponse est envoyée au client qui a fait la requête POST.
      res.status(201).json({
        status: "success",
        data: {
          user,
        },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        statusCode: err.statusCode,
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
