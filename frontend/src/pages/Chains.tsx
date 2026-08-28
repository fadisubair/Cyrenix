import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chainsApi, incidentsApi } from '../api';
import { AttackChain, Incident } from '../types';
import { Link2, Activity, ChevronRight, ShieldAlert, GitMerge, ArrowRight } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Chains: React.FC = () => {
  const navigate = useNavigate();
  const [chains, setChains] = useState<AttackChain[]>([]);
  const [incidents, setIncidents] = useState<Record<number, Incident>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chainData, incData] = await Promise.all([
          chainsApi.getAll(),
          incidentsApi.getAll().catch(() => [])
        ]);
        setChains(chainData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        
        const incMap: Record<number, Incident> = {};
        incData.forEach(inc => { incMap[inc.id] = inc; });
        setIncidents(incMap);
      } catch (error) {
        console.error('Failed to load attack chains', error);
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
          <h1 className="text-2xl font-bold text-white tracking-wide">Attack Chains</h1>
          <p className="text-gray-400">Track adversary progression across incidents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading attack chains...</div>
        ) : chains.length === 0 ? (
          <div className="bg-panel border border-border p-12 text-center text-gray-500 rounded-lg">
            <Link2 className="h-8 w-8 mx-auto mb-3 opacity-50" />
            No attack chains have been correlated yet.
          </div>
        ) : (
          chains.map(chain => {
            const incident = incidents[chain.incident_id];
            
            return (
              <div key={chain.id} className="bg-panel border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => navigate(`/incidents/${chain.incident_id}`)}>
                  <div>
                    <h2 className="text-lg font-medium text-white flex items-center">
                      <GitMerge className="h-5 w-5 mr-2 text-primary" />
                      {chain.name}
                    </h2>
                    <div className="text-sm text-gray-400 mt-1 flex items-center">
                      <ShieldAlert className="h-3 w-3 mr-1" />
                      Incident INC-{(chain.incident_id || 0).toString().padStart(4, '0')} 
                      {incident && ` - ${incident.title}`}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={incident && (incident.severity === 'HIGH' || incident.severity === 'CRITICAL') ? 'danger' : 'default'}>
                      {incident?.severity || 'UNKNOWN'}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(chain.created_at).toLocaleString()}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                
                <div className="p-6 overflow-x-auto">
                  <div className="flex items-start min-w-max">
                    {chain.stages.map((stage, index) => (
                      <div key={stage.id} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className="w-48 bg-background border border-border rounded-md p-3 relative hover:border-primary/50 transition-colors cursor-default group">
                            <div className="absolute -top-3 -right-3 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
                              Stage {stage.order + 1}
                            </div>
                            <div className="text-sm font-bold text-white mb-1 truncate" title={stage.name}>
                              {stage.name}
                            </div>
                            <div className="text-xs text-gray-400 mb-2">
                              {stage.mitre_tactic || 'Unknown Tactic'}
                            </div>
                            {stage.mitre_technique && (
                              <Badge variant="default" className="text-[10px]">
                                {stage.mitre_technique}
                              </Badge>
                            )}
                            
                            {/* Correlated Events / Evidence */}
                            {stage.links && stage.links.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-border/50 text-[10px] text-gray-500">
                                {stage.links.length} correlated event(s)
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {index < chain.stages.length - 1 && (
                          <div className="w-12 flex items-center justify-center relative mx-2">
                            <div className="h-0.5 w-full bg-border absolute top-1/2 -translate-y-1/2"></div>
                            <ArrowRight className="h-4 w-4 text-border absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {chain.stages.length === 0 && (
                      <div className="text-sm text-gray-500 italic py-4">
                        <Activity className="h-4 w-4 inline mr-2" />
                        No specific stages identified yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
