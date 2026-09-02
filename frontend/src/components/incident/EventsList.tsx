import React, { useEffect, useState } from 'react';
import { eventsApi } from '../../api';
import { Event } from '../../types';
import { Badge } from '../Badge';
import { Terminal, ChevronDown, ChevronRight } from 'lucide-react';

interface EventsListProps {
  incidentId: string | number;
}

export const EventsList: React.FC<EventsListProps> = ({ incidentId }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchEvents = async () => {
    try {
      const data = await eventsApi.getByIncident(incidentId);
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [incidentId]);

  if (isLoading) return <div className="p-4 text-zinc-400">Loading events...</div>;
  if (events.length === 0) return <div className="p-4 text-zinc-400">No events found for this incident.</div>;

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="flex-1 overflow-auto p-4">
        <div className="border border-border rounded-md overflow-hidden bg-panel">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-[10px] text-zinc-500 uppercase tracking-widest bg-zinc-900/50">
                <th className="w-8 px-4 py-2"></th>
                <th className="px-4 py-2 font-semibold">Time</th>
                <th className="px-4 py-2 font-semibold">Event Type</th>
                <th className="px-4 py-2 font-semibold">Source</th>
                <th className="px-4 py-2 font-semibold">User</th>
                <th className="px-4 py-2 font-semibold">IP (Src → Dst)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {events.map((event) => (
                <React.Fragment key={event.id}>
                  <tr 
                    className="hover:bg-zinc-800/30 cursor-pointer transition-colors group"
                    onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                  >
                    <td className="px-4 py-3 text-zinc-500 group-hover:text-zinc-300">
                      {expandedId === event.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-400 whitespace-nowrap">
                      {new Date(event.timestamp).toISOString()}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-indigo-400">
                      {event.event_type}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-300">
                      {event.source_type} {event.source ? `(${event.source})` : ''}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-300">
                      {event.username || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-500">
                      {event.source_ip ? (
                        <span className="text-zinc-300">{event.source_ip}</span>
                      ) : '-'} 
                      {event.destination_ip && (
                        <span> → <span className="text-zinc-300">{event.destination_ip}</span></span>
                      )}
                    </td>
                  </tr>
                  
                  {expandedId === event.id && (
                    <tr className="bg-zinc-950/50">
                      <td colSpan={6} className="px-4 py-4 border-b border-border/50">
                        <div className="pl-8">
                          <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Terminal className="h-3 w-3" /> Raw Event Forensics
                          </h4>
                          <div className="bg-zinc-950 border border-zinc-800 rounded p-3 overflow-x-auto">
                            <pre className="text-[11px] text-zinc-300 font-mono leading-relaxed">
                              {JSON.stringify(event.raw_data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
