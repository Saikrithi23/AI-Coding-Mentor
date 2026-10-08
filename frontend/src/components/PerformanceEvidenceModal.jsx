import React, { useState } from "react";

export default function PerformanceEvidenceModal({ evidence, onClose }) {
  const [filterType, setFilterType] = useState("all");

  const filteredLogs = evidence.filter((item) => {
    if (filterType === "all") return true;
    return item.request_type === filterType;
  });

  const exportAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(evidence, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ai_coding_mentor_benchmark_evidence_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAsCSV = () => {
    if (!evidence || evidence.length === 0) return;
    const headers = [
      "Run_ID", "Timestamp", "Request_Type", "Problem", "Response_Time_ms",
      "Analysis_Time_ms", "Total_Tests", "Passed_Tests", "Failed_Tests",
      "Errors_Detected", "Errors_Resolved", "Status", "CPU_Percent", "Memory_MB", "Notes"
    ];
    const rows = evidence.map((e) => [
      e.id,
      `"${e.timestamp}"`,
      `"${e.request_type}"`,
      `"${e.problem_id}"`,
      e.response_time_ms,
      e.analysis_time_ms,
      e.total_test_cases,
      e.passed_test_cases,
      e.failed_test_cases,
      e.errors_detected,
      e.errors_resolved,
      `"${e.status}"`,
      e.cpu_percent,
      e.memory_mb,
      `"${e.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `ai_coding_mentor_benchmark_evidence_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div className="review-modal" style={{ width: "1080px", maxWidth: "96vw" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="review-modal-header">
          <div className="review-modal-title">
            <span>Benchmark Evidence & Audit Logs</span>
            <span className="brand-badge">{evidence.length} Logged Runs</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="btn-secondary" onClick={exportAsCSV} title="Export to CSV">
              ↓ Export CSV
            </button>
            <button className="btn-secondary" onClick={exportAsJSON} title="Export to JSON">
              ↓ Export JSON
            </button>
            <button className="modal-close-btn" onClick={onClose} title="Close window">
              ✕
            </button>
          </div>
        </div>

        {/* Filters and Notice */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px" }}>
            <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>Filter:</span>
            <button
              className={`nav-tab-btn ${filterType === "all" ? "active" : ""}`}
              style={{ padding: "3px 8px", fontSize: "11px" }}
              onClick={() => setFilterType("all")}
            >
              All Events ({evidence.length})
            </button>
            <button
              className={`nav-tab-btn ${filterType === "benchmark_run" ? "active" : ""}`}
              style={{ padding: "3px 8px", fontSize: "11px" }}
              onClick={() => setFilterType("benchmark_run")}
            >
              Benchmark Suite
            </button>
            <button
              className={`nav-tab-btn ${filterType === "test_cases_submission" ? "active" : ""}`}
              style={{ padding: "3px 8px", fontSize: "11px" }}
              onClick={() => setFilterType("test_cases_submission")}
            >
              Test Submissions
            </button>
            <button
              className={`nav-tab-btn ${filterType === "ai_review" ? "active" : ""}`}
              style={{ padding: "3px 8px", fontSize: "11px" }}
              onClick={() => setFilterType("ai_review")}
            >
              AI Reviews
            </button>
          </div>

          <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
            ✓ Traceable SQLite audit log (<code>mentor.db</code>)
          </div>
        </div>

        {/* Evidence Table */}
        <div style={{ padding: "16px 20px", overflowY: "auto", maxHeight: "65vh" }}>
          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "13px" }}>
              No performance logs found for this filter. Run test cases or click "Run Performance Benchmark" to generate proof logs.
            </div>
          ) : (
            <table className="problems-table" style={{ fontSize: "12px" }}>
              <thead>
                <tr>
                  <th>Run #</th>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Problem / Notes</th>
                  <th>Response Time</th>
                  <th>Analysis Time</th>
                  <th>Tests Passed</th>
                  <th>Errors</th>
                  <th>Status</th>
                  <th>Memory</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((item) => (
                  <tr key={item.id}>
                    <td><strong>#{item.id.toString().padStart(3, "0")}</strong></td>
                    <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                      {item.timestamp}
                    </td>
                    <td>
                      <span className="topic-tag" style={{ fontSize: "10px" }}>
                        {item.request_type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.notes || item.problem_id}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>
                      <strong>{item.response_time_ms} ms</strong>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                      {item.analysis_time_ms > 0 ? `${item.analysis_time_ms} ms` : "—"}
                    </td>
                    <td>
                      {item.total_test_cases > 0 ? (
                        <span>
                          <strong style={{ color: item.passed_test_cases === item.total_test_cases ? "var(--success)" : "var(--danger)" }}>
                            {item.passed_test_cases}
                          </strong> / {item.total_test_cases}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: item.errors_detected > 0 ? "var(--danger)" : "var(--success)" }}>
                        {item.errors_detected > 0 ? `${item.errors_detected} det.` : "0"}
                      </span>
                      {item.errors_resolved > 0 && (
                        <span style={{ color: "var(--success)", marginLeft: "4px" }}>
                          ({item.errors_resolved} res.)
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`tc-status-pill ${item.status === "success" ? "pass" : "fail"}`} style={{ fontSize: "10px" }}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                      {item.memory_mb ? `${item.memory_mb} MB` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
