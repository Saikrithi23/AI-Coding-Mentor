import React from "react";

export default function ProblemDescription({ problem }) {
  if (!problem) {
    return (
      <div className="problem-panel">
        <div style={{ padding: "30px", color: "var(--text-muted)" }}>
          Loading problem details...
        </div>
      </div>
    );
  }

  const diffClass = problem.difficulty?.toLowerCase() || "easy";

  return (
    <section className="problem-panel">
      <div className="problem-header">
        <div className="problem-title-row">
          <h2 className="problem-title">{problem.title}</h2>
        </div>
        <div className="tag-row">
          <span className={`difficulty-badge ${diffClass}`}>{problem.difficulty}</span>
          <span className="topic-tag">{problem.topic}</span>
          {problem.companies?.slice(0, 3).map((comp, i) => (
            <span key={i} className="company-tag">{comp}</span>
          ))}
        </div>
      </div>

      <div className="problem-body">
        {/* Description */}
        <div>
          <div className="section-label">Problem Statement</div>
          <p className="problem-description-text">{problem.description}</p>
        </div>

        {/* Examples */}
        {problem.examples && problem.examples.length > 0 && (
          <div>
            <div className="section-label">Examples</div>
            {problem.examples.map((ex, idx) => (
              <div key={idx} className="example-card">
                <div className="example-title">Example {idx + 1}</div>
                <div>
                  <strong style={{ fontSize: "11px", color: "var(--text-muted)" }}>INPUT</strong>
                  <div className="code-snippet">{ex.input}</div>
                </div>
                <div>
                  <strong style={{ fontSize: "11px", color: "var(--text-muted)" }}>OUTPUT</strong>
                  <div className="code-snippet">{ex.output}</div>
                </div>
                {ex.explanation && (
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    <em>Explanation:</em> {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div>
            <div className="section-label">Constraints</div>
            <ul className="constraints-list">
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Expected Complexity */}
        <div>
          <div className="section-label">Expected Complexity</div>
          <div className="complexity-expectations">
            <div className="complexity-item">
              Time: <strong>{problem.expected_time_complexity || "O(n)"}</strong>
            </div>
            <div className="complexity-item">
              Auxiliary Space: <strong>{problem.expected_space_complexity || "O(1)"}</strong>
            </div>
          </div>
        </div>

        {/* Interview Tips */}
        {problem.interview_tips && problem.interview_tips.length > 0 && (
          <div className="interview-tips-box">
            <h4>Placement Interview Insights</h4>
            <ul>
              {problem.interview_tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
