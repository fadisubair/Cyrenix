import React, { useEffect, useState } from 'react';
import { incidentsApi } from '../../api';
import { BlastRadius } from '../../types';
import { Target, Server, Globe, User } from 'lucide-react';
import { Badge } from '../Badge';

interface Props {
  incidentId: number;
}

export const BlastRadiusView: React.FC<Props> = ({ incidentId }) => {
  const [data, setData] = useState<BlastRadius | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await incidentsApi.getBlastRadius(incidentId);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [incidentId]);

  if (isLoading) return <div className="p-4 text-gray-400">Loading blast radius...</div>;
  if (!data) return <div className="p-4 text-gray-400">No blast radius calculated for this incident.</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium text-white">Users</h3>
          </div>
          <div className="space-y-2">
            {data.affected_users.map(u => (
              <Badge key={u} variant="default" className="w-full justify-center text-sm">{u}</Badge>
            ))}
            {!data.affected_users.length && <span className="text-xs text-gray-500">None</span>}
          </div>
        </div>
        
        <div className="bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-green-400" />
            <h3 className="font-medium text-white">Hosts</h3>
          </div>
          <div className="space-y-2">
            {data.affected_hosts.map(h => (
              <Badge key={h} variant="default" className="w-full justify-center text-sm">{h}</Badge>
            ))}
            {!data.affected_hosts.length && <span className="text-xs text-gray-500">None</span>}
          </div>
        </div>

        <div className="bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-orange-400" />
            <h3 className="font-medium text-white">Source IPs</h3>
          </div>
          <div className="space-y-2">
            {data.source_ips.map(ip => (
              <Badge key={ip} variant="warning" className="w-full justify-center text-sm font-mono">{ip}</Badge>
            ))}
            {!data.source_ips.length && <span className="text-xs text-gray-500">None</span>}
          </div>
        </div>

        <div className="bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-red-400" />
            <h3 className="font-medium text-white">Destinations</h3>
          </div>
          <div className="space-y-2">
            {data.destinations.map(ip => (
              <Badge key={ip} variant="danger" className="w-full justify-center text-sm font-mono">{ip}</Badge>
            ))}
            {!data.destinations.length && <span className="text-xs text-gray-500">None</span>}
          </div>
        </div>
      </div>
      
      <div className="bg-panel border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-4">Graph Relationships</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-background border-b border-border">
              <tr>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Target</th>
              </tr>
            </thead>
            <tbody>
              {data.relationships.map((rel, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-white">{rel.source}</td>
                  <td className="px-4 py-3 text-primary">{rel.type}</td>
                  <td className="px-4 py-3">{rel.target}</td>
                </tr>
              ))}
              {!data.relationships.length && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center">No relationships mapped.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
