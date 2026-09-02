import React, { useEffect, useState } from 'react';
import { auditApi } from '../api';
import { AuditLog } from '../types';
import { ClipboardList, Search, User, ShieldAlert, Cpu, Calendar, Activity } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Audit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await auditApi.getAll();
        setLogs(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (error) {
        console.error('Failed to load audit logs', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.actor && log.actor.toLowerCase().includes(q))
    );
  });

  const getActorIcon = (actor: string) => {
    if (actor === 'SYSTEM' || actor.includes('Engine')) {
      return <Cpu className="h-4 w-4 text-indigo-400" />;
    }
    return <User className="h-4 w-4 text-indigo-400" />;
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-wide">Audit Logs</h1>
          <p className="text-zinc-400">Global chronological record of system and analyst actions</p>
        </div>
      </div>

      <div className="bg-panel border border-border p-4 rounded-md flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search by action or actor..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="bg-panel border border-border rounded-md overflow-hidden flex flex-col flex-1">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400">Loading audit trail...</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-border text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Timestamp</th>
                  <th className="px-6 py-3 font-medium">Actor</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium">Context / Target ID</th>
                  <th className="px-6 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-zinc-400 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-2 opacity-50" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-100">
                      <div className="flex items-center">
                        {getActorIcon(log.actor)}
                        <span className="ml-2">{log.actor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant="default">{log.action}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      <div className="flex flex-col space-y-1">
                        {log.incident_id && (
                          <div className="flex items-center">
                            <ShieldAlert className="h-3 w-3 mr-1 text-indigo-400/70" />
                            Incident {log.incident_id}
                          </div>
                        )}
                        {log.finding_id && (
                          <div className="flex items-center">
                            <Activity className="h-3 w-3 mr-1 text-amber-500/70" />
                            Finding {log.finding_id}
                          </div>
                        )}
                        {log.response_action_id && (
                          <div className="flex items-center">
                            <ClipboardList className="h-3 w-3 mr-1 text-emerald-500/70" />
                            Action {log.response_action_id}
                          </div>
                        )}
                        {!log.incident_id && !log.finding_id && !log.response_action_id && (
                          <span className="italic text-zinc-600">System level</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="bg-zinc-950 border border-border/50 rounded p-2 text-xs font-mono text-zinc-300 max-h-24 overflow-y-auto">
                        {Object.keys(log.details).length > 0 ? (
                          <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                        ) : (
                          <span className="italic text-zinc-600">No additional details</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      <ClipboardList className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      No audit logs match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
