# CYRENIX

## Evidence-Driven SOC Incident Response Platform

CYRENIX is a full-stack SOC and incident-response platform designed to transform security telemetry into structured, explainable investigations and controlled response workflows. Integrating with Wazuh for real security telemetry, it provides an advanced investigation layer.

> **Note**: IP addresses shown in the documentation are placeholders from an isolated development lab.

## Project Context

**Evidence-Driven SOC Incident Response Platform**

Wazuh is used for telemetry collection and detection, while CYRENIX serves as the investigation, correlation, reasoning, risk, and controlled-response layer built around that telemetry.

The system integrates with Wazuh for real security telemetry and provides an investigation layer covering:
- Event normalization
- Incident management
- Event-to-incident association
- Security-event correlation
- Attack-chain analysis
- Identity risk analysis
- Behavioral baseline/anomaly analysis
- Explainable findings
- Evidence linking
- MITRE ATT&CK mapping
- Blast-radius analysis
- Next investigation recommendations
- Threat intelligence
- Response-policy evaluation
- Analyst approval workflows
- DRY_RUN response execution
- Audit logging
- Global search
- Analyst notes
- Settings/configuration

*Disclaimer: CYRENIX is not a replacement for Wazuh, and currently validates Wazuh alerts through the authenticated CYRENIX ingestion API rather than automatic production-scale Wazuh streaming.*

## Real-World Lab

The CYRENIX lab consists of a host testing environment:

```text
Fedora Host
│
├── Kali Linux
│   └── <KALI_IP>
│       ATTACKER
│
├── Ubuntu Server
│   └── <UBUNTU_TARGET_IP>
│       TARGET
│       SSH
│       Wazuh Agent
│
└── Ubuntu Server
    └── <WAZUH_SERVER_IP>
        WAZUH SERVER
        ├── Wazuh Manager
        ├── Wazuh Indexer
        └── Wazuh Dashboard
```

## Real Telemetry Validation

The real-world validation currently uses the authenticated ingestion API as the integration boundary. 

```text
Kali
  ↓
controlled SSH authentication failure
  ↓
Ubuntu target
  ↓
authentication logs
  ↓
Wazuh Agent
  ↓
Wazuh Manager
  ↓
Wazuh detection
  ↓
CYRENIX ingestion API
  ↓
WazuhNormalizer
  ↓
FAILED_LOGIN
  ↓
PostgreSQL
  ↓
Incident
  ↓
Investigation
  ↓
Finding
  ↓
Response recommendation
  ↓
Approval
  ↓
DRY_RUN
  ↓
Audit
```

## Wazuh Normalization

The `WazuhNormalizer` converts raw Wazuh alerts into normalized CYRENIX event types. 

Examples:
- SSH/PAM authentication failure → `FAILED_LOGIN`
- successful SSH authentication → `SUCCESSFUL_LOGIN`
- unsupported events → `WAZUH_ALERT`

Normalized fields include:
- `timestamp`
- `event_type`
- `source`
- `username`
- `source_ip`
- `destination_ip`
- `hostname`
- `raw_data`

## Brute-Force Detection

The current investigation logic relies on deterministic MVP heuristics. For example, brute-force detection logic detects:
- at least 3 failed-login events
- same source IP
- same username
- within a 10-minute window

Example:
```text
<KALI_IP> → labuser → FAILED_LOGIN
<KALI_IP> → labuser → FAILED_LOGIN
<KALI_IP> → labuser → FAILED_LOGIN
```
Result: **Possible Brute-Force Attack**

## Investigation Workflow

High-impact response actions are not supposed to execute automatically just because a finding exists.

```text
Observation
↓
Correlation
↓
Assessment
↓
Evidence
↓
Finding
↓
MITRE ATT&CK
↓
Identity Risk
↓
Next Investigation Steps
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

## Features

1. **Incident Management**: End-to-end tracking of security incidents.
2. **Real Wazuh Integration**: Telemetry collection through authenticated ingestion APIs.
3. **Event Normalization**: `WazuhNormalizer` to handle raw Wazuh alerts.
4. **Event-to-Incident Association**: Grouping related security events.
5. **Brute-Force Detection**: Deterministic correlation rules.
6. **Explainable Findings**: Human-readable explanations of security alerts.
7. **Investigation Evidence**: Linking concrete evidence to findings.
8. **Attack Chain Correlation**: Visualizing the progression of an attack.
9. **Identity Risk**: Profiling identities involved in incidents.
10. **Behavioral Baseline**: Identifying anomalies from normal behavior.
11. **MITRE ATT&CK**: Mapping findings to the ATT&CK framework.
12. **Blast Radius**: Evaluating the potential scope of an incident.
13. **Threat Intelligence**: Integrating local threat insights.
14. **Next Investigation Steps**: Recommending analyst actions.
15. **Response Center**: Unified response management.
16. **Response Policy Engine**: Evaluating organizational response rules.
17. **Analyst Approval**: Manual checkpoints for high-impact actions.
18. **DRY_RUN**: Simulating response executions.
19. **Audit Trail**: Tracking system and analyst changes.
20. **Global Search**: System-wide querying capabilities.
21. **Analyst Notes**: Collaborative investigation documentation.
22. **Settings**: Platform configuration.

## Tech Stack

**Frontend:**
- React
- TypeScript
- Vite

**Backend:**
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT authentication

**Database:**
- PostgreSQL
- Alembic

**Security:**
- Wazuh
- Kali Linux
- Ubuntu Server
- SSH telemetry
- MITRE ATT&CK

## Authentication & Authorization

CYRENIX implements JWT authentication with an OAuth2-compatible token flow.

**Roles:**
- `ADMIN`
- `ANALYST`
- `VIEWER`

Protected modification endpoints require appropriate authorization via JWT Bearer tokens.

## API

The backend exposes several major endpoints for telemetry, investigation, and configuration:

```http
POST /api/auth/login
POST /api/auth/token

GET /api/incidents
POST /api/incidents

GET /api/incidents/{id}/risk
GET /api/incidents/{id}/blast-radius

POST /api/ingestion/events

PATCH /api/events/{event_id}/incident/{incident_id}
```

*For local Swagger documentation, visit: `http://127.0.0.1:8000/docs` (when running locally).*

## Installation

1. **Clone repository**:
   ```bash
   git clone <repository_url>
   cd Cyrenix
   ```
2. **Backend virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   ```
3. **Install backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Configure environment variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL=<YOUR_DATABASE_URL>
   JWT_SECRET_KEY=<YOUR_SECRET>
   ```
5. **PostgreSQL setup**:
   Ensure PostgreSQL is running and the CYRENIX database is created.
6. **Run Alembic migrations**:
   ```bash
   alembic upgrade head
   ```
7. **Start FastAPI backend**:
   ```bash
   uvicorn app.main:app --reload
   ```
8. **Start React/Vite frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
9. **Open Swagger**: Navigate to `http://127.0.0.1:8000/docs`
10. **Run tests**:
    ```bash
    cd ../backend
    python -m pytest -q
    ```

## Wazuh Lab Setup

The logical architecture consists of three nodes:

```text
Kali
  ↓
Ubuntu Target + Wazuh Agent
  ↓
Wazuh Server
  ↓
CYRENIX
```
The Ubuntu target monitors authentication telemetry, and the Wazuh server processes the resulting events, which are then shipped to CYRENIX.

## Real Demonstration

Please note that security testing must only be performed against systems the user owns or is authorized to test.

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

## Testing

Latest verified validation results:

- **Backend**: 35 passed.
- **Alembic**: No new upgrade operations detected.
- **Frontend**: Production build successful. 0 TypeScript compilation errors during the validated build.

## Current Limitations

- Wazuh ingestion is currently demonstrated through the authenticated CYRENIX ingestion API.
- Production-scale automated Wazuh streaming/webhook ingestion is not yet implemented.
- Some AI functionality uses an abstraction/fallback provider rather than a production LLM deployment.
- Detection logic includes deterministic MVP heuristics.
- There are currently 5 non-fatal Pydantic V2 deprecation warnings involving class-based configuration.
- Current deployment is intended for development and controlled security laboratory use.

## Future Roadmap

- [ ] Native Wazuh webhook/event-stream integration
- [ ] Message-queue based ingestion
- [ ] Redis/Kafka event processing
- [ ] Advanced behavioral analytics
- [ ] Production LLM integration
- [ ] Additional SIEM/EDR integrations
- [ ] SOAR connector framework
- [ ] Containerized deployment
- [ ] Kubernetes deployment
- [ ] Improved observability
- [ ] More granular response policies

## Screenshots

Screenshots of the UI can be found in `docs/screenshots/`.
*Note: Public screenshots must be sanitized to remove credentials, tokens, internal addresses, and other environment-specific information.*

Suggested filenames:
- `wazuh-alert.png`
- `incident-overview.png`
- `finding-analysis.png`
- `attack-chain.png`
- `identity-risk.png`
- `mitre-mapping.png`
- `blast-radius.png`
- `investigation-steps.png`
- `response-recommendation.png`
- `approval-workflow.png`
- `audit-trail.png`

## Project Structure

```text
CYRENIX/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   │       └── ingestion/
│   └── tests/
└── frontend/
    └── src/
        ├── api/
        ├── components/
        └── pages/
```
