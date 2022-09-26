require("dotenv").config();

const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

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
