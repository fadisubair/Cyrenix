import React, { useEffect, useState } from 'react';
import { incidentsApi } from '../../api';
import { IdentityProfile } from '../../types';
import { UserX, ShieldAlert } from 'lucide-react';
import { Badge } from '../Badge';

interface Props {
  incidentId: number;
}

export const IdentityRiskView: React.FC<Props> = ({ incidentId }) => {
  const [profile, setProfile] = useState<IdentityProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await incidentsApi.getIdentityRisk(incidentId);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [incidentId]);

  if (isLoading) return <div className="p-4 text-zinc-400">Loading identity risk...</div>;
  if (!profile) return <div className="p-4 text-zinc-400">No identity profiles found for this incident.</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-panel border border-border rounded-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-zinc-100">{profile.username}</h3>
              <p className="text-sm text-zinc-400">User Identity Profile</p>
            </div>
          </div>
          <div>
            <Badge variant={profile.risk_score === 'HIGH' ? 'danger' : profile.risk_score === 'MEDIUM' ? 'warning' : 'info'}>
              {profile.risk_score} RISK
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            Anomalous Signals
          </h4>
          {profile.signals.map(signal => (
            <div key={signal.id} className="bg-zinc-950 border border-border rounded-md p-4 flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-zinc-100">{signal.signal_type}</div>
                {signal.evidence && (
                  <div className="text-xs text-zinc-400 mt-1 font-mono">
                    {JSON.stringify(signal.evidence)}
                  </div>
                )}
              </div>
              <Badge variant={signal.severity === 'HIGH' ? 'danger' : 'warning'}>
                {signal.severity}
              </Badge>
            </div>
          ))}
          {profile.signals.length === 0 && (
            <p className="text-sm text-zinc-400">No signals detected.</p>
          )}
        </div>
      </div>
    </div>
  );
};
