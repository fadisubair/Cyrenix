import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mitreApi } from '../api/mitre';
import { Shield, ShieldAlert, Target, Crosshair } from 'lucide-react';

export const Mitre: React.FC = () => {
  const navigate = useNavigate();
  const [coverage, setCoverage] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Define standard MITRE tactics in order
  const TACTICS = [
    "Initial Access",
    "Execution",
    "Persistence",
    "Privilege Escalation",
    "Defense Evasion",
    "Credential Access",
    "Discovery",
    "Lateral Movement",
    "Collection",
    "Command and Control",
    "Exfiltration",
    "Impact"
  ];

  useEffect(() => {
    const fetchCoverage = async () => {
      try {
        const data = await mitreApi.getCoverage();
        setCoverage(data);
      } catch (error) {
        console.error('Failed to load MITRE coverage', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoverage();
  }, []);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-wide flex items-center">
            <Target className="mr-3 h-6 w-6 text-indigo-400" />
            MITRE ATT&CK Matrix
          </h1>
          <p className="text-zinc-400">Threat Coverage and Finding Mapping</p>
        </div>
      </div>

      <div className="bg-panel border border-border p-6 rounded-md mb-6">
        <h2 className="text-lg font-medium text-zinc-100 mb-4">Coverage Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {TACTICS.slice(0, 12).map(tactic => {
            const hits = coverage[tactic] ? coverage[tactic].length : 0;
            return (
              <div key={`summary-${tactic}`} className="bg-zinc-950 border border-border/50 p-3 rounded flex flex-col items-center text-center">
                <span className="text-xs font-medium text-zinc-400 mb-1 leading-tight">{tactic}</span>
                <span className={`text-xl font-bold ${hits > 0 ? 'text-rose-500' : 'text-zinc-600'}`}>
                  {hits}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-panel border border-border rounded-md overflow-x-auto flex-1">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400">Building MITRE ATT&CK Matrix...</div>
        ) : (
          <div className="min-w-max p-4 flex gap-4 h-full">
            {TACTICS.map(tactic => {
              const techniques = coverage[tactic] || [];
              
              // Group by technique ID to avoid duplicates in the same cell
              const groupedTechniques = techniques.reduce((acc, curr) => {
                if (!acc[curr.technique_id]) {
                  acc[curr.technique_id] = {
                    ...curr,
                    hits: 1,
                    findings: [curr.finding_id]
                  };
                } else {
                  acc[curr.technique_id].hits += 1;
                  if (!acc[curr.technique_id].findings.includes(curr.finding_id)) {
                    acc[curr.technique_id].findings.push(curr.finding_id);
                  }
                }
                return acc;
              }, {} as Record<string, any>);
              
              const techniqueList = Object.values(groupedTechniques);

              return (
                <div key={tactic} className="w-56 flex-shrink-0 flex flex-col">
                  <div className="bg-zinc-950/80 border border-border rounded-t-md p-3 mb-2 sticky top-0 z-10">
                    <h3 className="text-sm font-bold text-zinc-100 text-center">{tactic}</h3>
                    <div className="text-[10px] text-zinc-500 text-center mt-1">
                      {techniqueList.length} Techniques Detected
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2 overflow-y-auto pb-4">
                    {techniqueList.length > 0 ? (
                      techniqueList.map((tech: any) => (
                        <div 
                          key={tech.technique_id} 
                          className="bg-rose-500/10 border border-rose-500/30 rounded p-3 cursor-pointer hover:bg-rose-500/20 transition-colors group"
                          onClick={() => navigate(`/findings?search=${tech.technique_id}`)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                              {tech.technique_id}
                            </span>
                            <span className="text-[10px] text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded-full">
                              {tech.hits} {tech.hits === 1 ? 'Hit' : 'Hits'}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-zinc-100 mb-2 leading-tight">
                            {tech.technique_name}
                          </div>
                          <div className="flex items-center text-[10px] text-zinc-400 group-hover:text-rose-300 transition-colors">
                            <Crosshair className="h-3 w-3 mr-1" />
                            View mapped findings
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full border border-dashed border-border/30 rounded p-3 flex items-center justify-center text-zinc-600 text-xs italic">
                        No activity
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
