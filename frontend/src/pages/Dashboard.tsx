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
    return <div className="text-gray-400 p-6">Loading SOC Overview...</div>;
  }

  const openIncidents = incidents.filter(i => i.status !== 'CLOSED' && i.status !== 'RESOLVED');
  const criticalIncidents = openIncidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');
  const highConfFindings = findings.filter(f => f.confidence >= 0.8 && f.status !== 'REJECTED');
  const highRiskIdentities = identities.filter(id => id.risk_score === 'HIGH' || id.risk_score === 'CRITICAL');
  const pendingActions = actions.filter(a => a.status === 'PENDING_APPROVAL');
  
  // Queue items
  const findingsForReview = findings.filter(f => f.status === 'PROPOSED');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">SOC Overview</h1>
        <p className="text-gray-400">Security Operations Center Workspace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-panel border border-border p-4 rounded-lg flex flex-col justify-between hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => navigate('/incidents')}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Open Incidents</span>
            <ShieldAlert className="h-4 w-4 text-primary" />
          </div>
          <span className="text-2xl font-bold text-white">{openIncidents.length}</span>
        </div>
        
        <div className="bg-panel border border-border p-4 rounded-lg flex flex-col justify-between hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => navigate('/incidents')}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Critical / High</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold text-white">{criticalIncidents.length}</span>
        </div>

        <div className="bg-panel border border-border p-4 rounded-lg flex flex-col justify-between hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => navigate('/investigations')}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Active Investigations</span>
            <Activity className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-white">{openIncidents.filter(i => findings.some(f => f.incident_id === i.id)).length}</span>
        </div>

        <div className="bg-panel border border-border p-4 rounded-lg flex flex-col justify-between hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => navigate('/findings')}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">High Confidence Findings</span>
            <Target className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-white">{highConfFindings.length}</span>
        </div>

        <div className="bg-panel border border-border p-4 rounded-lg flex flex-col justify-between hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => navigate('/identities')}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Identity Risk Alerts</span>
            <Fingerprint className="h-4 w-4 text-rose-400" />
          </div>
          <span className="text-2xl font-bold text-white">{highRiskIdentities.length}</span>
        </div>

        <div className="bg-panel border border-border p-4 rounded-lg flex flex-col justify-between hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => navigate('/approvals')}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Pending Approvals</span>
            <Shield className="h-4 w-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-bold text-white">{pendingActions.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investigation Queue */}
        <div className="bg-panel border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Investigation Queue
            </h2>
          </div>
          <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-96">
            {criticalIncidents.slice(0, 3).map(inc => (
              <div key={`inc-${inc.id}`} className="p-3 border border-border rounded bg-background flex justify-between items-center cursor-pointer hover:border-primary/50" onClick={() => navigate(`/incidents/${inc.id}`)}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="danger">{inc.severity}</Badge>
                    <span className="text-sm font-bold text-white">INC-{(inc.id || 0).toString().padStart(4, '0')}</span>
                  </div>
                  <div className="text-sm text-gray-400">{inc.title}</div>
                </div>
                <Badge>Triage Required</Badge>
              </div>
            ))}
            
            {findingsForReview.slice(0, 3).map(f => (
              <div key={`fin-${f.id}`} className="p-3 border border-border rounded bg-background flex justify-between items-center cursor-pointer hover:border-primary/50" onClick={() => navigate(`/incidents/${f.incident_id}`)}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="warning">PROPOSED</Badge>
                    <span className="text-sm font-bold text-white">Finding #{f.id}</span>
                  </div>
                  <div className="text-sm text-gray-400">{f.title}</div>
                </div>
                <Badge>Review Required</Badge>
              </div>
            ))}
            
            {pendingActions.slice(0, 3).map(a => (
              <div key={`act-${a.id}`} className="p-3 border border-border rounded bg-background flex justify-between items-center cursor-pointer hover:border-primary/50" onClick={() => navigate(`/approvals`)}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="default">APPROVAL</Badge>
                    <span className="text-sm font-bold text-white">Action #{a.id}</span>
                  </div>
                  <div className="text-sm text-gray-400">{a.title} - {a.target}</div>
                </div>
                <Badge>Approval Required</Badge>
              </div>
            ))}

            {criticalIncidents.length === 0 && findingsForReview.length === 0 && pendingActions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No pending items in queue
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-panel border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border bg-background/50">
            <h2 className="text-lg font-medium text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Recent Incidents
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto max-h-96">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Severity</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {incidents.slice(0, 8).map(incident => (
                  <tr 
                    key={incident.id} 
                    className="border-b border-border/50 hover:bg-white/[0.02] cursor-pointer transition-colors"
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      INC-{(incident.id || 0).toString().padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 truncate max-w-[200px]">{incident.title}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={
                        incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'danger' :
                        incident.severity === 'MEDIUM' ? 'warning' : 'default'
                      }>
                        {incident.severity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        incident.status === 'CLOSED' || incident.status === 'RESOLVED' 
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-primary/10 text-primary'
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
