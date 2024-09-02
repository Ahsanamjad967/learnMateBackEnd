const express = require("express");
const { allDocuments,recentDocuments } = require("../controllers/document.controller");
const router = express.Router();

router.get("/", recentDocuments);

module.exports = router;
