import React, { useEffect, useState } from 'react';
import { incidentsApi } from '../../api';
import { AttackChain } from '../../types';
import { Network, ArrowRight } from 'lucide-react';
import { Badge } from '../Badge';

interface Props {
  incidentId: number;
}

export const AttackChainView: React.FC<Props> = ({ incidentId }) => {
  const [chains, setChains] = useState<AttackChain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await incidentsApi.getAttackChain(incidentId);
        setChains(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [incidentId]);

  if (isLoading) return <div className="p-4 text-zinc-400">Loading attack chain...</div>;
  if (!chains.length) return <div className="p-4 text-zinc-400">No attack chains correlated for this incident.</div>;

  return (
    <div className="p-4 space-y-8">
      {chains.map(chain => (
        <div key={chain.id}>
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-400" />
              {chain.name}
            </h3>
            <p className="text-sm text-zinc-400">{chain.description}</p>
          </div>
          
          <div className="relative border-l border-zinc-800 ml-2 space-y-6">
            {chain.stages.map((stage, idx) => (
              <div key={stage.id} className="relative pl-6">
                <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-950 border-2 border-indigo-500/50"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Stage {stage.order}</span>
                  <h4 className="text-sm font-medium text-zinc-100">{stage.name}</h4>
                  
                  {stage.mitre_tactic && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-mono">
                      <span className="text-zinc-500">TACTIC:</span> <span className="text-indigo-400">{stage.mitre_tactic}</span>
                      {stage.mitre_technique && (
                        <>
                          <span className="text-zinc-600 mx-1">|</span>
                          <span className="text-zinc-500">TECHNIQUE:</span> <span className="text-amber-400">{stage.mitre_technique}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
