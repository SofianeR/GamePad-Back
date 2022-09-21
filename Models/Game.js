const mongoose = require("mongoose");

const Game = new mongoose.model("Game", {
  gameId: Number,
  reviews: Array,
  date: Number,
});

module.exports = Game;
