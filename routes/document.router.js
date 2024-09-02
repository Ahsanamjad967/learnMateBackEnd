const express = require("express");
const {
  allDocuments,
  recentDocuments,
  documentById,
} = require("../controllers/document.controller");
const router = express.Router();

router.get("/", recentDocuments);
router.get("/:id", documentById);

module.exports = router;
