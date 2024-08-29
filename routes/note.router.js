const express = require("express");
const { allNotes } = require("../controllers/note.controller");
const router = express.Router();

router.get("/", allNotes);

module.exports = router;
