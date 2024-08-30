const mongoose = require("mongoose");
const ratingDetailSchema = new mongoose.Schema(
  {
    studentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    ratingValue: {
      type: Number,
    },
  },
  { _id: false } // This option disables the _id field for this subdocument schema
);
const noteSchema = new mongoose.Schema(
  {
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
      average: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      ratingDetails: [ratingDetailSchema],

      //////////todo
    },
  },
  { timestamps: true }
);

noteSchema.methods.addReview = async function () {
  this.rating.totalRatings += 1;
  return await this.save();
};
module.exports = mongoose.model("note", noteSchema);
