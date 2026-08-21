import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getIncident } from '../api/incidents';
import { Incident } from '../types';
import { LoadingState, ErrorState } from '../components/EmptyState';
import { StatusBadge, SeverityBadge, ConfidenceBadge } from '../components/Badges';
import OverviewTab from './incident/OverviewTab';
import EventsTab from './incident/EventsTab';
import FindingsTab from './incident/FindingsTab';
import ReasoningTab from './incident/ReasoningTab';
import ResponseTab from './incident/ResponseTab';
import AuditTab from './incident/AuditTab';

const IncidentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      getIncident(id)
        .then(setIncident)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <LoadingState message="Loading incident workspace..." />;
  if (!incident) return <ErrorState message="Incident not found" />;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'Events' },
    { id: 'findings', label: 'Findings & Evidence' },
    { id: 'reasoning', label: 'Reasoning' },
    { id: 'response', label: 'Response Actions' },
    { id: 'audit', label: 'Audit Timeline' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6 shrink-0 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-100">{incident.title}</h1>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span className="font-mono bg-slate-950 px-2 py-1 rounded">ID: {String(incident.id).substring(0,8)}</span>
              <span>Category: <strong className="text-slate-300">{incident.category}</strong></span>
              <span>Confidence: <ConfidenceBadge confidence={incident.confidence} /></span>
              <span>Risk Score: <strong className="text-slate-300 font-mono">{incident.risk_score}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-800 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab.id 
                ? 'border-brand text-brand bg-brand/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto mt-6">
        {activeTab === 'overview' && <OverviewTab incident={incident} />}
        {activeTab === 'events' && <EventsTab incidentId={incident.id} />}
        {activeTab === 'findings' && <FindingsTab incidentId={incident.id} />}
        {activeTab === 'reasoning' && <ReasoningTab incidentId={incident.id} />}
        {activeTab === 'response' && <ResponseTab incidentId={incident.id} />}
        {activeTab === 'audit' && <AuditTab incidentId={incident.id} />}
      </div>
    </div>
  );
};

export default IncidentDetail;
