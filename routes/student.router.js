const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer.middleware");
const { isLoggedIn, isAuthorized } = require("../middlewares/auth.middleware");
const {
  login,
  register,
  logOut,
  uploadDocument,
  updatePassword,
  updateProfilePic,
  currentStudentProfile,
  studentById,
  allStudents
} = require("../controllers/student.controller");

router.post("/register", upload.single("profilePic"), register);
router.post("/login",upload.none(), login);
router.post(
  "/upload",
  isLoggedIn,
  upload.single("documentFile"),
  uploadDocument
);
router.get("/logout", logOut);
router.patch("/updatePassword", isLoggedIn, updatePassword);
router.patch(
  "/updateProfilePic",
  isLoggedIn,
  upload.single("profilePic"),
  updateProfilePic
);
router.get("/currentStudentProfile", isLoggedIn, currentStudentProfile);
router.get("/allStudents", isLoggedIn, allStudents);
router.get("/:id", isLoggedIn, studentById);
//for tesing purpose only
router.get("/", isLoggedIn, (req, res) => {
  res.send(`logged in user: ${req.student.fullName}`);
});

module.exports = router;
