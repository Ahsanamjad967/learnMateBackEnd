const router = require("express").Router();
const {allScheduledMeetings, meetingById} = require("../controllers/meeting.controller");
const { isLoggedIn, isAuthorized } = require("../middlewares/auth.middleware");

router.get("/allScheduledMeetings", isLoggedIn, allScheduledMeetings);
router.get('/meetingById/:id',isLoggedIn,meetingById)

module.exports = router;
