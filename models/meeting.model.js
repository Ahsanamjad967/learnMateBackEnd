const mongoose = require("mongoose");
const meetingSchema = new mongoose.Schema(
  {
    meetingId: Number,
    student: { type: mongoose.SchemaTypes.ObjectId, ref: "student" },
    counsellor: { type: mongoose.SchemaTypes.ObjectId, ref: "counsellor" },
    scheduledAt: String,
    approvedByCounsellor: {type:Boolean,default:false},
    proposedTime: String,
    responseFromCounsellor: String,
    joinUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("meeting", meetingSchema);
