const student = require("../models/student.model");
const document = require("../models/document.model");
const meeting = require("../models/meeting.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");

const sendMail = require("../utils/nodeMailer");
const generatePassword = require("../utils/randomPasswordGenerator");

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
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
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

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword) {
    throw new ApiError(403, "Old password is required");
  }
  if (!newPassword) {
    throw new ApiError(403, "New password is required");
  }

  const tobeUpdatedStudent = await student.findById(req.user._id);
  const isOldPasswordCorrect = await tobeUpdatedStudent.isPasswordCorrect(
    oldPassword
  );
  if (!isOldPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }

  tobeUpdatedStudent.password = newPassword;
  await tobeUpdatedStudent.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
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
    "fullName email profilePic role"
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

const forgetPassword = asyncHandler(async (req, res) => {
  const email = req.body.email;
  if (!email) {
    throw new ApiError(403, "email feild is required");
  }

  const toBeForgetPasswordStudent = await student.findOne({ email });

  if (!toBeForgetPasswordStudent) {
    throw new ApiError(404, "No Student against this email");
  }
  const randomPassword = generatePassword();
  await sendMail(
    email,
    "Forget pasword triggered",
    `<b> ${randomPassword}</b> is your temporary password<br>login and Change it to your desired Password`
  );
  toBeForgetPasswordStudent.password = randomPassword;
  toBeForgetPasswordStudent.save();
  res.status(200).json(new ApiResponse(200, {}));
});

const requestForMeeting = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(404, "Student not found");
  }
  let requestingStudentId = req.user?._id;
  let { proposedTime } = req.body;
  let counsellorToBeRequested = req.params?.counsellorId;
  console.log
  let newMeeting = await meeting.create({
    student: requestingStudentId,
    counsellor: counsellorToBeRequested,
    proposedTime,
  });

  res.status(200).json(new ApiResponse(200,{meeting_id:newMeeting._id},"successfully requested a meeting"))
});
module.exports = {
  register,
  login,
  logOut,
  currentStudentProfile,
  allStudents,
  uploadDocument,
  updatePassword,
  updateProfilePic,
  studentById,
  forgetPassword,
  requestForMeeting,
};
