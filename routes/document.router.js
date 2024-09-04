const express = require("express");
const router = express.Router();
const verifyJwt = require("../middlewares/auth.middleware");
const {
  allDocuments,
  recentDocuments,
  documentById,
  reviewDocument,
  deleteDocument
} = require("../controllers/document.controller");

router.get("/recentDocuments", recentDocuments);
router.post("/review/:id", verifyJwt, reviewDocument);
router.post("/delete/:id", verifyJwt, deleteDocument);

router.get("/:id", documentById);
router.get("/", allDocuments);

module.exports = router;
