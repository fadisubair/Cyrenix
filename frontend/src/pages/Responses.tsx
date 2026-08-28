import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { responseActionsApi, incidentsApi, findingsApi } from '../api';
import { ResponseAction, Incident, Finding } from '../types';
import { Play, ShieldAlert, CheckCircle, XCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Responses: React.FC = () => {
  const navigate = useNavigate();
  const [actions, setActions] = useState<ResponseAction[]>([]);
  const [incidents, setIncidents] = useState<Record<number, Incident>>({});
  const [findings, setFindings] = useState<Record<number, Finding>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [actionData, incData, finData] = await Promise.all([
          responseActionsApi.getAll(),
          incidentsApi.getAll().catch(() => []),
          findingsApi.getAll().catch(() => [])
        ]);
        
        setActions(actionData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        
        const incMap: Record<number, Incident> = {};
        incData.forEach(inc => { incMap[inc.id] = inc; });
        setIncidents(incMap);
        
        const finMap: Record<number, Finding> = {};
        finData.forEach(fin => { finMap[fin.id] = fin; });
        setFindings(finMap);
      } catch (error) {
        console.error('Failed to load response actions', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredActions = actions.filter(action => {
    if (statusFilter !== 'ALL' && action.status !== statusFilter) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING_APPROVAL': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-rose-500" />;
      case 'EXECUTING': return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      case 'SUCCESS': return <Play className="h-4 w-4 text-emerald-500" />;
      case 'FAILED': return <AlertCircle className="h-4 w-4 text-rose-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch(status) {
      case 'PENDING_APPROVAL': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      case 'EXECUTING': return 'info';
      case 'SUCCESS': return 'success';
      case 'FAILED': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Response Center</h1>
          <p className="text-gray-400">Global queue of remediation and containment actions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-panel border border-border p-4 rounded-lg flex flex-col justify-between">
          <div className="text-sm font-medium text-gray-400 mb-2">Pending Approval</div>
          <div className="text-2xl font-bold text-amber-500">
            {actions.filter(a => a.status === 'PENDING_APPROVAL').length}
          </div>
        </div>
        <div className="bg-panel border border-border p-4 rounded-lg flex flex-col justify-between">
          <div className="text-sm font-medium text-gray-400 mb-2">Approved</div>
          <div className="text-2xl font-bold text-emerald-500">
            {actions.filter(a => a.status === 'APPROVED').length}
          </div>
        </div>
        <div className="bg-panel border border-border p-4 rounded-lg flex flex-col justify-between">
          <div className="text-sm font-medium text-gray-400 mb-2">Executing</div>
          <div className="text-2xl font-bold text-primary">
            {actions.filter(a => a.status === 'EXECUTING').length}
          </div>
        </div>
        <div className="bg-panel border border-border p-4 rounded-lg flex flex-col justify-between">
          <div className="text-sm font-medium text-gray-400 mb-2">Completed</div>
          <div className="text-2xl font-bold text-emerald-400">
            {actions.filter(a => a.status === 'SUCCESS').length}
          </div>
        </div>
        <div className="bg-panel border border-border p-4 rounded-lg flex flex-col justify-between">
          <div className="text-sm font-medium text-gray-400 mb-2">Failed</div>
          <div className="text-2xl font-bold text-rose-500">
            {actions.filter(a => a.status === 'FAILED').length}
          </div>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-lg overflow-hidden flex flex-col flex-1">
        <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center">
          <div className="flex space-x-2">
            {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'SUCCESS', 'REJECTED', 'FAILED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === status 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background border border-border text-gray-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading response actions...</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 border-b border-border text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium">Target</th>
                  <th className="px-6 py-3 font-medium">Context (Incident/Finding)</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Created / Updated</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredActions.map(action => {
                  const finding = findings[action.finding_id];
                  const incident = finding ? incidents[finding.incident_id] : null;
                  
                  return (
                    <tr 
                      key={action.id} 
                      onClick={() => navigate(`/incidents/${incident?.id || 1}`)}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-white flex items-center">
                        <span className="mr-3">{getStatusIcon(action.status)}</span>
                        {action.action_type.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="bg-[#0D1117] border border-border/50 rounded px-2 py-1 text-xs font-mono text-gray-300 inline-block truncate max-w-[150px]">
                          {action.target}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {incident ? (
                          <div className="flex flex-col">
                            <span className="text-gray-300 font-medium flex items-center">
                              <ShieldAlert className="h-3 w-3 mr-1 opacity-50" />
                              INC-{(incident.id || 0).toString().padStart(4, '0')}
                            </span>
                            <span className="text-gray-500 text-xs truncate max-w-[200px]">
                              {finding?.title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant={getStatusVariant(action.status)}>
                          {action.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        <div className="flex flex-col">
                          <span>{new Date(action.created_at).toLocaleDateString()}</span>
                          <span className="text-xs text-gray-600">{new Date(action.created_at).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <ArrowRight className="h-4 w-4 inline opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </td>
                    </tr>
                  );
                })}
                
                {filteredActions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <Play className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      No response actions found in this state.
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
