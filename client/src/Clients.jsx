import { useEffect, useState } from "react";

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);

  const token = localStorage.getItem("token");

  const fetchClients = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/clients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setClients(data);
      } else {
        alert(data.message || "Failed to load clients");
      }
    } catch (error) {
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Add / Update Client
  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientData = {
      name,
      email,
      phone,
      company,
      hourlyRate: Number(hourlyRate),
    };

    try {
      const url = editingId
        ? `http://localhost:5000/api/clients/${editingId}`
        : "http://localhost:5000/api/clients";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clientData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Operation failed");
        return;
      }

      alert(
        editingId
          ? "Client updated successfully"
          : "Client added successfully"
      );

      clearForm();
      fetchClients();
    } catch (error) {
      alert("Server connection failed");
    }
  };

  // Edit Client
  const editClient = (client) => {
    setEditingId(client._id);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone || "");
    setCompany(client.company || "");
    setHourlyRate(client.hourlyRate);
  };

  // Clear Form
  const clearForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setHourlyRate("");
  };

  // Delete Client
  const deleteClient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/clients/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete client");
        return;
      }

      alert("Client deleted successfully");
      fetchClients();
    } catch (error) {
      alert("Server connection failed");
    }
  };

  return (
    <section className="section-card">

      {/* Section Header */}
      <div className="section-header">
        <div>
          <h2>Clients</h2>
          <p>Manage your clients and their billing information</p>
        </div>
      </div>

      {/* Add / Update Form */}
      <form className="client-form" onSubmit={handleSubmit}>
        <div className="form-grid">

          <input
            type="text"
            placeholder="Client Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            type="text"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <input
            type="number"
            placeholder="Hourly Rate"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            required
          />

        </div>

        <div className="form-actions">

          <button className="primary-btn" type="submit">
            {editingId ? "Update Client" : "Add Client"}
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

      {/* Client List Header */}
      <div className="list-header">
        <h3>My Clients</h3>
        <span>{clients.length} Clients</span>
      </div>

      {/* Client List */}
      {loading ? (
        <p>Loading clients...</p>
      ) : clients.length === 0 ? (
        <div className="empty-state">
          <p>No clients found.</p>
        </div>
      ) : (
        <div className="clients-grid">

          {clients.map((client) => (

            <div className="client-card" key={client._id}>

              <div className="client-card-header">

                <div className="client-avatar">
  🏢
</div>

                <div>
                  <h3>{client.name}</h3>
                  <p>
                    {client.company || "Individual Client"}
                  </p>
                </div>

              </div>

              <div className="client-info">

                <p>
                  <strong>Email</strong>
                  <span>{client.email}</span>
                </p>

                <p>
                  <strong>Phone</strong>
                  <span>{client.phone || "N/A"}</span>
                </p>

                <p>
                  <strong>Hourly Rate</strong>
                  <span>₹{client.hourlyRate}</span>
                </p>

              </div>

              <div className="card-actions">

                <button
                  className="view-btn"
                  onClick={() => setViewingClient(client)}
                >
                  View
                </button>

                <button
                  className="edit-btn"
                  onClick={() => editClient(client)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteClient(client._id)}
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

      {/* View Client Details */}
      {viewingClient && (

        <div className="details-overlay">

          <div className="details-modal">

            <div className="modal-header">

              <div>
                <h2>Client Details</h2>
                <p>Complete client information</p>
              </div>

              <button
                className="close-icon"
                onClick={() => setViewingClient(null)}
              >
                ×
              </button>

            </div>

            <div className="details-content">

              <div className="detail-item">
                <span>Name</span>
                <strong>{viewingClient.name}</strong>
              </div>

              <div className="detail-item">
                <span>Email</span>
                <strong>{viewingClient.email}</strong>
              </div>

              <div className="detail-item">
                <span>Phone</span>
                <strong>
                  {viewingClient.phone || "N/A"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Company</span>
                <strong>
                  {viewingClient.company || "N/A"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Hourly Rate</span>
                <strong>
                  ₹{viewingClient.hourlyRate}
                </strong>
              </div>

            </div>

            <button
              className="modal-close-btn"
              onClick={() => setViewingClient(null)}
            >
              Close
            </button>

          </div>

        </div>

      )}

    </section>
  );
}

export default Clients;