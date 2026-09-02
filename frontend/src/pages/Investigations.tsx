import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentsApi, findingsApi } from '../api';
import client from '../api/client';
import { Incident, Finding } from '../types';
import { Activity, User, ShieldAlert, ArrowRight, Search } from 'lucide-react';
import { Badge } from '../components/Badge';

// Helper component for individual row to fetch its own recommendations
const InvestigationRow: React.FC<{ incident: Incident, findings: Finding[], onClick: () => void }> = ({ incident, findings, onClick }) => {
  const [nextStep, setNextStep] = useState<string>('-');
  const [missingEvidence, setMissingEvidence] = useState<string>('-');
  
  useEffect(() => {
    const fetchNextSteps = async () => {
      const activeFindings = findings.filter(f => f.incident_id === incident.id && f.status !== 'REJECTED');
      if (activeFindings.length > 0) {
        try {
          // Fetch recommendations for the first active finding
          const res = await client.get(`/api/findings/${activeFindings[0].id}/recommendations`);
          if (res.data && res.data.length > 0) {
            setNextStep(res.data[0].title);
            setMissingEvidence(res.data[0].reason || '-');
          } else {
            setNextStep('Awaiting Analysis');
          }
        } catch {
          setNextStep('Failed to load');
        }
      }
    };
    fetchNextSteps();
  }, [incident.id, findings]);

  // Derived Investigation State
  let invState = 'PENDING';
  let badgeVariant: 'default' | 'success' | 'warning' | 'danger' = 'default';
  
  if (incident.status === 'CLOSED') {
    invState = 'DISMISSED';
  } else if (incident.status === 'RESOLVED') {
    invState = 'COMPLETED';
    badgeVariant = 'success';
  } else {
    const incidentFindings = findings.filter(f => f.incident_id === incident.id);
    if (incidentFindings.length === 0) {
      invState = incident.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'PENDING';
      badgeVariant = 'default';
    } else if (incidentFindings.some(f => f.status === 'PROPOSED')) {
      invState = 'READY_FOR_REVIEW';
      badgeVariant = 'warning';
    } else {
      invState = 'WAITING_FOR_EVIDENCE'; // Simplified for UI
      badgeVariant = 'danger';
    }
  }

  return (
    <tr onClick={onClick} className="border-b border-border/50 hover:bg-zinc-800/30 cursor-pointer transition-colors group">
      <td className="px-4 py-4 text-sm">
        <div className="font-bold text-zinc-100 mb-1">INC-{(incident.id || 0).toString().padStart(4, '0')}</div>
        <div className="text-zinc-400 truncate max-w-[200px]">{incident.title}</div>
      </td>
      <td className="px-4 py-4 text-sm text-zinc-300">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-1 opacity-50" />
          {incident.owner_id ? `Analyst ${incident.owner_id}` : 'Unassigned'}
        </div>
      </td>
      <td className="px-4 py-4 text-sm">
        <Badge variant={incident.priority === 'HIGH' || incident.priority === 'CRITICAL' ? 'danger' : 'default'}>
          {incident.priority}
        </Badge>
      </td>
      <td className="px-4 py-4 text-sm">
        <Badge variant={badgeVariant}>{invState}</Badge>
      </td>
      <td className="px-4 py-4 text-sm">
        <div className="flex items-center">
          <div className="w-16 bg-zinc-950 rounded-full h-1.5 mr-2 overflow-hidden border border-border">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(incident.confidence || 0) * 100}%` }}></div>
          </div>
          <span className="text-xs text-zinc-400">{Math.round((incident.confidence || 0) * 100)}%</span>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-zinc-400 truncate max-w-[150px]">{missingEvidence}</td>
      <td className="px-4 py-4 text-sm text-zinc-300 truncate max-w-[150px]">{nextStep}</td>
      <td className="px-4 py-4 text-sm text-zinc-400">
        {new Date(incident.updated_at).toLocaleDateString()}
        <ArrowRight className="h-4 w-4 inline ml-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
      </td>
    </tr>
  );
};

export const Investigations: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incData, finData] = await Promise.all([
          incidentsApi.getAll(),
          findingsApi.getAll().catch(() => [])
        ]);
        // Only show active investigations (exclude dismissed/completed unless specifically searched)
        setIncidents(incData.filter(i => i.status !== 'CLOSED' && i.status !== 'RESOLVED').sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
        setFindings(finData);
      } catch (error) {
        console.error('Failed to load investigations', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-wide">Investigations</h1>
          <p className="text-zinc-400">Analyst case management queue</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Filter queue..." 
            className="bg-zinc-950 border border-border rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="bg-panel border border-border rounded-md overflow-hidden flex flex-col flex-1">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-400">Loading queue...</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-border text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Incident</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                  <th className="px-4 py-3 font-medium">Missing Evidence</th>
                  <th className="px-4 py-3 font-medium">Next Step</th>
                  <th className="px-4 py-3 font-medium">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {incidents.map(incident => (
                  <InvestigationRow 
                    key={incident.id} 
                    incident={incident} 
                    findings={findings}
                    onClick={() => navigate(`/incidents/${incident.id}`)} 
                  />
                ))}
                
                {incidents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                      <Activity className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      No active investigations in queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
