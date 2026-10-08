import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
JUDGE0_API_KEY = os.getenv("JUDGE0_API_KEY", "").strip()
JUDGE0_API_URL = os.getenv("JUDGE0_API_URL", "https://ce.judge0.com").rstrip("/")
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))
