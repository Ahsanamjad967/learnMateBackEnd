const note = require("../models/note.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const allNotes = asyncHandler(async (req, res) => {
  res.send("working");
});

module.exports = { allNotes };
