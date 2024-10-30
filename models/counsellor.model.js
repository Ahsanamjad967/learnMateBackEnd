const mongoose = require("mongoose");
const user = require("./user.model");
const { isLowercase } = require("validator");
const experience = new mongoose.Schema(
  {
    company: { type: String, required: [true, "company name is required"] },
    designation: { type: String, required: [true, "designation is required"] },
    duration: { type: Number, required: [true, "duration is required"] },
  },
  { _id: false }
);

const ratingDetailSchema = new mongoose.Schema(
  {
    studentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
    ratingValue: {
      type: Number,
    },
    ratingMessage:{
      type:String
    }
  },
  { _id: false }
);
const counsellorSchema = new mongoose.Schema(
  {
    feild: {
      type: String,
      lowercase: true,
      enum: [
        "computer science",
        "information technology",
        "engineering",
        "medical",
        "law",
        "business & management",
        "finance & accounting",
        "arts & humanities",
        "social sciences",
        "education",
        "health sciences",
        "media & communications",
        "design & architecture",
        "natural sciences",
      ],
      required: [true, "please specify your feild"],
    },
    profession: {
      type: String,
      lowercase: true,
      min: [5, "length not valid"],
      required: [true, "please specify your profession"],
    },
    about: {
      type: String,
      required: true,
      min: [15, "minimum length must be 15"],
    },
    experiences: [experience],
    degrees: [{ type: String }],
    referenceDocuments: [{ type: String, required: true }],

    isVerified: { type: Boolean, default: false },
    availableTimes: [
      {
        from: { type: String, required: true },
        to: { type: String, required: true },
      },
    ],
    activeDays: [{ type: String }],
    rating: {
      average: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      ratingDetails: [ratingDetailSchema],
    },
    profileReviewMessage: { type: String },
  },
  { discriminatorKey: "role" }
);

module.exports = user.discriminator("counsellor", counsellorSchema);
