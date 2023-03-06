const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const logger = require("morgan");
//loading environmental variables
require("dotenv").config();

const songRoutes = require("./routes/songRoutes");
const songStatsRoutes = require("./routes/songStatsRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//add Request Logger for development
app.use(logger("tiny"));

app.get("/", (req, res) => {
  return res.status(200).send("Hello world");
});

app.use("/api/songs", songRoutes);
app.use("/api/songs-stats", songStatsRoutes);

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    console.log(`Database connected successfully`);
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`app listening..... on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Failed to start the server", err);
    process.exit(1);
  });
