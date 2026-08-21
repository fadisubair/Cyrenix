import React, { useState, useEffect } from 'react';
import { getEvents } from '../../api/events';
import { Event } from '../../types';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { Card, CardBody } from '../../components/Card';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';

const EventsTab = ({ incidentId }: { incidentId: string }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Ideally the API would support filtering events by incident_id, but the backend doesn't seem to have a dedicated endpoint for it
    // We fetch all events for now, or if the API supports query params, we use them.
    getEvents({ incident_id: incidentId })
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [incidentId]);

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  if (loading) return <LoadingState message="Loading events..." />;
  if (events.length === 0) return <EmptyState message="No events associated with this incident" />;

  return (
    <Card>
      <CardBody className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 w-8"></th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Source IP</th>
              <th className="px-4 py-3">Destination IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {events.map((event) => (
              <React.Fragment key={event.id}>
                <tr className="hover:bg-slate-800/50 cursor-pointer" onClick={() => toggleRow(event.id)}>
                  <td className="px-4 py-3 text-slate-500">
                    {expandedRows.has(event.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs whitespace-nowrap">
                    {format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-300">{event.event_type}</td>
                  <td className="px-4 py-3 text-slate-400">{event.source_type}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{event.username || '-'}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{event.source_ip || '-'}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{event.destination_ip || '-'}</td>
                </tr>
                {expandedRows.has(event.id) && (
                  <tr className="bg-slate-900/50">
                    <td colSpan={7} className="px-12 py-4">
                      <div className="bg-slate-950 p-4 rounded-md border border-slate-800 font-mono text-xs text-slate-400 overflow-x-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4 pb-4 border-b border-slate-800">
                          {event.hostname && <div><span className="text-slate-500 block mb-1">Hostname:</span><span className="text-info">{event.hostname}</span></div>}
                          {event.destination_port && <div><span className="text-slate-500 block mb-1">Dest Port:</span><span className="text-info">{event.destination_port}</span></div>}
                          {event.protocol && <div><span className="text-slate-500 block mb-1">Protocol:</span><span className="text-info">{event.protocol}</span></div>}
                          {event.action && <div><span className="text-slate-500 block mb-1">Action:</span><span className="text-info">{event.action}</span></div>}
                          {event.url && <div className="col-span-2"><span className="text-slate-500 block mb-1">URL:</span><span className="text-info">{event.url}</span></div>}
                          {event.method && <div><span className="text-slate-500 block mb-1">Method:</span><span className="text-info">{event.method}</span></div>}
                          {event.status_code && <div><span className="text-slate-500 block mb-1">Status Code:</span><span className="text-info">{event.status_code}</span></div>}
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-2">Raw JSON:</span>
                          <pre className="text-slate-300">{JSON.stringify(event.raw_data || event, null, 2)}</pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
};

export default EventsTab;
