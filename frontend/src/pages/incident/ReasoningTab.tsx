import React, { useState, useEffect } from 'react';
import { getFindings } from '../../api/findings';
import { getInvestigationReasoning } from '../../api/investigations';
import { Finding, InvestigationStep } from '../../types';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { ConfidenceBadge } from '../../components/Badges';
import { Network, Search, BrainCircuit, ArrowDown } from 'lucide-react';

const ReasoningTab = ({ incidentId }: { incidentId: string }) => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [steps, setSteps] = useState<InvestigationStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [stepsLoading, setStepsLoading] = useState(false);

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

  useEffect(() => {
    if (selectedFindingId) {
      setStepsLoading(true);
      getInvestigationReasoning(selectedFindingId)
        .then(setSteps)
        .catch(console.error)
        .finally(() => {
          setLoading(false);
          setStepsLoading(false);
        });
    }
  }, [selectedFindingId]);

  if (loading) return <LoadingState message="Loading reasoning..." />;
  if (findings.length === 0) return <EmptyState message="No findings to reason about" />;

  const getStepIcon = (type: string) => {
    switch(type) {
      case 'OBSERVATION': return <Search size={20} />;
      case 'CORRELATION': return <Network size={20} />;
      case 'ASSESSMENT': return <BrainCircuit size={20} />;
      default: return <Search size={20} />;
    }
  };

  const getStepColor = (type: string) => {
    switch(type) {
      case 'OBSERVATION': return 'text-info bg-info/10 border-info/20';
      case 'CORRELATION': return 'text-warning bg-warning/10 border-warning/20';
      case 'ASSESSMENT': return 'text-danger bg-danger/10 border-danger/20';
      default: return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
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
        {stepsLoading ? (
          <LoadingState message="Loading reasoning chain..." />
        ) : steps.length === 0 ? (
          <EmptyState message="No reasoning steps available for this finding" />
        ) : (
          <div className="max-w-3xl mx-auto py-8">
            <h2 className="text-xl font-bold text-slate-200 mb-8 text-center flex items-center justify-center gap-2">
              <BrainCircuit className="text-brand" /> Investigation Reasoning Chain
            </h2>
            
            <div className="space-y-4">
              {steps.sort((a,b) => a.step_order - b.step_order).map((step, index) => (
                <div key={step.id} className="relative">
                  <div className={`border rounded-lg p-5 bg-slate-900 shadow-sm ${getStepColor(step.step_type).split(' ')[2]}`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full flex-shrink-0 ${getStepColor(step.step_type).split(' ')[0]} ${getStepColor(step.step_type).split(' ')[1]}`}>
                        {getStepIcon(step.step_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-200 text-lg uppercase tracking-wide">
                            {step.step_type}
                          </h3>
                          <span className="text-xs font-mono text-slate-500">Step {step.step_order}</span>
                        </div>
                        <h4 className="text-slate-300 font-medium mb-3">{step.title}</h4>
                        
                        <div className="bg-slate-950/50 p-3 rounded border border-slate-800/50 mb-3 text-sm text-slate-400">
                          {step.description}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <div className="text-sm font-medium text-slate-300">
                            Conclusion: <span className="text-brand ml-1">{step.conclusion}</span>
                          </div>
                          <ConfidenceBadge confidence={step.confidence} />
                        </div>
                        
                        {step.evidence_event_ids && step.evidence_event_ids.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-800/50">
                            <span className="text-xs text-slate-500 uppercase font-medium">Evidence Events: </span>
                            <span className="text-xs font-mono text-slate-400">
                              {step.evidence_event_ids.length} event(s) linked
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="w-px h-8 bg-brand/50"></div>
                      <ArrowDown className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-brand/50" size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReasoningTab;
