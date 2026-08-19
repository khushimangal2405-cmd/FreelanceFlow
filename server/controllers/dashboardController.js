const Client = require("../models/Client");
const Project = require("../models/Project");
const Task = require("../models/Task");
const TimeEntry = require("../models/TimeEntry");
const Invoice = require("../models/Invoice");

// =========================
// DASHBOARD
// =========================
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // =========================
    // CLIENTS
    // =========================

    const clients = await Client.find({
      owner: userId,
    }).distinct("_id");

    const totalClients = clients.length;

    // =========================
    // PROJECTS
    // =========================

    const userProjects = await Project.find({
      owner: userId,
    }).distinct("_id");

    const totalProjects = userProjects.length;

    // =========================
    // TASKS
    // =========================

    const totalTasks = await Task.countDocuments({
      project: { $in: userProjects },
    });

    const completedTasks = await Task.countDocuments({
      project: { $in: userProjects },
      status: "done",
    });

    // =========================
    // UPCOMING DEADLINES
    // =========================

    const upcomingTasks = await Task.find({
      project: { $in: userProjects },
      dueDate: {
        $ne: null,
        $gte: new Date(),
      },
    })
      .populate("project", "title")
      .select("title dueDate status priority project")
      .sort({ dueDate: 1 })
      .limit(5);

    const upcomingDeadlines = upcomingTasks.map((task) => ({
      type: "task",
      title: task.title,
      date: task.dueDate,
      status: task.status,
      priority: task.priority,
      project: task.project?.title || "Unknown Project",
    }));

    // =========================
    // TIME ENTRIES
    // =========================

    const totalTimeEntries = await TimeEntry.countDocuments({
      project: { $in: userProjects },
    });

    const timeResult = await TimeEntry.aggregate([
      {
        $match: {
          project: { $in: userProjects },
        },
      },
      {
        $group: {
          _id: null,
          totalDuration: {
            $sum: "$duration",
          },
        },
      },
    ]);

    const totalTrackedMinutes =
      timeResult.length > 0
        ? Number(timeResult[0].totalDuration || 0)
        : 0;

    // =========================
    // BILLABLE TIME
    // =========================

    const billableTimeResult = await TimeEntry.aggregate([
      {
        $match: {
          project: { $in: userProjects },
        },
      },
      {
        $group: {
          _id: "$billable",
          totalDuration: {
            $sum: "$duration",
          },
        },
      },
    ]);

    let billableMinutes = 0;
    let nonBillableMinutes = 0;

    billableTimeResult.forEach((item) => {
      if (item._id === true) {
        billableMinutes = Number(item.totalDuration || 0);
      } else {
        nonBillableMinutes = Number(item.totalDuration || 0);
      }
    });

    // =========================
    // INVOICES
    // =========================

    const userInvoices = await Invoice.find({
      client: { $in: clients },
    });

    // =========================
    // RECENT INVOICES
    // =========================

    const recentInvoices = await Invoice.find({
      client: { $in: clients },
    })
      .populate("client", "name company")
      .populate("project", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    // =========================
    // INVOICE COUNTS
    // =========================

    const totalInvoices = userInvoices.length;

    const paidInvoices = userInvoices.filter(
      (invoice) => invoice.status === "paid"
    ).length;

    const sentInvoices = userInvoices.filter(
      (invoice) => invoice.status === "sent"
    ).length;

    const overdueInvoices = userInvoices.filter(
      (invoice) => invoice.status === "overdue"
    ).length;

    const draftInvoices = userInvoices.filter(
      (invoice) => invoice.status === "draft"
    ).length;

    // =========================
    // INVOICE AMOUNTS
    // =========================

    const totalInvoiceAmount = userInvoices.reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

    const paidInvoiceAmount = userInvoices
      .filter((invoice) => invoice.status === "paid")
      .reduce(
        (total, invoice) =>
          total + Number(invoice.amount || 0),
        0
      );

    const sentInvoiceAmount = userInvoices
      .filter((invoice) => invoice.status === "sent")
      .reduce(
        (total, invoice) =>
          total + Number(invoice.amount || 0),
        0
      );

    const overdueInvoiceAmount = userInvoices
      .filter((invoice) => invoice.status === "overdue")
      .reduce(
        (total, invoice) =>
          total + Number(invoice.amount || 0),
        0
      );

    const draftInvoiceAmount = userInvoices
      .filter((invoice) => invoice.status === "draft")
      .reduce(
        (total, invoice) =>
          total + Number(invoice.amount || 0),
        0
      );

    // =========================
    // MONTHLY REVENUE
    // =========================

    const monthlyRevenue = await Invoice.aggregate([
  {
    $match: {
      client: { $in: clients },
      status: "paid",
      amount: { $gt: 0 },
    },
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      },
      revenue: {
        $sum: "$amount",
      },
    },
  },
  {
    $sort: {
      "_id.year": 1,
      "_id.month": 1,
    },
  },
]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyRevenueData = monthlyRevenue.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: Number(item.revenue || 0),
    }));

    // =========================
    // SEND RESPONSE
    // =========================

    res.json({
      totalClients,
      totalProjects,

      totalTasks,
      completedTasks,

      upcomingDeadlines,

      totalTimeEntries,
      totalTrackedMinutes,
      billableMinutes,
      nonBillableMinutes,

      totalInvoices,
      paidInvoices,
      sentInvoices,
      overdueInvoices,
      draftInvoices,

      totalInvoiceAmount,
      paidInvoiceAmount,
      sentInvoiceAmount,
      overdueInvoiceAmount,
      draftInvoiceAmount,

      recentInvoices,

      monthlyRevenue: monthlyRevenueData,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};