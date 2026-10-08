import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 35000,
});

export const getProblems = async () => {
  const res = await API.get("/problems");
  return res.data;
};

export const getProblemDetails = async (problemId) => {
  const res = await API.get(`/problems/${problemId}`);
  return res.data;
};

export const runCustomCode = async (code, language, stdin) => {
  const res = await API.post("/run-code", {
    code,
    language,
    stdin,
  });
  return res.data;
};

export const submitProblemCode = async (problemId, language, code) => {
  const res = await API.post("/submit-code", {
    problem_id: problemId,
    language,
    code,
  });
  return res.data;
};

export const requestAICodeReview = async ({
  problemId,
  language,
  code,
  submissionId,
  passedAll,
  executionResult,
}) => {
  const res = await API.post("/review-code", {
    problem_id: problemId,
    language,
    code,
    submission_id: submissionId,
    passed_all: passedAll,
    execution_result: executionResult,
  });
  return res.data;
};

export const getStudentMetrics = async () => {
  const res = await API.get("/metrics");
  return res.data;
};

export const getSubmissions = async (limit = 10) => {
  const res = await API.get(`/submissions?limit=${limit}`);
  return res.data;
};

// ==========================================
// Performance & Efficiency Module APIs
// ==========================================

export const getPerformanceMetrics = async () => {
  const res = await API.get("/performance/metrics");
  return res.data;
};

export const getPerformanceEvidence = async (limit = 50) => {
  const res = await API.get(`/performance/evidence?limit=${limit}`);
  return res.data;
};

export const getPerformanceResources = async () => {
  const res = await API.get("/performance/resources");
  return res.data;
};

export const getPerformanceBaselines = async () => {
  const res = await API.get("/performance/baselines");
  return res.data;
};

export const savePerformanceBaseline = async (baselineData) => {
  const res = await API.post("/performance/baselines", baselineData);
  return res.data;
};

export const runPerformanceBenchmark = async () => {
  const res = await API.post("/performance/benchmark");
  return res.data;
};

export default API;