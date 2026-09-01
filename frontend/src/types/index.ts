export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  role: 'ANALYST' | 'VIEWER';
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password?: string;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  category: string;
  priority: string;
  risk_score: number;
  confidence: number;
  owner_id?: number | null;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  incident_id: number;
  timestamp: string;
  event_type: string;
  source: string;
  source_type: string;
  username?: string;
  source_ip?: string;
  destination_ip?: string;
  hostname?: string;
  raw_data: Record<string, any>;
  created_at: string;
}

export interface Finding {
  id: number;
  incident_id: number;
  title: string;
  finding_type: string;
  description: string;
  rationale: string;
  confidence: number;
  status: 'PROPOSED' | 'ACTIVE' | 'MITIGATED' | 'FALSE_POSITIVE' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

export interface FindingEvidence {
  finding: Finding;
  events: Event[];
}

export interface ReasoningStep {
  id: number;
  finding_id: number;
  step_order: number;
  step_type: 'OBSERVATION' | 'CORRELATION' | 'ASSESSMENT' | 'CONCLUSION';
  title: string;
  description: string;
  conclusion?: string;
  confidence?: number;
  evidence_references: string[];
  created_at: string;
}

export interface ResponseAction {
  id: number;
  finding_id: number;
  action_type: string;
  target: string;
  title: string;
  description: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTING' | 'SUCCESS' | 'FAILED';
  rationale: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  execution_status: string;
  execution_mode?: string | null;
  execution_message?: string | null;
  executed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExecutionResult {
  status: string;
  mode: string;
  message: string;
  execution_timestamp: string;
}

export interface AuditLog {
  id: number;
  action: string;
  actor: string;
  details: Record<string, any>;
  response_action_id?: number;
  finding_id?: number;
  incident_id?: number;
  created_at: string;
}

export interface TimelineEvent {
  type: 'EVENT' | 'FINDING' | 'REASONING' | 'RESPONSE_ACTION' | 'AUDIT_LOG';
  id: number;
  timestamp: string;
  title: string;
  description: string;
  data: any;
}

export interface AttackStage {
  id: number;
  name: string;
  order: number;
  mitre_tactic?: string;
  mitre_technique?: string;
  links?: any[];
  created_at: string;
}

export interface AttackChain {
  id: number;
  incident_id: number;
  name: string;
  description?: string;
  stages: AttackStage[];
  created_at: string;
  updated_at: string;
}

export interface IdentitySignal {
  id: number;
  signal_type: string;
  severity: string;
  confidence: number;
  evidence?: any;
  created_at: string;
}

export interface IdentityProfile {
  id: number;
  username: string;
  risk_score: string;
  signals: IdentitySignal[];
  created_at: string;
}

export interface BlastRadius {
  affected_users: string[];
  affected_hosts: string[];
  source_ips: string[];
  destinations: string[];
  relationships: Array<{source: string, target: string, type: string}>;
}

