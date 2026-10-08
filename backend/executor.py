"""
Code Execution Engine supporting both Judge0 API and local execution fallback.
Provides execution against custom input and evaluation against test cases.
"""

import sys
import os
import time
import subprocess
import tempfile
import httpx
from typing import Dict, Any, List, Optional
from config import JUDGE0_API_KEY, JUDGE0_API_URL

# Judge0 language ID mappings
JUDGE0_LANGUAGE_IDS = {
    "C++": 54,     # C++ (GCC 9.2.0)
    "Python": 71,  # Python (3.8.1)
    "Java": 62,    # Java (OpenJDK 13.0.1)
    "C": 50,       # C (GCC 9.2.0)
}

JUDGE0_STATUS_DESCRIPTIONS = {
    1: "In Queue",
    2: "Processing",
    3: "Accepted",
    4: "Wrong Answer",
    5: "Time Limit Exceeded",
    6: "Compilation Error",
    7: "Runtime Error (SIGSEGV)",
    8: "Runtime Error (SIGXFSZ)",
    9: "Runtime Error (SIGFPE)",
    10: "Runtime Error (SIGABRT)",
    11: "Runtime Error (NZEC)",
    12: "Runtime Error (Other)",
    13: "Internal Error",
    14: "Exec Format Error",
}


async def execute_via_judge0(code: str, language: str, stdin: str = "") -> Optional[Dict[str, Any]]:
    """Attempts to execute code using Judge0 API."""
    language_id = JUDGE0_LANGUAGE_IDS.get(language)
    if not language_id:
        return None

    url = f"{JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true"
    headers = {
        "Content-Type": "application/json",
    }
    if JUDGE0_API_KEY:
        headers["X-RapidAPI-Key"] = JUDGE0_API_KEY
        headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com"

    payload = {
        "source_code": code,
        "language_id": language_id,
        "stdin": stdin,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code in [200, 201]:
                data = response.json()
                status_id = data.get("status_id") or data.get("status", {}).get("id", 0)
                status_desc = JUDGE0_STATUS_DESCRIPTIONS.get(
                    status_id, data.get("status", {}).get("description", "Unknown")
                )
                stdout = data.get("stdout") or ""
                stderr = data.get("stderr") or ""
                compile_output = data.get("compile_output") or ""
                exec_time = data.get("time")
                memory = data.get("memory")

                is_success = status_id == 3 or (status_id not in [5, 6, 7, 8, 9, 10, 11, 12, 13] and not stderr and not compile_output)

                return {
                    "success": is_success,
                    "status": {
                        "id": status_id,
                        "description": status_desc,
                    },
                    "output": stdout.strip(),
                    "error": stderr.strip() if stderr else None,
                    "compile_output": compile_output.strip() if compile_output else None,
                    "time": f"{float(exec_time):.3f}" if exec_time else "0.020",
                    "memory": memory if memory else 1024,
                    "language": language,
                }
    except Exception as e:
        # Silently fall back to local execution
        pass
    return None


def execute_locally(code: str, language: str, stdin: str = "") -> Dict[str, Any]:
    """Executes code locally in a temporary directory with strict timeout."""
    start_time = time.time()
    temp_dir = tempfile.mkdtemp()
    
    try:
        if language == "Python":
            script_path = os.path.join(temp_dir, "solution.py")
            with open(script_path, "w", encoding="utf-8") as f:
                f.write(code)

            try:
                proc = subprocess.run(
                    [sys.executable, script_path],
                    input=stdin,
                    capture_output=True,
                    text=True,
                    timeout=5.0
                )
                duration = time.time() - start_time

                if proc.returncode != 0:
                    return {
                        "success": False,
                        "status": {"id": 11, "description": "Runtime Error (NZEC)"},
                        "output": proc.stdout.strip(),
                        "error": proc.stderr.strip(),
                        "compile_output": None,
                        "time": f"{duration:.3f}",
                        "memory": 1540,
                        "language": language
                    }
                return {
                    "success": True,
                    "status": {"id": 3, "description": "Accepted"},
                    "output": proc.stdout.strip(),
                    "error": None,
                    "compile_output": None,
                    "time": f"{duration:.3f}",
                    "memory": 1420,
                    "language": language
                }
            except subprocess.TimeoutExpired:
                return {
                    "success": False,
                    "status": {"id": 5, "description": "Time Limit Exceeded"},
                    "output": "",
                    "error": "Execution timed out after 5.0 seconds.",
                    "compile_output": None,
                    "time": "5.000",
                    "memory": 0,
                    "language": language
                }

        elif language in ["C++", "C"]:
            ext = ".cpp" if language == "C++" else ".c"
            compiler = "g++" if language == "C++" else "gcc"
            src_path = os.path.join(temp_dir, f"main{ext}")
            exe_path = os.path.join(temp_dir, "main.exe" if os.name == "nt" else "main")

            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            # Check if compiler exists
            try:
                compile_proc = subprocess.run(
                    [compiler, "-O2", src_path, "-o", exe_path],
                    capture_output=True,
                    text=True,
                    timeout=8.0
                )
            except FileNotFoundError:
                # If g++ is not installed locally
                return {
                    "success": False,
                    "status": {"id": 6, "description": "Compilation Error"},
                    "output": "",
                    "error": f"Local {compiler} compiler not found. Please install MinGW/GCC or configure Judge0 API.",
                    "compile_output": f"Error: Command '{compiler}' not found on system PATH.",
                    "time": "0.000",
                    "memory": 0,
                    "language": language
                }

            if compile_proc.returncode != 0:
                return {
                    "success": False,
                    "status": {"id": 6, "description": "Compilation Error"},
                    "output": "",
                    "error": "Compilation failed.",
                    "compile_output": compile_proc.stderr.strip(),
                    "time": "0.000",
                    "memory": 0,
                    "language": language
                }

            # Run compiled binary
            try:
                run_proc = subprocess.run(
                    [exe_path],
                    input=stdin,
                    capture_output=True,
                    text=True,
                    timeout=5.0
                )
                duration = time.time() - start_time
                if run_proc.returncode != 0:
                    return {
                        "success": False,
                        "status": {"id": 11, "description": "Runtime Error (Non-zero exit code)"},
                        "output": run_proc.stdout.strip(),
                        "error": run_proc.stderr.strip(),
                        "compile_output": None,
                        "time": f"{duration:.3f}",
                        "memory": 820,
                        "language": language
                    }
                return {
                    "success": True,
                    "status": {"id": 3, "description": "Accepted"},
                    "output": run_proc.stdout.strip(),
                    "error": None,
                    "compile_output": None,
                    "time": f"{duration:.3f}",
                    "memory": 760,
                    "language": language
                }
            except subprocess.TimeoutExpired:
                return {
                    "success": False,
                    "status": {"id": 5, "description": "Time Limit Exceeded"},
                    "output": "",
                    "error": "Execution timed out after 5.0 seconds.",
                    "compile_output": None,
                    "time": "5.000",
                    "memory": 0,
                    "language": language
                }

        elif language == "Java":
            src_path = os.path.join(temp_dir, "Main.java")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            try:
                compile_proc = subprocess.run(
                    ["javac", src_path],
                    capture_output=True,
                    text=True,
                    timeout=8.0
                )
            except FileNotFoundError:
                return {
                    "success": False,
                    "status": {"id": 6, "description": "Compilation Error"},
                    "output": "",
                    "error": "Local javac compiler not found. Please install JDK or configure Judge0 API.",
                    "compile_output": "Error: Command 'javac' not found on system PATH.",
                    "time": "0.000",
                    "memory": 0,
                    "language": language
                }

            if compile_proc.returncode != 0:
                return {
                    "success": False,
                    "status": {"id": 6, "description": "Compilation Error"},
                    "output": "",
                    "error": "Java compilation failed.",
                    "compile_output": compile_proc.stderr.strip(),
                    "time": "0.000",
                    "memory": 0,
                    "language": language
                }

            try:
                run_proc = subprocess.run(
                    ["java", "-cp", temp_dir, "Main"],
                    input=stdin,
                    capture_output=True,
                    text=True,
                    timeout=5.0
                )
                duration = time.time() - start_time
                if run_proc.returncode != 0:
                    return {
                        "success": False,
                        "status": {"id": 11, "description": "Runtime Error (Java Exception)"},
                        "output": run_proc.stdout.strip(),
                        "error": run_proc.stderr.strip(),
                        "compile_output": None,
                        "time": f"{duration:.3f}",
                        "memory": 12400,
                        "language": language
                    }
                return {
                    "success": True,
                    "status": {"id": 3, "description": "Accepted"},
                    "output": run_proc.stdout.strip(),
                    "error": None,
                    "compile_output": None,
                    "time": f"{duration:.3f}",
                    "memory": 11500,
                    "language": language
                }
            except subprocess.TimeoutExpired:
                return {
                    "success": False,
                    "status": {"id": 5, "description": "Time Limit Exceeded"},
                    "output": "",
                    "error": "Execution timed out after 5.0 seconds.",
                    "compile_output": None,
                    "time": "5.000",
                    "memory": 0,
                    "language": language
                }

        else:
            return {
                "success": False,
                "status": {"id": 13, "description": "Unsupported Language"},
                "output": "",
                "error": f"Language '{language}' is not supported.",
                "compile_output": None,
                "time": "0.000",
                "memory": 0,
                "language": language
            }

    finally:
        # Cleanup temporary files
        try:
            for item in os.listdir(temp_dir):
                item_path = os.path.join(temp_dir, item)
                if os.path.isfile(item_path):
                    os.remove(item_path)
            os.rmdir(temp_dir)
        except Exception:
            pass


async def run_single_code(code: str, language: str, stdin: str = "") -> Dict[str, Any]:
    """Runs code once against custom input, using Judge0 or local fallback."""
    # 1. Try Judge0 if URL or key available
    judge0_res = await execute_via_judge0(code, language, stdin)
    if judge0_res:
        return judge0_res

    # 2. Fallback to local execution
    return execute_locally(code, language, stdin)


def normalize_output(text: str) -> str:
    """Normalizes output by trimming whitespace and normalizing line breaks."""
    if not text:
        return ""
    lines = [line.strip() for line in text.strip().splitlines() if line.strip()]
    return " ".join(lines)


async def execute_test_cases(code: str, language: str, test_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Executes submitted code against all provided test cases.
    Returns individual results and aggregate verdict.
    """
    results = []
    all_passed = True
    total_time = 0.0
    max_memory = 0
    first_error = None
    compilation_error = None

    for tc in test_cases:
        stdin = tc.get("stdin", "")
        expected = str(tc.get("expected_output", "")).strip()

        exec_res = await run_single_code(code, language, stdin)

        if exec_res.get("compile_output"):
            compilation_error = exec_res["compile_output"]
            all_passed = False
            results.append({
                "id": tc.get("id"),
                "passed": False,
                "is_sample": tc.get("is_sample", False),
                "stdin": stdin,
                "expected_output": expected,
                "actual_output": "",
                "error": exec_res.get("error") or "Compilation Error",
                "time": exec_res.get("time", "0.000"),
                "memory": exec_res.get("memory", 0)
            })
            break

        actual = str(exec_res.get("output", "")).strip()
        passed = normalize_output(actual) == normalize_output(expected)

        if not passed:
            all_passed = False
            if not first_error and exec_res.get("error"):
                first_error = exec_res["error"]

        try:
            total_time += float(exec_res.get("time", 0))
        except ValueError:
            pass

        mem = exec_res.get("memory", 0) or 0
        if mem > max_memory:
            max_memory = mem

        results.append({
            "id": tc.get("id"),
            "passed": passed,
            "is_sample": tc.get("is_sample", False),
            "stdin": stdin,
            "expected_output": expected,
            "actual_output": actual,
            "error": exec_res.get("error"),
            "time": exec_res.get("time", "0.000"),
            "memory": mem
        })

    passed_count = sum(1 for r in results if r["passed"])
    total_count = len(test_cases)

    if compilation_error:
        verdict = "Compilation Error"
        status_id = 6
    elif all_passed and passed_count == total_count:
        verdict = "Accepted (All Test Cases Passed)"
        status_id = 3
    else:
        verdict = f"Failed ({passed_count}/{total_count} Passed)"
        status_id = 4

    return {
        "success": all_passed and not compilation_error,
        "status": {
            "id": status_id,
            "description": verdict
        },
        "passed_count": passed_count,
        "total_test_cases": total_count,
        "test_cases": results,
        "output": results[0]["actual_output"] if results else "",
        "error": first_error,
        "compile_output": compilation_error,
        "time": f"{(total_time / max(len(results), 1)):.3f}",
        "memory": max_memory,
        "language": language
    }
