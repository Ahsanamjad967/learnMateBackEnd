const router = require("express").Router();
const { register ,login,verifyCounsellor, sendCounsellorReview, getSummary, logOut} = require("../controllers/admin.controller");
const { allStudents } = require("../controllers/student.controller");
const { isLoggedIn, isAuthorized } = require("../middlewares/auth.middleware");
const upload=require('../middlewares/multer.middleware')
router.post("/register",upload.none(),register );
router.post("/login",upload.none(),login );
router.get("/logout", logOut);
router.post('/verifyCounsellor/:id',isLoggedIn,upload.none(),isAuthorized('admin'),verifyCounsellor)
router.post('/sendCounsellorReview/:id',isLoggedIn,upload.none(),isAuthorized('admin'),sendCounsellorReview)
router.get('/getSummary',getSummary)
router.get("/allStudents", isLoggedIn, allStudents);


module.exports = router;
