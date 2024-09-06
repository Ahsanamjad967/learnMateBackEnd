const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const userSchema = new mongoose.Schema(
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
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email address!",
      },
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password required"],
      trim: true,
      minlength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: function (value) {
          return validator.isStrongPassword(value, {
            minUppercase: 1,
            minNumbers: 1,
            minSymbols:0}
          );
        },
        message:
          "Password must contain at least one uppercase letter,one number!",
      },
    },
    profilePic: String,
  },
  {
    discriminatorKey: "role",
    collection: "users",
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
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

module.exports = mongoose.model("user", userSchema);
