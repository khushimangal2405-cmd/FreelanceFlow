const TimeEntry = require("../models/TimeEntry");
const Project = require("../models/Project");
const Client = require("../models/Client");

// Add Time Entry
const addTimeEntry = async (req, res) => {
  try {
    const {
  description,
  project,
  task,
  startTime,
  endTime,
  duration,
  billable,
  billed,
} = req.body;
    if (!description || !project || !startTime) {
      return res.status(400).json({
        message: "Description, project and startTime are required",
      });
    }

    // Check project exists
    const projectExists = await Project.findById(project);

    if (!projectExists) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check project belongs to logged-in user
    const clientExists = await Client.findOne({
      _id: projectExists.client,
      owner: req.user.id,
    });

    if (!clientExists) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    let calculatedDuration = Number(duration) || 0;

if (startTime && endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    return res.status(400).json({
      message: "End time must be after start time",
    });
  }

  calculatedDuration = Math.floor(
    (end - start) / (1000 * 60)
  );
}

const timeEntry = await TimeEntry.create({
  description,
  project,
  task: task || undefined,
  startTime,
  endTime: endTime || undefined,
  duration: calculatedDuration,
  billable: billable !== undefined ? billable : true,
  billed: billed !== undefined ? billed : false,
});

    res.status(201).json({
      message: "Time entry added successfully",
      timeEntry,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get My Time Entries
const getTimeEntries = async (req, res) => {
  try {
    const clients = await Client.find({
      owner: req.user.id,
    }).distinct("_id");

    const projects = await Project.find({
      client: { $in: clients },
    }).distinct("_id");

    const timeEntries = await TimeEntry.find({
      project: { $in: projects },
    })
      .populate("project", "title")
      .populate("task", "title")
      .sort({ createdAt: -1 });

    res.json(timeEntries);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Time Entry
const updateTimeEntry = async (req, res) => {
  try {
    const timeEntry = await TimeEntry.findById(req.params.id);

    if (!timeEntry) {
      return res.status(404).json({
        message: "Time entry not found",
      });
    }

    const project = await Project.findById(timeEntry.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

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
      description,
      task,
      startTime,
      endTime,
      duration,
      billable,
      billed,
    } = req.body;

    if (description !== undefined) {
      timeEntry.description = description;
    }

    if (task !== undefined) {
      timeEntry.task = task;
    }

    if (startTime !== undefined) {
      timeEntry.startTime = startTime;
    }

    if (endTime !== undefined) {
      timeEntry.endTime = endTime;
    }

   if (duration !== undefined) {
  timeEntry.duration = Number(duration);
}

if (timeEntry.startTime && timeEntry.endTime) {
  const start = new Date(timeEntry.startTime);
  const end = new Date(timeEntry.endTime);

  if (end <= start) {
    return res.status(400).json({
      message: "End time must be after start time",
    });
  }

  timeEntry.duration = Math.floor(
    (end - start) / (1000 * 60)
  );
}

    if (billable !== undefined) {
      timeEntry.billable = billable;
    }
if (billed !== undefined) {
  timeEntry.billed = billed;
}
    await timeEntry.save();

    res.json({
      message: "Time entry updated successfully",
      timeEntry,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Time Entry
const deleteTimeEntry = async (req, res) => {
  try {
    const timeEntry = await TimeEntry.findById(req.params.id);

    if (!timeEntry) {
      return res.status(404).json({
        message: "Time entry not found",
      });
    }

    const project = await Project.findById(timeEntry.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const clientExists = await Client.findOne({
      _id: project.client,
      owner: req.user.id,
    });

    if (!clientExists) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await TimeEntry.findByIdAndDelete(req.params.id);

    res.json({
      message: "Time entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Unbilled Time Entries
const getUnbilledTimeEntries = async (req, res) => {
  try {
    const clients = await Client.find({
      owner: req.user.id,
    }).distinct("_id");

    const projects = await Project.find({
      client: { $in: clients },
    }).distinct("_id");

    const timeEntries = await TimeEntry.find({
      project: { $in: projects },
      billable: true,
      billed: false,
    })
      .populate("project", "title")
      .populate("task", "title")
      .sort({ startTime: -1 });

    res.json(timeEntries);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addTimeEntry,
  getTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
  getUnbilledTimeEntries,
};