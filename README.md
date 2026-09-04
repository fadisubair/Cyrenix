# CYRENIX

## Evidence-Driven SOC Incident Response Platform   

CYRENIX is a full-stack Security Operations Center (SOC) and incident-response platform designed to transform security telemetry into structured, explainable investigations and controlled response workflows.

## 1. Project Highlights
Wazuh provides the security telemetry and detection layer. CYRENIX provides the investigation, correlation, reasoning, risk, and response-governance layer built around that telemetry. *Note: CYRENIX is not a replacement for Wazuh.*

## 2. Architecture
```text
Kali Linux
    ↓
Ubuntu Target + Wazuh Agent
    ↓
Wazuh Server
    ↓
CYRENIX Ingestion
    ↓
FastAPI Backend
    ↓
PostgreSQL
    ↓
Investigation / Correlation
    ↓
Response Governance
    ↓
Audit
```
- **Kali Linux**: The attack source.
- **Ubuntu Target + Wazuh Agent**: The monitored host experiencing the attack and streaming logs.
- **Wazuh Server**: Detects and aggregates the telemetry.
- **CYRENIX Ingestion**: Validates and normalizes the incoming data.
- **FastAPI Backend & PostgreSQL**: Powers the core platform API and state.
- **Investigation & Governance**: Orchestrates reasoning, risk profiling, and controlled responses.

## 3. Wazuh + CYRENIX Responsibilities
- **Wazuh**: Host monitoring, log collection, intrusion detection, and initial telemetry alerting.
- **CYRENIX**: Incident management, finding rationale, event correlation, attack-chain visualization, identity risk assessment, and analyst-controlled response actions.

## 4. Real-World Wazuh Validation
The validated workflow in the laboratory:
```text
Kali
  ↓
Controlled SSH authentication failure
  ↓
Ubuntu target
  ↓
Authentication logs
  ↓
Wazuh Agent
  ↓
Wazuh Manager
  ↓
Wazuh alert
  ↓
CYRENIX authenticated ingestion API
  ↓
WazuhNormalizer
  ↓
FAILED_LOGIN
  ↓
PostgreSQL
  ↓
Incident investigation
```
*Note: The current real-lab integration uses the authenticated CYRENIX ingestion API as the integration boundary. Automatic production-scale Wazuh webhook/event-stream ingestion is a future roadmap item.*

## 5. Detection and Correlation
CYRENIX implements deterministic MVP heuristics for detecting brute-force attacks:
- 3 or more `FAILED_LOGIN` events
- same source IP
- same username
- within a 10-minute window

Result: **brute-force-oriented finding**. This represents deterministic correlation rather than purely AI-driven detection.

## 6. Event Normalization
Raw Wazuh events are processed by the `WazuhNormalizer` into `NormalizedEvent` entities, and finally stored as database events.

**Supported Mappings**:
- Authentication failure → `FAILED_LOGIN`
- Successful authentication → `SUCCESSFUL_LOGIN`
- Other Wazuh alert → `WAZUH_ALERT`

**Normalized Fields**:
- `timestamp`
- `event_type`
- `source`
- `username`
- `source_ip`
- `destination_ip`
- `hostname`
- `raw_data`

## 7. Incident Investigation Workflow
```text
Incident
 ↓
Events & Evidence
 ↓
Finding
 ↓
Reasoning
 ↓
Attack Chain
 ↓
MITRE ATT&CK
 ↓
Identity Risk
 ↓
Blast Radius
 ↓
Investigation Recommendations
 ↓
Response Recommendation
```

## 8. Findings & Reasoning
Findings represent structured analytical results based on real events. Fields include:
- `title`
- `finding_type`
- `severity`
- `confidence`
- `description`
- `rationale`
- `investigation_reasoning`

## 9. Events & Evidence
The platform tracks and associates security events directly with incidents, allowing analysts to review the underlying telemetry evidence separate from the high-level finding cards.

## 10. Attack Chain
CYRENIX visualizes the progression of related events mapped to attack stages across the incident lifecycle.

## 11. MITRE ATT&CK
Findings can be mapped to the MITRE ATT&CK framework. For example, the SSH authentication scenario maps to:
- `T1110` (Brute Force)
- `T1110.001` (Password Guessing)

## 12. Identity Risk
Identity risk provides context on users involved in an incident. It analyzes:
- Identity signals
- Identity profiles
- Relevant authentication activity

## 13. Blast Radius
Evaluates the potential scope of compromise:
```text
Incident
 ├── User
 │    └── labuser
 │
 └── Source
      └── <KALI_IP>
```

## 14. Investigation Recommendations
Suggests deterministic next steps for analysts based on the current state of findings (e.g., looking for a successful login following brute-force attempts).

## 15. Response Workflow
```text
Finding
 ↓
Response Recommendation
 ↓
Policy Evaluation
 ↓
Analyst Approval
 ↓
DRY_RUN
 ↓
Audit Trail
```
*Note: Response recommendations are not automatically executed. High-impact containment requires manual validation.*

## 16. Response Actions
Includes actions such as proposing block rules for attacking IPs based on findings.
## 17. Analyst Approval
Provides a governance checkpoint where analysts must explicitly approve or reject high-impact response actions.

## 18. DRY_RUN
Allows analysts to simulate response actions (like blocking an IP) before affecting the real environment.

## 19. Audit Trail
Comprehensive logging tracks all analyst actions, approvals, and system evaluations to ensure accountability.

## 20. Threat Intelligence
Allows searching and associating known indicators of compromise (IoCs) and threat insights with findings.

## 21. Authentication and Authorization
CYRENIX enforces role-based access control (RBAC) via JWT authentication.
Roles include: `ADMIN`, `ANALYST`, and `VIEWER`.

## 22. API
CYRENIX exposes RESTful FastAPI routes. Representative endpoints include:
- `POST /api/auth/login`
- `POST /api/auth/token`
- `GET /api/incidents`
- `POST /api/incidents`
- `GET /api/incidents/{id}/risk`
- `GET /api/incidents/{id}/blast-radius`
- `GET /api/incidents/{id}/attack-chain`
- `GET /api/incidents/{id}/identity-risk`
- `POST /api/ingestion/events`
- `GET /api/events`
- `POST /api/events`
- `GET /api/events/{event_id}`
- `PATCH /api/events/{event_id}/incident/{incident_id}`

*(Local Swagger documentation available at `http://127.0.0.1:8000/docs`)*

## 23. Technology Stack
**Frontend**: React, TypeScript, Vite
**Backend**: Python, FastAPI, SQLAlchemy, Pydantic, JWT authentication
**Database**: PostgreSQL, Alembic
**Security**: Wazuh, Linux, SSH telemetry, MITRE ATT&CK

## 24. Project Structure
```text
CYRENIX/
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   │       └── ingestion/
│   └── tests/
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── contexts/
│       └── pages/
└── README.md
```

## 25. Installation
To get started:
```bash
git clone <repository_url>
cd Cyrenix
```

## 26. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Set up the `.env` file (never use real credentials in public files):
```env
DATABASE_URL=<YOUR_DATABASE_URL>
JWT_SECRET_KEY=<YOUR_SECRET>
```

## 27. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 28. Database Setup
Create your PostgreSQL database matching your `DATABASE_URL`. Run migrations:
```bash
cd backend
alembic upgrade head
```

## 29. Wazuh Setup
Logical Wazuh architecture:
```text
Kali (<KALI_IP>)
  ↓
Ubuntu target + Wazuh Agent (<UBUNTU_TARGET_IP>)
  ↓
Wazuh Server (<WAZUH_SERVER_IP>)
```
The Wazuh Agent monitors `/var/log/auth.log` and forwards events to the Wazuh Server.

## 30. Real-World Demonstration
1. Generate a controlled authentication failure against the lab target.
2. Verify the event appears in Ubuntu authentication logs.
3. Verify the Wazuh Agent is connected.
4. Verify Wazuh generates the authentication alert.
5. Send the authenticated Wazuh event through the CYRENIX ingestion API.
6. Verify CYRENIX normalizes it to `FAILED_LOGIN`.
7. Associate events with a lab incident.
8. Run Analyze Incident.
9. Review Finding / Evidence / MITRE / Identity Risk.
10. Generate a response recommendation.
11. Review approval workflow.
12. Use DRY_RUN.
13. Review Audit Trail.

## 31. Testing
Latest verification results:
- **Backend Tests**: 35 passed.
- **Alembic**: No new upgrade operations detected.
- **Frontend Build**: Production build successful (0 TypeScript compilation errors).

## 32. Security Considerations
- Test only against systems you own and are authorized to assess.
- Ensure JWT keys and database passwords are long, random, and kept secret.

## 33. Current Limitations
- Ingestion operates via an authenticated API endpoint.
- Production-scale automatic Wazuh webhook/event-stream ingestion is not implemented.
- Five non-fatal Pydantic V2 deprecation warnings exist (class-based configuration).
- Detection logic currently relies on MVP deterministic rules.

## 34. Future Roadmap
- Native Wazuh webhook/event-stream integration
- Advanced Behavioral Analytics
- Redis/Kafka Event Processing
- Containerized/Kubernetes Deployment
- SOAR connector framework

## 35. Validation Summary
The workflow successfully demonstrates pulling telemetry from a real lab and traversing the entire incident lifecycle up to a controlled dry-run response.

## 36. Portfolio Description
CYRENIX is a full-stack SOC investigation platform integrating Wazuh telemetry with FastAPI, React, TypeScript, and PostgreSQL. It emphasizes explainable findings, MITRE ATT&CK mapping, response governance, and auditability.

## 37. Key Security Workflow
Observation → Investigation → Assessment → Governance → Simulated Execution.

## 38. Repository
https://github.com/fadisubair/Cyrenix.git

## 39. Author
Fadi Subair

## 40. Disclaimer
This project is intended for educational purposes and controlled laboratory environments only.     
