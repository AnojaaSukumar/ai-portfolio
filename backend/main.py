import os
import json
import time
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Official Groq SDK
from groq import Groq

load_dotenv()

# Initialize Groq Client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

app = FastAPI(title="Living AI Portfolio API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = Path("portfolio_data.json")
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def load_data():
    if DATA_FILE.exists():
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return {}


# Initialize Google GenAI client
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_KEY:
    ai_client = genai.Client(api_key=GEMINI_KEY)
else:
    ai_client = None
def load_data():
    if not DATA_FILE.exists():
        raise HTTPException(status_code=404, detail="Data file not found")
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        
        # Ensure default lists exist so the frontend never receives 'undefined'
        if "projects" not in data:
            data["projects"] = []
        if "academic_projects" not in data:
            data["academic_projects"] = []
        if "certificates" not in data:
            data["certificates"] = []
            
        return data

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


# ---------------- PYDANTIC SCHEMAS ---------------- #
class ProjectItem(BaseModel):
    title: str
    type: str
    description: str
    tech_stack: list[str]
    github_link: str


class PasswordUpdate(BaseModel):
    new_password: str


class ChatRequest(BaseModel):
    message: str


# ---------------- PORTFOLIO DATA ENDPOINT ---------------- #
@app.get("/api/portfolio")
def get_portfolio():
    return load_data()


# ---------------- ADMIN AUTHENTICATION ---------------- #
@app.post("/api/admin/verify")
def verify_admin(req: dict):
    data = load_data()
    # Checks .env variable first, then portfolio_data.json, defaults to '1234'
    expected_password = os.getenv("ADMIN_PASSWORD") or data.get("admin_password", "1234")
    
    if req.get("password") == expected_password:
        return {"success": True}
    raise HTTPException(status_code=401, detail="Invalid password")


@app.put("/api/admin/password")
def update_password(req: PasswordUpdate):
    data = load_data()
    data["admin_password"] = req.new_password
    save_data(data)
    return {"message": "Password updated successfully!"}


@app.post("/api/profile/photo")
async def upload_profile_photo(file: UploadFile = File(...)):
    data = load_data()
    safe_filename = f"profile_{file.filename.replace(' ', '_')}"
    file_path = UPLOAD_DIR / safe_filename
    with open(file_path, "wb") as f:
        f.write(await file.read())
    photo_url = f"/uploads/{safe_filename}"
    data["personal_info"]["profile_photo"] = photo_url
    save_data(data)
    return {"message": "Profile photo updated successfully!", "photo_url": photo_url}


# ---------------- FEATURED PROJECTS ENDPOINTS ---------------- #
@app.post("/api/projects")
def add_project(project: ProjectItem):
    data = load_data()
    new_id = len(data.get("projects", [])) + 1 if data.get("projects") else 1
    new_project_entry = {
        "id": new_id,
        "title": project.title,
        "type": project.type,
        "description": project.description,
        "tech_stack": project.tech_stack,
        "github_link": project.github_link,
    }
    if "projects" not in data:
        data["projects"] = []
    data["projects"].append(new_project_entry)
    save_data(data)
    return {"message": "Project saved successfully!", "project": new_project_entry}


@app.put("/api/projects/{project_id}")
def update_project(project_id: int, updated: ProjectItem):
    data = load_data()
    for p in data.get("projects", []):
        if p["id"] == project_id:
            p["title"] = updated.title
            p["type"] = updated.type
            p["description"] = updated.description
            p["tech_stack"] = updated.tech_stack
            p["github_link"] = updated.github_link
            save_data(data)
            return {"message": "Project updated successfully!"}
    raise HTTPException(status_code=404, detail="Project not found")


@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int):
    data = load_data()
    initial_length = len(data.get("projects", []))
    data["projects"] = [p for p in data.get("projects", []) if p.get("id") != project_id]
    if len(data.get("projects", [])) == initial_length:
        raise HTTPException(status_code=404, detail="Project not found")
    save_data(data)
    return {"message": f"Project {project_id} deleted successfully!"}


# ---------------- ACADEMIC / UNIVERSITY PROJECTS ENDPOINTS ---------------- #
@app.post("/api/academic-projects")
def add_academic_project(project: ProjectItem):
    data = load_data()
    new_id = len(data.get("academic_projects", [])) + 1 if data.get("academic_projects") else 1
    new_project_entry = {
        "id": new_id,
        "title": project.title,
        "type": project.type,
        "description": project.description,
        "tech_stack": project.tech_stack,
        "github_link": project.github_link,
    }
    if "academic_projects" not in data:
        data["academic_projects"] = []
    data["academic_projects"].append(new_project_entry)
    save_data(data)
    return {"message": "Academic project saved successfully!", "project": new_project_entry}


@app.put("/api/academic-projects/{project_id}")
def update_academic_project(project_id: int, updated: ProjectItem):
    data = load_data()
    for p in data.get("academic_projects", []):
        if p["id"] == project_id:
            p["title"] = updated.title
            p["type"] = updated.type
            p["description"] = updated.description
            p["tech_stack"] = updated.tech_stack
            p["github_link"] = updated.github_link
            save_data(data)
            return {"message": "Academic project updated successfully!"}
    raise HTTPException(status_code=404, detail="Academic project not found")


@app.delete("/api/academic-projects/{project_id}")
def delete_academic_project(project_id: int):
    data = load_data()
    initial_length = len(data.get("academic_projects", []))
    data["academic_projects"] = [p for p in data.get("academic_projects", []) if p.get("id") != project_id]
    if len(data.get("academic_projects", [])) == initial_length:
        raise HTTPException(status_code=404, detail="Academic project not found")
    save_data(data)
    return {"message": f"Academic project {project_id} deleted successfully!"}


# ---------------- CERTIFICATE ENDPOINTS ---------------- #
@app.post("/api/certificates/upload")
async def upload_certificate(
    title: str = Form(...),
    issuer: str = Form(...),
    issue_date: str = Form(...),
    file: UploadFile = File(...)
):
    data = load_data()
    safe_filename = file.filename.replace(" ", "_")
    file_path = UPLOAD_DIR / safe_filename
    with open(file_path, "wb") as f:
        f.write(await file.read())
    new_cert = {
        "id": len(data.get("certificates", [])) + 1 if data.get("certificates") else 1,
        "title": title,
        "issuer": issuer,
        "issue_date": issue_date,
        "file_url": f"/uploads/{safe_filename}"
    }
    if "certificates" not in data:
        data["certificates"] = []
    data["certificates"].append(new_cert)
    save_data(data)
    return {"message": "Certificate uploaded successfully!", "certificate": new_cert}


@app.put("/api/certificates/{cert_id}")
async def update_certificate(
    cert_id: int,
    title: str = Form(...),
    issuer: str = Form(...),
    issue_date: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    data = load_data()
    for c in data.get("certificates", []):
        if c["id"] == cert_id:
            c["title"] = title
            c["issuer"] = issuer
            c["issue_date"] = issue_date
            if file:
                safe_filename = file.filename.replace(" ", "_")
                file_path = UPLOAD_DIR / safe_filename
                with open(file_path, "wb") as f:
                    f.write(await file.read())
                c["file_url"] = f"/uploads/{safe_filename}"  # ✅ CORRECT
            save_data(data)
            return {"message": "Certificate updated successfully!"}
    raise HTTPException(status_code=404, detail="Certificate not found")


@app.delete("/api/certificates/{cert_id}")
def delete_certificate(cert_id: int):
    data = load_data()
    initial_length = len(data.get("certificates", []))
    data["certificates"] = [c for c in data.get("certificates", []) if c.get("id") != cert_id]
    if len(data.get("certificates", [])) == initial_length:
        raise HTTPException(status_code=404, detail="Certificate not found")
    save_data(data)
    return {"message": f"Certificate {cert_id} deleted successfully!"}

class ChatRequest(BaseModel):
    message: str


@app.post("/api/chat")
async def chat_with_agent(req: ChatRequest):
    data = load_data()
    user_query = req.message.strip()

    system_instruction = f"""
    You are an intelligent AI Recruiter Assistant representing Anojaa Sukumar on her portfolio website.

    Here is Anojaa's background data:
    {json.dumps(data, indent=2)}

    Instructions:
    1. Answer user questions accurately based on her portfolio background data above.
    2. Understand and respond naturally in WHATEVER language or language mix the user uses (English, Tamil, Tanglish, Sinhala, Singlish like 'oyake nama mokatha', etc.).
    3. Keep answers polite, concise, and professional.
    """

    if groq_client:
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_query},
                ],
                temperature=0.3,
            )
            return {"reply": response.choices[0].message.content}
        except Exception as e:
            print(f"⚠️ Groq Error: {repr(e)}")

    # Fallback if Groq API key is missing or encounters an issue
    return {
        "reply": f"Anojaa is an {data.get('personal_info', {}).get('role', 'AI Specialist & IT Student')}. Feel free to ask about her projects or certificates!"
    }