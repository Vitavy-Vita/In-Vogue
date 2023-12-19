const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const multer = require("multer");

const router = express.Router();

// Définition d'une route POST pour l'inscription d'un utilisateur
router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/logout").get(authController.logout);
router.route("/forgetPassword").post(authController.forgetPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

const upload = multer({ dest: "public/images/users" });

router
  .route("/upload-photo")
  .post(userController.uploadUserPhoto, userController.uploadPhoto);
router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  );
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
