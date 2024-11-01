const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const meeting = require("../models/meeting.model");
const meetingModel = require("../models/meeting.model");

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

const meetingById = asyncHandler(async (req, res) => {
  if(!req.params.id){
    throw new ApiError(403,"please specify id")
  }

  const meetingById=await meeting.findById(req.params.id)
  if(!meetingById){
    throw new ApiError(404,"meeting not found")
  }

  res.status(200).json(new ApiResponse(200,meetingById,'meeting fetched succesfully'))

});


module.exports = { allScheduledMeetings,meetingById };
