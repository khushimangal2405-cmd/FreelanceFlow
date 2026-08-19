import { useEffect, useState } from "react";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);

  const token = localStorage.getItem("token");

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTasks(data);
      } else {
        alert(data.message || "Failed to load tasks");
      }
    } catch (error) {
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const taskData = {
      title,
      description,
      project,
      status,
      priority,
      dueDate: dueDate || undefined,
    };

    try {
      const url = editingId
        ? `http://localhost:5000/api/tasks/${editingId}`
        : "http://localhost:5000/api/tasks";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Operation failed");
        return;
      }

      alert(
        editingId
          ? "Task updated successfully"
          : "Task added successfully"
      );

      clearForm();
      fetchTasks();
    } catch (error) {
      alert("Server connection failed");
    }
  };

  const editTask = (task) => {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description);
    setProject(task.project?._id || task.project);
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(
      task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : ""
    );
  };

  const clearForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setProject("");
    setStatus("todo");
    setPriority("medium");
    setDueDate("");
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete task");
        return;
      }

      alert("Task deleted successfully");
      fetchTasks();
    } catch (error) {
      alert("Server connection failed");
    }
  };

  return (
    <section className="section-card">

      <div className="section-header">
        <div>
          <h2>Tasks</h2>
          <p>Organize your work and track task progress</p>
        </div>
      </div>

      {/* Add / Update Task */}
      <form className="task-form" onSubmit={handleSubmit}>

        <div className="form-grid">

          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

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

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

        </div>

        <textarea
          className="task-description"
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="form-actions">

          <button className="primary-btn" type="submit">
            {editingId ? "Update Task" : "Add Task"}
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

      {/* Task List Header */}
      <div className="list-header">
        <h3>My Tasks</h3>
        <span>{tasks.length} Tasks</span>
      </div>

      {/* Task List */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks found.</p>
        </div>
      ) : (
        <div className="tasks-grid">

          {tasks.map((task) => (

            <div className="task-card" key={task._id}>

              <div className="task-card-header">

                <div>
                  <h3>{task.title}</h3>

                  <p>
                    {task.project?.title || "Unknown Project"}
                  </p>
                </div>

                <span
                  className={`priority-badge priority-${task.priority}`}
                >
                  {task.priority}
                </span>

              </div>

              <p className="task-description-text">
                {task.description}
              </p>

              <div className="task-info">

                <div>
                  <span>Status</span>
                  <strong className={`task-status status-${task.status}`}>
                    {task.status}
                  </strong>
                </div>

                <div>
                  <span>Due Date</span>
                  <strong>
                    {task.dueDate
                      ? new Date(
                          task.dueDate
                        ).toLocaleDateString()
                      : "Not set"}
                  </strong>
                </div>

              </div>

              <div className="card-actions">

                <button
                  className="view-btn"
                  onClick={() => setViewingTask(task)}
                >
                  View
                </button>

                <button
                  className="edit-btn"
                  onClick={() => editTask(task)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteTask(task._id)}
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

      {/* Task Details Modal */}
      {viewingTask && (

        <div className="details-overlay">

          <div className="details-modal">

            <div className="modal-header">

              <div>
                <h2>Task Details</h2>
                <p>Complete task information</p>
              </div>

              <button
                className="close-icon"
                onClick={() => setViewingTask(null)}
              >
                ×
              </button>

            </div>

            <div className="details-content">

              <div className="detail-item">
                <span>Title</span>
                <strong>{viewingTask.title}</strong>
              </div>

              <div className="detail-item">
                <span>Description</span>
                <strong>{viewingTask.description}</strong>
              </div>

              <div className="detail-item">
                <span>Project</span>
                <strong>
                  {viewingTask.project?.title || "Unknown"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Status</span>
                <strong>{viewingTask.status}</strong>
              </div>

              <div className="detail-item">
                <span>Priority</span>
                <strong>{viewingTask.priority}</strong>
              </div>

              <div className="detail-item">
                <span>Due Date</span>
                <strong>
                  {viewingTask.dueDate
                    ? new Date(
                        viewingTask.dueDate
                      ).toLocaleDateString()
                    : "Not set"}
                </strong>
              </div>

            </div>

            <button
              className="modal-close-btn"
              onClick={() => setViewingTask(null)}
            >
              Close
            </button>

          </div>

        </div>

      )}

    </section>
  );
}

export default Tasks;