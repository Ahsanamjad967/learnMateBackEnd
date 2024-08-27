const student = require("../models/student.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");

const verifyJwt = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    throw new ApiError(401, "Unauthorized Access");
  }

  // can i write if(user===("ahsan"||"usman") instead of  if(user==="ahsan"||user==="usman")
  try {
    const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const currentStudent = await student.findById(payload._id);
    if (!currentStudent) {
      throw new ApiError(401, "Wrong Access Token");
    }

    req.student = currentStudent;
    next();
  } catch (error) {
    throw new ApiError(401, "Wrong Access Token");
  }
});

module.exports = verifyJwt;
