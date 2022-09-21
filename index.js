require("dotenv").config();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

const userRoutes = require("./routes/user");
app.use(userRoutes);

const gamesRoutes = require("./routes/games");
app.use(gamesRoutes);

app.get("*", async (req, res) => {
  res.json("Page Introuvable 🦒");
});

app.listen(process.env.PORT, () => {
  console.log("Server launched ! 🐒");
});
