const student = require("../models/student.model");
const note = require("../models/note.model");

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

const uploadNotes = asyncHandler(async (req, res) => {
  const { title, course, price } = req.body;

  if (!title || !course || !price) {
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

  const createdNotes = await note.create({
    title,
    course,
    notesUrl: cloudinaryUrl,
    thumbnail,
    price,
    owner: req.student._id,
  });
  await student.findByIdAndUpdate(
    req.student._id,
    { $push: { notes: createdNotes._id } },
    { new: true }
  );
  res.status(200).json(new ApiResponse(200, { Notes_id: createdNotes._id }));
});

const reviewNotes = asyncHandler(async (req, res) => {
  const toBeReviewedNote = await note.findById(req.params.id);
  toBeReviewedNote.rating.totalRatings += 1;
  toBeReviewedNote.rating.ratingDetails.push({
    studentID: req.student._id,
    ratingValue: req.body.value,
  });
  const totalRatingValue = toBeReviewedNote.rating.ratingDetails.reduce(
    (sum, rating) => {
      return (sum += rating.ratingValue);
    },
    0
  );
  
  toBeReviewedNote.rating.average =
    totalRatingValue / toBeReviewedNote.rating.totalRatings;

  const reviewednote = await toBeReviewedNote.save();

  res.send(reviewednote);
});

module.exports = { register, login, logOut, uploadNotes, reviewNotes };

/*
review system not implemented
price

*/
