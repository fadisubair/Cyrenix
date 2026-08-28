import React, { useEffect, useState } from 'react';
import { assetsApi } from '../api';
import { Server, Monitor, HardDrive, ShieldAlert, Activity, Search, ShieldCheck } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Assets: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await assetsApi.getAll();
        setAssets(data.sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()));
      } catch (error) {
        console.error('Failed to load assets', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const filteredAssets = assets.filter(asset => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (asset.name && asset.name.toLowerCase().includes(q)) ||
      (asset.ip_address && asset.ip_address.toLowerCase().includes(q)) ||
      (asset.os && asset.os.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Assets</h1>
          <p className="text-gray-400">Discovered Endpoints, Servers, and Network Devices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-panel border border-border p-6 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Total Assets</span>
            <HardDrive className="h-4 w-4 text-primary" />
          </div>
          <span className="text-3xl font-bold text-white">{assets.length}</span>
        </div>
        
        <div className="bg-panel border border-border p-6 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Servers</span>
            <Server className="h-4 w-4 text-cyan-500" />
          </div>
          <span className="text-3xl font-bold text-white">
            {assets.filter(a => a.asset_type === 'Server').length}
          </span>
        </div>

        <div className="bg-panel border border-border p-6 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Workstations</span>
            <Monitor className="h-4 w-4 text-purple-500" />
          </div>
          <span className="text-3xl font-bold text-white">
            {assets.filter(a => a.asset_type === 'Workstation' || a.asset_type === 'Endpoint').length}
          </span>
        </div>

        <div className="bg-panel border border-border p-6 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">High Risk</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-3xl font-bold text-white">
            {assets.filter(a => a.risk_level === 'HIGH' || a.risk_level === 'CRITICAL').length}
          </span>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-lg overflow-hidden flex flex-col flex-1">
        <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-md pl-9 pr-4 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Discovering network assets...</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 border-b border-border text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Asset Name / IP</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Risk Level</th>
                  <th className="px-6 py-3 font-medium">OS</th>
                  <th className="px-6 py-3 font-medium">Telemetry Volume</th>
                  <th className="px-6 py-3 font-medium">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-white flex items-center">
                        {asset.asset_type === 'Server' ? (
                          <Server className="h-4 w-4 mr-2 text-gray-400" />
                        ) : (
                          <Monitor className="h-4 w-4 mr-2 text-gray-400" />
                        )}
                        {asset.name}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">{asset.ip_address}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {asset.asset_type}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={
                        asset.risk_level === 'CRITICAL' || asset.risk_level === 'HIGH' ? 'danger' :
                        asset.risk_level === 'MEDIUM' ? 'warning' : 'success'
                      }>
                        {asset.risk_level}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {asset.os}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Activity className="h-3 w-3 mr-2 opacity-50" />
                        {asset.events_count} events
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                      {new Date(asset.last_seen).toLocaleString()}
                    </td>
                  </tr>
                ))}
                
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <HardDrive className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      No assets found matching your criteria.
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
