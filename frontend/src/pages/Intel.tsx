import React, { useEffect, useState } from 'react';
import { intelApi, ThreatIntel } from '../api/intel';
import { Globe, ShieldAlert, CheckCircle, Search, ExternalLink, Shield } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Intel: React.FC = () => {
  const [intel, setIntel] = useState<ThreatIntel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchIntel = async () => {
      try {
        const data = await intelApi.getAll();
        setIntel(data);
      } catch (error) {
        console.error('Failed to load threat intelligence', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIntel();
  }, []);

  const filteredIntel = intel.filter(ioc => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (ioc.ioc_value && ioc.ioc_value.toLowerCase().includes(q)) ||
      (ioc.provider && ioc.provider.toLowerCase().includes(q)) ||
      (ioc.ioc_type && ioc.ioc_type.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Threat Intelligence</h1>
          <p className="text-gray-400">Indicators of Compromise (IOC) and External Telemetry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-panel border border-border p-6 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Total IOCs</span>
            <Globe className="h-4 w-4 text-primary" />
          </div>
          <span className="text-3xl font-bold text-white">{intel.length}</span>
        </div>
        
        <div className="bg-panel border border-border p-6 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Malicious</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-3xl font-bold text-white">
            {intel.filter(i => i.reputation === 'MALICIOUS').length}
          </span>
        </div>

        <div className="bg-panel border border-border p-6 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Suspicious</span>
            <Shield className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-3xl font-bold text-white">
            {intel.filter(i => i.reputation === 'SUSPICIOUS').length}
          </span>
        </div>

        <div className="bg-panel border border-border p-6 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Benign</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-3xl font-bold text-white">
            {intel.filter(i => i.reputation === 'BENIGN').length}
          </span>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-lg overflow-hidden flex flex-col flex-1">
        <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by IP, hash, domain, or provider..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-md pl-9 pr-4 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading threat intelligence data...</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 border-b border-border text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Indicator Value</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Reputation</th>
                  <th className="px-6 py-3 font-medium">Provider</th>
                  <th className="px-6 py-3 font-medium">Confidence</th>
                  <th className="px-6 py-3 font-medium">Last Retrieved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredIntel.map(ioc => (
                  <tr key={ioc.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-gray-300 flex items-center">
                      {ioc.ioc_value}
                      <ExternalLink className="h-3 w-3 ml-2 text-gray-600 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-primary transition-all" />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {ioc.ioc_type}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={
                        ioc.reputation === 'MALICIOUS' ? 'danger' :
                        ioc.reputation === 'SUSPICIOUS' ? 'warning' :
                        ioc.reputation === 'BENIGN' ? 'success' : 'default'
                      }>
                        {ioc.reputation}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {ioc.provider}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-16 bg-background rounded-full h-1.5 mr-2 overflow-hidden border border-border">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(ioc.confidence || 0) * 100}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400">{Math.round((ioc.confidence || 0) * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                      {new Date(ioc.retrieved_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                
                {filteredIntel.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <Globe className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      No threat intel matches your search query.
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
