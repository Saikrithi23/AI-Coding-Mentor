import { useState, useEffect } from "react";
import "./App.css";
import API, {
  getProblems,
  getProblemDetails,
  runCustomCode,
  submitProblemCode,
  requestAICodeReview,
  getStudentMetrics,
  getSubmissions,
  getPerformanceMetrics,
  getPerformanceEvidence,
  getPerformanceBaselines,
  savePerformanceBaseline,
  runPerformanceBenchmark,
} from "./services/api";

import {
  PROBLEMS_DATA,
  getLocalProblemById,
  getLocalProblemsSummary,
} from "./data/problemsData";

import Navbar from "./components/Navbar";
import ProblemDescription from "./components/ProblemDescription";
import CodeEditorPane from "./components/CodeEditorPane";
import ExecutionResultsPane from "./components/ExecutionResultsPane";
import AIReviewModal from "./components/AIReviewModal";
import DashboardView from "./components/DashboardView";
import PerformanceView from "./components/PerformanceView";

function App() {
  const [activeView, setActiveView] = useState("ide"); // 'ide' | 'dashboard' | 'performance'
  const [backendOnline, setBackendOnline] = useState(false);

  // Problem Catalog State - Initialized immediately with local data so problems never fail to load
  const [problems, setProblems] = useState(getLocalProblemsSummary());
  const [currentProblemId, setCurrentProblemId] = useState("two-sum");
  const [currentProblem, setCurrentProblem] = useState(getLocalProblemById("two-sum"));

  // Editor State
  const [language, setLanguage] = useState("C++");
  const [code, setCode] = useState(getLocalProblemById("two-sum").starter_code["C++"]);
  const [customInput, setCustomInput] = useState(getLocalProblemById("two-sum").examples[0]?.input || "");

  // Execution & Submission State
  const [executionResult, setExecutionResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [activeResultMode, setActiveResultMode] = useState("test_cases");
  const [lastSubmissionId, setLastSubmissionId] = useState(null);

  // Loading States
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // AI Review Modal State
  const [activeReview, setActiveReview] = useState(null);
  const [reviewProblemTitle, setReviewProblemTitle] = useState("");
  const [reviewLanguage, setReviewLanguage] = useState("");

  // Dashboard Stats State
  const [metrics, setMetrics] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  // Efficiency & Performance Telemetry State
  const [perfMetrics, setPerfMetrics] = useState(null);
  const [perfBaselines, setPerfBaselines] = useState([]);
  const [perfEvidence, setPerfEvidence] = useState([]);

  // Fetch initial catalog and check server status
  useEffect(() => {
    loadProblems();
    refreshDashboardData();
    refreshPerformanceData();
  }, []);

  const loadProblems = async () => {
    try {
      const data = await getProblems();
      if (data && data.problems && data.problems.length > 0) {
        setProblems(data.problems);
        setBackendOnline(true);
      }
    } catch (err) {
      console.warn("Backend server not connected. Operating in local offline mode:", err.message);
      setBackendOnline(false);
      // Ensure local problems summary is available
      setProblems(getLocalProblemsSummary());
    }
  };

  const refreshDashboardData = async () => {
    try {
      const [metricsData, submissionsData] = await Promise.all([
        getStudentMetrics(),
        getSubmissions(15),
      ]);
      if (metricsData?.metrics) setMetrics(metricsData.metrics);
      if (submissionsData?.submissions) setSubmissions(submissionsData.submissions);
      setBackendOnline(true);
    } catch (err) {
      console.warn("Could not load dashboard metrics:", err.message);
    }
  };

  const refreshPerformanceData = async () => {
    try {
      const [perfData, baseData, evData] = await Promise.all([
        getPerformanceMetrics(),
        getPerformanceBaselines(),
        getPerformanceEvidence(60),
      ]);
      if (perfData?.metrics) setPerfMetrics(perfData.metrics);
      if (baseData?.baselines) setPerfBaselines(baseData.baselines);
      if (evData?.evidence) setPerfEvidence(evData.evidence);
      setBackendOnline(true);
    } catch (err) {
      console.warn("Could not load performance telemetry:", err.message);
    }
  };

  // Switch problem
  const handleSelectProblem = async (probId) => {
    setCurrentProblemId(probId);
    setActiveView("ide");

    // Immediately load local problem details
    const localProb = getLocalProblemById(probId);
    setCurrentProblem(localProb);
    setCode(localProb.starter_code?.[language] || "");
    setCustomInput(localProb.examples?.[0]?.input || "");
    setExecutionResult(null);
    setSubmissionResult(null);
    setLastSubmissionId(null);

    // Try synchronizing with backend if reachable
    try {
      const data = await getProblemDetails(probId);
      if (data && data.problem) {
        setCurrentProblem(data.problem);
        setBackendOnline(true);
      }
    } catch (err) {
      // Keep local version
      setBackendOnline(false);
    }
  };

  // Update starter code when language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const starter = currentProblem?.starter_code?.[newLang] || getLocalProblemById(currentProblemId).starter_code?.[newLang] || "";
    setCode(starter);
  };

  // Reset to starter template
  const handleResetCode = () => {
    const starter = currentProblem?.starter_code?.[language] || getLocalProblemById(currentProblemId).starter_code?.[language] || "";
    setCode(starter);
  };

  // 1. Run single custom input execution
  const handleRunCustom = async () => {
    if (!code.trim()) {
      alert("Please write your code before running.");
      return;
    }

    setIsRunning(true);
    setActiveResultMode("custom");

    try {
      const res = await runCustomCode(code, language, customInput);
      setExecutionResult(res);
      setBackendOnline(true);
      refreshPerformanceData();
    } catch (err) {
      console.error(err);
      setExecutionResult({
        success: false,
        status: { id: 13, description: "Connection Failed" },
        output: "",
        error: "Backend server is offline. Please start the backend with:\n  cd backend\n  python -m uvicorn main:app --reload --port 8000",
        language,
      });
      setBackendOnline(false);
    } finally {
      setIsRunning(false);
    }
  };

  // 2. Submit solution against all test cases
  const handleSubmitTestCases = async () => {
    if (!code.trim()) {
      alert("Please write your code before submitting.");
      return;
    }

    setIsSubmitting(true);
    setActiveResultMode("test_cases");

    try {
      const res = await submitProblemCode(currentProblemId, language, code);
      setSubmissionResult(res);
      setBackendOnline(true);
      if (res.submission_id) {
        setLastSubmissionId(res.submission_id);
      }
      refreshDashboardData();
      refreshPerformanceData();
    } catch (err) {
      console.error(err);
      setSubmissionResult({
        success: false,
        status: { id: 13, description: "Backend Offline" },
        passed_count: 0,
        total_test_cases: currentProblem?.test_cases?.length || 0,
        output: "",
        error: "Cannot evaluate test cases because the Python FastAPI server is not running.\nStart the backend on port 8000 to execute code and test cases.",
        language,
        test_cases: [],
      });
      setBackendOnline(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Request AI Code Review
  const handleReviewCode = async () => {
    if (!code.trim()) {
      alert("Please write code before requesting an AI review.");
      return;
    }

    setIsReviewing(true);

    try {
      let subId = lastSubmissionId;
      let passedAll = submissionResult?.success ?? true;
      let execRes = submissionResult || executionResult;

      // If user hasn't submitted yet, do a quick submission run first
      if (!submissionResult) {
        try {
          const evalRes = await submitProblemCode(currentProblemId, language, code);
          setSubmissionResult(evalRes);
          setActiveResultMode("test_cases");
          subId = evalRes.submission_id;
          passedAll = evalRes.success;
          execRes = evalRes;
        } catch (e) {
          // Continue to review even if test runner was offline
        }
      }

      const res = await requestAICodeReview({
        problemId: currentProblemId,
        language,
        code,
        submissionId: subId,
        passedAll,
        executionResult: execRes,
      });

      if (res && res.review) {
        setActiveReview(res.review);
        setReviewProblemTitle(currentProblem?.title || currentProblemId);
        setReviewLanguage(language);
        refreshDashboardData();
        refreshPerformanceData();
      }
      setBackendOnline(true);
    } catch (err) {
      console.error(err);
      alert("AI Review failed: Backend server is unreachable at http://127.0.0.1:8000.\nPlease verify that your Python FastAPI backend is running.");
      setBackendOnline(false);
    } finally {
      setIsReviewing(false);
    }
  };

  // 4. Trigger Benchmark Probe Suite
  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await runPerformanceBenchmark();
      if (res.success) {
        await refreshPerformanceData();
        alert(`Benchmark Complete!\nExecuted: ${res.runs_completed} test probes\nTests: ${res.passed_test_cases}/${res.total_test_cases_evaluated} passed (${res.pass_rate_percentage}%)\nAvg Latency: ${res.average_execution_latency_ms} ms`);
      }
    } catch (err) {
      console.error("Benchmark failed:", err);
      alert("Benchmark failed: Backend server is offline. Please start the backend on port 8000.");
      setBackendOnline(false);
    } finally {
      setIsBenchmarking(false);
    }
  };

  // 5. Save/Update Comparison Baseline
  const handleSaveBaseline = async (baselineData) => {
    try {
      await savePerformanceBaseline(baselineData);
      await refreshPerformanceData();
    } catch (err) {
      console.error("Failed to save baseline:", err);
      alert("Failed to save baseline: " + (err.response?.data?.detail || err.message));
    }
  };

  // Open review from recent submissions history
  const handleOpenStoredReview = (revData, problemTitle, lang) => {
    setActiveReview(revData);
    setReviewProblemTitle(problemTitle);
    setReviewLanguage(lang);
  };

  return (
    <div className="app-layout">
      {/* NAVBAR */}
      <Navbar
        problems={problems}
        currentProblemId={currentProblemId}
        onSelectProblem={handleSelectProblem}
        activeView={activeView}
        setActiveView={setActiveView}
        backendOnline={backendOnline}
      />

      {/* Backend Offline Guidance Bar */}
      {!backendOnline && (
        <div style={{ backgroundColor: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "6px 16px", fontSize: "12px", color: "#92400e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>
            ⚠️ <strong>Backend Offline:</strong> Problems loaded from local cache. To execute code and run AI reviews, start the backend in terminal: <code>cd backend && python -m uvicorn main:app --reload --port 8000</code>
          </span>
          <button
            className="btn-secondary"
            style={{ padding: "2px 8px", fontSize: "11px", height: "24px" }}
            onClick={() => {
              loadProblems();
              refreshDashboardData();
              refreshPerformanceData();
            }}
          >
            ↻ Retry Connection
          </button>
        </div>
      )}

      {/* VIEW: PRACTICE IDE */}
      {activeView === "ide" && (
        <main className="ide-workspace">
          {/* LEFT: PROBLEM STATEMENT */}
          <ProblemDescription problem={currentProblem || getLocalProblemById(currentProblemId)} />

          {/* RIGHT: CODE EDITOR + RESULTS */}
          <section className="editor-results-panel">
            <CodeEditorPane
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={handleLanguageChange}
              onResetCode={handleResetCode}
              customInput={customInput}
              setCustomInput={setCustomInput}
              onRunCustom={handleRunCustom}
              onSubmitTestCases={handleSubmitTestCases}
              onReviewCode={handleReviewCode}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              isReviewing={isReviewing}
            />

            <ExecutionResultsPane
              executionResult={executionResult}
              submissionResult={submissionResult}
              activeMode={activeResultMode}
              setActiveMode={setActiveResultMode}
              isLoading={isRunning || isSubmitting}
            />
          </section>
        </main>
      )}

      {/* VIEW: DASHBOARD & READINESS */}
      {activeView === "dashboard" && (
        <DashboardView
          metrics={metrics}
          submissions={submissions}
          problems={problems}
          onSelectProblem={handleSelectProblem}
          onOpenReview={handleOpenStoredReview}
        />
      )}

      {/* VIEW: EFFICIENCY & PERFORMANCE EVALUATION */}
      {activeView === "performance" && (
        <PerformanceView
          metrics={perfMetrics}
          baselines={perfBaselines}
          evidence={perfEvidence}
          onRunBenchmark={handleRunBenchmark}
          onRefreshMetrics={refreshPerformanceData}
          onSaveBaseline={handleSaveBaseline}
          isBenchmarking={isBenchmarking}
        />
      )}

      {/* AI REVIEW MODAL */}
      {activeReview && (
        <AIReviewModal
          review={activeReview}
          problemTitle={reviewProblemTitle}
          language={reviewLanguage}
          onClose={() => setActiveReview(null)}
        />
      )}
    </div>
  );
}

export default App;