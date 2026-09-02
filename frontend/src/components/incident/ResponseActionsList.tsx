import React, { useEffect, useState } from 'react';
import { findingsApi, responseActionsApi } from '../../api';
import { Finding, ResponseAction } from '../../types';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { useAuth } from '../../contexts/AuthContext';
import { Play, Check, X, Shield, Terminal } from 'lucide-react';

interface ResponseActionsListProps {
  incidentId: string | number;
}

export const ResponseActionsList: React.FC<ResponseActionsListProps> = ({ incidentId }) => {
  const { user } = useAuth();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [actions, setActions] = useState<Record<number, ResponseAction[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});
  const [actionError, setActionError] = useState<Record<number, string>>({});

  const fetchData = async () => {
    try {
      const findingData = await findingsApi.getByIncident(incidentId);
      setFindings(findingData);

      const actionsData: Record<number, ResponseAction[]> = {};
      for (const finding of findingData) {
        actionsData[finding.id] = await responseActionsApi.getByFinding(finding.id);
      }
      setActions(actionsData);
    } catch (error) {
      console.error('Failed to fetch response actions', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [incidentId]);

  const handleRecommend = async (findingId: number) => {
    setActionLoading(prev => ({ ...prev, [findingId]: 'recommend' }));
    setActionError(prev => ({ ...prev, [findingId]: '' }));
    try {
      const action = await responseActionsApi.recommend(findingId);
      setActions(prev => ({
        ...prev,
        [findingId]: [...(prev[findingId] || []), action]
      }));
    } catch (error: any) {
      console.error('Failed to recommend action', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to recommend action';
      setActionError(prev => ({ ...prev, [findingId]: errorMessage }));
    } finally {
      setActionLoading(prev => ({ ...prev, [findingId]: '' }));
    }
  };

  const handleApprove = async (findingId: number, actionId: number) => {
    setActionLoading(prev => ({ ...prev, [actionId]: 'approve' }));
    try {
      const updatedAction = await responseActionsApi.approve(actionId);
      setActions(prev => ({
        ...prev,
        [findingId]: prev[findingId].map(a => a.id === actionId ? updatedAction : a)
      }));
    } catch (error) {
      console.error('Failed to approve action', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionId]: '' }));
    }
  };

  const handleReject = async (findingId: number, actionId: number) => {
    setActionLoading(prev => ({ ...prev, [actionId]: 'reject' }));
    try {
      const updatedAction = await responseActionsApi.reject(actionId);
      setActions(prev => ({
        ...prev,
        [findingId]: prev[findingId].map(a => a.id === actionId ? updatedAction : a)
      }));
    } catch (error) {
      console.error('Failed to reject action', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionId]: '' }));
    }
  };

  const handleExecute = async (findingId: number, actionId: number) => {
    setActionLoading(prev => ({ ...prev, [actionId]: 'execute' }));
    try {
      await responseActionsApi.execute(actionId);
      // Reload actions to get updated status
      const updatedActions = await responseActionsApi.getByFinding(findingId);
      setActions(prev => ({ ...prev, [findingId]: updatedActions }));
    } catch (error) {
      console.error('Failed to execute action', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionId]: '' }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return <Badge variant="warning">PENDING APPROVAL</Badge>;
      case 'APPROVED': return <Badge variant="success">APPROVED</Badge>;
      case 'REJECTED': return <Badge variant="danger">REJECTED</Badge>;
      case 'EXECUTING': return <Badge variant="info">EXECUTING</Badge>;
      case 'SUCCESS': return <Badge variant="success">SUCCESS</Badge>;
      case 'FAILED': return <Badge variant="danger">FAILED</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) return <div className="p-4 text-zinc-400">Loading response actions...</div>;

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-4 space-y-6 overflow-auto">
      {findings.map(finding => {
        const findingActions = actions[finding.id] || [];
        return (
          <div key={finding.id} className="bg-panel border border-border rounded-md p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-1">Finding Context</h3>
                <p className="text-zinc-100 font-medium">{finding.title}</p>
                <p className="text-sm text-zinc-400">{finding.description}</p>
              </div>
              {user?.role === 'ANALYST' && findingActions.length === 0 && (
                <div className="flex flex-col items-end gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRecommend(finding.id)}
                    isLoading={actionLoading[finding.id] === 'recommend'}
                    className="flex gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Recommend Action
                  </Button>
                  {actionError[finding.id] && (
                    <div className="text-sm text-red-400 bg-red-500/10 px-3 py-1 rounded border border-red-500/30 mt-2">
                      {actionError[finding.id]}
                    </div>
                  )}
                </div>
              )}
            </div>

            {findingActions.length > 0 && (
              <div className="space-y-4 border-t border-border pt-4">
                {findingActions.map(action => (
                  <div key={action.id} className="bg-zinc-950 border border-border rounded-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-zinc-100">{action.action_type}</h4>
                          {getStatusBadge(action.status)}
                          <Badge variant={action.risk_level === 'HIGH' ? 'danger' : 'warning'}>Risk: {action.risk_level}</Badge>
                        </div>
                        <p className="text-sm text-zinc-300">Target: <span className="font-mono text-indigo-400">{action.target}</span></p>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-400 mb-4">{action.description}</p>
                    <p className="text-sm text-zinc-500 italic mb-4">Rationale: {action.rationale}</p>

                    {/* Execution Result */}
                    {action.execution_status === 'SUCCESS' && action.execution_message && (
                      <div className="mb-4 bg-zinc-950 border border-emerald-500/20 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Terminal className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Dry Run Execution Result</span>
                        </div>
                        <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap">
                          {action.execution_message}
                        </pre>
                      </div>
                    )}

                    {/* Actions */}
                    {user?.role === 'ANALYST' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                        {action.status === 'PENDING_APPROVAL' && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleApprove(finding.id, action.id)}
                              isLoading={actionLoading[action.id] === 'approve'}
                            >
                              <Check className="h-4 w-4 mr-2" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleReject(finding.id, action.id)}
                              isLoading={actionLoading[action.id] === 'reject'}
                            >
                              <X className="h-4 w-4 mr-2" /> Reject
                            </Button>
                          </>
                        )}
                        {action.status === 'APPROVED' && action.execution_status === 'NOT_EXECUTED' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleExecute(finding.id, action.id)}
                            isLoading={actionLoading[action.id] === 'execute'}
                          >
                            <Play className="h-4 w-4 mr-2" /> Execute (Dry Run)
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {findingActions.length === 0 && (
              <p className="text-sm text-zinc-500 italic mt-4 pt-4 border-t border-border">No response actions recommended yet.</p>
            )}
          </div>
        );
      })}
      {findings.length === 0 && <div className="text-zinc-400">No findings available to recommend actions for.</div>}
    </div>
  );
};
