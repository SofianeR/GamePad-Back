const express = require("express");
const router = express.Router();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../Models/User");

router.post("/user/signup", async (req, res) => {
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

router.post("/user/login", async (req, res) => {
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

router.post("/user/favoris/add", async (req, res) => {
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

router.post("/user/favoris/delete", async (req, res) => {
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

router.post("/user/read/:token", async (req, res) => {
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

module.exports = router;
