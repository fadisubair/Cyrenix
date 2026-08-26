import React, { useEffect, useState } from 'react';
import { findingsApi, investigationsApi } from '../../api';
import { Finding, Event, ReasoningStep } from '../../types';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { ChevronDown, ChevronRight, Activity, BrainCircuit } from 'lucide-react';

interface FindingsListProps {
  incidentId: string | number;
}

export const FindingsList: React.FC<FindingsListProps> = ({ incidentId }) => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [evidence, setEvidence] = useState<Record<number, Event[]>>({});
  const [reasoning, setReasoning] = useState<Record<number, ReasoningStep[]>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});

  const fetchFindings = async () => {
    try {
      const data = await findingsApi.getByIncident(incidentId);
      setFindings(data);
    } catch (error) {
      console.error('Failed to fetch findings', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, [incidentId]);

  const toggleExpand = async (findingId: number) => {
    if (expandedId === findingId) {
      setExpandedId(null);
      return;
    }
    
    setExpandedId(findingId);
    
    if (!evidence[findingId] && !loadingDetails[findingId]) {
      setLoadingDetails(prev => ({ ...prev, [findingId]: true }));
      try {
        const [evData, rsData] = await Promise.all([
          findingsApi.getEvidence(findingId),
          investigationsApi.getReasoning(findingId).catch(() => []) // Might not exist
        ]);
        
        setEvidence(prev => ({ ...prev, [findingId]: evData }));
        setReasoning(prev => ({ ...prev, [findingId]: rsData }));
      } catch (error) {
        console.error('Failed to load finding details', error);
      } finally {
        setLoadingDetails(prev => ({ ...prev, [findingId]: false }));
      }
    }
  };

  if (isLoading) return <div className="p-4 text-gray-400">Loading findings...</div>;
  if (findings.length === 0) return <div className="p-4 text-gray-400">No findings have been generated yet.</div>;

  return (
    <div className="flex flex-col h-full bg-background/50 overflow-auto p-4 space-y-4">
      {findings.map((finding) => (
        <div key={finding.id} className="bg-panel border border-border rounded-lg overflow-hidden transition-all">
          <div 
            className="p-4 flex items-start justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
            onClick={() => toggleExpand(finding.id)}
          >
            <div className="flex gap-3">
              <div className="mt-1 text-gray-400">
                {expandedId === finding.id ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">{finding.title}</h3>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant={finding.status === 'ACTIVE' ? 'warning' : 'success'}>
                    {finding.status}
                  </Badge>
                  <span className="text-gray-400">{finding.finding_type}</span>
                  <span className="text-gray-500">Confidence: {(finding.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {expandedId === finding.id && (
            <div className="p-4 pt-0 border-t border-border mt-2 bg-background/30">
              <div className="mt-4 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Description</h4>
                  <p className="text-gray-300 text-sm">{finding.description}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Rationale</h4>
                  <p className="text-gray-300 text-sm">{finding.rationale}</p>
                </div>

                {loadingDetails[finding.id] ? (
                  <div className="text-gray-500 text-sm py-4">Loading evidence and reasoning...</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Reasoning Chain */}
                    <div className="bg-panel border border-border rounded-md p-4">
                      <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-primary" />
                        Investigation Reasoning
                      </h4>
                      <div className="space-y-4">
                        {(reasoning[finding.id] || []).map(step => (
                          <div key={step.id} className="relative pl-4 border-l-2 border-border">
                            <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-panel border-2 border-primary"></div>
                            <h5 className="text-sm font-medium text-white">{step.title}</h5>
                            <span className="text-xs text-primary mb-1 block">{step.step_type}</span>
                            <p className="text-xs text-gray-400">{step.description}</p>
                            {step.conclusion && (
                              <p className="text-xs text-gray-300 mt-1 italic">"{step.conclusion}"</p>
                            )}
                          </div>
                        ))}
                        {(reasoning[finding.id] || []).length === 0 && (
                          <p className="text-xs text-gray-500">No reasoning steps recorded.</p>
                        )}
                      </div>
                    </div>

                    {/* Evidence Events */}
                    <div className="bg-panel border border-border rounded-md p-4">
                      <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500" />
                        Supporting Evidence ({evidence[finding.id]?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {(evidence[finding.id] || []).map(ev => (
                          <div key={ev.id} className="p-2 border border-border rounded bg-background/50 text-xs">
                            <div className="flex justify-between text-gray-400 mb-1">
                              <span>{ev.event_type}</span>
                              <span>{new Date(ev.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="text-gray-300 font-mono truncate">{JSON.stringify(ev.raw_data)}</div>
                          </div>
                        ))}
                        {(evidence[finding.id] || []).length === 0 && (
                          <p className="text-xs text-gray-500">No direct evidence linked.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
