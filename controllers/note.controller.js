const note = require("../models/note.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const allNotes = asyncHandler(async (req, res) => {
  let allNotes = await note.aggregate([
    {
      $lookup: {
        from: "students",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { fullName: 1 } }],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
   
  ]).limit(1);
  res.send(allNotes);
});





module.exports = { allNotes };
