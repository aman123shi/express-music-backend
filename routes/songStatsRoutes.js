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
        $project: {
          totalSongs: {
            $getField: {
              field: "counter",
              input: { $first: "$totalNumberOfSongs" },
            },
          },
          totalArtists: {
            $getField: {
              field: "counter",
              input: { $first: "$totalNumberOfArtists" },
            },
          },
          totalAlbums: {
            $getField: {
              field: "counter",
              input: { $first: "$totalNumberOfAlbums" },
            },
          },
          totalGenres: {
            $getField: {
              field: "counter",
              input: { $first: "$totalNumberOfGenres" },
            },
          },
        },
      },
    ],
  ]);
  return res.send(response[0]);
});

/**
 * GET  /api/songs-stats/genre-songs
 * return type : [{genre:string,totalSongs:number}]
 */
router.get("/genre-songs", async (_req, res) => {
  //group by genre and count songs
  const genreNumberOfSongs = await Song.aggregate([
    { $group: { _id: "$genre", totalSongs: { $sum: 1 } } },
    {
      $set: {
        genre: "$_id",
        _id: "$$REMOVE",
      },
    },
  ]);

  return res.send(genreNumberOfSongs);
});

/**
 * GET  /api/songs-stats/artist-songs-albums
 * return type : [ {artist:string,totalSongs:number,totalAlbums:number} ]
 */
router.get("/artist-songs-albums", async (_req, res) => {
  const formattedResponse = await Song.aggregate([
    [
      {
        $facet: {
          artist: [
            {
              $group: {
                _id: "$artist",
                totalSongs: {
                  $sum: 1,
                },
              },
            },
            {
              $set: {
                artist: "$_id",
                _id: "$$REMOVE",
              },
            },
          ],
          albums: [
            {
              $group: {
                _id: {
                  artist: "$artist",
                  album: "$album",
                },
              },
            },
            {
              $group: {
                _id: "$_id.artist",
                totalAlbums: {
                  $sum: 1,
                },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$artist",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          artist: "$artist.artist",
          totalSongs: "$artist.totalSongs",
          totalAlbums: {
            $getField: {
              field: "totalAlbums",
              input: {
                $first: {
                  $filter: {
                    input: "$albums",
                    as: "album",
                    cond: {
                      $eq: ["$artist.artist", "$$album._id"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  ]);

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
    { $set: { album: "$_id", _id: "$$REMOVE" } },
  ]);

  return res.send(genreNumberOfSongs);
});

module.exports = router;
