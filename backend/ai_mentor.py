"""
AI Code Review & Placement Mentor module.
Uses Google Gemini API (gemini-3.8-flash) via the official google-genai SDK
with structured output. Includes an intelligent heuristic fallback for offline/demo use.
"""

import json
import re
from typing import Dict, Any, List, Optional
from config import GEMINI_API_KEY

REVIEW_JSON_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "score": {"type": "INTEGER", "description": "Overall code score from 0 to 100"},
        "summary": {"type": "STRING", "description": "Concise 1-2 sentence mentor summary of the code submission"},
        "metrics": {
            "type": "OBJECT",
            "properties": {
                "code_quality": {"type": "INTEGER", "description": "0 to 100 score"},
                "readability": {"type": "INTEGER", "description": "0 to 100 score"},
                "correctness": {"type": "INTEGER", "description": "0 to 100 score"},
                "efficiency": {"type": "INTEGER", "description": "0 to 100 score"},
                "coding_standards": {"type": "INTEGER", "description": "0 to 100 score"},
            },
            "required": ["code_quality", "readability", "correctness", "efficiency", "coding_standards"],
        },
        "time_complexity": {"type": "STRING", "description": "Estimated time complexity, e.g., O(n), O(n log n), O(n^2)"},
        "space_complexity": {"type": "STRING", "description": "Estimated auxiliary space complexity, e.g., O(1), O(n)"},
        "issues": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
            "description": "Specific issues or code smells found in student's code",
        },
        "suggestions": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
            "description": "Concrete code optimization or refactoring suggestions",
        },
        "best_practices": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
            "description": "Industry/placement coding standards to follow",
        },
        "interview_feedback": {
            "type": "STRING",
            "description": "How to explain this solution to an interviewer, key trade-offs, and communication tips",
        },
        "optimized_approach": {
            "type": "STRING",
            "description": "Description of the optimal approach and why a top-tier company interviewer prefers it",
        },
        "interview_questions": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
            "description": "3 to 4 realistic technical interview follow-up questions tailored to this code",
        },
    },
    "required": [
        "score",
        "summary",
        "metrics",
        "time_complexity",
        "space_complexity",
        "issues",
        "suggestions",
        "best_practices",
        "interview_feedback",
        "optimized_approach",
        "interview_questions",
    ],
}


def heuristic_review(
    code: str,
    language: str,
    problem_title: str,
    passed_all: bool,
    execution_result: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Intelligent heuristic fallback mentor review that inspects patterns in code,
    loops, data structures, and test pass status to provide structured feedback.
    """
    lines = [l.strip() for l in code.splitlines() if l.strip()]
    line_count = len(lines)
    
    # Detect loops
    for_count = len(re.findall(r"\bfor\b", code))
    while_count = len(re.findall(r"\bwhile\b", code))
    total_loops = for_count + while_count

    # Check for nested loops
    nested_loop = False
    loop_depth = 0
    for line in lines:
        if any(kw in line for kw in ["for (", "for ", "while (", "while "]):
            loop_depth += 1
            if loop_depth >= 2:
                nested_loop = True
        if "}" in line and loop_depth > 0:
            loop_depth -= 1

    # Check for hashing/maps
    uses_hash = bool(re.search(r"(unordered_map|HashMap|dict|\bseen\b|\bhash\b|\bmap\b|\bset\b)", code, re.IGNORECASE))

    # Base scores
    correctness = 95 if passed_all else 55
    efficiency = 65 if nested_loop else (88 if uses_hash else 78)
    readability = 85 if line_count < 60 else 72
    standards = 82
    code_quality = round((correctness * 0.35) + (efficiency * 0.25) + (readability * 0.20) + (standards * 0.20))

    if nested_loop:
        est_time = "O(n²)"
        est_space = "O(1)"
        issues = [
            "Nested iteration detected, which leads to quadratic time complexity O(n²).",
            "For large input bounds (e.g. n = 10⁴), nested loops will encounter Time Limit Exceeded (TLE)."
        ]
        suggestions = [
            "Replace the inner loop with a Hash Map or Hash Set to achieve O(1) average lookup time.",
            "Consider pre-sorting the array if a two-pointer approach with O(1) space is desired."
        ]
    elif uses_hash:
        est_time = "O(n)"
        est_space = "O(n)"
        issues = [
            "Ensure that hash collisions or duplicate values are accounted for in edge cases.",
            "Memory overhead of dynamic hash table resizing should be kept in mind."
        ]
        suggestions = [
            "Keep variable names expressive and self-documenting for technical interview clarity.",
            "Add early termination checks for invalid or empty inputs."
        ]
    else:
        est_time = "O(n)" if total_loops == 1 else "O(n log n)"
        est_space = "O(1)"
        issues = [
            "Verify all boundary conditions and edge cases (e.g., negative numbers, empty arrays).",
            "Add concise inline comments explaining critical algorithm invariants."
        ]
        suggestions = [
            "Clearly state your base cases and loop exit conditions.",
            "Optimize memory usage by avoiding unnecessary array copies."
        ]

    best_practices = [
        "In placement interviews, state the brute-force approach first before presenting your optimal solution.",
        "Always calculate both time and space complexity explicitly before the interviewer asks.",
        "Verify potential edge cases: empty input, single element, negative numbers, and integer overflow."
    ]

    interview_feedback = (
        f"For '{problem_title}', your solution demonstrates a solid grasp of fundamental programming logic. "
        f"In a technical interview, clearly explain your thought process: start by outlining the problem constraints, "
        f"discuss the trade-off between {est_time} runtime and {est_space} auxiliary space, and proactively dry-run "
        f"your code on a sample edge case."
    )

    optimized_approach = (
        f"The industry-standard optimal approach for {problem_title} achieves linear O(n) or logarithmic O(log n) "
        f"runtime by leveraging appropriate data structures (such as hash tables or two pointers). "
        f"During interviews, demonstrating familiarity with space-time trade-offs is what sets candidate solutions apart."
    )

    interview_questions = [
        f"What is the exact time and space complexity of your current solution, and what is the bottleneck?",
        f"How would you adapt your algorithm if the input dataset could not fit into memory (streaming data)?",
        f"Can you explain the trade-offs between a hash-based solution and a two-pointer solution for this problem?",
        f"What potential edge cases (e.g., duplicates, extreme constraints) could cause this code to fail or degrade in performance?"
    ]

    return {
        "score": code_quality,
        "summary": f"Solution submitted for {problem_title} in {language}. " + (
            "All test cases passed. Code structure is clear with actionable optimization paths."
            if passed_all
            else "Some test cases failed or encountered issues. Review boundary logic and edge cases."
        ),
        "metrics": {
            "code_quality": code_quality,
            "readability": readability,
            "correctness": correctness,
            "efficiency": efficiency,
            "coding_standards": standards,
        },
        "time_complexity": est_time,
        "space_complexity": est_space,
        "issues": issues,
        "suggestions": suggestions,
        "best_practices": best_practices,
        "interview_feedback": interview_feedback,
        "optimized_approach": optimized_approach,
        "interview_questions": interview_questions,
    }


async def generate_gemini_review(
    code: str,
    language: str,
    problem_title: str,
    problem_description: str,
    passed_all: bool,
    execution_result: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generates structured AI code review using the official Google GenAI SDK.
    Falls back gracefully to heuristic review if no API key is provided or if network fails.
    """
    if not GEMINI_API_KEY:
        # Graceful fallback when user hasn't configured an API key yet
        return heuristic_review(code, language, problem_title, passed_all, execution_result)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)

        exec_summary = "Execution Status: " + ("All test cases passed successfully." if passed_all else "Some test cases failed.")
        if execution_result:
            if execution_result.get("compile_output"):
                exec_summary += f"\nCompilation Output:\n{execution_result['compile_output']}"
            if execution_result.get("error"):
                exec_summary += f"\nRuntime Error:\n{execution_result['error']}"

        prompt = f"""You are a Senior Technical Interviewer and Placement Coding Mentor assessing a college student's code submission.

PROBLEM: {problem_title}
DESCRIPTION:
{problem_description}

STUDENT PROGRAMMING LANGUAGE: {language}
STUDENT CODE:
```{language}
{code}
```

TEST EXECUTION VERDICT:
{exec_summary}

Evaluate the student's submission as an experienced technical interviewer. Provide honest, constructive, and placement-focused evaluation.
Rate their code quality, readability, correctness, efficiency, and coding standards.
State the exact asymptotic Time Complexity and Space Complexity using Big-O notation.
Identify concrete issues, practical optimization suggestions, and industry best practices.
Provide practical advice on how the candidate should explain this solution in a live placement interview.
Generate 3 to 4 specific technical interview follow-up questions directly derived from this candidate's code.

Respond ONLY with structured JSON adhering to the provided schema. Do not include markdown code block wrappers around the JSON."""

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=REVIEW_JSON_SCHEMA,
                temperature=0.3,
            ),
        )

        text = response.text.strip()
        # Clean any accidental markdown backticks if returned
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        data = json.loads(text)
        return data

    except Exception as e:
        print(f"[AI Mentor Error] Gemini API call failed: {e}. Using heuristic review.")
        fallback = heuristic_review(code, language, problem_title, passed_all, execution_result)
        fallback["summary"] += " (Note: Reviewed using offline placement heuristics; connect Gemini API key for live AI reasoning)."
        return fallback
