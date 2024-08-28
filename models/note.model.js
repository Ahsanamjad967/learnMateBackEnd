const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is Required"],
    lowercase: true,
    trim: true,
  },
  course: {
    type: String,
    required: [true, "Course is Required"],
    lowercase: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },

  notesUrl: { type: String, required: true },

  thumbnail: {
    type: String,
  },
  price: {
    type: Number,
    required: [true, "Price feild is require"],
  },
  rating: {
    average: Number,
    totalRatings:Number,
    ratingDetails: [
      {
        studentID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
        ratingValue: Number,
      },
    ],

    //////////todo
  },
});

module.exports=mongoose.model("note",noteSchema)