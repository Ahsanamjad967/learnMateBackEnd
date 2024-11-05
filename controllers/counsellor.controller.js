const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const user = require("../models/user.model");
const counsellor = require("../models/counsellor.model");
const meeting = require("../models/meeting.model");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");

const { createZoomMeeting } = require("../utils/zoomIntegration");

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    throw new ApiError(403, "All fields are required");
  }

  const alreadyexistuser = await user.findOne({ email });

  if (alreadyexistuser) {
    throw new ApiError(409, "user with this email already exists");
  }

  let newCounsellor = new counsellor({
    fullName,
    email,
    password,
    profilePic: `https://avatar.iran.liara.run/username?username=${fullName}`,
  });
  await newCounsellor.validate(["fullName", "email", "password"]);
  await newCounsellor.save({ validateBeforeSave: false });

  res
    .status(201)
    .json(new ApiResponse(201, {}, "counsellor registered successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(403, "All fields are required");
  }

  const toBeloggedInCounsellor = await counsellor.findOne({ email });
  if (!toBeloggedInCounsellor) {
    throw new ApiError(401, "No counsellor with such email found!");
  }

  const isPasswordCorrect = await toBeloggedInCounsellor.isPasswordCorrect(
    password
  );
  if (!isPasswordCorrect) {
    throw new ApiError(401, "password is incorrect");
  }
  let accessToken = "";
  try {
    accessToken = toBeloggedInCounsellor.generateAccessToken();
  } catch (error) {
    throw new ApiError(500, error.message);
  }
  let options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, {}, "Logged in Successfully"));
});

const logOut = asyncHandler(async (req, res) => {
  res
    .status(200)
    .clearCookie("accessToken")
    .json(new ApiResponse(200, {}, "Counsellor Logout Successfully"));
});

const postDetails = asyncHandler(async (req, res) => {
  const {
    about,
    degrees,
    experiences,
    field,
    profession,
    availableTimes,
    activeDays,
  } = req.body;
  if (
    !about ||
    !degrees ||
    !experiences ||
    !field ||
    !profession ||
    !availableTimes ||
    !activeDays
  ) {
    throw new ApiError(409, "All fields are required");
  }
  let newCounsellor = await counsellor.findById(req.user?._id, "-password");
  if (!newCounsellor) {
    throw new ApiError(404, "User not found");
  }

  if (req.files?.profilePic) {
    let profilePicCloudinaryUrl = await uploadOnCloudinary(
      req.files.profilePic[0].path
    );
    newCounsellor.profilePic = profilePicCloudinaryUrl;
  }
  if (req.files?.documents) {
    const uploadPromise = req.files.documents.map((file) => {
      return uploadOnCloudinary(file.path);
    });
    let allFiles = await Promise.all(uploadPromise);
    allFiles.forEach((file) => {
      newCounsellor.referenceDocuments.push(file);
    });
  }

  Object.assign(newCounsellor, {
    about,
    degrees,
    experiences,
    field,
    profession,
    availableTimes,
    activeDays,
  });

  await newCounsellor.save({ validateBeforeSave: true });
  res
    .status(201)
    .json(new ApiResponse(200, {}, "details submitted succcessfully"));
});

const getCurrentProfile = asyncHandler(async (req, res) => {
  let user = await counsellor.findById(req.user?._id);
  if (!user) {
    throw new ApiError(401, "Unauthorized Access");
  }
  res.status(200).json(new ApiResponse(200, user, "User fetched Successfully"));
});

const updateDetails = asyncHandler(async (req, res) => {
  const {
    about,
    degrees,
    experiences,
    field,
    profession,
    deletedReferenceDocuments,
    availableTimes,
    activeDays,
  } = req.body;
  if (
    !about ||
    !degrees ||
    !experiences ||
    !field ||
    !profession ||
    !availableTimes ||
    !activeDays
  ) {
    throw new ApiError(409, "All fields are required");
  }
  let newCounsellor = await counsellor.findById(req.user?._id);

  if (req.files?.profilePic) {
    let profilePicCloudinaryUrl = await uploadOnCloudinary(
      req.files.profilePic[0].path
    );
    newCounsellor.profilePic = profilePicCloudinaryUrl;
  }
  if (req.files?.documents) {
    const uploadPromise = req.files.documents.map((file) => {
      return uploadOnCloudinary(file.path);
    });
    let allFiles = await Promise.all(uploadPromise);
    allFiles.forEach((file) => {
      newCounsellor.referenceDocuments.push(file);
    });
  }
  // https://res.cloudinary.com/di9sthase/image/upload/v1728387802/yds8gcovptwjlf9sdx1l.pdf
  if (deletedReferenceDocuments) {
    await Promise.all(
      deletedReferenceDocuments.map(async (fileUrl) => {
        newCounsellor.referenceDocuments.splice(
          newCounsellor.referenceDocuments.indexOf(fileUrl),
          1
        );
        await deleteFromCloudinary(fileUrl);
      })
    );
  }
  Object.assign(newCounsellor, {
    about,
    degrees,
    experiences,
    field,
    profession,
    availableTimes,
    activeDays,
  });

  await newCounsellor.save({ validateBeforeSave: true });
  res.status(201).json(new ApiResponse(200, {}, "user updated succcessfully"));
});

const allCounsellors = asyncHandler(async (req, res) => {
  const allCounsellors = await counsellor.find(
    req.query,
    "fullName email profilePic role profession"
  );

  if (!allCounsellors.length > 0) {
    throw new ApiError(400, "either the wrong query or no users exist");
  }
  res.status(200).json(new ApiResponse(200, allCounsellors));
});

const allMeetingRequests = asyncHandler(async (req, res) => {
  let counsellor = req.user?._id;
  if (!counsellor) {
    throw new ApiError(404, "Counsellor Not found");
  }
  const allMeetingRequests = await meeting
    .find({ counsellor, approvedByCounsellor: false }, "-counsellor")
    .populate("student", "fullName");
  res
    .status(200)
    .json(new ApiResponse(200, allMeetingRequests, "data fetched succesfully"));
});

const acceptRequest = asyncHandler(async (req, res) => {
  if (!req.user?._id || !req.params?.id) {
    throw new ApiError(
      500,
      "Cannot accept the meeting! either wrong meeting id or wrong counsellor id"
    );
  }
  const meetingToBeAccepted = await meeting
    .findOne({ counsellor: req.user._id, _id: req.params.id })
    .populate("counsellor student", "fullName");

  if (!meetingToBeAccepted) {
    throw new ApiError(500, "Something went wrong !");
  }

const createdMeeting = await createZoomMeeting(
    `${meetingToBeAccepted.counsellor.fullName} & ${meetingToBeAccepted.student.fullName} `,
    `${meetingToBeAccepted.proposedTime}:00`
  );
  meetingToBeAccepted.scheduledAt = meetingToBeAccepted.proposedTime;
  meetingToBeAccepted.joinUrl = createdMeeting.join_url;
  meetingToBeAccepted.approvedByCounsellor = true;
  meetingToBeAccepted.meetingId = createdMeeting.id;
  meetingToBeAccepted.responseFromCounsellor = "";
  const acceptedMeeting = await meetingToBeAccepted.save();
  res
    .status(200)
    .json(
      new ApiResponse(200, acceptedMeeting, "Succesfully Accepted meeting")
    );
});

const respondToMeeting = asyncHandler(async (req, res) => {
  const { responseFromCounsellor } = req.body;
  if (!req.user?._id || !req.params.id) {
    throw new ApiError(
      500,
      "Cannot accept the meeting! either wrong meeting id or wrong counsellor id"
    );
  }
  const meetingToBeResponded = await meeting.findOne({counsellor: req.user._id ,  _id: req.params.id});
  if (!meetingToBeResponded) {
    throw new ApiError(500, "Something went wrong !");
  }

  meetingToBeResponded.responseFromCounsellor = responseFromCounsellor;
  const respondedMeeting = await meetingToBeResponded.save();
  res
    .status(200)
    .json(new ApiResponse(200, respondedMeeting, "succesfully sent response"));
});

const counsellorById=asyncHandler(async(req,res)=>{
  const {id}=req.params
  if(!id){
    throw new ApiError(403,"please specify id ")
  }

  const counsellorById=await counsellor.findById(id,"-password")
  if(!counsellorById){
    throw new ApiError(404,"Counsellor not found")
  }

  res.status(200).json(new ApiResponse(200,counsellorById,'counsellor fetched succesfully'))
})

module.exports = {
  register,
  login,
  logOut,
  postDetails,
  updateDetails,
  getCurrentProfile,
  allCounsellors,
  counsellorById,
  allMeetingRequests,
  acceptRequest,
  respondToMeeting,
};
