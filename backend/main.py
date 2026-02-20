import os
import io
import base64
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import google.generativeai as genai
from PIL import Image
import webbrowser
import threading
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def open_browser():
    """Opens the browser to the local server after a short delay."""
    webbrowser.open("http://localhost:8000")

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Math Solver API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SolveRequest(BaseModel):
    problem: str
    language: str
    image_data: Optional[str] = None # Base64 string

class ExplainRequest(BaseModel):
    problem: str
    solution: str
    language: str


def get_model():
    # Using gemini-2.5-flash as it's available and was used in the original version
    return genai.GenerativeModel('gemini-2.5-flash')

@app.post("/api/solve")
async def solve_problem(request: SolveRequest):
    try:
        model = get_model()
        
        solve_prompt_base = f"""TASK: You are a world-class STEM (Math, Physics, Chemistry) solver. 
        
        REQUIREMENTS:
        1. Solve the problem COMPLETELY using the shortest and easiest method
        2. Provide step-by-step solution with ALL intermediate calculations
        3. ALWAYS show the final numerical answer clearly at the end
        4. Use simple math symbols (*, /, +, ^) only - NO LaTeX/MathJax
        5. Respond in {request.language} language
        
        CRITICAL: You MUST complete ALL calculations and show the final answer. Do not stop mid-calculation."""

        contents = []
        
        if request.image_data:
            # Handle image data
            try:
                # Remove header if present (e.g., "data:image/png;base64,")
                if "," in request.image_data:
                    base64_data = request.image_data.split(",")[1]
                else:
                    base64_data = request.image_data
                
                image_bytes = base64.b64decode(base64_data)
                img = Image.open(io.BytesIO(image_bytes))
                
                contents.append(img)
                contents.append(f"Solve the math problem shown in the attached image. {solve_prompt_base}")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")
        else:
            contents.append(f"Solve the following problem: '{request.problem}'. {solve_prompt_base}")

        response = model.generate_content(
            contents,
            generation_config=genai.types.GenerationConfig(
                temperature=0.0,
                max_output_tokens=2500,
            )
        )
        
        return {"solution": response.text}
    
    except Exception as e:
        print(f"Error in solve_problem: {str(e)}")
        # Return more detailed error if possible
        detail = str(e)
        if "quota" in detail.lower():
            detail = "API Quota exceeded. Please wait a few seconds and try again. " + detail
        raise HTTPException(status_code=500, detail=detail)

@app.post("/api/explain")
async def explain_solution(request: ExplainRequest):
    try:
        model = get_model()
        
        prompt = f"""TASK: You are an expert STEM tutor. Your goal is to simplify the provided detailed solution. 
        The explanation must be easy to understand for a middle school student, use simple math symbols (*, /, +) only, and be highly efficient.
        
        The original problem was: {request.problem}
        The detailed solution to simplify is: {request.solution}
        
        Provide the simplified explanation in {request.language} language."""
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=800,
            )
        )
        
        return {"explanation": response.text}
    
    except Exception as e:
        print(f"Error in explain_solution: {str(e)}")
        detail = str(e)
        if "quota" in detail.lower():
            detail = "API Quota exceeded. Please wait a few seconds and try again. " + detail
        raise HTTPException(status_code=500, detail=detail)


# Serve Frontend (Must be declared last to avoid intercepting API routes)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")
try:
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
except Exception as e:
    print(f"Warning: Could not mount frontend directory: {e}")

if __name__ == "__main__":
    import uvicorn
    # Start the browser only if NOT in production (simple heuristic)
    if not os.getenv("RENDER"):
        threading.Timer(1.5, open_browser).start()
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
