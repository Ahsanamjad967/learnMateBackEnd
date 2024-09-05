const express = require("express");
const router = express.Router();
const {isLoggedIn,isAuthorized} = require("../middlewares/auth.middleware");
const {
  allDocuments,
  recentDocuments,
  documentById,
  reviewDocument,
  deleteDocument
} = require("../controllers/document.controller");

router.get("/recentDocuments", recentDocuments);
router.post("/review/:id", isLoggedIn, reviewDocument);
router.post("/delete/:id", isLoggedIn, deleteDocument);

router.get("/:id", documentById);
router.get("/", allDocuments);

module.exports = router;
