const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv");

const app = express();
const User = require("./models/userModel");

const userRouter = require('./routes/userRoutes')


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

dotenv.config();

app.use('/api/v1/users', userRouter)

module.exports = app;
