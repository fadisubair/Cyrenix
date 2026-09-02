import React, { useEffect, useState } from 'react';
import { identitiesApi } from '../api';
import { IdentityProfile, IdentitySignal } from '../types';
import { Fingerprint, ShieldAlert, Activity, ChevronRight, ChevronDown, User, AlertTriangle } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Identities: React.FC = () => {
  const [identities, setIdentities] = useState<IdentityProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchIdentities = async () => {
      try {
        const data = await identitiesApi.getAll();
        setIdentities(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (error) {
        console.error('Failed to load identities', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIdentities();
  }, []);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-wide">Identities</h1>
          <p className="text-zinc-400">User Identity Risk Profiles and Behavioral Anomalies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-panel border border-border p-6 rounded-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Monitored Identities</p>
            <p className="text-3xl font-bold text-zinc-100 mt-2">{identities.length}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <Fingerprint className="h-6 w-6 text-indigo-400" />
          </div>
        </div>
        
        <div className="bg-panel border border-border p-6 rounded-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">High Risk Profiles</p>
            <p className="text-3xl font-bold text-zinc-100 mt-2">
              {identities.filter(id => id.risk_score === 'HIGH' || id.risk_score === 'CRITICAL').length}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-rose-500/20 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
          </div>
        </div>

        <div className="bg-panel border border-border p-6 rounded-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Active Signals</p>
            <p className="text-3xl font-bold text-zinc-100 mt-2">
              {identities.reduce((acc, curr) => acc + (curr.signals?.length || 0), 0)}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Activity className="h-6 w-6 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-md overflow-hidden flex flex-col flex-1">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400">Analyzing identity risks...</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-border text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium">Risk Score</th>
                  <th className="px-4 py-3 font-medium">Signals Count</th>
                  <th className="px-4 py-3 font-medium">Profile Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {identities.map(profile => (
                  <React.Fragment key={`profile-${profile.id}`}>
                    <tr 
                      onClick={() => toggleRow(profile.id)}
                      className={`hover:bg-zinc-800/30 cursor-pointer transition-colors ${expandedRows[profile.id] ? 'bg-white/[0.02]' : ''}`}
                    >
                      <td className="px-4 py-4 text-zinc-500">
                        {expandedRows[profile.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-zinc-100 flex items-center">
                        <User className="h-4 w-4 mr-2 text-zinc-400" />
                        {profile.username}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <Badge variant={
                          profile.risk_score === 'CRITICAL' || profile.risk_score === 'HIGH' ? 'danger' :
                          profile.risk_score === 'MEDIUM' ? 'warning' : 'success'
                        }>
                          {profile.risk_score}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-zinc-300">
                        <span className="flex items-center">
                          <Activity className="h-3 w-3 mr-1 text-indigo-400" />
                          {profile.signals?.length || 0} active signals
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-zinc-400">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                    
                    {/* Expanded Signals View */}
                    {expandedRows[profile.id] && (
                      <tr className="bg-zinc-950/30">
                        <td colSpan={5} className="px-8 py-6 border-l-4 border-l-primary/50">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-zinc-100 flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-indigo-400" />
                              Active Risk Signals
                            </h4>
                          </div>
                          
                          {(!profile.signals || profile.signals.length === 0) ? (
                            <div className="text-sm text-zinc-500 italic bg-zinc-950/50 p-4 rounded-md border border-border/50">
                              No active risk signals detected for this identity. Baseline behavior is normal.
                            </div>
                          ) : (
                            <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                              {profile.signals.map(signal => (
                                <div key={signal.id} className="bg-zinc-950/80 border border-border/50 rounded-md p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="font-medium text-sm text-zinc-100">{signal.signal_type}</div>
                                    <Badge variant={signal.severity === 'HIGH' || signal.severity === 'CRITICAL' ? 'danger' : 'warning'}>
                                      {signal.severity}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center text-xs text-zinc-400 mb-3">
                                    <span className="mr-3">Confidence: {Math.round((signal.confidence || 0) * 100)}%</span>
                                    <span>Detected: {new Date(signal.created_at).toLocaleString()}</span>
                                  </div>
                                  
                                  {signal.evidence && (
                                    <div className="bg-zinc-950 border border-border/50 rounded p-2 overflow-x-auto text-xs font-mono text-zinc-300">
                                      {Object.entries(signal.evidence).map(([k, v]) => (
                                        <div key={k} className="flex">
                                          <span className="text-indigo-400/70 min-w-[100px]">{k}:</span>
                                          <span>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="mt-6 pt-4 border-t border-border/50">
                            <h4 className="text-sm font-bold text-zinc-100 mb-3 flex items-center">
                              <Fingerprint className="h-4 w-4 mr-2 text-indigo-400" />
                              Baseline Data Context
                            </h4>
                            <div className="bg-zinc-950 border border-border/50 rounded p-4 text-xs text-zinc-400 font-mono">
                              {/* Assuming baseline_data exists in profile, otherwise just show placeholder */}
                              {(profile as any).baseline_data ? (
                                <pre className="whitespace-pre-wrap">{JSON.stringify((profile as any).baseline_data, null, 2)}</pre>
                              ) : (
                                <span>No historical baseline context available for this profile (MVP Mode).</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                
                {identities.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                      <Fingerprint className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      No identity profiles are currently being tracked.
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
