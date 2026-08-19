import { useEffect, useState } from "react";

function TimeEntries() {
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [billable, setBillable] = useState(true);

  // Edit / View
  const [editingId, setEditingId] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);

  // Stopwatch
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const token = localStorage.getItem("token");

  // =========================
  // START TIMER
  // =========================
  const startTimer = () => {
    if (timerRunning) return;

    const now = Date.now();

    setTimerStart(now);
    setTimerSeconds(0);
    localStorage.removeItem(
  "freelanceflow_timer_seconds"
);
    setTimerRunning(true);

    localStorage.setItem(
      "freelanceflow_timer_start",
      now.toString()
    );

    // Automatically set start time
    const localDate = new Date(now);
    const formatted = new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    setStartTime(formatted);
  };

  // =========================
  // STOP TIMER
  // =========================
  const stopTimer = () => {
  if (!timerRunning || !timerStart) return;

  const now = Date.now();

  const seconds = Math.floor((now - timerStart) / 1000);
  const minutes = Math.floor(seconds / 60);

  // Timer stop
  setTimerRunning(false);
  setTimerStart(null);
  setTimerSeconds(seconds);

  // Duration fill karo
  setDuration(minutes);

  // End time fill karo
  const endDate = new Date(now);

  const formattedEndTime = new Date(
    endDate.getTime() -
      endDate.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  setEndTime(formattedEndTime);

  // Saved timer hatao
  localStorage.removeItem("freelanceflow_timer_start");

  // Last timer duration save karo
  localStorage.setItem(
    "freelanceflow_timer_seconds",
    seconds.toString()
  );
};

  // =========================
  // FORMAT TIMER
  // =========================
  const formatTimer = (seconds) => {
    const hours = Math.floor(seconds / 3600);

    const mins = Math.floor(
      (seconds % 3600) / 60
    );

    const secs = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(
      mins
    ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // =========================
  // FETCH PROJECTS
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
        alert(
          data.message ||
            "Failed to load projects"
        );
      }
    } catch (error) {
      alert("Server connection failed");
    }
  };

  // =========================
  // FETCH TASKS
  // =========================
  const fetchTasks = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTasks(data);
      } else {
        alert(
          data.message ||
            "Failed to load tasks"
        );
      }
    } catch (error) {
      alert("Server connection failed");
    }
  };

  // =========================
  // FETCH TIME ENTRIES
  // =========================
  const fetchEntries = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/time-entries",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEntries(data);
      } else {
        alert(
          data.message ||
            "Failed to load time entries"
        );
      }
    } catch (error) {
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchEntries();
  }, []);

  // =========================
  // RESTORE TIMER AFTER REFRESH
  // =========================
useEffect(() => {
  const savedStart = localStorage.getItem(
    "freelanceflow_timer_start"
  );

  const savedSeconds = localStorage.getItem(
    "freelanceflow_timer_seconds"
  );

  // Agar timer abhi running tha
  if (savedStart) {
    const start = Number(savedStart);

    setTimerStart(start);
    setTimerRunning(true);

    const elapsed = Math.floor(
      (Date.now() - start) / 1000
    );

    setTimerSeconds(elapsed);
  }
  // Agar timer stop ho chuka tha
  else if (savedSeconds) {
    setTimerSeconds(Number(savedSeconds));
  }
}, []);
  // =========================
  // TIMER INTERVAL
  // =========================
  useEffect(() => {
    if (!timerRunning || !timerStart) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - timerStart) / 1000
      );

      setTimerSeconds(elapsed);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [timerRunning, timerStart]);

  // =========================
  // ADD / UPDATE TIME ENTRY
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const entryData = {
      description,
      project,
      task: task || undefined,
      startTime,
      endTime: endTime || undefined,
      duration: Number(duration) || 0,
      billable,
    };

    try {
      const url = editingId
        ? `http://localhost:5000/api/time-entries/${editingId}`
        : "http://localhost:5000/api/time-entries";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(entryData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Operation failed"
        );
        return;
      }

      alert(
        editingId
          ? "Time entry updated successfully"
          : "Time entry added successfully"
      );

      clearForm();
      fetchEntries();
    } catch (error) {
      alert("Server connection failed");
    }
  };

  // =========================
  // EDIT ENTRY
  // =========================
  const editEntry = (entry) => {
    setEditingId(entry._id);

    setDescription(
      entry.description || ""
    );

    setProject(
      entry.project?._id ||
        entry.project ||
        ""
    );

    setTask(
      entry.task?._id ||
        entry.task ||
        ""
    );

    setStartTime(
      entry.startTime
        ? new Date(entry.startTime)
            .toISOString()
            .slice(0, 16)
        : ""
    );

    setEndTime(
      entry.endTime
        ? new Date(entry.endTime)
            .toISOString()
            .slice(0, 16)
        : ""
    );

    setDuration(
      entry.duration || ""
    );

    setBillable(
      entry.billable !== false
    );
  };

  // =========================
  // CLEAR FORM
  // =========================
  const clearForm = () => {
    setEditingId(null);
    setDescription("");
    setProject("");
    setTask("");
    setStartTime("");
    setEndTime("");
    setDuration("");
    setBillable(true);
  };

  // =========================
  // DELETE ENTRY
  // =========================
  const deleteEntry = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this time entry?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/time-entries/${id}`,
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
          data.message ||
            "Failed to delete time entry"
        );
        return;
      }

      alert(
        "Time entry deleted successfully"
      );

      fetchEntries();
    } catch (error) {
      alert("Server connection failed");
    }
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleString();
  };

  // =========================
  // FORMAT DURATION
  // =========================
  const formatDuration = (minutes) => {
    if (!minutes) return "0 min";

    const hours = Math.floor(
      minutes / 60
    );

    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} min`;
    }

    if (mins === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${mins} min`;
  };

  return (
    <section className="section-card">

      {/* =========================
          STOPWATCH
      ========================= */}

      <div className="timer-box">

        <div>
          <h3>Work Timer</h3>

          <p>
            {timerRunning
              ? "Timer is running..."
              : "Track your work time"}
          </p>
        </div>

        <div className="timer-display">
          {formatTimer(timerSeconds)}
        </div>

        {!timerRunning ? (
          <button
            type="button"
            className="primary-btn"
            onClick={startTimer}
          >
            ▶ Start Timer
          </button>
        ) : (
          <button
            type="button"
            className="delete-btn"
            onClick={stopTimer}
          >
            ⏹ Stop Timer
          </button>
        )}

      </div>

      {/* =========================
          HEADER
      ========================= */}

      <div className="section-header">

        <div>
          <h2>Time Tracking</h2>

          <p>
            Track your work hours and
            billable time
          </p>
        </div>

      </div>

      {/* =========================
          FORM
      ========================= */}

      <form
        className="time-form"
        onSubmit={handleSubmit}
      >

        <div className="form-grid">

          {/* Description */}

          <input
            type="text"
            placeholder="Work Description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            required
          />

          {/* Project */}

          <select
            value={project}
            onChange={(e) =>
              setProject(e.target.value)
            }
            required
          >

            <option value="">
              Select Project
            </option>

            {projects.map((item) => (
              <option
                key={item._id}
                value={item._id}
              >
                {item.title}
              </option>
            ))}

          </select>

          {/* Task */}

          <select
            value={task}
            onChange={(e) =>
              setTask(e.target.value)
            }
          >

            <option value="">
              Select Task (Optional)
            </option>

            {tasks.map((item) => (
              <option
                key={item._id}
                value={item._id}
              >
                {item.title}
              </option>
            ))}

          </select>

          {/* Start Time */}

          <div className="input-group">

            <label>
              Start Time
            </label>

            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) =>
                setStartTime(
                  e.target.value
                )
              }
              required
            />

          </div>

          {/* End Time */}

          <div className="input-group">

            <label>
              End Time
            </label>

            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) =>
                setEndTime(
                  e.target.value
                )
              }
            />

          </div>

          {/* Duration */}

          <input
            type="number"
            placeholder="Duration (minutes)"
            value={duration}
            onChange={(e) =>
              setDuration(
                e.target.value
              )
            }
            min="0"
          />

        </div>

        {/* Billable */}

        <label className="billable-check">

          <input
            type="checkbox"
            checked={billable}
            onChange={(e) =>
              setBillable(
                e.target.checked
              )
            }
          />

          <span>
            Billable Time
          </span>

        </label>

        {/* Buttons */}

        <div className="form-actions">

          <button
            className="primary-btn"
            type="submit"
          >
            {editingId
              ? "Update Time Entry"
              : "Add Time Entry"}
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
          LIST HEADER
      ========================= */}

      <div className="list-header">

        <h3>
          My Time Entries
        </h3>

        <span>
          {entries.length} Entries
        </span>

      </div>

      {/* =========================
          ENTRIES
      ========================= */}

      {loading ? (
        <p>
          Loading time entries...
        </p>
      ) : entries.length === 0 ? (
        <div className="empty-state">

          <p>
            No time entries found.
          </p>

        </div>
      ) : (

        <div className="time-grid">

          {entries.map((entry) => (

            <div
              className="time-card"
              key={entry._id}
            >

              {/* Card Header */}

              <div className="time-card-header">

                <div>

                  <h3>
                    {entry.description}
                  </h3>

                  <p>
                    {entry.project?.title ||
                      "Unknown Project"}
                  </p>

                </div>

                <span
                  className={
                    entry.billable
                      ? "status-badge status-billable"
                      : "status-badge status-nonbillable"
                  }
                >
                  {entry.billable
                    ? "Billable"
                    : "Non-billable"}
                </span>

              </div>

              {/* Details */}

              <div className="time-details">

                <div>

                  <span>
                    Task
                  </span>

                  <strong>
                    {entry.task?.title ||
                      "No task"}
                  </strong>

                </div>

                <div>

                  <span>
                    Duration
                  </span>

                  <strong>
                    {formatDuration(
                      entry.duration
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Start
                  </span>

                  <strong>
                    {formatDate(
                      entry.startTime
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    End
                  </span>

                  <strong>
                    {formatDate(
                      entry.endTime
                    )}
                  </strong>

                </div>

              </div>

              {/* Actions */}

              <div className="card-actions">

                <button
                  type="button"
                  className="view-btn"
                  onClick={() =>
                    setViewingEntry(entry)
                  }
                >
                  View
                </button>

                <button
                  type="button"
                  className="edit-btn"
                  onClick={() =>
                    editEntry(entry)
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() =>
                    deleteEntry(entry._id)
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
          VIEW MODAL
      ========================= */}

      {viewingEntry && (

        <div className="details-overlay">

          <div className="details-modal">

            {/* Modal Header */}

            <div className="modal-header">

              <div>

                <h2>
                  Time Entry Details
                </h2>

                <p>
                  Complete time tracking
                  information
                </p>

              </div>

              <button
                type="button"
                className="close-icon"
                onClick={() =>
                  setViewingEntry(null)
                }
              >
                ×
              </button>

            </div>

            {/* Modal Content */}

            <div className="details-content">

              <div className="detail-item">

  <span>
    Duration
  </span>

  <strong>
    {formatDuration(
      viewingEntry.duration
    )}
  </strong>

</div>

<div className="detail-item">

  <span>
    Billing
  </span>

  <strong>
    {viewingEntry.billable
      ? "Billable"
      : "Non-billable"}
  </strong>

</div>

</div>

</div>

</div>

)}

</section>
);
}

export default TimeEntries;