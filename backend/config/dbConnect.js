const mongoose = require("mongoose");
const chalk = require("chalk");

const dbConnect = () => {
  // `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@vitavy.tesxlpz.mongodb.net/${process.env.MONGO_DATABASE}`
  mongoose
    .connect("mongodb://localhost:27017/invogue")
    .then(() => console.log(chalk.green("WE IN BOYS!")))
    .catch((err) => console.log(chalk.red(err)));
};

module.exports = dbConnect;
