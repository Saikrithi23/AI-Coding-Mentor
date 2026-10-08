import httpx
import asyncio


JUDGE0_URL = "https://ce.judge0.com"


LANGUAGE_IDS = {
    "C++": 54,
    "Python": 71,
    "Java": 62,
    "C": 50
}


async def execute_code(code: str, language: str, stdin: str = ""):

    if language not in LANGUAGE_IDS:
        raise ValueError(f"Unsupported language: {language}")

    language_id = LANGUAGE_IDS[language]

    submission = {
        "source_code": code,
        "language_id": language_id,
        "stdin": stdin
    }

    async with httpx.AsyncClient(timeout=30.0) as client:

        # Submit code
        response = await client.post(
            f"{JUDGE0_URL}/submissions",
            params={
                "base64_encoded": "false",
                "wait": "false"
            },
            json=submission
        )

        response.raise_for_status()

        token = response.json()["token"]

        # Wait for result
        for _ in range(30):

            await asyncio.sleep(1)

            result_response = await client.get(
                f"{JUDGE0_URL}/submissions/{token}",
                params={
                    "base64_encoded": "false"
                }
            )

            result_response.raise_for_status()

            result = result_response.json()

            status_id = result["status"]["id"]

            # 1 = In Queue
            # 2 = Processing
            if status_id not in [1, 2]:
                return result

        raise TimeoutError("Code execution timed out")