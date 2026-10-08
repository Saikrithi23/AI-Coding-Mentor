import React, { useState } from "react";

export default function ExecutionResultsPane({
  executionResult,
  submissionResult,
  activeMode,
  setActiveMode,
  isLoading,
}) {
  const [activeTab, setActiveTab] = useState("all");

  const isTestCasesMode = activeMode === "test_cases" && submissionResult;
  const isCustomMode = activeMode === "custom" && executionResult;

  return (
    <div className="results-pane">
      <div className="results-tabs-bar">
        <div className="results-tab-group">
          <button
            className={`res-tab-btn ${activeMode === "test_cases" ? "active" : ""}`}
            onClick={() => setActiveMode("test_cases")}
          >
            Test Case Results
          </button>
          <button
            className={`res-tab-btn ${activeMode === "custom" ? "active" : ""}`}
            onClick={() => setActiveMode("custom")}
          >
            Custom Run Output
          </button>
        </div>

        <div className="exec-meta-info">
          {isTestCasesMode && (
            <>
              <span>Lang: <strong>{submissionResult.language}</strong></span>
              <span>Avg Time: <strong>{submissionResult.time}s</strong></span>
              <span>Memory: <strong>{submissionResult.memory} KB</strong></span>
            </>
          )}
          {isCustomMode && (
            <>
              <span>Lang: <strong>{executionResult.language}</strong></span>
              <span>Time: <strong>{executionResult.time || "—"}s</strong></span>
              <span>Memory: <strong>{executionResult.memory || "—"} KB</strong></span>
            </>
          )}
        </div>
      </div>

      <div className="results-content-box">
        {isLoading && (
          <div className="empty-results-msg">
            <span>Executing code and evaluating test cases...</span>
          </div>
        )}

        {!isLoading && !isTestCasesMode && !isCustomMode && (
          <div className="empty-results-msg">
            <span>Click "Run Code" for custom input or "Submit Code" to test against problem test cases.</span>
          </div>
        )}

        {/* TEST CASES EVALUATION VIEW */}
        {!isLoading && isTestCasesMode && (
          <div>
            <div className="verdict-header">
              <span className={`verdict-tag ${submissionResult.success ? "passed" : "failed"}`}>
                {submissionResult.status?.description || (submissionResult.success ? "PASSED" : "FAILED")}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {submissionResult.passed_count} of {submissionResult.total_test_cases} test cases passed
              </span>
            </div>

            {/* Compilation Error Display */}
            {submissionResult.compile_output && (
              <div className="compile-error-banner">
                <div className="compile-error-title">Compilation Error</div>
                <pre className="compile-error-text">{submissionResult.compile_output}</pre>
              </div>
            )}

            {/* Individual Test Cases */}
            {submissionResult.test_cases && (
              <div className="tc-grid">
                {submissionResult.test_cases.map((tc, index) => (
                  <div key={tc.id || index} className="tc-card">
                    <div className="tc-card-header">
                      <span style={{ fontWeight: 600, fontSize: "12px" }}>
                        Test Case {index + 1} {tc.is_sample ? "(Sample)" : ""}
                      </span>
                      <span className={`tc-status-pill ${tc.passed ? "pass" : "fail"}`}>
                        {tc.passed ? "PASSED" : "FAILED"}
                      </span>
                    </div>

                    <div className="tc-details">
                      <div className="tc-detail-item">
                        <span className="lbl">Input</span>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{tc.stdin}</pre>
                      </div>

                      <div className="tc-detail-item">
                        <span className="lbl">Expected Output</span>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{tc.expected_output}</pre>
                      </div>

                      <div className="tc-detail-item">
                        <span className="lbl">Your Output</span>
                        <pre
                          style={{
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            color: tc.passed ? "var(--success)" : "var(--danger)",
                            fontWeight: 600
                          }}
                        >
                          {tc.actual_output || (tc.error ? `Error: ${tc.error}` : "—")}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CUSTOM RUN VIEW */}
        {!isLoading && isCustomMode && (
          <div>
            <div className="verdict-header">
              <span className={`verdict-tag ${executionResult.success ? "passed" : "failed"}`}>
                {executionResult.status?.description || (executionResult.success ? "SUCCESS" : "ERROR")}
              </span>
            </div>

            {/* Compilation Error */}
            {executionResult.compile_output && (
              <div className="compile-error-banner">
                <div className="compile-error-title">Compilation Error</div>
                <pre className="compile-error-text">{executionResult.compile_output}</pre>
              </div>
            )}

            {/* Standard Output */}
            {executionResult.output && (
              <div style={{ marginBottom: "12px" }}>
                <span className="section-label">Program Output</span>
                <pre className="code-snippet" style={{ marginTop: "4px" }}>
                  {executionResult.output}
                </pre>
              </div>
            )}

            {/* Runtime Error */}
            {executionResult.error && (
              <div style={{ marginBottom: "12px" }}>
                <span className="section-label" style={{ color: "var(--danger)" }}>Runtime Error / stderr</span>
                <pre className="code-snippet" style={{ color: "var(--danger)", backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
                  {executionResult.error}
                </pre>
              </div>
            )}

            {!executionResult.output && !executionResult.error && !executionResult.compile_output && (
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                Program completed with no output.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
