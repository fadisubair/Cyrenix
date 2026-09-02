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
      return data;
    } catch (error) {
      console.error('Failed to fetch findings', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings().then(data => {
      if (data && data.length > 0 && expandedId === null) {
        toggleExpand(data[0].id);
      }
    });
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

  if (isLoading) return <div className="p-4 text-zinc-400">Loading findings...</div>;
  if (findings.length === 0) return <div className="p-4 text-zinc-400">No findings have been generated yet.</div>;

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-auto p-4 space-y-4">
      {findings.map((finding) => (
        <div key={finding.id} className="border-b border-border last:border-0">
          <div 
            className="py-4 flex items-start justify-between cursor-pointer hover:bg-zinc-900/30 transition-colors group"
            onClick={() => toggleExpand(finding.id)}
          >
            <div className="flex gap-4">
              <div className="mt-1 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                {expandedId === finding.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-mono text-zinc-500">FINDING-{finding.id.toString().padStart(3, '0')}</span>
                  {finding.status === 'ACTIVE' ? (
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Active</span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Resolved</span>
                  )}
                  <span className="text-xs text-zinc-500 border-l border-border pl-3">{finding.finding_type}</span>
                </div>
                <h3 className="text-base font-medium text-zinc-100">{finding.title}</h3>
              </div>
            </div>
            <div className="text-xs text-zinc-500 font-mono flex items-center">
              Conf: {(finding.confidence * 100).toFixed(0)}%
            </div>
          </div>
          
          {expandedId === finding.id && (
            <div className="pl-8 pb-8 pr-4">
              <div className="max-w-4xl space-y-8">
                
                {/* Executive Summary Section */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Observation</h4>
                    <p className="text-zinc-200 text-sm leading-relaxed">{finding.description}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Assessment</h4>
                    <p className="text-zinc-200 text-sm leading-relaxed">{finding.rationale}</p>
                  </div>
                </div>

                {loadingDetails[finding.id] ? (
                  <div className="text-zinc-500 text-sm py-4 italic">Retrieving analytical correlation...</div>
                ) : (
                  <div className="space-y-8">
                    {/* Reasoning Chain */}
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4 border-b border-border pb-2">Analytical Correlation</h4>
                      <div className="space-y-5 pl-2">
                        {(reasoning[finding.id] || []).map((step, idx) => (
                          <div key={step.id} className="relative">
                            <div className="flex items-baseline gap-3">
                              <span className="text-xs font-mono text-zinc-500 w-6">{idx + 1}.</span>
                              <div>
                                <h5 className="text-sm font-medium text-zinc-100">{step.title}</h5>
                                <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase block mt-0.5 mb-1.5">{step.step_type}</span>
                                <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                                {step.conclusion && (
                                  <div className="mt-2 pl-3 border-l-2 border-indigo-500/30 py-0.5">
                                    <p className="text-sm text-zinc-300 font-medium">"{step.conclusion}"</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {(reasoning[finding.id] || []).length === 0 && (
                          <p className="text-sm text-zinc-500 italic">No automated reasoning steps available.</p>
                        )}
                      </div>
                    </div>

                    {/* Evidence Events */}
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4 border-b border-border pb-2">Supporting Evidence ({evidence[finding.id]?.length || 0})</h4>
                      <div className="space-y-3 pl-9">
                        {(evidence[finding.id] || []).map(ev => (
                          <div key={ev.id} className="text-sm">
                            <div className="flex items-center gap-3 text-zinc-400 mb-1 font-mono text-xs">
                              <span>{new Date(ev.timestamp).toISOString()}</span>
                              <span className="text-indigo-400">{ev.event_type}</span>
                            </div>
                            <div className="text-zinc-300 font-mono text-[11px] bg-zinc-950 p-2.5 rounded border border-border/50 overflow-x-auto">
                              {JSON.stringify(ev.raw_data)}
                            </div>
                          </div>
                        ))}
                        {(evidence[finding.id] || []).length === 0 && (
                          <p className="text-sm text-zinc-500 italic">No direct raw events linked.</p>
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
