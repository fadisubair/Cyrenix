import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentsApi, findingsApi, responseActionsApi, identitiesApi } from '../api';
import { Incident, Finding, ResponseAction } from '../types';
import { ShieldAlert, AlertTriangle, Activity, Target, Shield, Fingerprint, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [actions, setActions] = useState<ResponseAction[]>([]);
  const [identities, setIdentities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incData, finData, actData, idData] = await Promise.all([
          incidentsApi.getAll().catch(() => []),
          findingsApi.getAll().catch(() => []),
          responseActionsApi.getAll().catch(() => []),
          identitiesApi.getAll().catch(() => []),
        ]);
        setIncidents(incData);
        setFindings(finData);
        setActions(actData);
        setIdentities(idData);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="text-zinc-400 p-6">Loading SOC Overview...</div>;
  }

  const openIncidents = incidents.filter(i => i.status !== 'CLOSED' && i.status !== 'RESOLVED');
  const criticalIncidents = openIncidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');
  const highConfFindings = findings.filter(f => f.confidence >= 0.8 && f.status !== 'REJECTED');
  const highRiskIdentities = identities.filter(id => id.risk_score === 'HIGH' || id.risk_score === 'CRITICAL');
  const pendingActions = actions.filter(a => a.status === 'PENDING_APPROVAL');
  
  // Queue items
  const findingsForReview = findings.filter(f => f.status === 'PROPOSED');

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-wide mb-1">SOC Operations Workspace</h1>
          <div className="text-sm text-zinc-500 flex items-center gap-4">
            <span className="flex items-center gap-1.5"><ShieldAlert className="h-4 w-4 text-rose-500" /> {criticalIncidents.length} Critical/High Incidents</span>
            <span className="flex items-center gap-1.5"><Activity className="h-4 w-4 text-amber-500" /> {openIncidents.filter(i => findings.some(f => f.incident_id === i.id)).length} Active Investigations</span>
            <span className="flex items-center gap-1.5"><Target className="h-4 w-4 text-emerald-500" /> {highConfFindings.length} High Conf Findings</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-indigo-500" /> {pendingActions.length} Pending Approvals</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-zinc-100">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
          <div className="text-xs text-zinc-500 font-mono">{new Date().toLocaleTimeString('en-US', { hour12: false, timeZoneName: 'short' })}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Investigation Queue */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center">
              Investigation Queue
            </h2>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium" onClick={() => navigate('/incidents')}>View All</button>
          </div>
          <div className="space-y-3">
            {criticalIncidents.slice(0, 3).map(inc => (
              <div key={`inc-${inc.id}`} className="p-4 border border-border rounded-md bg-panel flex justify-between items-center cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => navigate(`/incidents/${inc.id}`)}>
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-12 rounded-full bg-rose-500"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-zinc-500">INC-{(inc.id || 0).toString().padStart(4, '0')}</span>
                      <span className="text-xs font-medium text-rose-400 uppercase tracking-wider">{inc.severity}</span>
                    </div>
                    <div className="text-sm font-medium text-zinc-100">{inc.title}</div>
                  </div>
                </div>
                <div className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2 py-1 rounded">Triage Required</div>
              </div>
            ))}
            
            {findingsForReview.slice(0, 3).map(f => (
              <div key={`fin-${f.id}`} className="p-4 border border-border rounded-md bg-panel flex justify-between items-center cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => navigate(`/incidents/${f.incident_id}`)}>
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-12 rounded-full bg-amber-500"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-zinc-500">FINDING-{f.id}</span>
                      <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">PROPOSED</span>
                    </div>
                    <div className="text-sm font-medium text-zinc-100">{f.title}</div>
                  </div>
                </div>
                <div className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2 py-1 rounded">Review Required</div>
              </div>
            ))}
            
            {pendingActions.slice(0, 3).map(a => (
              <div key={`act-${a.id}`} className="p-4 border border-border rounded-md bg-panel flex justify-between items-center cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => navigate(`/approvals`)}>
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-12 rounded-full bg-indigo-500"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-zinc-500">ACTION-{a.id}</span>
                      <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">APPROVAL</span>
                    </div>
                    <div className="text-sm font-medium text-zinc-100">{a.title} - {a.target}</div>
                  </div>
                </div>
                <div className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2 py-1 rounded">Authorization Required</div>
              </div>
            ))}

            {criticalIncidents.length === 0 && findingsForReview.length === 0 && pendingActions.length === 0 && (
              <div className="p-8 border border-border border-dashed rounded-md text-center text-zinc-500">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                No pending items in queue
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center">
              Recent Incidents
            </h2>
          </div>
          <div className="border border-border rounded-md overflow-hidden bg-panel">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-[10px] text-zinc-500 uppercase tracking-widest bg-zinc-900/50">
                  <th className="px-4 py-2 font-semibold">ID</th>
                  <th className="px-4 py-2 font-semibold">Title</th>
                  <th className="px-4 py-2 font-semibold">Sev</th>
                  <th className="px-4 py-2 font-semibold">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {incidents.slice(0, 8).map(incident => (
                  <tr 
                    key={incident.id} 
                    className="hover:bg-zinc-800/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                  >
                    <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                      {(incident.id || 0).toString().padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-200 font-medium truncate max-w-[200px]">{incident.title}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`font-semibold tracking-wide ${
                        incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'text-rose-400' :
                        incident.severity === 'MEDIUM' ? 'text-amber-400' : 'text-zinc-400'
                      }`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`font-medium ${
                        incident.status === 'CLOSED' || incident.status === 'RESOLVED' 
                          ? 'text-zinc-500'
                          : 'text-zinc-300'
                      }`}>
                        {incident.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
