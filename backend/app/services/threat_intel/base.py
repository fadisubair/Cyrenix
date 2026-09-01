from abc import ABC, abstractmethod
from typing import Optional
from pydantic import BaseModel

class ThreatIntelResult(BaseModel):
    ioc_value: str
    ioc_type: str
    provider: str
    reputation: str
    confidence: float
    context_data: dict

class ThreatIntelProvider(ABC):
    @abstractmethod
    def get_name(self) -> str:
        pass
        
    @abstractmethod
    def lookup(self, ioc_value: str, ioc_type: str) -> Optional[ThreatIntelResult]:
        pass
