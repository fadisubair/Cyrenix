import React, { useEffect, useState } from 'react';
import { timelineApi } from '../../api';
import { TimelineEvent } from '../../types';
import { Shield, BrainCircuit, Activity, Clock, Terminal } from 'lucide-react';

interface TimelineViewProps {
  incidentId: string | number;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ incidentId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await timelineApi.getByIncident(incidentId);
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch timeline', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeline();
  }, [incidentId]);

  if (isLoading) return <div className="p-4 text-zinc-400">Loading timeline...</div>;
  if (events.length === 0) return <div className="p-4 text-zinc-400">No timeline events found.</div>;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'EVENT': return <Activity className="h-4 w-4 text-indigo-400" />;
      case 'FINDING': return <Shield className="h-4 w-4 text-amber-400" />;
      case 'REASONING': return <BrainCircuit className="h-4 w-4 text-indigo-400" />;
      case 'RESPONSE_ACTION': return <Terminal className="h-4 w-4 text-emerald-400" />;
      case 'AUDIT_LOG': return <Clock className="h-4 w-4 text-zinc-500" />;
      default: return <Clock className="h-4 w-4 text-zinc-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 overflow-auto">
      <div className="max-w-4xl">
        <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-6">Chronological Sequence</h3>
        <div className="relative border-l border-zinc-800 ml-2.5 space-y-8 pb-8">
          {events.map((event, index) => (
            <div key={`${event.type}-${event.id}-${index}`} className="relative pl-8 group">
              <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-950 border-2 border-zinc-500 group-hover:border-zinc-300 transition-colors">
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-mono text-zinc-500 w-32">{new Date(event.timestamp).toLocaleString()}</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900 rounded text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    {getEventIcon(event.type)}
                    {event.type}
                  </div>
                </div>
                
                <h4 className="text-sm font-medium text-zinc-200 mt-1 mb-1">{event.title}</h4>
                {event.description && <p className="text-sm text-zinc-400 leading-relaxed">{event.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
