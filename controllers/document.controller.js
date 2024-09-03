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
  //if the url is embedded with the documentType filter i.e books or notes it will filter respectively if not then returns all documents
  let allDocuments = await document.find(query).populate("owner", "fullName");
  res.status(200).json(new ApiResponse(200, allDocuments, "success"));
});

const recentDocuments = asyncHandler(async (req, res) => {
  let recentDocuments = await document
    .find({})
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
    studentID: req.student._id,
    ratingValue: req.body.value,
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

module.exports = {
  allDocuments,
  recentDocuments,
  documentById,
  reviewDocument,
};
