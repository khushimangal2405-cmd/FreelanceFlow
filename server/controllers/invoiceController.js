const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const Project = require("../models/Project");
const TimeEntry = require("../models/TimeEntry");

// =====================================================
// ADD INVOICE
// =====================================================
const addInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      client,
      project,
      startDate,
      endDate,
      dueDate,
      status,
      notes,
    } = req.body;

    if (
      !invoiceNumber ||
      !client ||
      !project ||
      !startDate ||
      !endDate ||
      !dueDate
    ) {
      return res.status(400).json({
        message:
          "Invoice number, client, project, start date, end date and due date are required",
      });
    }

    // Check client
    const clientExists = await Client.findOne({
      _id: client,
      owner: req.user.id,
    });

    if (!clientExists) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    // Check project
   const projectExists = await Project.findOne({
  _id: project,
  owner: req.user.id,
});
    if (!projectExists) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Project-client check
    if (String(projectExists.client) !== String(client)) {
      return res.status(400).json({
        message:
          "Selected project does not belong to selected client",
      });
    }

    // Dates
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid start date or end date",
      });
    }

    if (end < start) {
      return res.status(400).json({
        message: "End date must be after or equal to start date",
      });
    }

    // Find unbilled billable entries
    const timeEntries = await TimeEntry.find({
      project: project,
      billable: true,
      billed: false,
      startTime: {
        $gte: start,
        $lte: end,
      },
    });

    if (timeEntries.length === 0) {
      return res.status(400).json({
        message:
          "No unbilled billable time entries found for this date range",
      });
    }

    // Calculate total minutes
    const totalMinutes = timeEntries.reduce(
      (total, entry) => {
        return total + (Number(entry.duration) || 0);
      },
      0
    );

    const totalHours = totalMinutes / 60;

    const hourlyRate = Number(clientExists.hourlyRate) || 0;

    const amount = Number(
      (totalHours * hourlyRate).toFixed(2)
    );

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      client,
      project,
      amount,
      startDate: start,
      endDate: end,
      dueDate,
      status: status || "draft",
      notes,
    });

    // Mark entries as billed
    await TimeEntry.updateMany(
      {
        _id: {
          $in: timeEntries.map((entry) => entry._id),
        },
      },
      {
        $set: {
          billed: true,
        },
      }
    );

    res.status(201).json({
      message: "Invoice added successfully",
      invoice,
      billingSummary: {
        totalEntries: timeEntries.length,
        totalMinutes,
        totalHours: Number(totalHours.toFixed(2)),
        hourlyRate,
        amount,
      },
    });
  } catch (error) {
    console.error("ADD INVOICE ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// =====================================================
// PREVIEW INVOICE
// =====================================================
const previewInvoice = async (req, res) => {
  try {
    const {
      client,
      project,
      startDate,
      endDate,
    } = req.query;

    if (!client || !project || !startDate || !endDate) {
      return res.status(400).json({
        message:
          "Client, project, start date and end date are required",
      });
    }

    // Check client
    const clientExists = await Client.findOne({
      _id: client,
      owner: req.user.id,
    });

    if (!clientExists) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    // Check project
    const projectExists = await Project.findById(project);

    if (!projectExists) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check project belongs to client
    if (String(projectExists.client) !== String(client)) {
      return res.status(400).json({
        message:
          "Selected project does not belong to selected client",
      });
    }

    // Start date
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    // End date
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid start date or end date",
      });
    }

    if (end < start) {
      return res.status(400).json({
        message:
          "End date must be after or equal to start date",
      });
    }

    // =================================================
    // FIND UNBILLED BILLABLE TIME
    // =================================================

    const timeEntries = await TimeEntry.find({
      project: project,
      billable: true,
      billed: false,
      startTime: {
        $gte: start,
        $lte: end,
      },
    })
      .populate("project", "title")
      .populate("task", "title")
      .sort({
        startTime: 1,
      });

    // Calculate minutes
    const totalMinutes = timeEntries.reduce(
      (total, entry) => {
        return total + (Number(entry.duration) || 0);
      },
      0
    );

    // Hours
    const totalHours = totalMinutes / 60;

    // Hourly rate
    const hourlyRate = Number(clientExists.hourlyRate) || 0;

    // Amount
    const amount = Number(
      (totalHours * hourlyRate).toFixed(2)
    );

    res.json({
      timeEntries,
      totalEntries: timeEntries.length,
      totalMinutes,
      totalHours: Number(totalHours.toFixed(2)),
      hourlyRate,
      amount,
    });
  } catch (error) {
    console.error("PREVIEW INVOICE ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// =====================================================
// GET MY INVOICES
// =====================================================
const getInvoices = async (req, res) => {
  try {
    const clients = await Client.find({
      owner: req.user.id,
    }).distinct("_id");

    const invoices = await Invoice.find({
      client: {
        $in: clients,
      },
    })
      .populate(
        "client",
        "name email company hourlyRate"
      )
      .populate(
        "project",
        "title"
      )
      .sort({
        createdAt: -1,
      });

    res.json(invoices);
  } catch (error) {
    console.error("GET INVOICES ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE INVOICE
// =====================================================
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(
      req.params.id
    );

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const clientExists = await Client.findOne({
      _id: invoice.client,
      owner: req.user.id,
    });

    if (!clientExists) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const {
      invoiceNumber,
      dueDate,
      status,
      notes,
    } = req.body;

    if (invoiceNumber !== undefined) {
      invoice.invoiceNumber = invoiceNumber;
    }

    if (dueDate !== undefined) {
      invoice.dueDate = dueDate;
    }

    if (status !== undefined) {
      invoice.status = status;
    }

    if (notes !== undefined) {
      invoice.notes = notes;
    }

    await invoice.save();

    res.json({
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    console.error("UPDATE INVOICE ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE INVOICE
// =====================================================
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(
      req.params.id
    );

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const clientExists = await Client.findOne({
      _id: invoice.client,
      owner: req.user.id,
    });

    if (!clientExists) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // Make related entries unbilled again
    await TimeEntry.updateMany(
      {
        project: invoice.project,
        billable: true,
        billed: true,
        startTime: {
          $gte: invoice.startDate,
          $lte: new Date(
            new Date(invoice.endDate).setHours(
              23,
              59,
              59,
              999
            )
          ),
        },
      },
      {
        $set: {
          billed: false,
        },
      }
    );

    await Invoice.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("DELETE INVOICE ERROR:", error);

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
  addInvoice,
  previewInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
};