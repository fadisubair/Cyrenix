import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { incidentsApi, investigationsApi } from '../api';
import { Incident } from '../types';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { EventsList } from '../components/incident/EventsList';
import { FindingsList } from '../components/incident/FindingsList';
import { ResponseActionsList } from '../components/incident/ResponseActionsList';
import { TimelineView } from '../components/incident/TimelineView';
import { AttackChainView } from '../components/incident/AttackChainView';
import { IdentityRiskView } from '../components/incident/IdentityRiskView';
import { BlastRadiusView } from '../components/incident/BlastRadiusView';
import { NotesList } from '../components/incident/NotesList';
import { Play } from 'lucide-react';

export const IncidentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'findings' | 'events' | 'chain' | 'identity' | 'blast' | 'response' | 'notes' | 'timeline'>('findings');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const fetchIncident = async () => {
    if (!id) return;
    try {
      const data = await incidentsApi.getById(id);
      setIncident(data);
    } catch (error) {
      console.error('Failed to fetch incident details', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const handleAnalyze = async () => {
    if (!id) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      await investigationsApi.analyze(id);
      // Reload everything to show new findings
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to analyze incident', error);
      if (error.response?.data?.detail) {
        setAnalyzeError(error.response.data.detail);
      } else {
        setAnalyzeError('Failed to analyze incident. Please check the logs.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) return <div className="text-gray-400">Loading incident...</div>;
  if (!incident) return <div className="text-red-400">Incident not found.</div>;

  const tabs = [
    { id: 'findings', label: 'Findings & Reasoning' },
    { id: 'chain', label: 'Attack Chain' },
    { id: 'identity', label: 'Identity Risk' },
    { id: 'blast', label: 'Blast Radius' },
    { id: 'events', label: 'Events & Evidence' },
    { id: 'response', label: 'Response Actions' },
    { id: 'notes', label: 'Analyst Notes' },
    { id: 'timeline', label: 'Audit Timeline' },
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white tracking-wide">
              INC-{incident.id.toString().padStart(4, '0')}: {incident.title}
            </h1>
            <Badge variant={incident.severity === 'CRITICAL' ? 'danger' : incident.severity === 'HIGH' ? 'warning' : incident.severity === 'MEDIUM' ? 'info' : 'default'}>
              {incident.severity}
            </Badge>
            <Badge variant={incident.status === 'NEW' ? 'danger' : incident.status === 'RESOLVED' ? 'success' : 'warning'}>
              {incident.status}
            </Badge>
          </div>
          <p className="text-gray-400">{incident.description}</p>
        </div>
        
        {user?.role === 'ANALYST' && (
          <div className="flex flex-col items-end gap-2">
            <Button onClick={handleAnalyze} isLoading={isAnalyzing} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Analyze Incident
            </Button>
            {analyzeError && (
              <p className="text-sm text-red-400 max-w-sm text-right bg-red-950/30 p-2 rounded border border-red-900/50">
                {analyzeError}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 bg-panel border border-border rounded-lg overflow-hidden flex flex-col">
        <div className="border-b border-border px-4 flex gap-6 bg-background/30">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex-1 overflow-hidden">
          {activeTab === 'findings' && <FindingsList incidentId={incident.id} />}
          {activeTab === 'chain' && <AttackChainView incidentId={incident.id} />}
          {activeTab === 'identity' && <IdentityRiskView incidentId={incident.id} />}
          {activeTab === 'blast' && <BlastRadiusView incidentId={incident.id} />}
          {activeTab === 'events' && <EventsList incidentId={incident.id} />}
          {activeTab === 'response' && <ResponseActionsList incidentId={incident.id} />}
          {activeTab === 'notes' && <NotesList incidentId={incident.id} />}
          {activeTab === 'timeline' && <TimelineView incidentId={incident.id} />}
        </div>
      </div>
    </div>
  );
};
