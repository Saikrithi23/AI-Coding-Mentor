from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.judge0 import execute_code


app = FastAPI(
    title="AI Coding Mentor API",
    description="Backend API for AI-Based Placement Coding Mentor",
    version="1.0.0"
)


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request format
class CodeRequest(BaseModel):
    code: str
    language: str
    stdin: str = ""


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "AI Coding Mentor API is running"
    }


# Health check
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# Run code
@app.post("/run-code")
async def run_code(request: CodeRequest):

    try:

        result = await execute_code(
            code=request.code,
            language=request.language,
            stdin=request.stdin
        )

        return {
            "success": True,
            "language": request.language,
            "status": result.get("status"),
            "output": result.get("stdout"),
            "error": result.get("stderr"),
            "compile_output": result.get("compile_output"),
            "time": result.get("time"),
            "memory": result.get("memory")
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }