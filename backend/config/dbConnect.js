const mongoose = require("mongoose");
const chalk = require("chalk");

const dbConnect = () => {
  mongoose
    .connect(
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@vitavy.tesxlpz.mongodb.net/${process.env.MONGO_DATABASE}`
    )
    .then(() => console.log(chalk.green("WE IN BOYS!")))
    .catch((err) => console.log(chalk.red(err)));
};

module.exports = dbConnect;
