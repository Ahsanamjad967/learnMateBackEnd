const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer.middleware");
const verifyJwt = require("../middlewares/auth.middleware");
const {
  login,
  register,
  logOut,
  uploadDocument,
  reviewDocument,
} = require("../controllers/student.controller");

router.post("/register", upload.single("profilePic"), register);
router.post("/login", login);
router.post("/upload",verifyJwt,upload.single("documentFile"),uploadDocument);
router.get("/logout", logOut);
router.post("/review/:id", verifyJwt, reviewDocument);

//for tesing purpose only
router.get("/", verifyJwt, (req, res) => {
  res.send(`logged in user: ${req.student.fullName}`);
});

module.exports = router;
