const express = require("express");

const {
  addTimeEntry,
  getTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
  getUnbilledTimeEntries,
} = require("../controllers/timeEntryController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addTimeEntry);

router.get("/", protect, getTimeEntries);

router.get("/unbilled", protect, getUnbilledTimeEntries);

router.put("/:id", protect, updateTimeEntry);

router.delete("/:id", protect, deleteTimeEntry);

module.exports = router;