const mongoose = require("mongoose");
const User=require("./user.model")
const studentSchema = new mongoose.Schema({
  universityName: {
    type: String,
    required: [true, "University Name required"],
    trim: true,
    lowercase: true,
  },
  documents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "document",
    },
  ],
},{discriminatorKey:"role"});


module.exports = User.discriminator('student', studentSchema);
