const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // Automatically calculated invoice amount
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Billing period
    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue"],
      default: "draft",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);