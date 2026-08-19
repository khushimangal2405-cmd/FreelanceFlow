const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const app = express();
const clientRoutes = require("./routes/clientRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const timeEntryRoutes = require("./routes/timeEntryRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
connectDB();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/time-entries", timeEntryRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("FreelanceFlow Backend Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});