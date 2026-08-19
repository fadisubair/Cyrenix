from fastapi import FastAPI

from app.api.audit_logs import router as audit_log_router
from app.api.auth import router as auth_router
from app.api.events import router as event_router
from app.api.findings import router as finding_router
from app.api.incidents import router as incident_router
from app.api.investigations import router as investigation_router
from app.api.response_actions import router as response_action_router
from app.api.timeline import router as timeline_router


app = FastAPI(
    title="Cyrenix Incident Response Assistant",
    version="0.1.0",
)


# API routers
app.include_router(auth_router)
app.include_router(incident_router)
app.include_router(event_router)
app.include_router(finding_router)
app.include_router(investigation_router)
app.include_router(response_action_router)
app.include_router(audit_log_router)
app.include_router(timeline_router)


@app.get("/health")
def health():
    return {"status": "healthy"}
