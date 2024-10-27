const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const meeting = require("../models/meeting.model");

const allScheduledMeetings = asyncHandler(async (req, res) => {
  let query = { _id: null };
  if (req.user.role === "counsellor") {
    query = { counsellor: req.user._id, approvedByCounsellor: true };
  } else if (req.user.role === "counsellor") {
    query = { student: req.user._id, approvedByCounsellor: true };
  }

  const allScheduledMeetings = await meeting
    .find(query)
    .populate("student counsellor", { _id: 0, fullName: 1, role: 0 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allScheduledMeetings,
        "all scheduled meeting fetched succesfuly"
      )
    );
});

module.exports = { allScheduledMeetings };
