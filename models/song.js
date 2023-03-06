const mongoose = require("mongoose");
const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: 1,
    max: 40,
  },
  artist: {
    type: String,
    required: true,
    min: 1,
    max: 40,
  },
  album: {
    type: String,
    required: true,
    min: 1,
    max: 40,
  },
  genre: {
    type: String,
    required: true,
    min: 1,
    max: 40,
  },
});

const Song = mongoose.model("Song", songSchema);
module.exports = Song;
