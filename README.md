In-Vogue Project React/Node

1-express -e backend
2-npx create-react-app frontend

echo "# truc" >> README.md
  git init
  git add README.md
  git commit -m "first commit"
  git branch -M main
  git remote add origin https://github.com/Vitavy-Vita/truc.git  <== change name repo
  git push -u origin main

3- sur backend npm i

4- clear files(remove routes/views/error handler in app.js)/
replace var/nodemon

``JS
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

module.exports = app;
``
(this is all you need in app.js)

