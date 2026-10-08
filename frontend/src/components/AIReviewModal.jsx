import React from "react";

export default function AIReviewModal({ review, problemTitle, language, onClose }) {
  if (!review) return null;

  const metrics = review.metrics || {};
  const score = review.score || 0;

  const getMetricClass = (val) => {
    if (val >= 80) return "high";
    if (val >= 60) return "mid";
    return "low";
  };

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="review-modal-header">
          <div className="review-modal-title">
            <span>AI Code Review & Placement Mentor</span>
            <span className="brand-badge">{problemTitle} ({language})</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close review">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="review-modal-body">
          {/* Overall Score Overview */}
          <div className="score-overview-box">
            <div className="score-circle">
              {score}
              <span>/ 100</span>
            </div>
            <div className="score-summary-content">
              <div className="score-summary-title">Mentor Assessment Summary</div>
              <p className="score-summary-text">{review.summary}</p>
            </div>
          </div>

          {/* Time & Space Complexity Badges */}
          <div className="complexity-row">
            <div className="complexity-pill-card">
              <span className="label">Estimated Time Complexity</span>
              <span className="value">{review.time_complexity || "O(n)"}</span>
            </div>
            <div className="complexity-pill-card">
              <span className="label">Estimated Auxiliary Space</span>
              <span className="value">{review.space_complexity || "O(1)"}</span>
            </div>
          </div>

          {/* Metric Meters */}
          <div>
            <div className="review-section-heading">Detailed Code Quality Metrics</div>
            <div className="metrics-grid" style={{ marginTop: "8px" }}>
              <div className="metric-bar-card">
                <div className="metric-bar-header">
                  <span>Code Quality</span>
                  <span>{metrics.code_quality ?? score}%</span>
                </div>
                <div className="metric-track">
                  <div
                    className={`metric-fill ${getMetricClass(metrics.code_quality ?? score)}`}
                    style={{ width: `${metrics.code_quality ?? score}%` }}
                  />
                </div>
              </div>

              <div className="metric-bar-card">
                <div className="metric-bar-header">
                  <span>Correctness</span>
                  <span>{metrics.correctness ?? 90}%</span>
                </div>
                <div className="metric-track">
                  <div
                    className={`metric-fill ${getMetricClass(metrics.correctness ?? 90)}`}
                    style={{ width: `${metrics.correctness ?? 90}%` }}
                  />
                </div>
              </div>

              <div className="metric-bar-card">
                <div className="metric-bar-header">
                  <span>Readability</span>
                  <span>{metrics.readability ?? 85}%</span>
                </div>
                <div className="metric-track">
                  <div
                    className={`metric-fill ${getMetricClass(metrics.readability ?? 85)}`}
                    style={{ width: `${metrics.readability ?? 85}%` }}
                  />
                </div>
              </div>

              <div className="metric-bar-card">
                <div className="metric-bar-header">
                  <span>Algorithmic Efficiency</span>
                  <span>{metrics.efficiency ?? 75}%</span>
                </div>
                <div className="metric-track">
                  <div
                    className={`metric-fill ${getMetricClass(metrics.efficiency ?? 75)}`}
                    style={{ width: `${metrics.efficiency ?? 75}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Issues */}
          {review.issues && review.issues.length > 0 && (
            <div className="review-section">
              <div className="review-section-heading" style={{ color: "var(--danger)" }}>
                Identified Issues & Anti-Patterns ({review.issues.length})
              </div>
              <ul className="review-list">
                {review.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {review.suggestions && review.suggestions.length > 0 && (
            <div className="review-section">
              <div className="review-section-heading" style={{ color: "var(--accent-blue)" }}>
                Optimization Suggestions
              </div>
              <ul className="review-list">
                {review.suggestions.map((sug, idx) => (
                  <li key={idx}>{sug}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Interview Explanation Advice */}
          {review.interview_feedback && (
            <div className="review-section">
              <div className="review-section-heading" style={{ color: "#1e40af" }}>
                How to Explain in a Placement Interview
              </div>
              <div className="interview-feedback-box">
                {review.interview_feedback}
              </div>
            </div>
          )}

          {/* Optimal Approach */}
          {review.optimized_approach && (
            <div className="review-section">
              <div className="review-section-heading">Target Optimal Approach</div>
              <div className="optimal-approach-box">
                {review.optimized_approach}
              </div>
            </div>
          )}

          {/* Technical Interview Follow-Up Questions */}
          {review.interview_questions && review.interview_questions.length > 0 && (
            <div className="review-section">
              <div className="review-section-heading" style={{ color: "#15803d" }}>
                Interviewer Follow-Up Questions For This Solution
              </div>
              <div>
                {review.interview_questions.map((q, idx) => (
                  <div key={idx} className="interview-question-card">
                    <strong>Q{idx + 1}:</strong> {q}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
