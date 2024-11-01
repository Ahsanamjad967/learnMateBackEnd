const router = require("express").Router();
const {
  sendPasswordResetEmail,
  resetPassword,
} = require("../controllers/auth.controller");

router.post("/requestPasswordReset", upload.none(), sendPasswordResetEmail);
router.post("/resetPassword", upload.none(), resetPassword);

module.exports = router;
