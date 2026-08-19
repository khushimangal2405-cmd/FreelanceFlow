const Client = require("../models/Client");
const User = require("../models/User");
// Add Client
const addClient = async (req, res) => {
  try {
    const { name, email, phone, company, hourlyRate } = req.body;

    if (!name || !email || hourlyRate === undefined) {
      return res.status(400).json({
        message: "Name, email and hourly rate are required",
      });
    }
// =========================
// FREE / PRO CLIENT LIMIT
// =========================

const user = await User.findById(req.user.id);

if (!user) {
  return res.status(404).json({
    message: "User not found",
  });
}

const clientCount = await Client.countDocuments({
  owner: req.user.id,
});

if (user.plan === "free" && clientCount >= 2) {
  return res.status(403).json({
    message:
      "Free plan allows maximum 2 clients. Upgrade to Pro for unlimited clients.",
  });
}
    const client = await Client.create({
      name,
      email,
      phone,
      company,
      hourlyRate,
      owner: req.user.id,
    });

    res.status(201).json({
      message: "Client added successfully",
      client,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get My Clients
const getClients = async (req, res) => {
  try {
    const clients = await Client.find({
      owner: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(clients);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Client
const updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.json({
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Client
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.json({
      message: "Client deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addClient,
  getClients,
  updateClient,
  deleteClient,
};