const express = require("express");
const router = express.Router();
const Song = require("../models/song");

router.get("/", async (req, res) => {
  const songs = await Song.find();
  return res.status(200).send(songs);
});

router.post("/", async (req, res) => {
  const song = new Song(req.body);
  await song.save();
  return res.status(200).send(song);
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const song = await Song.findByIdAndUpdate(id, req.body, { new: true });
  return res.status(200).send(song);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const song = await Song.findByIdAndDelete(id);
  return res.status(200).send(song);
});
module.exports = router;
