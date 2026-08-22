export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ANALYST' | 'VIEWER';
  is_active: boolean;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  confidence: number;
  risk_score: number;
  created_at: string;
  updated_at: string;
  first_seen: string;
  last_seen: string;
}

export interface Event {
  id: string;
  timestamp: string;
  event_type: string;
  source: string;
  source_type: string;
  username?: string;
  source_ip?: string;
  destination_ip?: string;
  destination_port?: number;
  hostname?: string;
  protocol?: string;
  action?: string;
  url?: string;
  method?: string;
  status_code?: number;
  user_agent?: string;
  process_name?: string;
  file_name?: string;
  status?: string;
  raw_data?: Record<string, any>;
}

export interface Finding {
  id: string;
  incident_id: string;
  title: string;
  finding_type: string;
  description: string;
  rationale: string;
  confidence: number;
  status: 'PROPOSED' | 'CONFIRMED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

export interface InvestigationStep {
  id: string;
  finding_id: string;
  step_order: number;
  step_type: 'OBSERVATION' | 'CORRELATION' | 'ASSESSMENT';
  title: string;
  description: string;
  conclusion: string;
  confidence: number;
  evidence_event_ids: string[];
}

export interface ResponseAction {
  id: string;
  finding_id: string;
  action_type: string;
  target: string;
  title: string;
  description: string;
  rationale: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  approved_by_id?: string;
  approved_at?: string;
  execution_status?: 'PENDING' | 'SUCCESS' | 'FAILED';
  execution_mode?: 'DRY_RUN' | 'LIVE';
  execution_message?: string;
  executed_at?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, any>;
}

export interface TimelineEvent {
  timestamp: string;
  event_type: string;
  title: string;
  description: string;
  source_type: string;
  source_id: string;
  data: Record<string, any>;
}
