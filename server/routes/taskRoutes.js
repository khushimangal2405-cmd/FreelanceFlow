const express = require("express");

const {
  addTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addTask);

router.get("/", protect, getTasks);

router.put("/:id", protect, updateTask);

router.delete("/:id", protect, deleteTask);

module.exports = router;