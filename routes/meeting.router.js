const router = require("express").Router();
const {allScheduledMeetings} = require("../controllers/meeting.controller");
const { isLoggedIn, isAuthorized } = require("../middlewares/auth.middleware");

router.get("/allScheduledMeetings", isLoggedIn, allScheduledMeetings);

module.exports = router;
