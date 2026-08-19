const Task = require("../models/Task");
const Project = require("../models/Project");
const Client = require("../models/Client");

// =====================================================
// ADD TASK
// =====================================================
const addTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      dueDate,
    } = req.body;

    if (!title || !description || !project) {
      return res.status(400).json({
        message: "Title, description and project are required",
      });
    }

    // Check project exists
    const projectExists = await Project.findById(project);

    if (!projectExists) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check project belongs to logged-in user's client
    const clientExists = await Client.findOne({
      _id: projectExists.client,
      owner: req.user.id,
    });

    if (!clientExists) {
      return res.status(403).json({
        message: "Not authorized to add task to this project",
      });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      status: status || "todo",
      priority: priority || "medium",
      dueDate,
    });

    res.status(201).json({
      message: "Task added successfully",
      task,
    });
  } catch (error) {
    console.error("ADD TASK ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================================
// GET MY TASKS
// =====================================================
const getTasks = async (req, res) => {
  try {
    const clients = await Client.find({
      owner: req.user.id,
    }).distinct("_id");

    const projects = await Project.find({
      client: { $in: clients },
    }).distinct("_id");

    const tasks = await Task.find({
      project: { $in: projects },
    })
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("GET TASKS ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE TASK
// =====================================================
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check project belongs to logged-in user's client
    const clientExists = await Client.findOne({
      _id: project.client,
      owner: req.user.id,
    });

    if (!clientExists) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const {
      title,
      description,
      assignedTo,
      status,
      priority,
      dueDate,
    } = req.body;

    if (title !== undefined) {
      task.title = title;
    }

    if (description !== undefined) {
      task.description = description;
    }

    if (assignedTo !== undefined) {
      task.assignedTo = assignedTo;
    }

    if (status !== undefined) {
      task.status = status;
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate;
    }

    await task.save();

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE TASK
// =====================================================
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check project belongs to logged-in user's client
    const clientExists = await Client.findOne({
      _id: project.client,
      owner: req.user.id,
    });

    if (!clientExists) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================
module.exports = {
  addTask,
  getTasks,
  updateTask,
  deleteTask,
};