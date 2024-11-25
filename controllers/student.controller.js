const student = require("../models/student.model");
const counsellor = require("../models/counsellor.model");
const document = require("../models/document.model");
const meeting = require("../models/meeting.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");

const register = asyncHandler(async (req, res) => {
  const { fullName, universityName, email, password } = req.body;
  //checking if any feild is empty if yes then throw error
  if (
    [fullName, universityName, email, password].some((feild) => {
      return !feild; //return true if one of feilds is empty
    })
  ) {
    throw new ApiError(403, "All feilds are required");
  }

  // checking if the student with this email already exists if yes then throw error
  let alreadyexiststudent = await student.findOne({ email });

  if (alreadyexiststudent) {
    throw new ApiError(409, "Student with this email already exists");
  }

  // if there is a file being uploaded ,upload it on cloudinary and remove it from local directory
  let cloudinaryUrl = "";
  if (req.file?.path) {
    //req.file is dealed by multer
    cloudinaryUrl = await uploadOnCloudinary(req.file?.path);
  }

  let createdStudent = await student.create({
    fullName,
    email,
    universityName,
    password,
    profilePic:
      cloudinaryUrl ||
      `https://avatar.iran.liara.run/username?username=${fullName}`,
  });

  let newStudent = await student
    .findById(createdStudent._id)
    .select("-password ");

  res
    .status(201)
    .json(new ApiResponse(201, newStudent, "Student Registered Succesfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(403, "All feilds are required");
  }

  let findStudent = await student.findOne({ email });
  if (!findStudent) {
    throw new ApiError(401, "Email not Correct !");
  }

  let result = await findStudent.isPasswordCorrect(password);
  if (!result) {
    throw new ApiError(401, "Wrong password !");
  }

  let accessToken = "";
  try {
    accessToken = findStudent.generateAccessToken();
  } catch (error) {
    throw new ApiError(500, error.message);
  }

  let options = {
    httpOnly: false,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options).cookie("role", toBeloggedInAdmin.role, options)
    .json(new ApiResponse(200, {}, "logged in Sucessfully"));
});

const logOut = asyncHandler(async (req, res) => {
  //This method is called when the Student is logged in
  let options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken")
    .json(new ApiResponse(200, {}, "Student Logout Successfully"));
});

const uploadDocument = asyncHandler(async (req, res) => {
  const { title, course, price, documentType } = req.body;

  if (!title || !course || !price || !documentType) {
    throw new ApiError(403, "All feilds are required");
  }

  if (!req.file?.path) {
    throw new ApiError(403, "File is required");
  }

  const cloudinaryUrl = await uploadOnCloudinary(req.file.path);
  const thumbnail = cloudinaryUrl.replace(
    "upload",
    "upload/c_thumb,h_150,w_150,f_jpg" //embedding the url with transforming parameters to make it a thumbnail
  );

  const createdDocument = await document.create({
    documentType,
    title,
    course,
    documentUrl: cloudinaryUrl,
    thumbnail,
    price,

    owner: req.user._id,
  });
  await student.findByIdAndUpdate(
    req.user._id,
    { $push: { documents: createdDocument._id } },
    { new: true }
  );
  res
    .status(200)
    .json(new ApiResponse(200, { document_id: createdDocument._id }));
});

const updateProfilePic = asyncHandler(async (req, res) => {
  const newImagePath = req.file?.path;
  if (!newImagePath) {
    throw new ApiError(500, "Error while uploading file");
  }

  const updatedCloudinaryUrl = await uploadOnCloudinary(newImagePath);
  const currentStudent = await student.findById(req.user._id);
  const oldCloudinaryUrl = currentStudent.profilePic;
  currentStudent.profilePic = updatedCloudinaryUrl;
  await currentStudent.save({ validateBeforeSave: false });
  if (oldCloudinaryUrl.includes("cloudinary")) {
    await deleteFromCloudinary(oldCloudinaryUrl);
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "profile pic updated succesfuly"));
});

const currentStudentProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "No Student Logged In");
  }

  const currentStudent = await student
    .findById(req.user._id, "-password ")
    .populate("documents");
  res.status(200).json(new ApiResponse(200, currentStudent));
});

const allStudents = asyncHandler(async (req, res) => {
  const query = {};
  const { filter } = req.query;
  if (filter) {
    query.filter = filter;
  }
  const allStudents = await student.find(
    query,
    "fullName email createdAt"
  );
  res.status(200).json(new ApiResponse(200, allStudents));
});

const studentById = asyncHandler(async (req, res) => {
  const studentById = await student.findById(req.params.id);
  if (!studentById) {
    throw new ApiError(400, "student not found");
  }
  res.status(200).json(new ApiResponse(200, studentById));
});

const requestForMeeting = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(404, "Student not found");
  }
  let requestingStudentId = req.user?._id;
  let { proposedTime } = req.body;
  let counsellorToBeRequested = req.params?.counsellorId;
  let newMeeting = await meeting.create({
    student: requestingStudentId,
    counsellor: counsellorToBeRequested,
    proposedTime,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { meeting_id: newMeeting._id },
        "successfully requested a meeting"
      )
    );
});

const allRequestedMeetings = asyncHandler(async (req, res) => {
  let student = req.user?._id;
  if (!student) {
    throw new ApiError(404, "Student Not found");
  }
  const allMeetingRequests = await meeting
    .find({ student, approvedByCounsellor: false }, "-student")
    .populate("counsellor", "fullName");
  res
    .status(200)
    .json(new ApiResponse(200, allMeetingRequests, "data fetched succesfully"));
});

const reviewCounsellor = asyncHandler(async (req, res) => {
  const { ratingValue, ratingMessage } = req.body;
  if (!ratingValue) {
    throw new ApiError(403, "rating value missing");
  }

  if (!ratingMessage) {
    throw new ApiError(403, "rating message missing");
  }

  if (!req.params.counsellorId) {
    throw new ApiError(403, "counsellor id missing");
  }

  let counsellorToBeReviewed = await counsellor.findById(
    req.params.counsellorId
  );
  counsellorToBeReviewed.rating.totalRatings += 1;
  counsellorToBeReviewed.rating.ratingDetails.push({
    studentID: req.user._id,
    ratingValue,
    ratingMessage,
  });

  const totalRatingValue = counsellorToBeReviewed.rating.ratingDetails.reduce(
    (sum, rating) => {
      return (sum += rating.ratingValue);
    },
    0
  );

  counsellorToBeReviewed.rating.average =
    totalRatingValue / counsellorToBeReviewed.rating.totalRatings;

  await counsellorToBeReviewed.save();
  res.send("review sucessfull");
});

module.exports = {
  register,
  login,
  logOut,
  currentStudentProfile,
  allStudents,
  uploadDocument,
  updateProfilePic,
  studentById,
  requestForMeeting,
  allRequestedMeetings,
  reviewCounsellor,
};
