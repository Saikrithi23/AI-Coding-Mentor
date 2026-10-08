import React from "react";

export default function DashboardView({
  metrics,
  submissions,
  problems,
  onSelectProblem,
  onOpenReview,
}) {
  const solvedCount = metrics?.problems_solved ?? 0;
  const attemptedCount = metrics?.problems_attempted ?? 0;
  const avgQuality = metrics?.average_quality ?? 0;
  const readiness = metrics?.interview_readiness ?? 0;
  const recentFeedback = metrics?.recent_feedback;

  // Find next unattempted or first problem
  const nextProblem = problems.find((p) => true) || problems[0];

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome-header">
        <h2>Placement Preparation Dashboard</h2>
        <p>Track your coding practice, AI review quality scores, and interview readiness metrics.</p>
      </div>

      {/* 4 CORE METRICS */}
      <div className="metrics-summary-grid">
        <div className="stat-metric-card">
          <div className="stat-label">Problems Solved</div>
          <div className="stat-value">{solvedCount}</div>
          <div className="stat-subtext">Verified against test cases</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-label">Problems Attempted</div>
          <div className="stat-value">{attemptedCount}</div>
          <div className="stat-subtext">Total catalog coverage</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-label">Avg Code Quality</div>
          <div className="stat-value">{avgQuality > 0 ? `${avgQuality}%` : "—"}</div>
          <div className="stat-subtext">AI mentor evaluation average</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-label">Interview Readiness</div>
          <div className="stat-value">{readiness > 0 ? `${readiness}%` : "—"}</div>
          <div className="stat-subtext">Algorithm & complexity rating</div>
        </div>
      </div>

      {/* TWO COLUMN GRID: PROBLEMS + RECENT GUIDANCE */}
      <div className="dashboard-grid-two-col">
        {/* Practice Problem Catalog */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3>Placement Practice Problems</h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {problems.length} Available Questions
            </span>
          </div>

          <table className="problems-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Target Companies</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p) => {
                const diffClass = p.difficulty?.toLowerCase() || "easy";
                return (
                  <tr key={p.id}>
                    <td>
                      <button
                        className="problem-link-btn"
                        onClick={() => onSelectProblem(p.id)}
                      >
                        {p.title}
                      </button>
                    </td>
                    <td>{p.topic}</td>
                    <td>
                      <span className={`difficulty-badge ${diffClass}`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {p.companies?.slice(0, 2).join(", ") || "Tech Interviews"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        style={{ padding: "3px 8px", fontSize: "11px" }}
                        onClick={() => onSelectProblem(p.id)}
                      >
                        Practice →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Recent AI Mentor Guidance */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3>Recent AI Mentor Feedback</h3>
          </div>

          <div className="recent-guidance-card">
            {recentFeedback ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4>{recentFeedback.problem_title}</h4>
                  <span className="score-badge" style={{ color: "var(--accent-blue)" }}>
                    {recentFeedback.score}/100
                  </span>
                </div>
                <p><strong>Summary:</strong> {recentFeedback.summary}</p>
                {recentFeedback.interview_feedback && (
                  <p style={{ fontSize: "12px", color: "#1e40af", background: "#eff6ff", padding: "8px", borderRadius: "4px" }}>
                    <em>Interview tip:</em> {recentFeedback.interview_feedback}
                  </p>
                )}
              </>
            ) : (
              <div>
                <h4>No Reviews Recorded Yet</h4>
                <p>Submit a solution and click <strong>AI Review</strong> to receive in-depth code quality and placement feedback.</p>
              </div>
            )}

            {nextProblem && (
              <button
                className="quick-practice-btn"
                onClick={() => onSelectProblem(nextProblem.id)}
              >
                Continue Practice ({nextProblem.title})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RECENT SUBMISSIONS TABLE */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h3>Recent Submissions History</h3>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {submissions.length} Submissions Logged
          </span>
        </div>

        {submissions.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
            No submissions recorded yet. Pick a problem and run tests to start your history.
          </div>
        ) : (
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Language</th>
                <th>Verdict</th>
                <th>Test Cases</th>
                <th>Quality Score</th>
                <th>Date</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <button
                      className="problem-link-btn"
                      onClick={() => onSelectProblem(s.problem_id)}
                    >
                      {s.problem_title}
                    </button>
                  </td>
                  <td><strong>{s.language}</strong></td>
                  <td>
                    <span
                      className={`tc-status-pill ${s.passed ? "pass" : "fail"}`}
                      style={{ padding: "3px 8px" }}
                    >
                      {s.passed ? "Passed" : "Failed"}
                    </span>
                  </td>
                  <td>{s.passed_count} / {s.total_test_cases}</td>
                  <td>
                    {s.score !== null ? (
                      <span className="score-badge">{s.score}/100</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {s.created_at}
                  </td>
                  <td>
                    {s.review ? (
                      <button
                        className="btn-secondary"
                        style={{ padding: "2px 8px", fontSize: "11px" }}
                        onClick={() => onOpenReview(s.review, s.problem_title, s.language)}
                      >
                        View AI Review
                      </button>
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Unreviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
