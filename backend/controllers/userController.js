const User = require("../models/userModel");
const env = require("../config/env");
const multer = require("multer");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");

exports.getUser = (req, res) => {
  User.findById(req.params.id)
    .then((userData) => {
      res.status(200).json({
        status: "success",
        data: {
          user: userData,
        },
      });
    })
    .catch((err) => {
      res.status(err.statusCode ?? 500).json({
        status: "error",
        message: err.message,
      });
    });
};
exports.getCurrentUser = (req, res) => {
  const token = req.cookies.jwt;
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    res.status(403).end();
    return;
  }

  User.findById(decoded.id)
    .then((userData) => {
      res.status(200).json({
        status: "success",
        data: {
          user: userData,
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

exports.getAllUsers = (_, res) => {
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
          user: userData,
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

////////////////////////////////////// MULTER (UPLOAD PHOTO) //////////////////////////////////////
// Définition du stockage pour multer. Ici, nous utilisons 'multer.memoryStorage()' pour stocker les fichiers en mémoire sous forme de Buffer.
// Cela est utile lorsque vous voulez manipuler les fichiers avant de les enregistrer.
const multerStorage = multer.memoryStorage();

// Définition du filtre pour multer. Cette fonction est appelée pour chaque fichier téléchargé.
// Si le fichier est une image (son type MIME commence par 'image'), la fonction de rappel 'cb' est appelée avec 'true' pour indiquer que le fichier doit être accepté.
// Sinon, 'cb' est appelé avec une nouvelle erreur et 'false' pour indiquer que le fichier doit être rejeté.
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    // 400

    throw new Error("Not an image! Please upload only images.");
  }
};

// Initialisation de multer avec le stockage et le filtre définis précédemment.
// Multer est un middleware pour gérer le téléchargement de fichiers dans Express.
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Upload photo
exports.uploadUserPhoto = upload.single("photo");

// Fonction pour télécharger une photo
exports.uploadPhoto = (req, res, next) => {
  // Si aucun fichier n'a été téléchargé, passe au prochain middleware
  if (!req.file) return next();

  // Définit le nom du fichier. Il est composé de 'user-', l'ID de l'utilisateur, la date actuelle en millisecondes, et l'extension '.jpeg'
  req.file.filename = `user-${Date.now()}.jpeg`;

  // Utilise la bibliothèque sharp pour traiter l'image
  sharp(req.file.buffer)
    // Redimensionne l'image à 500x500 pixels
    .resize(500, 500)
    // Convertit l'image au format JPEG
    .toFormat("jpeg")
    // Définit la qualité de l'image à 90
    .jpeg({ quality: 90 })
    // Enregistre l'image dans le dossier 'public/images/users' avec le nom de fichier défini précédemment
    .toFile(`public/images/users/${req.file.filename}`)
    // Si le traitement de l'image réussit, affiche les données de l'image dans la console
    .then((data) => console.log('"data" :', data))
    // Si une erreur se produit lors du traitement de l'image, envoie une réponse avec le statut 500 (Erreur interne du serveur) et le message d'erreur
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: err.message,
      })
    );

  // Envoie une réponse avec le statut 200 (OK) et un message indiquant que la photo a été téléchargée avec succès
  res.status(200).json({
    status: "success",
    message: "Photo uploaded successfully",
  });
};
