import { useEffect, useState } from "react";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [skills, setSkills] = useState("");
  const [client, setClient] = useState("");
  const [status, setStatus] = useState("open");
  const [deadline, setDeadline] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);

  const token = localStorage.getItem("token");

  // =========================
  // GET CLIENTS
  // =========================
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
      console.error("FETCH CLIENTS ERROR:", error);
      alert("Server connection failed");
    }
  };

  // =========================
  // GET PROJECTS
  // =========================
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
      console.error("FETCH PROJECTS ERROR:", error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchProjects();
  }, []);

  // =========================
  // ADD / UPDATE PROJECT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const projectData = {
      title,
      description,
      budget: Number(budget),
      skills: skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill),
      client,
      status,
      deadline: deadline || null,
    };

    console.log("PROJECT DATA:", projectData);

    try {
      const url = editingId
        ? `http://localhost:5000/api/projects/${editingId}`
        : "http://localhost:5000/api/projects";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      console.log("PROJECT SERVER RESPONSE:", data);

      // IMPORTANT: Show actual backend error
      if (!response.ok) {
        alert(
          `ERROR: ${data.message || "Operation failed"}\n\nDETAIL: ${
            data.error || "No details available"
          }`
        );
        return;
      }

      alert(
        editingId
          ? "Project updated successfully"
          : "Project added successfully"
      );

      clearForm();
      fetchProjects();
    } catch (error) {
      console.error("PROJECT REQUEST ERROR:", error);
      alert("Server connection failed");
    }
  };

  // =========================
  // EDIT PROJECT
  // =========================
  const editProject = (project) => {
    setEditingId(project._id);

    setTitle(project.title || "");
    setDescription(project.description || "");
    setBudget(project.budget || "");

    setSkills(
      project.skills
        ? project.skills.join(", ")
        : ""
    );

    setClient(
      project.client?._id ||
      project.client ||
      ""
    );

    setStatus(project.status || "open");

    setDeadline(
      project.deadline
        ? new Date(project.deadline)
            .toISOString()
            .split("T")[0]
        : ""
    );
  };

  // =========================
  // CLEAR FORM
  // =========================
  const clearForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setBudget("");
    setSkills("");
    setClient("");
    setStatus("open");
    setDeadline("");
  };

  // =========================
  // DELETE PROJECT
  // =========================
  const deleteProject = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          `ERROR: ${data.message || "Failed to delete project"}\n\nDETAIL: ${
            data.error || "No details available"
          }`
        );
        return;
      }

      alert("Project deleted successfully");

      fetchProjects();
    } catch (error) {
      console.error("DELETE PROJECT ERROR:", error);
      alert("Server connection failed");
    }
  };

  return (
    <section className="section-card">

      {/* =========================
          HEADER
      ========================= */}
      <div className="section-header">
        <div>
          <h2>Projects</h2>
          <p>
            Manage your projects, budgets and client work
          </p>
        </div>
      </div>

      {/* =========================
          PROJECT FORM
      ========================= */}
      <form
        className="project-form"
        onSubmit={handleSubmit}
      >

        <div className="form-grid">

          {/* Title */}
          <input
            type="text"
            placeholder="Project Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
          />

          {/* Budget */}
          <input
            type="number"
            placeholder="Budget"
            value={budget}
            onChange={(e) =>
              setBudget(e.target.value)
            }
            required
          />

          {/* Skills */}
          <input
            type="text"
            placeholder="Skills (e.g. React, Node.js, MongoDB)"
            value={skills}
            onChange={(e) =>
              setSkills(e.target.value)
            }
          />

          {/* Client */}
          <select
            value={client}
            onChange={(e) =>
              setClient(e.target.value)
            }
            required
          >
            <option value="">
              Select Client
            </option>

            {clients.map((item) => (
              <option
                key={item._id}
                value={item._id}
              >
                {item.name}
                {item.company
                  ? ` - ${item.company}`
                  : ""}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            <option value="open">
              Open
            </option>

            <option value="in-progress">
              In Progress
            </option>

            <option value="completed">
              Completed
            </option>
          </select>

          {/* Deadline */}
          <input
            type="date"
            value={deadline}
            onChange={(e) =>
              setDeadline(e.target.value)
            }
            required
          />

        </div>

        {/* Description */}
        <textarea
          className="project-description"
          placeholder="Project Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          required
        />

        {/* Buttons */}
        <div className="form-actions">

          <button
            className="primary-btn"
            type="submit"
          >
            {editingId
              ? "Update Project"
              : "Add Project"}
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

      {/* =========================
          PROJECT LIST HEADER
      ========================= */}
      <div className="list-header">
        <h3>My Projects</h3>
        <span>
          {projects.length} Projects
        </span>
      </div>

      {/* =========================
          PROJECT LIST
      ========================= */}
      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (

        <div className="empty-state">
          <p>No projects found.</p>
        </div>

      ) : (

        <div className="projects-grid">

          {projects.map((project) => (

            <div
              className="project-card"
              key={project._id}
            >

              {/* Card Header */}
              <div className="project-card-header">

                <div>

                  <h3>
                    {project.title}
                  </h3>

                  <p>
                    {project.client?.name ||
                      "Unknown Client"}
                  </p>

                </div>

                <span
                  className={`status-badge status-${project.status}`}
                >
                  {project.status}
                </span>

              </div>

              {/* Description */}
              <p className="project-description-text">
                {project.description}
              </p>

              {/* Project Details */}
              <div className="project-details">

                <div>
                  <span>Budget</span>

                  <strong>
                    ₹
                    {Number(
                      project.budget || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div>
                  <span>Client</span>

                  <strong>
                    {project.client?.name ||
                      "Unknown"}
                  </strong>
                </div>

              </div>

              {/* Deadline */}
              <div className="project-deadline">

                <span>
                  Deadline
                </span>

                <strong>
                  {project.deadline
                    ? new Date(
                        project.deadline
                      ).toLocaleDateString()
                    : "Not set"}
                </strong>

              </div>

              {/* =========================
                  BURN RATE
              ========================= */}
              <div className="burn-rate-section">

                <div className="burn-rate-header">

                  <span>
                    Budget Usage
                  </span>

                  <strong>
                    {project.burnRate || 0}%
                  </strong>

                </div>

                <div className="burn-rate-bar">

                  <div
                    className="burn-rate-progress"
                    style={{
                      width: `${Math.min(
                        project.burnRate || 0,
                        100
                      )}%`,
                    }}
                  ></div>

                </div>

                <div className="burn-rate-info">

                  <div>
                    <span>
                      Used
                    </span>

                    <strong>
                      ₹
                      {Number(
                        project.usedBudget || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Remaining
                    </span>

                    <strong>
                      ₹
                      {Number(
                        project.remainingBudget ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Hours
                    </span>

                    <strong>
                      {project.totalTrackedHours ||
                        0}{" "}
                      hrs
                    </strong>
                  </div>

                </div>

              </div>

              {/* Skills */}
              <div className="skills-list">

                {project.skills &&
                project.skills.length > 0 ? (

                  project.skills.map(
                    (skill, index) => (
                      <span key={index}>
                        {skill}
                      </span>
                    )
                  )

                ) : (

                  <span>
                    No skills added
                  </span>

                )}

              </div>

              {/* Buttons */}
              <div className="card-actions">

                <button
                  type="button"
                  className="view-btn"
                  onClick={() =>
                    setViewingProject(
                      project
                    )
                  }
                >
                  View
                </button>

                <button
                  type="button"
                  className="edit-btn"
                  onClick={() =>
                    editProject(project)
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() =>
                    deleteProject(
                      project._id
                    )
                  }
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

      {/* =========================
          PROJECT DETAILS MODAL
      ========================= */}
      {viewingProject && (

        <div className="details-overlay">

          <div className="details-modal">

            <div className="modal-header">

              <div>

                <h2>
                  Project Details
                </h2>

                <p>
                  Complete project information
                </p>

              </div>

              <button
                type="button"
                className="close-icon"
                onClick={() =>
                  setViewingProject(null)
                }
              >
                ×
              </button>

            </div>

            <div className="details-content">

              <div className="detail-item">
                <span>Title</span>

                <strong>
                  {viewingProject.title}
                </strong>
              </div>

              <div className="detail-item">
                <span>
                  Description
                </span>

                <strong>
                  {viewingProject.description}
                </strong>
              </div>

              <div className="detail-item">
                <span>Budget</span>

                <strong>
                  ₹
                  {Number(
                    viewingProject.budget || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div className="detail-item">
                <span>Skills</span>

                <strong>
                  {viewingProject.skills?.join(
                    ", "
                  ) || "None"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Client</span>

                <strong>
                  {viewingProject.client
                    ?.name || "Unknown"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Status</span>

                <strong>
                  {viewingProject.status}
                </strong>
              </div>

              <div className="detail-item">
                <span>Deadline</span>

                <strong>
                  {viewingProject.deadline
                    ? new Date(
                        viewingProject.deadline
                      ).toLocaleDateString()
                    : "Not set"}
                </strong>
              </div>

            </div>

            <button
              type="button"
              className="modal-close-btn"
              onClick={() =>
                setViewingProject(null)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </section>
  );
}

export default Projects;