import { useEffect, useState } from "react";
import "./App.css";

import Clients from "./Clients";
import Projects from "./Projects";
import Tasks from "./Tasks";
import TimeEntries from "./TimeEntries";
import Invoice from "./Invoice";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] = useState("dashboard");
// =========================
// TIME TRACKING CHART DATA
// =========================

const timeTrackingData = dashboard
  ? [
      {
        name: "Billable",
        minutes: dashboard.billableMinutes || 0,
      },
      {
        name: "Non-Billable",
        minutes: dashboard.nonBillableMinutes || 0,
      },
    ]
  : [];
  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DASHBOARD
  // =========================
  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load dashboard"
          );
        }

       console.log("DASHBOARD DATA:", data);
setDashboard(data);
      } catch (err) {
        setError(err.message);

        localStorage.removeItem("token");
        setToken(null);
      }
    };

    fetchDashboard();
  }, [token]);

  // =========================
  // LOGIN PAGE
  // =========================
  if (!token) {
    return (
      <div className="login-page">
        <div className="login-box">

          <h1>FreelanceFlow</h1>
          <p>Login to your account</p>

          <form onSubmit={handleLogin}>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          {error && (
            <p className="error">
              {error}
            </p>
          )}

        </div>
      </div>
    );
  }

  // =========================
  // DASHBOARD LOADING
  // =========================
  if (!dashboard) {
    return (
      <div className="loading-screen">
        <h2>Loading FreelanceFlow...</h2>
      </div>
    );
  }
const invoiceStatusData = [
  {
    name: "Paid",
    value: dashboard.paidInvoices || 0,
  },
  {
    name: "Draft",
    value: dashboard.draftInvoices || 0,
  },
  {
    name: "Sent",
    value: dashboard.sentInvoices || 0,
  },
  {
    name: "Overdue",
    value: dashboard.overdueInvoices || 0,
  },
];

const invoiceChartColors = [
  "#22c55e",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];
  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setDashboard(null);
  };

  return (
    <div className="app-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          <img
            src="/logo.jpg.jpeg"
            alt="FreelanceFlow"
            className="sidebar-logo-image"
          />

          <div className="sidebar-brand">
            <h2>FreelanceFlow</h2>
            <p>Management System</p>
          </div>

        </div>

        <nav className="sidebar-nav">

          <button
            className={
              activeSection === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActiveSection("dashboard")}
          >
            🏠
            <span>Dashboard</span>
          </button>

          <button
            className={
              activeSection === "clients"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActiveSection("clients")}
          >
            👤
            <span>Clients</span>
          </button>

          <button
            className={
              activeSection === "projects"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActiveSection("projects")}
          >
            📁
            <span>Projects</span>
          </button>

          <button
            className={
              activeSection === "tasks"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActiveSection("tasks")}
          >
            ✅
            <span>Tasks</span>
          </button>

          <button
            className={
              activeSection === "time"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActiveSection("time")}
          >
            ⏱️
            <span>Time Tracking</span>
          </button>

          <button
            className={
              activeSection === "invoices"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActiveSection("invoices")}
          >
            🧾
            <span>Invoices</span>
          </button>

        </nav>

        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          🚪
          <span>Logout</span>
        </button>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main-area">

        {/* TOP HEADER */}

        <header className="top-header">

          <div>

            <h1>
              {activeSection === "dashboard" && "Dashboard"}
              {activeSection === "clients" && "Clients"}
              {activeSection === "projects" && "Projects"}
              {activeSection === "tasks" && "Tasks"}
              {activeSection === "time" && "Time Tracking"}
              {activeSection === "invoices" && "Invoices"}
            </h1>

            <p>
              Manage your freelance business efficiently
            </p>

          </div>

        </header>

        {/* ================= DASHBOARD ================= */}

        {activeSection === "dashboard" && (

          <div className="dashboard-content">

            {/* Welcome */}

            <div className="dashboard-welcome">

              <div>

                <span className="welcome-small">
                  👋 Welcome back
                </span>

                <h2>
                  Let's manage your freelance business
                </h2>

                <p>
                  Here's what's happening with your business today.
                </p>

              </div>

              <div className="welcome-icon">
                ✨
              </div>

            </div>

            {/* ================= STATS ================= */}

            <div className="stats-grid">

              {/* Clients */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon blue">
                  👥
                </div>

                <div className="stat-info">
                  <span>Clients</span>
                  <strong>
                    {dashboard.totalClients}
                  </strong>
                </div>

              </div>

              {/* Projects */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon orange">
                  📁
                </div>

                <div className="stat-info">
                  <span>Projects</span>
                  <strong>
                    {dashboard.totalProjects}
                  </strong>
                </div>

              </div>

              {/* Total Tasks */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon green">
                  ✅
                </div>

                <div className="stat-info">
                  <span>Total Tasks</span>
                  <strong>
                    {dashboard.totalTasks}
                  </strong>
                </div>

              </div>

              {/* Completed Tasks */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon purple">
                  🎯
                </div>

                <div className="stat-info">
                  <span>Completed Tasks</span>
                  <strong>
                    {dashboard.completedTasks}
                  </strong>
                </div>

              </div>

              {/* Time Entries */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon cyan">
                  ⏱️
                </div>

                <div className="stat-info">
                  <span>Time Entries</span>
                  <strong>
                    {dashboard.totalTimeEntries}
                  </strong>
                </div>

              </div>

              {/* Tracked Minutes */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon yellow">
                  ⌛
                </div>

                <div className="stat-info">
                  <span>Tracked Minutes</span>
                  <strong>
                    {dashboard.totalTrackedMinutes}
                  </strong>
                </div>

              </div>

              {/* Total Invoices */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon teal">
                  🧾
                </div>

                <div className="stat-info">
                  <span>Invoices</span>
                  <strong>
                    {dashboard.totalInvoices}
                  </strong>
                </div>

              </div>

              {/* Paid Invoices */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon green">
                  ✅
                </div>

                <div className="stat-info">
                  <span>Paid Invoices</span>
                  <strong>
                    {dashboard.paidInvoices}
                  </strong>
                </div>

              </div>

              {/* Sent Invoices */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon cyan">
                  📤
                </div>

                <div className="stat-info">
                  <span>Sent Invoices</span>
                  <strong>
                    {dashboard.sentInvoices}
                  </strong>
                </div>

              </div>

              {/* Overdue Invoices */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon orange">
                  ⚠️
                </div>

                <div className="stat-info">
                  <span>Overdue Invoices</span>
                  <strong>
                    {dashboard.overdueInvoices}
                  </strong>
                </div>

              </div>

              {/* Paid Amount */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon green">
                  💰
                </div>

                <div className="stat-info">
                  <span>Paid Amount</span>
                  <strong>
                    ₹{dashboard.paidInvoiceAmount}
                  </strong>
                </div>

              </div>

              {/* Sent Amount */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon cyan">
                  📤
                </div>

                <div className="stat-info">
                  <span>Sent Amount</span>
                  <strong>
                    ₹{dashboard.sentInvoiceAmount}
                  </strong>
                </div>

              </div>

              {/* Overdue Amount */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon orange">
                  ⚠️
                </div>

                <div className="stat-info">
                  <span>Overdue Amount</span>
                  <strong>
                    ₹{dashboard.overdueInvoiceAmount}
                  </strong>
                </div>

              </div>

              {/* Draft Amount */}

              <div className="card dashboard-stat-card">

                <div className="stat-icon purple">
                  📝
                </div>

                <div className="stat-info">
                  <span>Draft Amount</span>
                  <strong>
                    ₹{dashboard.draftInvoiceAmount}
                  </strong>
                </div>

              </div>

            </div>
{/* Invoice Revenue Summary */}
<div className="revenue-summary">

  <div className="section-title">
    <h2>Invoice Revenue Summary</h2>
    <p>Overview of your invoice amounts</p>
  </div>

  <div className="revenue-grid">

    <div className="revenue-card">
      <div className="revenue-icon">💰</div>
      <div>
        <span>Total Invoice Amount</span>
        <strong>₹{dashboard.totalInvoiceAmount}</strong>
      </div>
    </div>

    <div className="revenue-card">
      <div className="revenue-icon">✅</div>
      <div>
        <span>Paid Amount</span>
        <strong>₹{dashboard.paidInvoiceAmount}</strong>
      </div>
    </div>

    <div className="revenue-card">
      <div className="revenue-icon">📝</div>
      <div>
        <span>Draft Amount</span>
        <strong>₹{dashboard.draftInvoiceAmount}</strong>
      </div>
    </div>

    <div className="revenue-card">
      <div className="revenue-icon">📤</div>
      <div>
        <span>Sent Amount</span>
        <strong>₹{dashboard.sentInvoiceAmount}</strong>
      </div>
    </div>

    <div className="revenue-card">
      <div className="revenue-icon">⚠️</div>
      <div>
        <span>Overdue Amount</span>
        <strong>₹{dashboard.overdueInvoiceAmount}</strong>
      </div>
    </div>

  </div>

</div>
{/* =========================
    MONTHLY REVENUE CHART
========================= */}

<div className="revenue-chart-section">

  <div className="section-title">
    <h2>Monthly Revenue</h2>
    <p>Paid invoice revenue over time</p>
  </div>

  <div className="revenue-chart-card">

    {dashboard.monthlyRevenue &&
    dashboard.monthlyRevenue.length > 0 ? (

      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={dashboard.monthlyRevenue}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="month"
          />

          <YAxis />

          <Tooltip
            formatter={(value) =>
              `₹${Number(value).toLocaleString("en-IN")}`
            }
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 5 }}
          />

        </LineChart>
      </ResponsiveContainer>

    ) : (

      <div className="empty-state">
        <p>
          No revenue data available yet.
        </p>
      </div>

    )}

  </div>

</div>
{/* =========================
    INVOICE STATUS CHART
========================= */}

<div className="invoice-status-section">

  <div className="section-title">
    <h2>Invoice Status</h2>
    <p>Overview of your invoice status</p>
  </div>

  <div className="invoice-status-chart-card">

    {dashboard.totalInvoices > 0 ? (

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>

          <Pie
            data={invoiceStatusData}
            cx="50%"
            cy="50%"
            outerRadius={120}
            dataKey="value"
            nameKey="name"
          >

            {invoiceStatusData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={invoiceChartColors[index]}
              />
            ))}

          </Pie>

          <Tooltip />
<Legend />
        </PieChart>
      </ResponsiveContainer>

    ) : (

      <div className="empty-state">
        <p>No invoice data available yet.</p>
      </div>

    )}

  </div>

</div>
{/* =========================
    TIME TRACKING CHART
========================= */}

<div className="time-tracking-chart-section">

  <div className="section-title">
    <h2>Time Tracking</h2>
    <p>Billable and non-billable work time</p>
  </div>

  <div className="time-tracking-chart-card">

    {dashboard.totalTimeEntries > 0 ? (

      <ResponsiveContainer width="100%" height={350}>

        <BarChart
          data={timeTrackingData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis
            label={{
              value: "Minutes",
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip
            formatter={(value) =>
              `${Number(value).toLocaleString("en-IN")} minutes`
            }
          />

          <Legend />

          <Bar
            dataKey="minutes"
            name="Tracked Time"
            fill="#2563eb"
            radius={[8, 8, 0, 0]}
          />

        </BarChart>

      </ResponsiveContainer>

    ) : (

      <div className="empty-state">
        <p>No time tracking data available yet.</p>
      </div>

    )}

  </div>

</div>
{/* ================= UPCOMING DEADLINES ================= */}

<div className="upcoming-deadlines-section">

  <div className="section-title">
    <h2>Upcoming Deadlines</h2>
    <p>Tasks that need your attention</p>
  </div>

  {dashboard.upcomingDeadlines &&
  dashboard.upcomingDeadlines.length > 0 ? (

    <div className="upcoming-deadlines-list">

      {dashboard.upcomingDeadlines.map((item, index) => (

        <div
          className="deadline-card"
          key={index}
        >

          <div className="deadline-icon">
            {item.priority === "high"
              ? "🔴"
              : item.priority === "medium"
              ? "🟡"
              : "🟢"}
          </div>

          <div className="deadline-info">

            <h3>{item.title}</h3>

            <p>
              {item.project}
            </p>

            <span>
              Due:{" "}
              {new Date(item.date).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}
            </span>

          </div>

          <div className="deadline-status">
            {item.status}
          </div>

        </div>

      ))}

    </div>

  ) : (

    <div className="empty-state">
      <p>No upcoming deadlines 🎉</p>
    </div>

  )}

</div>
{/* ================= RECENT INVOICES ================= */}

<div className="recent-invoices-section">

  <div className="section-title">
    <h2>Recent Invoices</h2>
    <p>Your latest 5 invoices</p>
  </div>

  {dashboard.recentInvoices &&
  dashboard.recentInvoices.length > 0 ? (

    <div className="recent-invoices-table">

      {/* Table Header */}
      <div className="recent-invoice-row recent-invoice-header">

        <span>Invoice</span>
        <span>Client</span>
        <span>Project</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Due Date</span>
        <span>Action</span>

      </div>

      {/* Invoice Rows */}
      {dashboard.recentInvoices.map((invoice) => (

        <div
          className="recent-invoice-row"
          key={invoice._id}
        >

          {/* Invoice Number */}
          <div className="invoice-number-cell">
            <strong>
              {invoice.invoiceNumber}
            </strong>
          </div>

          {/* Client */}
          <div>
            <span className="invoice-primary-text">
              {invoice.client?.name ||
                invoice.client?.company ||
                "Unknown Client"}
            </span>
          </div>

          {/* Project */}
          <div>
            <span className="invoice-primary-text">
              {invoice.project?.title ||
                "Unknown Project"}
            </span>
          </div>

          {/* Amount */}
          <div>
            <strong className="invoice-amount">
              ₹
              {Number(
                invoice.amount || 0
              ).toLocaleString("en-IN")}
            </strong>
          </div>

          {/* Status */}
          <div>
            <span
              className={`recent-status status-${invoice.status}`}
            >
              {invoice.status}
            </span>
          </div>

          {/* Due Date */}
          <div>
            <span className="invoice-date">
              {invoice.dueDate
                ? new Date(
                    invoice.dueDate
                  ).toLocaleDateString("en-IN")
                : "Not set"}
            </span>
          </div>

          {/* View */}
          <div>
            <button
              className="recent-view-btn"
              onClick={() => {
                setActiveSection("invoices");
              }}
            >
              View
            </button>
          </div>

        </div>

      ))}

    </div>

  ) : (

    <div className="empty-state">
      <p>No recent invoices found.</p>
    </div>

  )}

</div>
            {/* ================= QUICK ACTIONS ================= */}

            <div className="quick-actions-section">

              <div className="section-title">

                <h2>Quick Actions</h2>

                <p>
                  Manage your work quickly
                </p>

              </div>

              <div className="quick-actions-grid">

                <button
                  className="quick-action-card"
                  onClick={() =>
                    setActiveSection("clients")
                  }
                >
                  <div className="quick-icon blue">
                    👥
                  </div>

                  <div>
                    <strong>Add Client</strong>
                    <span>Manage your clients</span>
                  </div>

                  <b>→</b>
                </button>

                <button
                  className="quick-action-card"
                  onClick={() =>
                    setActiveSection("projects")
                  }
                >
                  <div className="quick-icon orange">
                    📁
                  </div>

                  <div>
                    <strong>View Projects</strong>
                    <span>Manage your projects</span>
                  </div>

                  <b>→</b>
                </button>

                <button
                  className="quick-action-card"
                  onClick={() =>
                    setActiveSection("tasks")
                  }
                >
                  <div className="quick-icon green">
                    ✅
                  </div>

                  <div>
                    <strong>Manage Tasks</strong>
                    <span>Track your tasks</span>
                  </div>

                  <b>→</b>
                </button>

                <button
                  className="quick-action-card"
                  onClick={() =>
                    setActiveSection("time")
                  }
                >
                  <div className="quick-icon purple">
                    ⏱️
                  </div>

                  <div>
                    <strong>Track Time</strong>
                    <span>Record your work hours</span>
                  </div>

                  <b>→</b>
                </button>

                <button
                  className="quick-action-card"
                  onClick={() =>
                    setActiveSection("invoices")
                  }
                >
                  <div className="quick-icon cyan">
                    🧾
                  </div>

                  <div>
                    <strong>Invoices</strong>
                    <span>Manage your invoices</span>
                  </div>

                  <b>→</b>
                </button>

              </div>

            </div>

          </div>

        )}

        {/* ================= CLIENTS ================= */}

        {activeSection === "clients" && (
          <Clients />
        )}

        {/* ================= PROJECTS ================= */}

        {activeSection === "projects" && (
          <Projects />
        )}

        {/* ================= TASKS ================= */}

        {activeSection === "tasks" && (
          <Tasks />
        )}

        {/* ================= TIME TRACKING ================= */}

        {activeSection === "time" && (
          <TimeEntries />
        )}

        {/* ================= INVOICES ================= */}

        {activeSection === "invoices" && (
          <Invoice />
        )}

      </main>

    </div>
  );
}

export default App;