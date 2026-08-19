import { useEffect, useState } from "react";
import jsPDF from "jspdf";
function Invoice() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  const [invoiceNumber, setInvoiceNumber] = useState("");
const [client, setClient] = useState("");
const [project, setProject] = useState("");

const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

const [amount, setAmount] = useState("");
const [dueDate, setDueDate] = useState("");
const [totalHours, setTotalHours] = useState(0);
const [hourlyRate, setHourlyRate] = useState(0);
const [previewLoading, setPreviewLoading] = useState(false);
  const [status, setStatus] = useState("draft");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState(null);
const [viewingInvoice, setViewingInvoice] = useState(null);
const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Get Clients
  const fetchClients = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/clients",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setClients(data);
      } else {
        alert(data.message || "Failed to load clients");
      }
    } catch (error) {
      alert("Server connection failed");
    }
  };

  // Get Projects
  const fetchProjects = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setProjects(data);
      } else {
        alert(data.message || "Failed to load projects");
      }
    } catch (error) {
      alert("Server connection failed");
    }
  };

  // Get Invoices
  const fetchInvoices = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/invoices",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setInvoices(data);
      } else {
        alert(data.message || "Failed to load invoices");
      }
    } catch (error) {
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchProjects();
    fetchInvoices();
  }, []);
// Fetch unbilled time and calculate invoice amount
const fetchInvoicePreview = async () => {
  if (!client || !project || !startDate || !endDate) {
    setAmount("");
    setTotalHours(0);
    setHourlyRate(0);
    return;
  }

  try {
    setPreviewLoading(true);

    const params = new URLSearchParams({
      client,
      project,
      startDate,
      endDate,
    });

    const response = await fetch(
      `http://localhost:5000/api/invoices/preview?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setAmount("");
      setTotalHours(0);
      setHourlyRate(0);
      alert(data.message || "Failed to calculate invoice");
      return;
    }

    setTotalHours(data.totalHours || 0);
    setHourlyRate(data.hourlyRate || 0);
    setAmount(data.amount || 0);
  } catch (error) {
    alert("Failed to fetch invoice preview");
  } finally {
    setPreviewLoading(false);
  }
};
useEffect(() => {
  fetchInvoicePreview();
}, [client, project, startDate, endDate]);
  // Add / Update Invoice
  const handleSubmit = async (e) => {
    e.preventDefault();

    const invoiceData = {
  invoiceNumber,
  client,
  project,
  startDate,
  endDate,
  dueDate,
  status,
  notes,
};

    try {
      const url = editingId
        ? `http://localhost:5000/api/invoices/${editingId}`
        : "http://localhost:5000/api/invoices";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Operation failed");
        return;
      }

      alert(
        editingId
          ? "Invoice updated successfully"
          : "Invoice added successfully"
      );

      clearForm();
      fetchInvoices();
    } catch (error) {
      alert("Server connection failed");
    }
  };

  // Edit Invoice
  const editInvoice = (invoice) => {
  setEditingId(invoice._id);

  setInvoiceNumber(invoice.invoiceNumber);

  setClient(
    invoice.client?._id || invoice.client || ""
  );

  setProject(
    invoice.project?._id || invoice.project || ""
  );

  // Billing period dates
  setStartDate(
    invoice.startDate
      ? new Date(invoice.startDate)
          .toISOString()
          .split("T")[0]
      : ""
  );

  setEndDate(
    invoice.endDate
      ? new Date(invoice.endDate)
          .toISOString()
          .split("T")[0]
      : ""
  );

  setAmount(invoice.amount || "");

  setDueDate(
    invoice.dueDate
      ? new Date(invoice.dueDate)
          .toISOString()
          .split("T")[0]
      : ""
  );

  setStatus(invoice.status || "draft");

  setNotes(invoice.notes || "");
};

  // Clear Form
  const clearForm = () => {
    setEditingId(null);
    setInvoiceNumber("");
    setClient("");
    setProject("");
    setStartDate("");
setEndDate("");
    setAmount("");
    setDueDate("");
    setStatus("draft");
    setNotes("");
  };

  // Delete Invoice
  const deleteInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/invoices/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete invoice");
        return;
      }

      alert("Invoice deleted successfully");
      fetchInvoices();
    } catch (error) {
      alert("Server connection failed");
    }
  };
// Print Invoice
const printInvoice = () => {
  window.print();
};
// Download Invoice PDF
// Download Professional Invoice PDF
const downloadInvoicePDF = () => {
  if (!viewingInvoice) return;

  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();

  const invoiceNumber =
    viewingInvoice.invoiceNumber || "Invoice";

  const clientName =
    viewingInvoice.client?.name ||
    viewingInvoice.client?.company ||
    "Unknown Client";

  const clientCompany =
    viewingInvoice.client?.company || "";

  const clientEmail =
    viewingInvoice.client?.email || "";

  const projectTitle =
    viewingInvoice.project?.title || "Unknown Project";

  const invoiceAmount =
    Number(viewingInvoice.amount || 0);

  const rate =
    Number(viewingInvoice.client?.hourlyRate || hourlyRate || 0);

  const hours =
    totalHours ||
    (rate > 0 ? invoiceAmount / rate : 0);

  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // HEADER
  // =========================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("FreelanceFlow", 20, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "Freelance Management & Invoicing",
    20,
    32
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("INVOICE", 190, 25, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Invoice #: ${invoiceNumber}`,
    190,
    32,
    { align: "right" }
  );

  // Header line
  doc.line(20, 40, 190, 40);

  // =========================
  // BILL TO + INVOICE INFO
  // =========================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("BILL TO", 20, 53);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(clientName, 20, 61);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  let clientY = 68;

  if (clientCompany) {
    doc.text(clientCompany, 20, clientY);
    clientY += 6;
  }

  if (clientEmail) {
    doc.text(clientEmail, 20, clientY);
  }

  // Invoice information
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE DETAILS", 125, 53);

  doc.setFont("helvetica", "normal");

  doc.text(
    `Issue Date: ${formatDate(viewingInvoice.createdAt)}`,
    125,
    61
  );

  doc.text(
    `Due Date: ${formatDate(viewingInvoice.dueDate)}`,
    125,
    68
  );

  doc.text(
    `Status: ${(viewingInvoice.status || "draft").toUpperCase()}`,
    125,
    75
  );

  // =========================
  // PROJECT
  // =========================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PROJECT", 20, 95);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(projectTitle, 20, 102);

  // Billing period
  if (viewingInvoice.startDate || viewingInvoice.endDate) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("BILLING PERIOD", 125, 95);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
      `${formatDate(viewingInvoice.startDate)} - ${formatDate(
        viewingInvoice.endDate
      )}`,
      125,
      102
    );
  }

  // =========================
  // TABLE HEADER
  // =========================

  const tableTop = 120;

  doc.setFillColor(240, 240, 240);
  doc.rect(20, tableTop, 170, 10, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text("DESCRIPTION", 25, tableTop + 6);
  doc.text("HOURS", 110, tableTop + 6);
  doc.text("RATE", 135, tableTop + 6);
  doc.text("AMOUNT", 165, tableTop + 6);

  // =========================
  // TABLE ROW
  // =========================

  doc.setFont("helvetica", "normal");

  doc.text(
    projectTitle,
    25,
    tableTop + 20
  );

  doc.text(
    hours.toFixed(2),
    110,
    tableTop + 20
  );

  doc.text(
    `INR ${rate.toLocaleString("en-IN")}`,
    135,
    tableTop + 20
  );

  doc.text(
    `INR ${invoiceAmount.toLocaleString("en-IN")}`,
    165,
    tableTop + 20
  );

  doc.line(
    20,
    tableTop + 27,
    190,
    tableTop + 27
  );

  // =========================
  // TOTAL
  // =========================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.text("TOTAL", 135, 165);

  doc.setFontSize(15);

  doc.text(
    `INR ${invoiceAmount.toLocaleString("en-IN")}`,
    190,
    165,
    { align: "right" }
  );

  // =========================
  // NOTES
  // =========================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("NOTES", 20, 190);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const invoiceNotes =
    viewingInvoice.notes || "Thank you for your business.";

  const noteLines =
    doc.splitTextToSize(invoiceNotes, 170);

  doc.text(noteLines, 20, 198);

  // =========================
  // FOOTER
  // =========================

  doc.line(20, 260, 190, 260);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text(
    "Thank you for working with FreelanceFlow.",
    20,
    270
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  doc.text(
    "Generated by FreelanceFlow",
    20,
    277
  );

  // =========================
  // SAVE PDF
  // =========================

  doc.save(
    `${invoiceNumber}.pdf`
  );
};
 return (
  <section className="section-card">
    <div className="section-header">
      <div>
        <h2>Invoices</h2>
        <p>Create and manage your client invoices</p>
      </div>
    </div>

    {/* Invoice Form */}
    <form className="invoice-form" onSubmit={handleSubmit}>
      <div className="form-grid">

        <input
          type="text"
          placeholder="Invoice Number"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          required
        />

        <select
          value={client}
          onChange={(e) => setClient(e.target.value)}
          required
        >
          <option value="">Select Client</option>

          {clients.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name || item.company}
            </option>
          ))}
        </select>

        <select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          required
        >
          <option value="">Select Project</option>

          {projects.map((item) => (
            <option key={item._id} value={item._id}>
              {item.title}
            </option>
          ))}
        </select>
<input
  type="date"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
  required
/>
<div className="invoice-calculation">
  <div>
    <span>Total Billable Hours</span>
    <strong>
      {previewLoading ? "Calculating..." : `${totalHours} hours`}
    </strong>
  </div>

  <div>
    <span>Hourly Rate</span>
    <strong>
      ₹{Number(hourlyRate).toLocaleString("en-IN")}
    </strong>
  </div>

  <div>
    <span>Invoice Amount</span>
    <strong>
      ₹{Number(amount || 0).toLocaleString("en-IN")}
    </strong>
  </div>
</div>
<input
  type="date"
  value={endDate}
  onChange={(e) => setEndDate(e.target.value)}
  required
/>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <textarea
        className="invoice-notes"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="form-actions">
        <button className="primary-btn" type="submit">
          {editingId ? "Update Invoice" : "Add Invoice"}
        </button>

        {editingId && (
          <button
            className="secondary-btn"
            type="button"
            onClick={clearForm}
          >
            Cancel
          </button>
        )}
      </div>
    </form>

    {/* Invoice List Header */}
    <div className="list-header">
      <h3>My Invoices</h3>
      <span>{invoices.length} Invoices</span>
    </div>

    {/* Invoice Cards */}
    {loading ? (
      <p>Loading invoices...</p>
    ) : invoices.length === 0 ? (
      <div className="empty-state">
        <p>No invoices found.</p>
      </div>
    ) : (
      <div className="invoice-grid">

        {invoices.map((invoice) => (
          <div className="invoice-card" key={invoice._id}>

            <div className="invoice-card-header">
              <div>
                <h3>{invoice.invoiceNumber}</h3>

                <p>
                  {invoice.client?.name ||
                    invoice.client?.company ||
                    "Unknown Client"}
                </p>
              </div>

              <span
                className={`status-badge status-${invoice.status}`}
              >
                {invoice.status}
              </span>
            </div>

            <div className="invoice-details">

              <div>
                <span>Project</span>
                <strong>
                  {invoice.project?.title || "Unknown"}
                </strong>
              </div>

              <div>
                <span>Amount</span>
                <strong>₹{invoice.amount}</strong>
              </div>

              <div>
                <span>Due Date</span>
                <strong>
                  {invoice.dueDate
                    ? new Date(
                        invoice.dueDate
                      ).toLocaleDateString()
                    : "Not set"}
                </strong>
              </div>

            </div>

            <div className="invoice-notes-preview">
              {invoice.notes || "No notes added"}
            </div>

            <div className="card-actions">

              <button
                className="view-btn"
                onClick={() => setViewingInvoice(invoice)}
              >
                View
              </button>

              <button
                className="edit-btn"
                onClick={() => editInvoice(invoice)}
              >
                Edit
              </button>

              <button
                className="delete-btn"
                onClick={() => deleteInvoice(invoice._id)}
              >
                Delete
              </button>

            </div>
          </div>
        ))}

      </div>
    )}

    {/* Invoice Details Modal */}
    {viewingInvoice && (
      <div className="details-overlay">

        <div className="details-modal">

          <div className="modal-header">
            <div>
              <h2>Invoice Details</h2>
              <p>Complete invoice information</p>
            </div>

            <button
              className="close-icon"
              onClick={() => setViewingInvoice(null)}
            >
              ×
            </button>
          </div>

          <div className="details-content">

            <div className="detail-item">
              <span>Invoice Number</span>
              <strong>
                {viewingInvoice.invoiceNumber}
              </strong>
            </div>

            <div className="detail-item">
              <span>Client</span>
              <strong>
                {viewingInvoice.client?.name ||
                  viewingInvoice.client?.company ||
                  "Unknown"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Project</span>
              <strong>
                {viewingInvoice.project?.title || "Unknown"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Amount</span>
              <strong>
                ₹{viewingInvoice.amount}
              </strong>
            </div>

            <div className="detail-item">
              <span>Due Date</span>
              <strong>
                {viewingInvoice.dueDate
                  ? new Date(
                      viewingInvoice.dueDate
                    ).toLocaleDateString()
                  : "Not set"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Status</span>
              <strong>
                {viewingInvoice.status}
              </strong>
            </div>

            <div className="detail-item">
              <span>Notes</span>
              <strong>
                {viewingInvoice.notes || "No notes"}
              </strong>
            </div>

          </div>

          <div className="invoice-modal-actions">

  <button
    className="print-btn"
    onClick={printInvoice}
  >
    🖨️ Print Invoice
  </button>

  <button
    className="download-btn"
    onClick={downloadInvoicePDF}
  >
    📄 Download PDF
  </button>

  <button
    className="modal-close-btn"
    onClick={() => setViewingInvoice(null)}
  >
    Close
  </button>

</div>

        </div>
      </div>
    )}

  </section>
);
}

export default Invoice;