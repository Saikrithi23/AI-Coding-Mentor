# AI-Based Placement Coding Mentor
### Intelligent Code Review and Interview Preparation System
**Department of Computer Science — Anurag University (Team-08 / Batch 8)**

---

## 📌 Project Overview
The **AI-Based Placement Coding Mentor** is a specialized web application engineered for college students and placement candidates preparing for technical coding interviews. 

Unlike standard competitive programming websites that only output a binary `"Accepted"` or `"Wrong Answer"` verdict, this platform combines:
1. **Automated multi-language code execution** (C++, Python, Java, C) against test cases.
2. **In-depth AI-powered code review and placement interview preparation** (Google Gemini).
3. **Efficiency & Performance Evaluation Module** with empirical runtime telemetry, benchmark comparisons, and verifiable audit evidence.

The primary objective is to help students transition from:
> *"My code works"*  
> **to:**  
> *"I understand why it works, its time and space complexity trade-offs, how to optimize it, and how I would confidently explain it in a technical interview."*

---

## 🚀 Key Modules & Capabilities

### 1. Problem Catalog & Categorization
- Placement topics: Arrays & Hashing, Strings & Two Pointers, Searching, Stacks, and Dynamic Programming.
- Comprehensive problem statements, example cases with inputs/outputs, algorithmic constraints, and target company tags (Amazon, TCS Digital, Microsoft, Accenture, etc.).

### 2. Multi-Language Code Editor
- Supports **C++**, **Python**, **Java**, and **C**.
- Clean developer-tool interface with monospace typography, line numbers, template resets, and custom standard input (`stdin`) testing.

### 3. Multi-Test Case Execution Engine
- Evaluates submissions across both sample and hidden test cases.
- Displays clear execution diagnostics: PASSED / FAILED test cases, runtime execution time, memory usage, stdout, and formatted compilation/runtime error traces.
- Integrates with Judge0 CE with local sandboxed fallback execution.

### 4. AI-Powered Code Review & Mentor
- Powered by Google Gemini (`gemini-3.8-flash`) using structured output.
- **Comprehensive Evaluation**:
  - Overall Score (0–100) & Mentor Summary
  - Metric breakdown: Code Quality, Readability, Correctness, Algorithmic Efficiency, Coding Standards.
  - Big-O Asymptotic Complexity: Time Complexity (e.g., $O(n)$) and Space Complexity (e.g., $O(1)$).
  - Concrete Code Smells & Issues.
  - Optimization Opportunities & Industry Best Practices.
  - **Placement Interview Explanation Guide**: Actionable guidance on how to verbally walk an interviewer through the solution.
  - **Interviewer Follow-Up Questions**: 3 to 4 technical questions directly derived from the candidate's actual submission.

### 5. Placement Readiness Dashboard
- Real-time tracking of Problems Solved, Problems Attempted, Average Code Quality score, and Interview Readiness rating.
- Persistent SQLite history logging each submission, verdict, timestamp, and saved AI review.

### 6. Efficiency & Performance Evaluation Module (New)
A software-engineering telemetry and benchmarking system measuring 6 concrete parameters from actual machine executions:
1. **Response Time**: Average, minimum, maximum, and latest round-trip latency (in milliseconds/seconds).
2. **Code Analysis Time**: Time taken by the static analysis and Gemini reasoning engine.
3. **Code/Test Performance**: Real test case pass rate percentage (e.g., 94%), with total, passed, and failed counts.
4. **Error Detection & Resolution**: Tracks total errors detected, correctly identified faults, errors resolved, detection rate %, and resolution rate %.
5. **System Throughput**: Sustained requests per minute (RPM), successful requests, failed requests, and average processing time.
6. **Resource Utilization**: Real backend server CPU usage % and process memory (MB) using `psutil`.
7. **Empirical Benchmark Comparison**: Side-by-side comparison with configurable baselines (Baseline A: Traditional Static Linter; Baseline B: Generic Cloud LLM API).
8. **Traceable Audit Evidence**: Complete chronological run log stored in `mentor.db` with CSV and JSON export for academic defense and evaluation.

---

## 📊 Efficiency Score Methodology

The **Composite Efficiency Score** is calculated using a transparent weighted scoring model:

$$\text{Efficiency Score} = (S_{\text{RT}} \times 0.25) + (S_{\text{TP}} \times 0.25) + (S_{\text{ER}} \times 0.20) + (S_{\text{TPUT}} \times 0.15) + (S_{\text{RES}} \times 0.15)$$

Where:
- **$S_{\text{RT}}$ (Response Time, 25%)**: $100$ pts for $\le 500\text{ ms}$, scaled down linearly to $0$ pts at $4000\text{ ms}$.
- **$S_{\text{TP}}$ (Test Pass Rate, 25%)**: Percentage of test cases passed.
- **$S_{\text{ER}}$ (Error Resolution, 20%)**: Percentage of identified errors and bugs successfully resolved in subsequent attempts.
- **$S_{\text{TPUT}}$ (Throughput, 15%)**: Scaled score based on sustainable requests per minute.
- **$S_{\text{RES}}$ (Resource Efficiency, 15%)**: $100$ pts for low server memory ($\le 50\text{ MB}$) and low CPU footprint ($\le 10\%$).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Axios, Pure CSS Developer-Tool Design System
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic, SQLite, `psutil`
- **AI Engine**: Google GenAI SDK (`google-genai`), Gemini 3.8 Flash
- **Code Execution**: Judge0 CE API + Sandboxed Local Execution Engine

---

## ⚡ Quick Start Guide

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   - Create a `.env` file (or copy `.env.example`):
     ```ini
     GEMINI_API_KEY=your_gemini_api_key_here
     JUDGE0_API_KEY=
     JUDGE0_API_URL=https://ce.judge0.com
     PORT=8000
     HOST=127.0.0.1
     ```
   *(Note: You can get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/). If no key is set, the system seamlessly uses built-in placement heuristic evaluations so you can test and present offline!)*

4. Start the FastAPI server:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```
   *The backend will be running at `http://127.0.0.1:8000` (API docs at `http://127.0.0.1:8000/docs`).*

---

### 2. Frontend Setup

1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the provided local URL (typically `http://localhost:5173`).

---

## 📁 Project Structure

```
AI-Coding-Mentor/
├── backend/
│   ├── .env.example        # Environment variable template
│   ├── .env                # Local config (API keys, ports)
│   ├── config.py           # Configuration loader
│   ├── database.py         # SQLite database & performance telemetry engine
│   ├── executor.py         # Judge0 & local code execution engine
│   ├── ai_mentor.py        # Gemini API review & placement mentor
│   ├── problems.py         # Placement coding problem catalog
│   ├── requirements.txt    # Python dependencies
│   └── main.py             # FastAPI entrypoint, REST endpoints & benchmark suite
│
├── frontend/
│   ├── index.html          # HTML entrypoint
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite build configuration
│   └── src/
│       ├── App.jsx         # Main React application orchestrator
│       ├── App.css         # Developer-tool styling
│       ├── index.css       # Design tokens & baseline CSS
│       ├── main.jsx        # React root
│       ├── services/
│       │   └── api.js      # Backend API connector
│       └── components/
│           ├── Navbar.jsx                   # Top brand, selector, status & tabs
│           ├── ProblemDescription.jsx       # Problem, examples & interview tips
│           ├── CodeEditorPane.jsx           # Multi-language editor & actions
│           ├── ExecutionResultsPane.jsx     # Test cases & console diagnostics
│           ├── AIReviewModal.jsx            # Structured AI code review modal
│           ├── DashboardView.jsx            # Placement readiness dashboard
│           ├── PerformanceView.jsx          # Efficiency & Performance evaluation page
│           └── PerformanceEvidenceModal.jsx # Traceable evidence & CSV/JSON export
│
└── README.md               # Project documentation
```

---

## 👥 Team Details
**Batch No: 8 | Team-08**  
**Department of Computer Science, Anurag University**

| Roll No. | Name | Role |
| :--- | :--- | :--- |
| **23EG105F58** | **SAMPALLY SAI KRITHI** | **TEAM LEAD** |
| **23EG105F02** | **AKSHAYA BETHALA** | **TEAM MEMBER** |
| **23EG105F61** | **SREERANGAM HARSHITH** | **TEAM MEMBER** |
| **23EG105F31** | **KODI MANOJ** | **TEAM MEMBER** |

**Project Guide**: Dr. Purnachary, Assistant Professor
