import React, { useState, useEffect } from 'react';
import { getFindings } from '../../api/findings';
import { getResponseActionsByFinding, approveResponseAction, rejectResponseAction, executeResponseAction, recommendResponseAction } from '../../api/responseActions';
import { Finding, ResponseAction } from '../../types';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { StatusBadge, ConfidenceBadge, SeverityBadge } from '../../components/Badges';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Activity, ShieldAlert, Check, X, Play, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const ResponseTab = ({ incidentId }: { incidentId: string }) => {
  const { user } = useAuth();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [actions, setActions] = useState<ResponseAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionsLoading, setActionsLoading] = useState(false);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getFindings({ incident_id: incidentId })
      .then(data => {
        setFindings(data);
        if (data.length > 0) {
          setSelectedFindingId(data[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch(console.error);
  }, [incidentId]);

  const loadActions = (findingId: string) => {
    setActionsLoading(true);
    getResponseActionsByFinding(findingId)
      .then(setActions)
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setActionsLoading(false);
      });
  };

  useEffect(() => {
    if (selectedFindingId) {
      loadActions(selectedFindingId);
    }
  }, [selectedFindingId]);

  const handleApprove = (action: ResponseAction) => {
    setDialogConfig({
      title: 'Approve Response Action?',
      type: action.risk_level === 'HIGH' || action.risk_level === 'CRITICAL' ? 'danger' : 'warning',
      message: (
        <div className="space-y-4">
          <p>Are you sure you want to approve this response action?</p>
          <div className="bg-slate-950 p-3 rounded text-slate-300 font-mono text-xs border border-slate-800">
            <div>Target: {action.target}</div>
            <div>Action: {action.action_type}</div>
            <div className="mt-2 text-warning">Risk: {action.risk_level}</div>
          </div>
          {action.risk_level === 'HIGH' || action.risk_level === 'CRITICAL' ? (
            <p className="text-danger font-medium">HIGH RISK: Review evidence and rationale carefully before approval.</p>
          ) : null}
        </div>
      ),
      confirmText: 'Approve Action',
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await approveResponseAction(action.id);
          if (selectedFindingId) loadActions(selectedFindingId);
        } catch (error) {
          console.error("Failed to approve action", error);
        } finally {
          setIsProcessing(false);
          setDialogOpen(false);
        }
      }
    });
    setDialogOpen(true);
  };

  const handleReject = (action: ResponseAction) => {
    setDialogConfig({
      title: 'Reject Response Action?',
      type: 'warning',
      message: 'Are you sure you want to reject this response action? It will not be executed.',
      confirmText: 'Reject Action',
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await rejectResponseAction(action.id);
          if (selectedFindingId) loadActions(selectedFindingId);
        } catch (error) {
          console.error("Failed to reject action", error);
        } finally {
          setIsProcessing(false);
          setDialogOpen(false);
        }
      }
    });
    setDialogOpen(true);
  };

  const handleExecute = (action: ResponseAction) => {
    setDialogConfig({
      title: 'Execute Response Action (DRY RUN)',
      type: 'info',
      message: (
        <div className="space-y-4">
          <div className="bg-info/10 text-info border border-info/20 p-3 rounded font-medium text-center">
            DRY RUN — no real defensive action will be performed.
          </div>
          <p>You are about to execute the following approved action:</p>
          <div className="bg-slate-950 p-3 rounded text-slate-300 font-mono text-xs border border-slate-800">
            <div>Target: {action.target}</div>
            <div>Action: {action.action_type}</div>
          </div>
        </div>
      ),
      confirmText: 'Execute (DRY RUN)',
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await executeResponseAction(action.id, 'DRY_RUN');
          if (selectedFindingId) loadActions(selectedFindingId);
        } catch (error) {
          console.error("Failed to execute action", error);
        } finally {
          setIsProcessing(false);
          setDialogOpen(false);
        }
      }
    });
    setDialogOpen(true);
  };

  const [recommendError, setRecommendError] = useState('');

  const handleGenerateRecommendation = async () => {
    if (!selectedFindingId) return;
    setIsProcessing(true);
    setRecommendError('');
    try {
      // recommendResponseAction should be imported above
      await recommendResponseAction(selectedFindingId);
      loadActions(selectedFindingId);
    } catch (err: any) {
      console.error("Failed to generate recommendation", err);
      setRecommendError(err.response?.data?.detail || 'Failed to generate recommendation');
    } finally {
      setIsProcessing(false);
    }
  };

  const canManageActions = user?.role === 'ANALYST';

  if (loading) return <LoadingState message="Loading response actions..." />;
  if (findings.length === 0) return <EmptyState message="No findings available to generate response recommendations." />;

  return (
    <div className="flex flex-col h-full space-y-6">
      <ConfirmDialog
        isOpen={dialogOpen}
        title={dialogConfig.title || ''}
        message={dialogConfig.message || ''}
        type={dialogConfig.type}
        confirmText={dialogConfig.confirmText}
        onConfirm={dialogConfig.onConfirm}
        onCancel={() => setDialogOpen(false)}
        isLoading={isProcessing}
      />

      <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-800 shrink-0">
        <span className="text-sm text-slate-500 self-center mr-2">Select Finding:</span>
        {findings.map(finding => (
          <button
            key={finding.id}
            onClick={() => setSelectedFindingId(finding.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              selectedFindingId === finding.id
                ? 'bg-brand text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {finding.title}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-4 pb-12">
        {!canManageActions && (
          <div className="mb-6 p-4 bg-info/10 border border-info/20 text-info rounded-lg flex gap-3 text-sm items-center">
            <Shield size={20} />
            <p>You are viewing this in <strong>VIEWER</strong> mode. You cannot approve, reject, or execute response actions.</p>
          </div>
        )}

        {canManageActions && selectedFindingId && (
          <div className="mb-6 flex flex-col items-start">
            <button
              onClick={handleGenerateRecommendation}
              disabled={isProcessing}
              className="btn btn-primary py-2 px-4 flex items-center gap-2"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Activity size={18} />}
              Generate Response Recommendation
            </button>
            {recommendError && (
              <div className="text-danger mt-2 text-sm bg-danger/10 border border-danger/20 p-2 rounded">{recommendError}</div>
            )}
          </div>
        )}

        {actionsLoading ? (
          <LoadingState message="Loading recommended actions..." />
        ) : actions.length === 0 ? (
          <EmptyState message="No response actions recommended for this finding." />
        ) : (
          <div className="space-y-6">
            {actions.map((action) => (
              <div key={action.id} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
                <div className="bg-slate-900/80 p-4 border-b border-slate-800 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded text-brand">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-lg">{action.title}</h3>
                      <p className="text-sm text-slate-400 font-mono mt-1">Target: {action.target}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={action.status} />
                    {action.execution_status && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        action.execution_status === 'SUCCESS' ? 'bg-success/10 text-success' :
                        action.execution_status === 'FAILED' ? 'bg-danger/10 text-danger' :
                        'bg-warning/10 text-warning'
                      }`}>
                        Execution: {action.execution_status} {action.execution_mode ? `(${action.execution_mode})` : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                      <p className="text-slate-300 text-sm">{action.description}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Rationale</h4>
                      <p className="text-slate-300 text-sm bg-slate-950 p-3 rounded border border-slate-800/50">{action.rationale}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 mb-6 pt-4 border-t border-slate-800/50">
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Action Type</span>
                      <span className="text-slate-200 font-mono text-sm">{action.action_type}</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Risk Level</span>
                      <SeverityBadge severity={action.risk_level} />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Confidence</span>
                      <ConfidenceBadge confidence={action.confidence} />
                    </div>
                  </div>

                  {/* Execution Timeline visualizer */}
                  <div className="my-6">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <div className={`flex flex-col items-center ${action.status !== 'PENDING_APPROVAL' ? 'text-brand' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${action.status !== 'PENDING_APPROVAL' ? 'bg-brand/20 text-brand border border-brand/50' : 'bg-slate-800 text-slate-500'}`}>1</div>
                        <span>Pending</span>
                      </div>
                      <div className={`h-px flex-1 mx-4 ${action.status === 'APPROVED' || action.status === 'REJECTED' || action.status === 'EXECUTED' ? 'bg-brand/50' : 'bg-slate-800'}`}></div>
                      
                      <div className={`flex flex-col items-center ${action.status === 'APPROVED' || action.status === 'EXECUTED' ? 'text-success' : action.status === 'REJECTED' ? 'text-danger' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                          action.status === 'APPROVED' || action.status === 'EXECUTED' ? 'bg-success/20 text-success border border-success/50' : 
                          action.status === 'REJECTED' ? 'bg-danger/20 text-danger border border-danger/50' : 
                          'bg-slate-800 text-slate-500'
                        }`}>2</div>
                        <span>{action.status === 'REJECTED' ? 'Rejected' : 'Approved'}</span>
                      </div>
                      <div className={`h-px flex-1 mx-4 ${action.status === 'EXECUTED' ? 'bg-success/50' : 'bg-slate-800'}`}></div>
                      
                      <div className={`flex flex-col items-center ${action.status === 'EXECUTED' ? 'text-success' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${action.status === 'EXECUTED' ? 'bg-success/20 text-success border border-success/50' : 'bg-slate-800 text-slate-500'}`}>3</div>
                        <span>Executed</span>
                      </div>
                    </div>
                  </div>

                  {action.execution_message && (
                    <div className="mb-6 bg-slate-950 p-3 rounded border border-slate-800 text-sm font-mono text-slate-400">
                      <span className="block text-xs text-slate-500 mb-1">Execution Output:</span>
                      {action.execution_message}
                    </div>
                  )}

                  {/* Actions Bar */}
                  {canManageActions && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                      {action.status === 'PENDING_APPROVAL' && (
                        <>
                          <button onClick={() => handleReject(action)} className="btn btn-danger py-1.5 flex items-center gap-2">
                            <X size={16} /> Reject
                          </button>
                          <button onClick={() => handleApprove(action)} className="btn btn-success py-1.5 flex items-center gap-2">
                            <Check size={16} /> Approve
                          </button>
                        </>
                      )}
                      {action.status === 'APPROVED' && (
                        <button onClick={() => handleExecute(action)} className="btn btn-primary py-1.5 flex items-center gap-2">
                          <Play size={16} /> Execute (DRY_RUN)
                        </button>
                      )}
                      {(action.status === 'REJECTED' || action.status === 'EXECUTED') && (
                        <span className="text-sm text-slate-500 italic flex items-center">
                          Lifecycle complete. No further actions possible.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseTab;
