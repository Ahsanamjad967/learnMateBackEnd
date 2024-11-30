const document = require("../models/document.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const allDocuments = asyncHandler(async (req, res) => {
  const { documentType } = req.query;
  const query = {};
  if (documentType) {
    query.documentType = documentType;
  }

  let allDocuments = await document
    .find(query, "-rating.ratingDetails")
    .populate("owner", "fullName");
  res.status(200).json(new ApiResponse(200, allDocuments, "success"));
});

const recentDocuments = asyncHandler(async (req, res) => {
  let recentDocuments = await document
    .find({}, "-rating.ratingDetails")
    .populate("owner", "fullName")
    .limit(6); // only 6 documents are fetched

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

const reviewDocument = asyncHandler(async (req, res) => {
  const toBeReviewedDocument = await document.findById(req.params.id);

  toBeReviewedDocument.rating.totalRatings += 1;
  toBeReviewedDocument.rating.ratingDetails.push({
    studentID: req.user._id,
    ratingValue: Number(req.body.value),
  });
  const totalRatingValue = toBeReviewedDocument.rating.ratingDetails.reduce(
    (sum, rating) => {
      return (sum += rating.ratingValue);
    },
    0
  );

  toBeReviewedDocument.rating.average =
    totalRatingValue / toBeReviewedDocument.rating.totalRatings;

  const reviewedDocument = await toBeReviewedDocument.save();

  res.status(200).json(new ApiResponse(200, {}, "Review Submitted Sucessfuly"));
});

const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    let documentToBeDeleted = await document.findOneAndDelete({ _id: id });
    if (!documentToBeDeleted) {
      throw new ApiError(404, "student not found");
    }
  } catch (error) {
    throw new ApiError(404, "student not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "document deleted successfully"));
});

const searchDocuments = asyncHandler(async (req, res) => {
  const query = req.query.q || "";

  const results = await document
    .find(
      {
        title: { $regex: query, $options: "i" },
      },
      "-rating.ratingDetails"
    )
    .populate("owner", "fullName")
    .limit(5);
  res.status(200).json(new ApiResponse(200, results, "success"));
});

module.exports = {
  searchDocuments,
  allDocuments,
  recentDocuments,
  documentById,
  reviewDocument,
  deleteDocument,
};
