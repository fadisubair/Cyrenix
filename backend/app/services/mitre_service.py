from sqlalchemy.orm import Session
from app.models.finding import Finding
from typing import List, Dict, Any

class MitreService:
    # A simple dictionary mapping for MVP
    TECHNIQUES = {
        "T1110": {"technique_id": "T1110", "technique_name": "Brute Force", "tactic": "Credential Access"},
        "T1078": {"technique_id": "T1078", "technique_name": "Valid Accounts", "tactic": "Initial Access"},
        "T1059": {"technique_id": "T1059", "technique_name": "Command and Scripting Interpreter", "tactic": "Execution"},
        "T1071": {"technique_id": "T1071", "technique_name": "Application Layer Protocol", "tactic": "Command and Control"}
    }
    
    @staticmethod
    def get_mitre_mapping_for_finding(db: Session, finding_id: int) -> List[Dict[str, Any]]:
        finding = db.get(Finding, finding_id)
        if not finding:
            return []
            
        techniques = finding.mitre_techniques or []
        # If empty, try to auto-map based on finding title or type for MVP
        if not techniques:
            if "Brute" in finding.title or finding.finding_type == "FAILED_LOGIN_SPIKE":
                techniques = ["T1110"]
            elif "Valid" in finding.title or finding.finding_type == "UNUSUAL_LOGIN":
                techniques = ["T1078"]
            elif "Process" in finding.title or finding.finding_type == "SUSPICIOUS_PROCESS":
                techniques = ["T1059"]
            
            # Save the mapping back
            if techniques:
                finding.mitre_techniques = techniques
                db.commit()
                
        # Hydrate techniques
        results = []
        for tech in techniques:
            base_info = MitreService.TECHNIQUES.get(tech, {"technique_id": tech, "technique_name": "Unknown", "tactic": "Unknown"})
            results.append({
                **base_info,
                "confidence": finding.confidence,
                "rationale": finding.rationale,
                "evidence_ids": [] # can be extracted from evidence links
            })
            
        return results

    @staticmethod
    def get_coverage(db: Session) -> Dict[str, Any]:
        from app.models.finding import Finding
        from sqlalchemy import select
        
        stmt = select(Finding)
        findings = db.scalars(stmt).all()
        
        # Build coverage
        coverage = {
            tactic: [] for tactic in set(t["tactic"] for t in MitreService.TECHNIQUES.values())
        }
        
        for finding in findings:
            mapping = MitreService.get_mitre_mapping_for_finding(db, finding.id)
            for m in mapping:
                tactic = m["tactic"]
                if tactic in coverage:
                    coverage[tactic].append({
                        "technique_id": m["technique_id"],
                        "technique_name": m["technique_name"],
                        "finding_id": finding.id,
                        "finding_title": finding.title,
                        "confidence": finding.confidence
                    })
                    
        return coverage
