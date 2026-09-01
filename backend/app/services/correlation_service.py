from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from app.models.correlation import AttackChain, AttackStage, CorrelationLink
from app.models.event import Event
from app.models.incident import Incident

class CorrelationService:
    @staticmethod
    def get_all_attack_chains(db: Session) -> List[AttackChain]:
        stmt = select(AttackChain)
        chains = list(db.scalars(stmt).all())
        for chain in chains:
            stage_stmt = select(AttackStage).where(AttackStage.chain_id == chain.id).order_by(AttackStage.order)
            chain.stages = list(db.scalars(stage_stmt).all())
            for stage in chain.stages:
                link_stmt = select(CorrelationLink).where(CorrelationLink.stage_id == stage.id)
                stage.links = list(db.scalars(link_stmt).all())
        return chains

    @staticmethod
    def get_attack_chains_for_incident(db: Session, incident_id: int) -> List[AttackChain]:
        stmt = select(AttackChain).where(AttackChain.incident_id == incident_id)
        chains = list(db.scalars(stmt).all())
        
        # Populate stages and links
        for chain in chains:
            stage_stmt = select(AttackStage).where(AttackStage.chain_id == chain.id).order_by(AttackStage.order)
            chain.stages = list(db.scalars(stage_stmt).all())
            for stage in chain.stages:
                link_stmt = select(CorrelationLink).where(CorrelationLink.stage_id == stage.id)
                stage.links = list(db.scalars(link_stmt).all())
        return chains
    
    @staticmethod
    def correlate_events_for_incident(db: Session, incident_id: int) -> List[AttackChain]:
        # A deterministic example implementation for MVP.
        # Find all events in the incident.
        stmt = select(Event).where(Event.incident_id == incident_id).order_by(Event.timestamp)
        events = list(db.scalars(stmt).all())

        if not events:
            return []

        # Find existing chain, or create one.
        chain_stmt = select(AttackChain).where(AttackChain.incident_id == incident_id)
        existing_chain = db.scalars(chain_stmt).first()
        
        if not existing_chain:
            chain = AttackChain(
                incident_id=incident_id,
                name="Identified Attack Chain",
                description="Auto-generated chain from correlated events"
            )
            db.add(chain)
            db.commit()
            db.refresh(chain)
        else:
            chain = existing_chain
            
        # Clear existing stages and links for a simple rebuild approach (MVP)
        db.query(AttackStage).where(AttackStage.chain_id == chain.id).delete()
        db.commit()
        
        # Let's map events to stages based on event type.
        # This is a naive implementation matching the user's example.
        stage_order = 0
        stages = {}
        for event in events:
            stage_name = "Activity"
            tactic = None
            technique = None
            
            if event.event_type == "FAILED_LOGIN":
                stage_name = "Authentication Anomaly"
                tactic = "Credential Access"
                technique = "T1110"
            elif event.event_type == "SUCCESSFUL_LOGIN":
                stage_name = "Successful Authentication"
                tactic = "Initial Access"
                technique = "T1078"
            elif event.event_type == "NEW_PROCESS":
                stage_name = "Process Execution"
                tactic = "Execution"
                technique = "T1059"
            elif event.event_type == "OUTBOUND_CONNECTION":
                stage_name = "Network Activity"
                tactic = "Command and Control"
                technique = "T1071"
                
            if stage_name not in stages:
                stage = AttackStage(
                    chain_id=chain.id,
                    name=stage_name,
                    order=stage_order,
                    mitre_tactic=tactic,
                    mitre_technique=technique
                )
                db.add(stage)
                db.flush() # flush to get stage.id
                stages[stage_name] = stage
                stage_order += 1
            else:
                stage = stages[stage_name]
                
            # Add correlation link
            link = CorrelationLink(
                stage_id=stage.id,
                source_event_id=event.id,
                reason=f"Event {event.event_type} matches {stage_name}",
                confidence=0.8
            )
            db.add(link)
            
        db.commit()
        return CorrelationService.get_attack_chains_for_incident(db, incident_id)
