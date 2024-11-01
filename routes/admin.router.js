const router = require("express").Router();
const { register ,login,verifyCounsellor, sendCounsellorReview} = require("../controllers/admin.controller");
const { isLoggedIn, isAuthorized } = require("../middlewares/auth.middleware");
const upload=require('../middlewares/multer.middleware')
router.post("/register",upload.none(),register );
router.post("/login",upload.none(),login );
router.post('/verifyCounsellor/:id',isLoggedIn,upload.none(),isAuthorized('admin'),verifyCounsellor)
router.post('/sendCounsellorReview/:id',isLoggedIn,upload.none(),isAuthorized('admin'),sendCounsellorReview)

module.exports = router;
