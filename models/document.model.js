const mongoose = require("mongoose");
const student = require("./student.model");

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
  { _id: false }
);
const documentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      enum: ["book", "notes"],
      required: [true, "document type is required"],
    },
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
      ref: "user",
    },

    documentUrl: { type: String, required: true },

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

documentSchema.pre("findOneAndDelete", async function (next) {
  const toBeDeletedDocument = await this.model.findOne(this.getQuery());
  await student.findOneAndUpdate(
    { _id: toBeDeletedDocument.owner },
    { $pull: { documents: toBeDeletedDocument._id } }
  );
  next();
});

module.exports = mongoose.model("document", documentSchema);
