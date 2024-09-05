const user = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");

const isLoggedIn = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    throw new ApiError(401, "Unauthorized Access");
  }

  try {
    const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const currentUser = await user.findById(payload._id);
    if (!currentUser) {
      throw new ApiError(401, "Wrong Access Token");
    }

    req.user = currentUser;
    next();
  } catch (error) {
    throw new ApiError(401, "Wrong Access Token");
  }
});

const isAuthorized = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(401, "Unauthorized Access");
    }

    next();
  });
};
module.exports = { isLoggedIn, isAuthorized };
