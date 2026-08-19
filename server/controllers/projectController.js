const Project = require("../models/Project");
const Client = require("../models/Client");

// =========================
// ADD PROJECT
// =========================
const addProject = async (req, res) => {
  try {
    console.log("ADD PROJECT BODY:", req.body);
    console.log("LOGGED IN USER:", req.user);

    const {
      title,
      description,
      budget,
      skills,
      client,
      status,
      deadline,
    } = req.body;

    // Required fields
    if (!title || !description || budget === undefined || !client) {
      return res.status(400).json({
        message: "Title, description, budget and client are required",
      });
    }

    // Check client exists AND belongs to logged-in user
    const clientExists = await Client.findOne({
      _id: client,
      owner: req.user.id,
    });

    if (!clientExists) {
      return res.status(404).json({
        message: "Client not found or does not belong to you",
      });
    }

    // Create project
    const project = await Project.create({
      title,
      description,
      budget: Number(budget),
      skills: skills || [],
      client,
      owner: req.user.id, // ⭐ THIS WAS MISSING
      status: status || "open",
      deadline: deadline || null,
    });

    console.log("PROJECT CREATED:", project);

    return res.status(201).json({
      message: "Project added successfully",
      project,
    });
  } catch (error) {
    console.error("ADD PROJECT ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// =========================
// GET PROJECTS
// =========================
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      owner: req.user.id,
    })
      .populate("client", "name email company hourlyRate")
      .sort({ createdAt: -1 });

    return res.json(projects);
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// =========================
// UPDATE PROJECT
// =========================
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check ownership
    if (project.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this project",
      });
    }

    const {
      title,
      description,
      budget,
      skills,
      status,
      deadline,
      client,
    } = req.body;

    if (title !== undefined) {
      project.title = title;
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (budget !== undefined) {
      project.budget = Number(budget);
    }

    if (skills !== undefined) {
      project.skills = skills;
    }

    if (status !== undefined) {
      project.status = status;
    }

    if (deadline !== undefined) {
      project.deadline = deadline;
    }

    // If client is changed, check that new client belongs to user
    if (client !== undefined) {
      const clientExists = await Client.findOne({
        _id: client,
        owner: req.user.id,
      });

      if (!clientExists) {
        return res.status(404).json({
          message: "Selected client not found",
        });
      }

      project.client = client;
    }

    await project.save();

    return res.json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// =========================
// DELETE PROJECT
// =========================
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check ownership
    if (project.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this project",
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    return res.json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// =========================
// EXPORT
// =========================
module.exports = {
  addProject,
  getProjects,
  updateProject,
  deleteProject,
};