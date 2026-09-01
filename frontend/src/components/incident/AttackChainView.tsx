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

  if (isLoading) return <div className="p-4 text-gray-400">Loading attack chain...</div>;
  if (!chains.length) return <div className="p-4 text-gray-400">No attack chains correlated for this incident.</div>;

  return (
    <div className="p-4 space-y-6">
      {chains.map(chain => (
        <div key={chain.id} className="bg-panel border border-border rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            {chain.name}
          </h3>
          <p className="text-sm text-gray-400 mb-6">{chain.description}</p>
          
          <div className="flex items-center gap-4 flex-wrap">
            {chain.stages.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                <div className="bg-background border border-border p-4 rounded-lg flex-1 min-w-[200px]">
                  <div className="text-sm font-medium text-white mb-2">{stage.name}</div>
                  <div className="text-xs text-gray-400">Order: {stage.order}</div>
                  {stage.mitre_tactic && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="info">{stage.mitre_tactic}</Badge>
                      {stage.mitre_technique && <Badge variant="warning">{stage.mitre_technique}</Badge>}
                    </div>
                  )}
                </div>
                {idx < chain.stages.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-gray-600 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
