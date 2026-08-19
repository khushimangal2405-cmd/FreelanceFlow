const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    budget: {
      type: Number,
      required: true,
    },

    deadline: {
      type: Date,
    },

    skills: {
      type: [String],
      default: [],
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    // Project owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "completed"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);