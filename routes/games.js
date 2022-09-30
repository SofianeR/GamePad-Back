const express = require("express");

const router = express.Router();

const Game = require("../Models/Game");
const User = require("../Models/User");

router.post("/review/add", async (req, res) => {
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

router.post("/review/read/:gameId", async (req, res) => {
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

router.post("/review/rating", async (req, res) => {
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

module.exports = router;
