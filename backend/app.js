const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv");

const app = express();
const userSchema = require('./models/userModel')

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

dotenv.config();

app.post('/api/v1/signup', (req, res) => {
  // Affichage du corps de la requête dans la console
  console.log(req.body);

  try {
    // Création d'un nouvel utilisateur en utilisant le schéma d'utilisateur
    // et les données provenant du corps de la requête
    userSchema.create(req.body).then((user) => {
      console.log(user);
      // Envoi d'une réponse avec le statut 201 (créé) et les données de l'utilisateur
      res.status(201).json({
        status: 'success',
        data: {
          user,
        },
      })
    });

  } catch (error) {
    // En cas d'erreur lors de la création de l'utilisateur, affiche l'erreur dans la console
    console.log(error);
  }
});

module.exports = app;
