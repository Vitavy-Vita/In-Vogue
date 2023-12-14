const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv");

const app = express();
const User = require("./models/userModel");


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

dotenv.config();

// Définition d'une route POST pour l'inscription d'un utilisateur
app.post("/api/v1/signup", async (req, res) => {
  // Création d'un nouvel utilisateur en utilisant le schéma d'utilisateur
  // et les données provenant du corps de la requête.
  // 'User.create(req.body)' renvoie une promesse qui résout à l'utilisateur créé.
  // L'utilisation de 'await' permet d'attendre que la promesse soit résolue avant de continuer l'exécution du code.
  // Cela signifie que 'user' contiendra l'utilisateur créé une fois que la promesse sera résolue.

  User.create(req.body)
    .then((user) => {
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
});

app.get("/api/v1/users", (req, res) => {
  User.find().then((users) => {
    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  }).catch((err)=>{
    res.status(500).json({
      status:'error',
      statusCode: err.statusCode,
      message: err.message
    })
  })
});
module.exports = app;
