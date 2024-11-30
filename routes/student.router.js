const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer.middleware");
const { isLoggedIn, isAuthorized } = require("../middlewares/auth.middleware");
const {
  login,
  register,
  logOut,
  uploadDocument,
  updateProfilePic,
  currentStudentProfile,
  studentById,
  requestForMeeting,
  allRequestedMeetings,
  reviewCounsellor,
} = require("../controllers/student.controller");

router.post("/register", upload.single("profilePic"), register);
router.post("/login", upload.none(), login);
router.post(
  "/upload",
  isLoggedIn,
  upload.single("documentFile"),
  uploadDocument
);
router.get("/logout", logOut);
router.patch(
  "/updateProfilePic",
  isLoggedIn,
  upload.single("profilePic"),
  updateProfilePic
);
router.get("/currentStudentProfile", isLoggedIn, currentStudentProfile);
router.get("/allRequestedMeetings", isLoggedIn, allRequestedMeetings);
router.put(
  "/reviewCounsellor/:counsellorId",
  isLoggedIn,
  upload.none(),
  reviewCounsellor
);
router.post(
  "/requestForMeeting/:counsellorId",
  isLoggedIn,
  upload.none(),
  requestForMeeting
);
router.get("/:id", isLoggedIn, studentById);

router.get("/", isLoggedIn, (req, res) => {
  res.send(`logged in user: ${req.student.fullName}`);
});

module.exports = router;
