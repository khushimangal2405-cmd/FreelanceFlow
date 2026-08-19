const mongoose = require("mongoose");

const timeEntrySchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
    },

    duration: {
      type: Number,
      default: 0,
    },

    // Billable or non-billable
    billable: {
      type: Boolean,
      default: true,
    },

    // Whether this time entry has already been included in an invoice
    billed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TimeEntry", timeEntrySchema);