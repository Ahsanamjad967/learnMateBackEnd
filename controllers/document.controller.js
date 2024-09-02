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
  res.status(200).json(new ApiResponse(200, allDocuments, "success"));
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
  res.status(200).json(new ApiResponse(200, recentDocuments, "success"));
});

const documentById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const foundDocument = await document
    .findById(id)
    .populate("owner", "fullName");
  res
    .status(200)
    .json(new ApiResponse(200, foundDocument, "Found document succesfully"));
});

module.exports = { allDocuments, recentDocuments, documentById };
