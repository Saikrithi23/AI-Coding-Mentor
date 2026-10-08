import React, { useState } from "react";

export default function CodeEditorPane({
  code,
  setCode,
  language,
  setLanguage,
  onResetCode,
  customInput,
  setCustomInput,
  onRunCustom,
  onSubmitTestCases,
  onReviewCode,
  isRunning,
  isSubmitting,
  isReviewing,
}) {
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Calculate line numbers
  const lineCount = Math.max(code.split("\n").length, 18);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Handle Tab key inside textarea
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* TOOLBAR */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <select
            className="lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="C++">C++ (GCC)</option>
            <option value="Python">Python (3.x)</option>
            <option value="Java">Java (OpenJDK)</option>
            <option value="C">C (GCC)</option>
          </select>

          <button
            className="btn-secondary"
            onClick={onResetCode}
            title="Reset to starter code template"
          >
            Reset Template
          </button>

          <button
            className="btn-secondary"
            onClick={() => setShowCustomInput(!showCustomInput)}
          >
            {showCustomInput ? "Hide Custom Input" : "Custom Input"}
          </button>
        </div>

        <div className="toolbar-right">
          <button
            className="btn-run"
            onClick={onRunCustom}
            disabled={isRunning || isSubmitting || isReviewing}
            title="Run code against custom input"
          >
            {isRunning ? "Running..." : "▶ Run Code"}
          </button>

          <button
            className="btn-submit"
            onClick={onSubmitTestCases}
            disabled={isRunning || isSubmitting || isReviewing}
            title="Test against all problem test cases"
          >
            {isSubmitting ? "Evaluating..." : "✓ Submit Code"}
          </button>

          <button
            className="btn-review"
            onClick={onReviewCode}
            disabled={isRunning || isSubmitting || isReviewing}
            title="Request AI-powered mentor code review"
          >
            {isReviewing ? "Analyzing..." : "✨ AI Review"}
          </button>
        </div>
      </div>

      {/* EDITOR */}
      <div className="code-editor-wrapper">
        <div className="line-numbers-col">
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        <textarea
          className="code-textarea"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          placeholder="Write your solution here..."
        />
      </div>

      {/* COLLAPSIBLE CUSTOM INPUT */}
      {showCustomInput && (
        <div className="custom-input-pane">
          <label htmlFor="custom-stdin">Standard Input (stdin)</label>
          <textarea
            id="custom-stdin"
            className="custom-input-area"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Enter custom input arguments..."
            spellCheck="false"
          />
        </div>
      )}
    </div>
  );
}
