import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { findingsApi, incidentsApi } from '../api';
import { Finding, Incident } from '../types';
import { Target, Search, AlertTriangle, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Findings: React.FC = () => {
  const navigate = useNavigate();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [incidents, setIncidents] = useState<Record<number, Incident>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [finData, incData] = await Promise.all([
          findingsApi.getAll(),
          incidentsApi.getAll().catch(() => [])
        ]);
        setFindings(finData);
        
        const incMap: Record<number, Incident> = {};
        incData.forEach(inc => { incMap[inc.id] = inc; });
        setIncidents(incMap);
      } catch (error) {
        console.error('Failed to load findings', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredFindings = useMemo(() => {
    return findings.filter(f => {
      const inc = incidents[f.incident_id];
      const severity = inc ? inc.severity : 'UNKNOWN';
      
      // Status Filter
      if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
      
      // Severity Filter
      if (severityFilter !== 'ALL' && severity !== severityFilter) return false;
      
      // Text Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!f.title.toLowerCase().includes(q) && 
            !f.finding_type.toLowerCase().includes(q) &&
            !f.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [findings, incidents, statusFilter, severityFilter, searchQuery]);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Global Findings</h1>
          <p className="text-gray-400">Review AI-identified threats and anomalies</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-panel border border-border p-4 rounded-lg flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search findings, types, MITRE techniques..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        
        <div className="w-[150px]">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PROPOSED">Proposed</option>
            <option value="ACTIVE">Active</option>
            <option value="MITIGATED">Mitigated</option>
            <option value="FALSE_POSITIVE">False Positive</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="w-[150px]">
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-panel border border-border rounded-lg overflow-hidden flex flex-col flex-1">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading findings...</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 border-b border-border text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Finding</th>
                  <th className="px-4 py-3 font-medium">Incident</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Severity</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredFindings.map(finding => {
                  const incident = incidents[finding.incident_id];
                  return (
                    <tr 
                      key={finding.id} 
                      onClick={() => navigate(`/incidents/${finding.incident_id}`)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-4 text-sm">
                        <div className="font-medium text-white mb-1 truncate max-w-[250px]">{finding.title}</div>
                        <div className="text-gray-500 text-xs truncate max-w-[250px]">{finding.description}</div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {incident ? (
                          <div className="flex items-center text-gray-300">
                            <ShieldAlert className="h-3 w-3 mr-1 opacity-50" />
                            INC-{(incident.id || 0).toString().padStart(4, '0')}
                          </div>
                        ) : <span className="text-gray-600">-</span>}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400">
                        {finding.finding_type}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <Badge variant={
                          !incident ? 'default' :
                          incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'danger' :
                          incident.severity === 'MEDIUM' ? 'warning' : 'default'
                        }>
                          {incident?.severity || 'UNKNOWN'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center">
                          <div className="w-16 bg-background rounded-full h-1.5 mr-2 overflow-hidden border border-border">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(finding.confidence || 0) * 100}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-400">{Math.round((finding.confidence || 0) * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <Badge variant={
                          finding.status === 'PROPOSED' ? 'warning' :
                          finding.status === 'ACTIVE' ? 'danger' :
                          finding.status === 'MITIGATED' ? 'success' : 'default'
                        }>
                          {finding.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400 whitespace-nowrap">
                        {new Date(finding.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-right">
                        <ArrowRight className="h-4 w-4 inline opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </td>
                    </tr>
                  );
                })}
                
                {filteredFindings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      <Target className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      No findings match the current filters.
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
