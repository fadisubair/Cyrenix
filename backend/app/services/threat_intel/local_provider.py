from typing import Optional
from app.services.threat_intel.base import ThreatIntelProvider, ThreatIntelResult

class LocalThreatIntelProvider(ThreatIntelProvider):
    def get_name(self) -> str:
        return "Local Mock Provider"
        
    def lookup(self, ioc_value: str, ioc_type: str) -> Optional[ThreatIntelResult]:
        # Simple deterministic responses for MVP
        if ioc_type == "IP" and ioc_value.startswith("10."):
            return ThreatIntelResult(
                ioc_value=ioc_value,
                ioc_type=ioc_type,
                provider=self.get_name(),
                reputation="SAFE",
                confidence=0.9,
                context_data={"desc": "Internal IP"}
            )
        elif ioc_type == "IP":
            return ThreatIntelResult(
                ioc_value=ioc_value,
                ioc_type=ioc_type,
                provider=self.get_name(),
                reputation="SUSPICIOUS",
                confidence=0.7,
                context_data={"desc": "Unknown external IP"}
            )
        elif ioc_type == "DOMAIN":
            return ThreatIntelResult(
                ioc_value=ioc_value,
                ioc_type=ioc_type,
                provider=self.get_name(),
                reputation="UNKNOWN",
                confidence=0.5,
                context_data={}
            )
            
        return None
