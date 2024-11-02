const router = require("express").Router();
const upload=require('../middlewares/multer.middleware')

const {
  sendPasswordResetEmail,
  resetPassword,
  updatePassword,
} = require("../controllers/auth.controller");

router.post("/requestPasswordReset", upload.none(), sendPasswordResetEmail);
router.post("/resetPassword", upload.none(), resetPassword);
router.patch("/updatePassword",upload.none(), isLoggedIn, updatePassword);

module.exports = router;
