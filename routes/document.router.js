const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer.middleware");

const {isLoggedIn,isAuthorized} = require("../middlewares/auth.middleware");
const {
  allDocuments,
  recentDocuments,
  documentById,
  reviewDocument,
  deleteDocument,
  searchDocuments
} = require("../controllers/document.controller");

router.get("/recentDocuments", recentDocuments);
router.patch("/review/:id", isLoggedIn,upload.none(), reviewDocument);
router.delete("/delete/:id", isLoggedIn, deleteDocument);
router.get('/searchDocuments',searchDocuments)
router.get("/:id", documentById);
router.get("/", allDocuments);

module.exports = router;
