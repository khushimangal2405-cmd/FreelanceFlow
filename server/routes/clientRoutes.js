const express = require("express");

const {
  addClient,
  getClients,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addClient);

router.get("/", protect, getClients);

router.put("/:id", protect, updateClient);

router.delete("/:id", protect, deleteClient);

module.exports = router;