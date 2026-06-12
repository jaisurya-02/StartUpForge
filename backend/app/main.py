import os
import json
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import agents
from agents.agent1 import startup_discovery_agent
from agents.market_research_agent import market_research_agent
from agents.mvp_planner_agent import mvp_planner_agent
from agents.pitch_deck_agent import pitch_deck_agent

load_dotenv()

app = FastAPI(title="StartupForge AI Accelerator API")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schemas for request validation
class DiscoveryRequest(BaseModel):
    skills: str
    interests: str
    experience: str
    budget: str
    goal: str

class ValidationRequest(BaseModel):
    startup_name: str
    problem: str
    solution: str
    target_users: str
    skills: str
    experience: str
    budget: str
    goal: str

class MvpRequest(BaseModel):
    startup_name: str
    problem: str
    solution: str
    target_users: str
    skills: str
    experience: str
    budget: str

class PitchRequest(BaseModel):
    startup_name: str
    problem: str
    solution: str
    target_users: str
    validation: str
    features: str
    revenue_strategy: str
    success_probability: str


# Helper to clean JSON markdown wrappers
def parse_agent_json(raw_text):
    if not raw_text or not isinstance(raw_text, str):
        return raw_text
    
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    
    try:
        return json.loads(cleaned)
    except Exception:
        return {"raw_text": raw_text}


@app.post("/api/discovery")
def run_discovery(payload: DiscoveryRequest):
    try:
        user_profile = {
            "skills": payload.skills,
            "interests": payload.interests,
            "experience": payload.experience,
            "budget": payload.budget,
            "goal": payload.goal
        }
        
        result = startup_discovery_agent(user_profile)
        
        # Parse nested blueprint if it is a string JSON
        blueprint_parsed = parse_agent_json(result.get("blueprint"))
        
        return {
            "intent": parse_agent_json(result.get("intent")),
            "retrieved_startups": result.get("retrieved_startups"),
            "patterns": parse_agent_json(result.get("patterns")),
            "market_gaps": parse_agent_json(result.get("market_gaps")),
            "opportunities": parse_agent_json(result.get("opportunities")),
            "scores": parse_agent_json(result.get("scores")),
            "blueprint": blueprint_parsed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/validation")
def run_validation(payload: ValidationRequest):
    try:
        startup_idea = {
            "startup_name": payload.startup_name,
            "problem": payload.problem,
            "solution": payload.solution,
            "target_users": payload.target_users,
            "skills": payload.skills,
            "experience": payload.experience,
            "budget": payload.budget,
            "goal": payload.goal
        }
        
        result = market_research_agent(startup_idea=startup_idea)
        
        return {
            "startup_context": result.get("startup_context"),
            "yc_startups": result.get("yc_startups"),
            "competitors": parse_agent_json(result.get("competitors")),
            "pain_points": parse_agent_json(result.get("pain_points")),
            "demand": parse_agent_json(result.get("demand")),
            "ranked_opportunities": parse_agent_json(result.get("ranked_opportunities")),
            "validation": parse_agent_json(result.get("validation")),
            "investor_feedback": result.get("investor_feedback")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mvp")
def run_mvp(payload: MvpRequest):
    try:
        startup_idea = {
            "startup_name": payload.startup_name,
            "problem": payload.problem,
            "solution": payload.solution,
            "target_users": payload.target_users
        }
        user_profile = {
            "skills": payload.skills,
            "experience": payload.experience,
            "budget": payload.budget
        }
        
        result = mvp_planner_agent(startup_idea, user_profile)
        
        return {
            "yc_startups": result.get("yc_startups"),
            "features": parse_agent_json(result.get("features")),
            "tech_stack": parse_agent_json(result.get("tech_stack")),
            "database": parse_agent_json(result.get("database")),
            "apis": parse_agent_json(result.get("apis")),
            "ui": parse_agent_json(result.get("ui")),
            "roadmap": parse_agent_json(result.get("roadmap")),
            "costs": parse_agent_json(result.get("costs")),
            "risks": parse_agent_json(result.get("risks")),
            "founder_fit": parse_agent_json(result.get("founder_fit")),
            "buildability": parse_agent_json(result.get("buildability")),
            "investor_readiness": parse_agent_json(result.get("investor_readiness")),
            "revenue_strategy": parse_agent_json(result.get("revenue_strategy")),
            "launch_strategy": parse_agent_json(result.get("launch_strategy")),
            "success_probability": parse_agent_json(result.get("success_probability"))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pitch")
def run_pitch(payload: PitchRequest):
    try:
        startup_context = {
            "startup_name": payload.startup_name,
            "problem": payload.problem,
            "solution": payload.solution,
            "target_users": payload.target_users
        }
        architect_summary = {
            "features": payload.features,
            "revenue_strategy": payload.revenue_strategy,
            "success_probability": payload.success_probability
        }
        
        result = pitch_deck_agent(
            startup_context,
            payload.validation,
            architect_summary
        )
        
        return {
            "pitch_deck": parse_agent_json(result)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    # Start web server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)