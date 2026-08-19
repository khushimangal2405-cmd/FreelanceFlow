const express = require("express");

const {
  addInvoice,
  previewInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoiceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addInvoice);
router.get("/preview", protect, previewInvoice);
router.get("/", protect, getInvoices);

router.put("/:id", protect, updateInvoice);

router.delete("/:id", protect, deleteInvoice);

module.exports = router;