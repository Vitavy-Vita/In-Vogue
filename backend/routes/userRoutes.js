const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

// Définition d'une route POST pour l'inscription d'un utilisateur
router.route("/signup").post(userController.signup);

router.route("/").get(userController.getAllUsers);

module.exports = router;
