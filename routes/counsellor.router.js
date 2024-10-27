const router = require("express").Router();
const {
  register,
  login,
  logOut,
  postDetails,
  getCurrentProfile,
  updateDetails,
  allCounsellors,
  allMeetingRequests,
  acceptRequest,
  respondToMeeting,
} = require("../controllers/counsellor.controller");
const { allScheduledMeetings } = require("../controllers/meeting.controller");
const { isLoggedIn } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware");

// router.post('/register',upload.array('documents'),register)
router.post("/register", register);
router.post(
  "/postDetails",
  isLoggedIn,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "documents", maxCount: 8 },
  ]),
  postDetails
);
router.put(
  "/updateDetails",
  isLoggedIn,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "documents", maxCount: 8 },
  ]),
  updateDetails
);
router.post("/login", login);
router.get("/logout", logOut);
router.get("/current", isLoggedIn, getCurrentProfile);
router.get("/allCounsellors", allCounsellors);
router.get('/allMeetingRequests',isLoggedIn,allMeetingRequests)
router.put('/acceptRequest/:id',isLoggedIn,acceptRequest)
router.put('/respondToMeeting/:id',isLoggedIn,respondToMeeting)


module.exports = router;