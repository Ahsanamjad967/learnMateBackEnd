const document = require("../models/document.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const allDocuments = asyncHandler(async (req, res) => {
  let allDocuments = await document.aggregate([
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
  ]);
  res.send(allDocuments);
});

const recentDocuments = asyncHandler(async (req, res) => {
  let recentDocuments = await document
    .aggregate([
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
    ])
    .limit(6);
  res.send(recentDocuments);
});

module.exports = { allDocuments, recentDocuments };
