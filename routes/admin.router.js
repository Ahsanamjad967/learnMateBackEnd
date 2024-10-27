const router = require("express").Router();
const { register ,login,verifyCounsellor, sendCounsellorReview} = require("../controllers/admin.controller");
const { isLoggedIn, isAuthorized } = require("../middlewares/auth.middleware");
router.post("/register",register );
router.post("/login",login );
router.post('/verifyCounsellor/:id',isLoggedIn,isAuthorized('admin'),verifyCounsellor)
router.post('/sendCounsellorReview/:id',isLoggedIn,isAuthorized('admin'),sendCounsellorReview)

module.exports = router;
