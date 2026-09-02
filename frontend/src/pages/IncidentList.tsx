import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentsApi } from '../api';
import { Incident } from '../types';
import { Badge } from '../components/Badge';
import { Search } from 'lucide-react';

export const IncidentList: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await incidentsApi.getAll();
        setIncidents(data);
      } catch (error) {
        console.error('Failed to fetch incidents', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  const getSeverityDisplay = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">CRITICAL</span>;
      case 'HIGH': return <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">HIGH</span>;
      case 'MEDIUM': return <span className="text-xs font-semibold text-zinc-300">Medium</span>;
      default: return <span className="text-xs text-zinc-500">Low</span>;
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'NEW': return <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>New</span>;
      case 'IN_PROGRESS': return <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>In Progress</span>;
      case 'RESOLVED': return <span className="text-xs text-zinc-400">Resolved</span>;
      case 'CLOSED': return <span className="text-xs text-zinc-500">Closed</span>;
      default: return <span className="text-xs text-zinc-400">{status}</span>;
    }
  };

  const filteredIncidents = incidents.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.id.toString().includes(search) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-wide">Incidents</h1>
          <p className="text-zinc-400">Manage and investigate security incidents</p>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-md flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search incidents..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-border rounded-md pl-10 pr-4 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 transition-all placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs text-zinc-500 uppercase sticky top-0 bg-zinc-900/90 backdrop-blur-sm border-b border-border z-10">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    Loading incidents...
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No incidents found.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => (
                  <tr 
                    key={incident.id} 
                    className="hover:bg-zinc-800/30 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                  >
                    <td className="px-6 py-3 font-mono text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      {(incident.id || 0).toString().padStart(4, '0')}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-zinc-100">{incident.title}</td>
                    <td className="px-6 py-3">{getSeverityDisplay(incident.severity)}</td>
                    <td className="px-6 py-3 text-sm text-zinc-400">{incident.category}</td>
                    <td className="px-6 py-3">{getStatusDisplay(incident.status)}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${incident.risk_score > 70 ? 'bg-rose-500/10 text-rose-400' : incident.risk_score > 40 ? 'text-amber-400' : 'text-zinc-500'}`}>
                        {incident.risk_score.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
