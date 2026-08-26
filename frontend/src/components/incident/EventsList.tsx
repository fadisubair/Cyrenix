import React, { useEffect, useState } from 'react';
import { eventsApi } from '../../api';
import { Event } from '../../types';
import { Badge } from '../Badge';
import { Terminal } from 'lucide-react';

interface EventsListProps {
  incidentId: string | number;
}

export const EventsList: React.FC<EventsListProps> = ({ incidentId }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) return <div className="p-4 text-gray-400">Loading events...</div>;
  if (events.length === 0) return <div className="p-4 text-gray-400">No events found for this incident.</div>;

  return (
    <div className="flex flex-col h-full bg-background/50">
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-panel border border-border rounded-lg p-4 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge variant="info">{event.event_type}</Badge>
                  <span className="text-sm font-medium text-white">{event.source_type}</span>
                  <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-400 font-mono">ID: {event.id}</div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                {event.source && (
                  <div><span className="text-gray-500">Source:</span> <span className="text-gray-300">{event.source}</span></div>
                )}
                {event.username && (
                  <div><span className="text-gray-500">User:</span> <span className="text-gray-300">{event.username}</span></div>
                )}
                {event.source_ip && (
                  <div><span className="text-gray-500">Src IP:</span> <span className="text-gray-300 font-mono">{event.source_ip}</span></div>
                )}
                {event.destination_ip && (
                  <div><span className="text-gray-500">Dst IP:</span> <span className="text-gray-300 font-mono">{event.destination_ip}</span></div>
                )}
              </div>

              <div className="bg-background border border-border rounded p-3 relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Terminal className="h-4 w-4 text-gray-500" />
                </div>
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(event.raw_data, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
