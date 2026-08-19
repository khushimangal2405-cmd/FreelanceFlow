const express = require("express");

const {
  addProject,
  getProjects,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", (req, res, next) => {
  console.log("🔥 PROJECT POST ROUTE HIT");
  next();
}, protect, addProject);

router.get("/", protect, getProjects);

router.put("/:id", protect, updateProject);

router.delete("/:id", protect, deleteProject);

module.exports = router;