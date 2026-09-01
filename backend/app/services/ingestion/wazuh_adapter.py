import json
from typing import Dict, Any
from datetime import datetime, timezone
from app.services.ingestion.base import EventNormalizer, NormalizedEvent

class WazuhNormalizer(EventNormalizer):
    def can_handle(self, source_type: str) -> bool:
        return source_type.lower() == "wazuh"

    def normalize(self, raw_event: Dict[str, Any]) -> NormalizedEvent:
        # Example Wazuh format parsing
        timestamp = raw_event.get("timestamp")
        if timestamp:
            try:
                dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            except ValueError:
                dt = datetime.now(timezone.utc)
        else:
            dt = datetime.now(timezone.utc)

        rule = raw_event.get("rule", {})
        agent = raw_event.get("agent", {})
        data = raw_event.get("data", {})

        description = rule.get("description", "Unknown Wazuh Event")
        full_log = raw_event.get("full_log", "")

        desc_lower = description.lower()
        log_lower = full_log.lower()
        combined = f"{desc_lower} {log_lower}"

        # Heuristics for event mapping
        if (
            ("login" in combined and "failed" in combined) or
            ("authentication failed" in combined) or
            ("failed password" in combined) or
            ("user login failed" in combined)
        ):
            mapped_type = "FAILED_LOGIN"
        elif (
            ("login" in combined and "success" in combined) or
            ("accepted password" in combined)
        ):
            mapped_type = "SUCCESSFUL_LOGIN"
        else:
            mapped_type = "WAZUH_ALERT"

        # Extract fields
        username = data.get("srcuser") or data.get("dstuser")
        source_ip = data.get("srcip")
        dest_ip = data.get("dstip")
        hostname = agent.get("name")

        return NormalizedEvent(
            timestamp=dt,
            event_type=mapped_type,
            source=f"Wazuh - {rule.get('id', 'Unknown')}",
            username=username,
            source_ip=source_ip,
            destination_ip=dest_ip,
            hostname=hostname,
            raw_data=json.dumps(raw_event)
        )
