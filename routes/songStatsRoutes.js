const express = require("express");
const router = express.Router();
const Song = require("../models/song");

/**
 * GET  /api/songs-stats/overall
 * return type : { totalSongs:number, totalArtists:number, totalAlbums:number, totalGenres:number }
 */
router.get("/overall", async (req, res) => {
  const response = await Song.aggregate([
    [
      {
        $facet: {
          totalNumberOfSongs: [
            {
              $count: "counter",
            },
          ],
          totalNumberOfArtists: [
            {
              $group: {
                _id: "$artist",
              },
            },
            {
              $count: "counter",
            },
          ],
          totalNumberOfAlbums: [
            {
              $group: {
                _id: "$album",
              },
            },
            {
              $count: "counter",
            },
          ],
          totalNumberOfGenres: [
            {
              $group: {
                _id: "$genre",
              },
            },
            {
              $count: "counter",
            },
          ],
        },
      },
      {
        $set: {
          totalNumberOfSongs: {
            $first: "$totalNumberOfSongs",
          },
          totalNumberOfArtists: {
            $first: "$totalNumberOfArtists",
          },
          totalNumberOfAlbums: {
            $first: "$totalNumberOfAlbums",
          },
          totalNumberOfGenres: {
            $first: "$totalNumberOfGenres",
          },
        },
      },
      {
        $project: {
          totalSongs: "$totalNumberOfSongs.counter",
          totalAlbums: "$totalNumberOfAlbums.counter",
          totalGenres: "$totalNumberOfGenres.counter",
          totalArtists: "$totalNumberOfArtists.counter",
        },
      },
    ],
  ]);
  return res.send(response);
});

/**
 * GET  /api/songs-stats/genre-songs
 * return type : [{genre:string,totalSongs:number}]
 */
router.get("/genre-songs", async (_req, res) => {
  //group by genre and count songs
  const genreNumberOfSongs = await Song.aggregate([
    { $group: { _id: "$genre", totalSongs: { $sum: 1 } } },
  ]);

  const formattedResponse = genreNumberOfSongs.map((stat) => ({
    genre: stat._id,
    totalSongs: stat.totalSongs,
  }));

  return res.send(formattedResponse);
});

/**
 * GET  /api/songs-stats/artist-songs-albums
 * return type : [ {artist:string,totalSongs:number,totalAlbums:number} ]
 */
router.get("/artist-songs-albums", async (_req, res) => {
  //group by artist and count songs
  const artistNumberOfSongs = await Song.aggregate([
    { $group: { _id: "$artist", totalSongs: { $sum: 1 } } },
  ]);

  //group to count Total Albums
  const artistNumberOfAlbums = await Song.aggregate([
    {
      $group: {
        _id: { artist: "$artist", album: "$album" },
      },
    },
    {
      $group: { _id: "$_id.artist", totalAlbums: { $sum: 1 } },
    },
  ]);
  const formattedResponse = [];

  for (const albumStat of artistNumberOfAlbums) {
    const artist = albumStat._id;
    const totalSongs = artistNumberOfSongs.find(
      (artistSongsStat) => artist == artistSongsStat._id
    ).totalSongs;
    const totalAlbums = albumStat.totalAlbums;
    formattedResponse.push({ artist, totalSongs, totalAlbums });
  }

  return res.send(formattedResponse);
});

/**
 * GET  /api/songs-stats/album-songs
 * return type : [{album:string,totalSongs:number}]
 */
router.get("/album-songs", async (_req, res) => {
  //group by album and count songs
  const genreNumberOfSongs = await Song.aggregate([
    { $group: { _id: "$album", totalSongs: { $sum: 1 } } },
  ]);

  const formattedResponse = genreNumberOfSongs.map((stat) => ({
    album: stat._id,
    totalSongs: stat.totalSongs,
  }));

  return res.send(formattedResponse);
});

module.exports = router;
