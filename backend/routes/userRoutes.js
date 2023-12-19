const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

// Définition d'une route POST pour l'inscription d'un utilisateur
router.route("/signup").post(userController.signup);
router.route("/login").post(userController.login);
router.route("/forgetPassword").post(userController.forgetPassword);
router.route("/resetPassword/:token").patch(userController.resetPassword);
router.route("/").get(userController.getAllUsers);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
