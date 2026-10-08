import React, { useState } from "react";
import PerformanceEvidenceModal from "./PerformanceEvidenceModal";

export default function PerformanceView({
  metrics,
  baselines,
  evidence,
  onRunBenchmark,
  onRefreshMetrics,
  onSaveBaseline,
  isBenchmarking,
}) {
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [showEditBaselines, setShowEditBaselines] = useState(false);

  // Editable baseline state
  const [selectedBaselineName, setSelectedBaselineName] = useState(
    baselines?.[0]?.name || "Baseline A (Traditional Static Linter)"
  );
  const activeBaseline = baselines?.find((b) => b.name === selectedBaselineName) || baselines?.[0] || {
    name: "Baseline A",
    response_time_sec: 2.8,
    analysis_time_sec: 1.9,
    test_pass_rate: 78.0,
    error_resolution_rate: 62.0,
    throughput_rpm: 18.0,
    memory_usage_mb: 120.0,
  };

  const [editForm, setEditForm] = useState({
    response_time_sec: activeBaseline.response_time_sec,
    analysis_time_sec: activeBaseline.analysis_time_sec,
    test_pass_rate: activeBaseline.test_pass_rate,
    error_resolution_rate: activeBaseline.error_resolution_rate,
    throughput_rpm: activeBaseline.throughput_rpm,
    memory_usage_mb: activeBaseline.memory_usage_mb,
  });

  const handleSelectBaselineToEdit = (name) => {
    setSelectedBaselineName(name);
    const target = baselines.find((b) => b.name === name);
    if (target) {
      setEditForm({
        response_time_sec: target.response_time_sec,
        analysis_time_sec: target.analysis_time_sec,
        test_pass_rate: target.test_pass_rate,
        error_resolution_rate: target.error_resolution_rate,
        throughput_rpm: target.throughput_rpm,
        memory_usage_mb: target.memory_usage_mb,
      });
    }
  };

  const handleSaveBaselineForm = (e) => {
    e.preventDefault();
    onSaveBaseline({
      name: selectedBaselineName,
      response_time_sec: parseFloat(editForm.response_time_sec),
      analysis_time_sec: parseFloat(editForm.analysis_time_sec),
      test_pass_rate: parseFloat(editForm.test_pass_rate),
      error_resolution_rate: parseFloat(editForm.error_resolution_rate),
      throughput_rpm: parseFloat(editForm.throughput_rpm),
      memory_usage_mb: parseFloat(editForm.memory_usage_mb),
      source_type: "user_entered",
    });
    setShowEditBaselines(false);
  };

  const effScore = metrics?.efficiency_score?.overall_score ?? 0;
  const breakdown = metrics?.efficiency_score?.breakdown ?? {};
  const rt = metrics?.response_time ?? {};
  const at = metrics?.analysis_time ?? {};
  const tp = metrics?.test_performance ?? {};
  const et = metrics?.error_tracking ?? {};
  const th = metrics?.throughput ?? {};
  const res = metrics?.resources ?? {};

  // Formats ms or sec
  const formatTime = (ms) => {
    if (!ms || ms === 0) return "—";
    if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
    return `${Math.round(ms)} ms`;
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: "1280px" }}>
      {/* Top Banner and Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.4px", marginBottom: "4px" }}>
            Efficiency & Performance Evaluation
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Empirical runtime performance, code analysis latency, algorithmic accuracy, and benchmark comparison across live test runs.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn-submit"
            onClick={onRunBenchmark}
            disabled={isBenchmarking}
            title="Execute non-destructive benchmark test suite"
          >
            {isBenchmarking ? "Running Benchmark..." : "▶ Run Performance Benchmark"}
          </button>

          <button
            className="btn-secondary"
            onClick={() => setShowEvidenceModal(true)}
            title="Inspect underlying run telemetry"
          >
            📋 View Evidence ({evidence.length} Runs)
          </button>

          <button
            className="btn-secondary"
            onClick={onRefreshMetrics}
            title="Reload telemetry data"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* 1. EFFICIENCY SCORE HERO CARD */}
      <div className="dash-card" style={{ marginBottom: "24px", padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div className="score-circle" style={{ width: "88px", height: "88px", fontSize: "28px" }}>
              {effScore > 0 ? effScore : "—"}
              <span>{effScore > 0 ? "/ 100" : "Score"}</span>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                  Composite Efficiency Score
                </h3>
                <span className={`difficulty-badge ${effScore >= 80 ? "easy" : effScore >= 60 ? "medium" : "hard"}`}>
                  {effScore >= 85 ? "Optimal Efficiency" : effScore >= 70 ? "Good Performance" : "Needs Benchmark Runs"}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "600px", lineHeight: "1.5" }}>
                Calculated dynamically from real machine telemetry: 25% Response Time, 25% Code/Test Pass Rate,
                20% Error Resolution Rate, 15% System Throughput, and 15% Resource Efficiency.
              </p>
            </div>
          </div>

          <div>
            <button
              className="btn-secondary"
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            >
              {showFormulaDetails ? "Hide Score Breakdown" : "View Score Calculation"}
            </button>
          </div>
        </div>

        {/* Detailed Formula Breakdown */}
        {showFormulaDetails && (
          <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "10px" }}>
              Weighted Score Components Breakdown
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
              <div className="metric-bar-card">
                <div className="metric-bar-header">
                  <span>Response Time (25%)</span>
                  <strong>{breakdown.response_time_component ?? 0} pts</strong>
                </div>
                <div className="metric-track">
                  <div className="metric-fill high" style={{ width: `${(breakdown.raw_scores?.response_time || 0)}%` }} />
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Avg: {formatTime(rt.avg_ms)}
                </div>
              </div>

              <div className="metric-bar-card">
                <div className="metric-bar-header">
                  <span>Test Pass Rate (25%)</span>
                  <strong>{breakdown.test_pass_component ?? 0} pts</strong>
                </div>
                <div className="metric-track">
                  <div className="metric-fill high" style={{ width: `${(breakdown.raw_scores?.test_pass_rate || 0)}%` }} />
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Pass: {tp.pass_rate_pct ?? 0}%
                </div>
              </div>

              <div className="metric-bar-card">
                <div className="metric-bar-header">
                  <span>Error Resolution (20%)</span>
                  <strong>{breakdown.error_resolution_component ?? 0} pts</strong>
                </div>
                <div className="metric-track">
                  <div className="metric-fill high" style={{ width: `${(breakdown.raw_scores?.error_resolution || 0)}%` }} />
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Res: {et.resolution_rate_pct ?? 0}%
                </div>
              </div>

              <div className="metric-bar-card">
                <div className="metric-bar-header">
                  <span>Throughput (15%)</span>
                  <strong>{breakdown.throughput_component ?? 0} pts</strong>
                </div>
                <div className="metric-track">
                  <div className="metric-fill high" style={{ width: `${(breakdown.raw_scores?.throughput || 0)}%` }} />
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Rate: {th.requests_per_minute ?? 0} RPM
                </div>
              </div>

              <div className="metric-bar-card">
                <div className="metric-bar-header">
                  <span>Resource Use (15%)</span>
                  <strong>{breakdown.resource_component ?? 0} pts</strong>
                </div>
                <div className="metric-track">
                  <div className="metric-fill high" style={{ width: `${(breakdown.raw_scores?.resource_efficiency || 0)}%` }} />
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  RAM: {res.memory_mb ?? 0} MB
                </div>
              </div>
            </div>

            <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
              Formula: <code>Efficiency Score = (Response Time × 0.25) + (Test Pass Rate × 0.25) + (Error Resolution × 0.20) + (Throughput × 0.15) + (Resource Efficiency × 0.15)</code>
            </div>
          </div>
        )}
      </div>

      {/* 2. THE 6 MEASURABLE PARAMETER KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px", marginBottom: "28px" }}>
        {/* PARAMETER 1: Response Time */}
        <div className="stat-metric-card">
          <div className="stat-label">1. Response Time</div>
          <div className="stat-value">{formatTime(rt.avg_ms)}</div>
          <div className="stat-subtext" style={{ marginBottom: "12px" }}>
            Average round-trip response duration
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "4px", border: "1px solid var(--border)" }}>
            <div>Min: <strong>{formatTime(rt.min_ms)}</strong></div>
            <div>Max: <strong>{formatTime(rt.max_ms)}</strong></div>
            <div>Latest: <strong>{formatTime(rt.latest_ms)}</strong></div>
          </div>
        </div>

        {/* PARAMETER 2: Code Analysis Time */}
        <div className="stat-metric-card">
          <div className="stat-label">2. Code Analysis Time</div>
          <div className="stat-value">{formatTime(at.avg_ms)}</div>
          <div className="stat-subtext" style={{ marginBottom: "12px" }}>
            Time spent analyzing submitted code structure & algorithms
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "4px", border: "1px solid var(--border)" }}>
            <div>Fastest: <strong>{formatTime(at.fastest_ms)}</strong></div>
            <div>Slowest: <strong>{formatTime(at.slowest_ms)}</strong></div>
          </div>
        </div>

        {/* PARAMETER 3: Code/Test Performance */}
        <div className="stat-metric-card">
          <div className="stat-label">3. Code/Test Performance</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>
            {tp.pass_rate_pct !== undefined ? `${tp.pass_rate_pct}%` : "—"}
          </div>
          <div className="stat-subtext" style={{ marginBottom: "12px" }}>
            Pass rate across all verified test cases
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "4px", border: "1px solid var(--border)" }}>
            <div>Total: <strong>{tp.total_test_cases || 0}</strong></div>
            <div style={{ color: "var(--success)" }}>Passed: <strong>{tp.passed || 0}</strong></div>
            <div style={{ color: "var(--danger)" }}>Failed: <strong>{tp.failed || 0}</strong></div>
          </div>
        </div>

        {/* PARAMETER 4: Error Detection & Resolution */}
        <div className="stat-metric-card">
          <div className="stat-label">4. Error Detection & Resolution</div>
          <div className="stat-value" style={{ color: "var(--accent-blue)" }}>
            {et.resolution_rate_pct !== undefined ? `${et.resolution_rate_pct}%` : "—"}
          </div>
          <div className="stat-subtext" style={{ marginBottom: "12px" }}>
            Resolution rate of identified code errors & issues
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "4px", border: "1px solid var(--border)" }}>
            <div>Detected: <strong>{et.total_detected || 0}</strong></div>
            <div>Correctly Identified: <strong>{et.correctly_detected || 0}</strong></div>
            <div style={{ color: "var(--success)" }}>Resolved: <strong>{et.resolved || 0}</strong></div>
          </div>
        </div>

        {/* PARAMETER 5: Throughput */}
        <div className="stat-metric-card">
          <div className="stat-label">5. Throughput</div>
          <div className="stat-value">
            {th.requests_per_minute !== undefined ? `${th.requests_per_minute}` : "—"}
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)", marginLeft: "4px" }}>RPM</span>
          </div>
          <div className="stat-subtext" style={{ marginBottom: "12px" }}>
            Sustained processed requests per minute
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "4px", border: "1px solid var(--border)" }}>
            <div>Success: <strong>{th.successful_requests || 0}</strong></div>
            <div>Failed: <strong>{th.failed_requests || 0}</strong></div>
            <div>Avg Proc: <strong>{formatTime(th.avg_processing_time_ms)}</strong></div>
          </div>
        </div>

        {/* PARAMETER 6: Resource Utilization */}
        <div className="stat-metric-card">
          <div className="stat-label">6. Resource Utilization (Backend)</div>
          <div className="stat-value">
            {res.memory_mb ? `${res.memory_mb} MB` : "—"}
          </div>
          <div className="stat-subtext" style={{ marginBottom: "12px" }}>
            Real server-side process memory & CPU footprint
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "4px", border: "1px solid var(--border)" }}>
            <div>Process CPU: <strong>{res.cpu_percent ? `${res.cpu_percent}%` : "< 2%"}</strong></div>
            <div>System RAM: <strong>{res.system_memory_percent ? `${res.system_memory_percent}%` : "—"}</strong></div>
            <div>Source: <strong>{res.source || "backend/psutil"}</strong></div>
          </div>
        </div>
      </div>

      {/* 3. BENCHMARK COMPARISON TABLE */}
      <div className="dash-card" style={{ marginBottom: "28px" }}>
        <div className="dash-card-header">
          <div>
            <h3>Empirical Benchmark Comparison</h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Comparing AI Coding Mentor against established baseline implementations
            </span>
          </div>

          <button
            className="btn-secondary"
            onClick={() => setShowEditBaselines(!showEditBaselines)}
          >
            {showEditBaselines ? "Close Baseline Editor" : "✎ Customize Comparison Baselines"}
          </button>
        </div>

        {/* Baseline Editor Drawer */}
        {showEditBaselines && (
          <div style={{ padding: "16px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
              Configure Baseline Target Values
            </div>
            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginRight: "8px" }}>Select Baseline:</span>
              <select
                className="lang-select"
                value={selectedBaselineName}
                onChange={(e) => handleSelectBaselineToEdit(e.target.value)}
              >
                {baselines.map((b) => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSaveBaselineForm} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Response Time (sec)</label>
                <input
                  type="number"
                  step="0.01"
                  className="custom-input-area"
                  style={{ height: "32px", padding: "4px 8px" }}
                  value={editForm.response_time_sec}
                  onChange={(e) => setEditForm({ ...editForm, response_time_sec: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Analysis Time (sec)</label>
                <input
                  type="number"
                  step="0.01"
                  className="custom-input-area"
                  style={{ height: "32px", padding: "4px 8px" }}
                  value={editForm.analysis_time_sec}
                  onChange={(e) => setEditForm({ ...editForm, analysis_time_sec: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Test Pass Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="custom-input-area"
                  style={{ height: "32px", padding: "4px 8px" }}
                  value={editForm.test_pass_rate}
                  onChange={(e) => setEditForm({ ...editForm, test_pass_rate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Error Resolution Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="custom-input-area"
                  style={{ height: "32px", padding: "4px 8px" }}
                  value={editForm.error_resolution_rate}
                  onChange={(e) => setEditForm({ ...editForm, error_resolution_rate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Throughput (RPM)</label>
                <input
                  type="number"
                  step="0.1"
                  className="custom-input-area"
                  style={{ height: "32px", padding: "4px 8px" }}
                  value={editForm.throughput_rpm}
                  onChange={(e) => setEditForm({ ...editForm, throughput_rpm: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Memory Usage (MB)</label>
                <input
                  type="number"
                  step="0.1"
                  className="custom-input-area"
                  style={{ height: "32px", padding: "4px 8px" }}
                  value={editForm.memory_usage_mb}
                  onChange={(e) => setEditForm({ ...editForm, memory_usage_mb: e.target.value })}
                  required
                />
              </div>

              <div style={{ gridColumn: "span 3", display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "6px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowEditBaselines(false)}>Cancel</button>
                <button type="submit" className="btn-run">Save Baseline Settings</button>
              </div>
            </form>
          </div>
        )}

        <table className="problems-table">
          <thead>
            <tr>
              <th>Evaluation Metric</th>
              <th style={{ backgroundColor: "#eff6ff", color: "var(--accent-blue)" }}>
                AI Coding Mentor <span style={{ fontSize: "10px", padding: "2px 5px", background: "#dbeafe", borderRadius: "3px" }}>Measured</span>
              </th>
              {baselines.map((b) => (
                <th key={b.id}>
                  {b.name}
                  <div style={{ fontSize: "10px", textTransform: "none", color: "var(--text-muted)" }}>
                    {b.source_type === "benchmark_reference" ? "(Reference)" : "(User Input)"}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Response Time</strong></td>
              <td style={{ backgroundColor: "#f8fafc", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-blue)" }}>
                {rt.avg_ms ? `${(rt.avg_ms / 1000).toFixed(2)} s` : "—"}
              </td>
              {baselines.map((b) => (
                <td key={b.id} style={{ fontFamily: "var(--font-mono)" }}>
                  {b.response_time_sec.toFixed(2)} s
                </td>
              ))}
            </tr>

            <tr>
              <td><strong>Code Analysis Time</strong></td>
              <td style={{ backgroundColor: "#f8fafc", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-blue)" }}>
                {at.avg_ms ? `${(at.avg_ms / 1000).toFixed(2)} s` : "—"}
              </td>
              {baselines.map((b) => (
                <td key={b.id} style={{ fontFamily: "var(--font-mono)" }}>
                  {b.analysis_time_sec.toFixed(2)} s
                </td>
              ))}
            </tr>

            <tr>
              <td><strong>Code / Test Pass Rate</strong></td>
              <td style={{ backgroundColor: "#f8fafc", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--success)" }}>
                {tp.pass_rate_pct !== undefined ? `${tp.pass_rate_pct}%` : "—"}
              </td>
              {baselines.map((b) => (
                <td key={b.id} style={{ fontFamily: "var(--font-mono)" }}>
                  {b.test_pass_rate.toFixed(1)}%
                </td>
              ))}
            </tr>

            <tr>
              <td><strong>Error Resolution Rate</strong></td>
              <td style={{ backgroundColor: "#f8fafc", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-blue)" }}>
                {et.resolution_rate_pct !== undefined ? `${et.resolution_rate_pct}%` : "—"}
              </td>
              {baselines.map((b) => (
                <td key={b.id} style={{ fontFamily: "var(--font-mono)" }}>
                  {b.error_resolution_rate.toFixed(1)}%
                </td>
              ))}
            </tr>

            <tr>
              <td><strong>System Throughput</strong></td>
              <td style={{ backgroundColor: "#f8fafc", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-blue)" }}>
                {th.requests_per_minute ? `${th.requests_per_minute} RPM` : "—"}
              </td>
              {baselines.map((b) => (
                <td key={b.id} style={{ fontFamily: "var(--font-mono)" }}>
                  {b.throughput_rpm.toFixed(1)} RPM
                </td>
              ))}
            </tr>

            <tr>
              <td><strong>Resource Footprint (Memory)</strong></td>
              <td style={{ backgroundColor: "#f8fafc", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-blue)" }}>
                {res.memory_mb ? `${res.memory_mb} MB` : "—"}
              </td>
              {baselines.map((b) => (
                <td key={b.id} style={{ fontFamily: "var(--font-mono)" }}>
                  {b.memory_usage_mb.toFixed(1)} MB
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <div style={{ padding: "12px 18px", backgroundColor: "#f8fafc", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
          <div>
            <span style={{ color: "var(--accent-blue)", fontWeight: 700 }}>● Blue column:</span> Real measurements from your live backend instance.
          </div>
          <div>
            <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>○ Baselines:</span> Comparison references configurable via the editor above.
          </div>
        </div>
      </div>

      {/* EVIDENCE MODAL */}
      {showEvidenceModal && (
        <PerformanceEvidenceModal
          evidence={evidence}
          onClose={() => setShowEvidenceModal(false)}
        />
      )}
    </div>
  );
}
