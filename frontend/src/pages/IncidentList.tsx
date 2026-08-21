import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { getIncidents } from '../api/incidents';
import { Incident } from '../types';
import { StatusBadge, SeverityBadge, ConfidenceBadge } from '../components/Badges';
import { LoadingState, EmptyState } from '../components/EmptyState';
import { format } from 'date-fns';

const IncidentList = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await getIncidents();
        setIncidents(data);
      } catch (error) {
        console.error("Error fetching incidents", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(search.toLowerCase()) || String(incident.id).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? incident.status === statusFilter : true;
    const matchesSeverity = severityFilter ? incident.severity === severityFilter : true;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Incidents</h1>
          <p className="text-slate-400 text-sm">Manage and investigate security incidents</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="appearance-none bg-slate-950 border border-slate-700 rounded-md pl-4 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-950 border border-slate-700 rounded-md pl-4 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="panel overflow-hidden">
        {loading ? (
          <LoadingState message="Loading incidents..." />
        ) : filteredIncidents.length === 0 ? (
          <EmptyState message="No incidents found matching your criteria" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Risk Score</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-slate-400 text-xs">{String(incident.id).substring(0, 8)}</td>
                    <td className="px-4 py-3"><SeverityBadge severity={incident.severity} /></td>
                    <td className="px-4 py-3 font-medium text-slate-300 max-w-[250px] truncate">{incident.title}</td>
                    <td className="px-4 py-3 text-slate-400">{incident.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={incident.status} /></td>
                    <td className="px-4 py-3 text-right font-mono">{incident.risk_score}</td>
                    <td className="px-4 py-3"><ConfidenceBadge confidence={incident.confidence} /></td>
                    <td className="px-4 py-3 text-right text-slate-500 text-xs">
                      {format(new Date(incident.created_at), 'MMM dd, yyyy HH:mm:ss')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentList;
