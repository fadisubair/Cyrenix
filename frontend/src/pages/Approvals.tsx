import React, { useEffect, useState } from 'react';
import { responseActionsApi, findingsApi, incidentsApi } from '../api';
import { ResponseAction, Finding, Incident } from '../types';
import { ShieldCheck, AlertTriangle, Check, X, Clock, Play } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Approvals: React.FC = () => {
  const [actions, setActions] = useState<ResponseAction[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [incidents, setIncidents] = useState<Record<number, Incident>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [actionData, findingData, incData] = await Promise.all([
        responseActionsApi.getAll(),
        findingsApi.getAll(),
        incidentsApi.getAll().catch(() => [])
      ]);
      
      setActions(actionData.filter(a => a.status === 'PENDING_APPROVAL'));
      setFindings(findingData.filter(f => f.status === 'PROPOSED'));
      
      const incMap: Record<number, Incident> = {};
      incData.forEach(inc => { incMap[inc.id] = inc; });
      setIncidents(incMap);
    } catch (error) {
      console.error('Failed to load approvals', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActionApprove = async (id: number) => {
    try {
      await responseActionsApi.approve(id);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleActionReject = async (id: number) => {
    try {
      await responseActionsApi.reject(id);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFindingApprove = async (id: number) => {
    try {
      await findingsApi.update(id, { status: 'ACTIVE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFindingReject = async (id: number) => {
    try {
      await findingsApi.update(id, { status: 'REJECTED' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-wide">Approvals Queue</h1>
          <p className="text-zinc-400">Manual intervention required for high-impact actions and proposed findings</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center px-4 py-2 bg-zinc-950 border border-border text-zinc-300 rounded-md text-sm hover:bg-zinc-800/30 transition-colors"
        >
          <Clock className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
        {/* Response Actions Pending Approval */}
        <div className="bg-panel border border-border rounded-md flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-border bg-zinc-950/50 flex justify-between items-center">
            <h2 className="text-lg font-medium text-zinc-100 flex items-center">
              <Play className="h-5 w-5 mr-2 text-indigo-400" />
              Pending Response Actions
              <Badge variant="warning" className="ml-3">{actions.length}</Badge>
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="text-center text-zinc-400 py-8">Loading queue...</div>
            ) : actions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                <ShieldCheck className="h-10 w-10 mb-3 opacity-50 text-emerald-500" />
                <p>No response actions require your approval.</p>
              </div>
            ) : (
              actions.map(action => (
                <div key={action.id} className="bg-zinc-950 border border-amber-500/30 rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-zinc-100 flex items-center">
                        {action.action_type.replace(/_/g, ' ')}
                      </h3>
                      <div className="text-xs text-amber-500 mt-1 font-medium bg-amber-500/10 inline-block px-2 py-0.5 rounded">
                        Requires Authorization
                      </div>
                    </div>
                    <Badge variant={action.risk_level === 'HIGH' ? 'danger' : action.risk_level === 'MEDIUM' ? 'warning' : 'default'}>
                      {action.risk_level} Risk
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-zinc-400 my-3">
                    <p>{action.description}</p>
                    <div className="mt-2 text-xs font-mono bg-zinc-950 p-2 rounded border border-border/50 truncate">
                      Target: {action.target}
                    </div>
                    <div className="mt-2 text-xs text-zinc-500 italic">
                      Rationale: {action.rationale}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-4 pt-4 border-t border-border/50">
                    <button 
                      onClick={() => handleActionApprove(action.id)}
                      className="flex-1 flex items-center justify-center py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-md text-sm font-medium transition-colors"
                    >
                      <Check className="h-4 w-4 mr-2" /> Approve & Execute
                    </button>
                    <button 
                      onClick={() => handleActionReject(action.id)}
                      className="flex-1 flex items-center justify-center py-2 bg-zinc-950 border border-border text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-100 rounded-md text-sm font-medium transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Proposed Findings */}
        <div className="bg-panel border border-border rounded-md flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-border bg-zinc-950/50 flex justify-between items-center">
            <h2 className="text-lg font-medium text-zinc-100 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Proposed Findings
              <Badge variant="warning" className="ml-3">{findings.length}</Badge>
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="text-center text-zinc-400 py-8">Loading queue...</div>
            ) : findings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                <ShieldCheck className="h-10 w-10 mb-3 opacity-50 text-emerald-500" />
                <p>No proposed findings to review.</p>
              </div>
            ) : (
              findings.map(finding => {
                const incident = incidents[finding.incident_id];
                return (
                  <div key={finding.id} className="bg-zinc-950 border border-border rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-zinc-100 text-sm">{finding.title}</h3>
                      <div className="flex items-center text-xs text-zinc-400 bg-zinc-950 px-2 py-1 rounded border border-border/50">
                        {Math.round((finding.confidence || 0) * 100)}% Conf.
                      </div>
                    </div>
                    
                    <div className="text-sm text-zinc-400 my-2 line-clamp-2">
                      {finding.description}
                    </div>
                    
                    <div className="text-xs text-zinc-500 mb-3 flex justify-between items-center">
                      <span>Type: {finding.finding_type}</span>
                      {incident && (
                        <span>Incident INC-{(incident.id || 0).toString().padStart(4, '0')}</span>
                      )}
                    </div>
                    
                    <div className="flex space-x-3 pt-3 border-t border-border/50">
                      <button 
                        onClick={() => handleFindingApprove(finding.id)}
                        className="flex-1 flex items-center justify-center py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10 border border-primary/20 rounded-md text-xs font-medium transition-colors"
                      >
                        <Check className="h-3 w-3 mr-1" /> Validate
                      </button>
                      <button 
                        onClick={() => handleFindingReject(finding.id)}
                        className="flex-1 flex items-center justify-center py-1.5 bg-zinc-950 border border-border text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-100 rounded-md text-xs font-medium transition-colors"
                      >
                        <X className="h-3 w-3 mr-1" /> False Positive
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
