import React from "react";

export default function Navbar({
  problems,
  currentProblemId,
  onSelectProblem,
  activeView,
  setActiveView,
  backendOnline,
}) {
  return (
    <nav className="top-navbar">
      <div className="nav-brand-section">
        <div className="brand-title">
          <span>AI Coding Mentor</span>
          <span className="brand-badge">Placement Prep</span>
        </div>

        {activeView === "ide" && problems.length > 0 && (
          <div className="nav-problem-picker">
            <span style={{ color: "#64748b", fontSize: "12px" }}>Problem:</span>
            <select
              className="nav-problem-select"
              value={currentProblemId}
              onChange={(e) => onSelectProblem(e.target.value)}
            >
              {problems.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.difficulty})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="nav-actions">
        <button
          className={`nav-tab-btn ${activeView === "ide" ? "active" : ""}`}
          onClick={() => setActiveView("ide")}
        >
          Practice IDE
        </button>

        <button
          className={`nav-tab-btn ${activeView === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveView("dashboard")}
        >
          Dashboard & Readiness
        </button>

        <button
          className={`nav-tab-btn ${activeView === "performance" ? "active" : ""}`}
          onClick={() => setActiveView("performance")}
        >
          Efficiency & Performance
        </button>

        <div className="connection-status" title={backendOnline ? "Connected to backend server" : "Connecting to backend..."}>
          <span className={`status-dot ${backendOnline ? "" : "offline"}`} />
          <span>{backendOnline ? "Ready" : "Offline"}</span>
        </div>
      </div>
    </nav>
  );
}
