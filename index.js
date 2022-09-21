require("dotenv").config();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

const User = new mongoose.model("User", {
  mail: {
    unique: true,
    type: String,
  },
  username: {
    required: true,
    type: String,
  },
  hash: String,
  salt: String,
  token: String,

  favoris: Array,
});

const Game = new mongoose.model("Game", {
  gameId: Number,
  reviews: Array,
  date: Number,
});

const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

app.post("/user/read/:token", async (req, res) => {
  // console.log(req.params);
  const { token } = req.params;
  try {
    if (token) {
      const user = await User.findOne({ token: token });

      if (user) {
        res.json(user);
      } else {
        res.json({ errorMessage: "Error token" });
      }
    } else {
      res.json({ errorMessage: "Error token" });
    }
  } catch (error) {
    console.log(error.message);

    res.status(400).json(error.message);
  }
});

app.post("/user/signup", async (req, res) => {
  console.log(req.fields);
  const { username, mail, password } = req.fields;
  if (username && mail && password) {
    const checkUser = await User.findOne({ mail: mail });

    if (!checkUser) {
      try {
        const salt = uid2(32);
        const hash = SHA256(password + salt).toString(encBase64);

        const token = uid2(32);

        const newUser = new User({
          mail,
          username,
          salt,
          hash,
          token,
        });
        console.log(newUser);
        await newUser.save();

        res.json(newUser);
      } catch (error) {
        res.status(400).json(error.message);
      }
    } else {
      res.json({ errorMessage: "Un compte utilise déja cet email" });
    }
  } else {
    res.json({ errorMessage: "Champ(s) manquant(s)" });
  }
});

app.post("/user/login", async (req, res) => {
  //   console.log(req.fields);
  const { mail, password } = req.fields;
  console.log(mail, password);
  try {
    if (mail && password) {
      const checkForUser = await User.findOne({ mail: mail });
      console.log(checkForUser);
      if (checkForUser) {
        console.log("dans checkforuser" + checkForUser);

        const checkHash = SHA256(password + checkForUser.salt).toString(
          encBase64
        );
        if (checkHash === checkForUser.hash) {
          console.log("dans checkPassword");

          await checkForUser.save();
          res.json(checkForUser);
        } else {
          res.json({ errorMessage: "Erreur mail ou mot de passe" });
        }
      } else {
        res.json({ errorMessage: "Erreur mail ou mot de passe" });
      }
    } else {
      res.json({ errorMessage: "Champ(s) manquant(s)" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error.message);
  }
});

app.post("/user/favoris/add", async (req, res) => {
  const { game, token } = req.fields;
  try {
    if (game && token) {
      const checkUser = await User.findOne({ token: token });
      if (checkUser) {
        const checkForGameInFavoris = checkUser.favoris.find((item) => {
          return item.id === game.id;
        });
        if (!checkForGameInFavoris) {
          checkUser.favoris.push(game);
          console.log("!check");

          await checkUser.save();

          res.json(game);
        } else {
          res.json({
            errorMessage: "Vous avez déja ajouté ce jeux a vos favoris",
          });
        }
      } else {
        res.json({ errorMessage: "Error Server" });
      }
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

app.post("/user/favoris/delete", async (req, res) => {
  console.log(req.fields);
  const { favoris, token } = req.fields;
  if (favoris && token) {
    try {
      const userToUpdate = await User.findOne({ token: token });
      if (userToUpdate) {
        userToUpdate.favoris = favoris;

        await userToUpdate.save();

        res.json(userToUpdate);
      } else {
        res.json({ errorMessage: "Error User" });
      }
    } catch (error) {
      res.status(400).json(error.message);
    }
  } else {
    res.status(400).json({ errorMessage: "Error server" });
  }
});

app.post("/review/add", async (req, res) => {
  // console.log(req.fields);

  const { gameId, title, description, token } = req.fields;
  try {
    const checkUser = await User.findOne({ token: token });
    if (checkUser) {
      const checkForGame = await Game.findOne({ gameId: gameId });
      if (checkForGame) {
        checkForGame.reviews.push({
          reviewId: uid2(32),

          title,
          description,

          note: 0,
          date: Date.now(),

          userToken: token,
        });

        await checkForGame.save();

        // console.log(checkForGame);
        res.json(checkForGame);
      } else {
        const newGame = new Game({
          gameId,
        });

        newGame.reviews.push({
          reviewId: uid2(32),

          title,
          description,

          note: 0,
          date: Date.now(),

          userToken: token,
        });

        await newGame.save();

        res.json(newGame);
      }
    } else {
      // console.log("Pas connecté");

      res.json({
        errorMessage: "Vous devez être connecté pour laisser une review",
      });
    }
  } catch (error) {
    res.status(400).json(error.message);
    // console.log(error.message);
  }
});

app.post("/review/read/:gameId", async (req, res) => {
  // console.log("req.params => ", req.params);

  const { gameId } = req.params;
  try {
    const checkGame = await Game.findOne({ gameId: gameId });
    if (checkGame) {
      res.json({ result: checkGame });
      // console.log(checkGame);
    } else {
      // console.log("pas de jeu, pas de review");
      res.json({ errorMessage: "Ce jeu n'a pas encore de review" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error.message);
  }
});

app.post("/review/rating", async (req, res) => {
  console.log(req.fields);

  const { gameId, ratingValue, reviewId, note } = req.fields;
  try {
    const gameToUpdate = await Game.updateOne(
      { gameId: gameId, "reviews.reviewId": reviewId },
      {
        $set: {
          "reviews.$.note": ratingValue + note,
        },
      }
    );
    // console.log(gameToUpdate);
    return res.json(gameToUpdate);

    // res.json(game);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

app.get("*", async (req, res) => {
  res.json("Page Introuvable 🦒");
});

app.listen(process.env.PORT, () => {
  console.log("Server launched ! 🐒");
});
