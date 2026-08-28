import React, { useEffect, useState, useCallback } from 'react';
import { eventsApi } from '../api';
import { Event } from '../types';
import { Search, Filter, Activity, Server, User, Network, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  
  // Filters
  const [filters, setFilters] = useState({
    event_type: '',
    username: '',
    source_ip: '',
    hostname: '',
    limit: 100
  });

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build query params, ignoring empty strings
      const params: any = {};
      if (filters.event_type) params.event_type = filters.event_type;
      if (filters.username) params.username = filters.username;
      if (filters.source_ip) params.source_ip = filters.source_ip;
      if (filters.hostname) params.hostname = filters.hostname;
      params.limit = filters.limit;

      const data = await eventsApi.getAll(params);
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Global Events</h1>
          <p className="text-gray-400">Search and explore raw security telemetry</p>
        </div>
        <button 
          onClick={() => fetchEvents()}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </button>
      </div>

      {/* Filter Panel */}
      <div className="bg-panel border border-border p-4 rounded-lg flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-1">Event Type</label>
          <input 
            type="text" 
            name="event_type"
            value={filters.event_type}
            onChange={handleFilterChange}
            placeholder="e.g. FAILED_LOGIN" 
            className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-1">Username</label>
          <input 
            type="text" 
            name="username"
            value={filters.username}
            onChange={handleFilterChange}
            placeholder="e.g. admin" 
            className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-1">Source IP</label>
          <input 
            type="text" 
            name="source_ip"
            value={filters.source_ip}
            onChange={handleFilterChange}
            placeholder="e.g. 192.168.1.1" 
            className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-1">Hostname</label>
          <input 
            type="text" 
            name="hostname"
            value={filters.hostname}
            onChange={handleFilterChange}
            placeholder="e.g. server-01" 
            className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <div className="w-[100px]">
          <label className="block text-xs text-gray-400 mb-1">Limit</label>
          <select 
            name="limit"
            value={filters.limit}
            onChange={handleFilterChange}
            className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-panel border border-border rounded-lg overflow-hidden flex flex-col flex-1">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Querying events...</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 border-b border-border text-xs text-gray-500 uppercase tracking-wider">
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                  <th className="px-4 py-3 font-medium">Event Type</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Network</th>
                  <th className="px-4 py-3 font-medium">Host</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {events.map(event => (
                  <React.Fragment key={`event-${event.id}`}>
                    <tr 
                      onClick={() => toggleRow(event.id)}
                      className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${expandedRows[event.id] ? 'bg-white/[0.02]' : ''}`}
                    >
                      <td className="px-4 py-3 text-gray-500">
                        {expandedRows[event.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={event.event_type.includes('FAIL') ? 'danger' : 'default'}>
                          {event.event_type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {event.source}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {event.username ? (
                          <div className="flex items-center text-gray-300">
                            <User className="h-3 w-3 mr-1 opacity-50" />
                            {event.username}
                          </div>
                        ) : <span className="text-gray-600">-</span>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {event.source_ip || event.destination_ip ? (
                          <div className="flex flex-col text-xs text-gray-400 space-y-1">
                            {event.source_ip && <div><span className="text-gray-500">SRC:</span> {event.source_ip}</div>}
                            {event.destination_ip && <div><span className="text-gray-500">DST:</span> {event.destination_ip}</div>}
                          </div>
                        ) : <span className="text-gray-600">-</span>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {event.hostname ? (
                          <div className="flex items-center text-gray-300">
                            <Server className="h-3 w-3 mr-1 opacity-50" />
                            {event.hostname}
                          </div>
                        ) : <span className="text-gray-600">-</span>}
                      </td>
                    </tr>
                    
                    {/* Expanded Raw Data View */}
                    {expandedRows[event.id] && (
                      <tr className="bg-background/30">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-gray-300 flex items-center">
                              <Activity className="h-4 w-4 mr-2 text-primary" />
                              Raw Event Data
                            </h4>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="mr-4">Event ID: {event.id}</span>
                              {event.incident_id && <span>Incident ID: {event.incident_id}</span>}
                            </div>
                          </div>
                          <div className="bg-[#0D1117] border border-border/50 rounded-md p-4 overflow-x-auto">
                            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
                              {JSON.stringify(event.raw_data, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                
                {events.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      No events found matching your criteria.
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
