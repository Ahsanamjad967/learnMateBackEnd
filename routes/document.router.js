const express = require("express");
const { allNotes } = require("../controllers/note.controller");
const router = express.Router();

router.get("/", recentNotes);

module.exports = router;
