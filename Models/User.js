const mongoose = require("mongoose");

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

module.exports = User;
