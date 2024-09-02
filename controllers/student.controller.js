const student = require("../models/student.model");
const document = require("../models/document.model");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const uploadOnCloudinary = require("../utils/cloudinary");

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

    owner: req.student._id,
  });
  await student.findByIdAndUpdate(
    req.student._id,
    { $push: { documents: createdDocument._id } },
    { new: true }
  );
  res
    .status(200)
    .json(new ApiResponse(200, { document_id: createdDocument._id }));
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

  res.send(reviewedDocument);
});

module.exports = { register, login, logOut, uploadDocument, reviewDocument };
