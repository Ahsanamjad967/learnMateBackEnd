const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "fullName required"],
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: [true, "Email required"],
      trim: true,
      unique: [true, "Email must be unique"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password required"],
      trim: true,
    },

    universityName: {
      type: String,
      required: [true, "University Name required"],
      trim: true,
      lowercase: true,
    },
    notes:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"note"
    }],
    profilePic: String,
  },
  { timestamps: true }
);

studentSchema.pre("save", async function (next) {
  // do stuff
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

studentSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};


module.exports = mongoose.model("Student", studentSchema);
