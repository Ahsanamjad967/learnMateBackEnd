const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const user = require("../models/user.model");
const admin = require("../models/admin.model");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const counsellor = require("../models/counsellor.model");
const { deleteMeeting, createZoomMeeting } = require("../utils/zoomIntegration");


const register = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      throw new ApiError(403, "All feilds are required");
    }
  
    const alreadyexistuser = await user.findOne({ email });
  
    if (alreadyexistuser) {
      throw new ApiError(409, "user with this email already exists");
    }
  
    let newAdmin = new admin({
      fullName,
      email,
      password,
      profilePic: `https://avatar.iran.liara.run/username?username=${fullName}`,
    });
    await newAdmin.validate(["fullName", "email", "password"]);
    let createdAdmin=await newAdmin.save({ validateBeforeSave: false });
  
    res
      .status(201)
      .json(new ApiResponse(201, {createdAdmin}, "admin registered successfully"));
  });

  const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(403, "All feilds are required");
    }
  
    const toBeloggedInAdmin = await admin.findOne({ email });
    if (!toBeloggedInAdmin) {
      throw new ApiError(401, "No Admin with such email found!");
    }
  
    const isPasswordCorrect = await toBeloggedInAdmin.isPasswordCorrect(
      password
    );
    if (!isPasswordCorrect) {
      throw new ApiError(401, "password is incorrect");
    }
    let accessToken = "";
    try {
      accessToken = toBeloggedInAdmin.generateAccessToken();
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

  const verifyCounsellor=asyncHandler(async(req,res)=>{
    const counsellorId=req.params.id
    let counsellorToBeVerified=await counsellor.findById(counsellorId)
    if(!counsellorToBeVerified){
        throw new ApiError('No Counsellor found against this id')
    }
    counsellorToBeVerified.isVerified=true
    await counsellorToBeVerified.save()
    res.status(200).json(new ApiResponse(200,{},"counsellor verified Successfully"))
  })

  const sendCounsellorReview=asyncHandler(async(req,res)=>{
    const {profileReviewMessage}=req.body
    if(!profileReviewMessage){
      throw new ApiError(403,"please input review message")
    }
    const counsellorId=req.params.id;
    let toBeReviewedCounsellor=await counsellor.findById(counsellorId)
    if(!toBeReviewedCounsellor){
      throw new ApiError(404,"user not found")
    }
    toBeReviewedCounsellor.profileReviewMessage=profileReviewMessage;
    toBeReviewedCounsellor.save()
    res.status(200).json(new ApiResponse(200,{},"counsellor review message sent successfully"))
  })

  const generateMeeting = asyncHandler(async (req, res) => { 
const test=await createZoomMeeting('studentpaystudent@gmail.com','test','2024-10-13T23:59:00+05:00',60)

});


module.exports={register,login,verifyCounsellor,sendCounsellorReview,generateMeeting}