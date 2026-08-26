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

  if (isLoading) return <div className="p-4 text-gray-400">Loading timeline...</div>;
  if (events.length === 0) return <div className="p-4 text-gray-400">No timeline events found.</div>;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'EVENT': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'FINDING': return <Shield className="h-4 w-4 text-amber-500" />;
      case 'REASONING': return <BrainCircuit className="h-4 w-4 text-purple-500" />;
      case 'RESPONSE_ACTION': return <Terminal className="h-4 w-4 text-cyan-500" />;
      case 'AUDIT_LOG': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background/50 p-6 overflow-auto">
      <div className="relative border-l-2 border-border ml-3 space-y-8">
        {events.map((event, index) => (
          <div key={`${event.type}-${event.id}-${index}`} className="relative pl-6">
            <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-panel border-2 border-border flex items-center justify-center">
               <div className="h-2 w-2 rounded-full bg-gray-500" />
            </div>
            
            <div className="bg-panel border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                {getEventIcon(event.type)}
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{event.type}</span>
                <span className="text-xs text-gray-500 ml-auto">{new Date(event.timestamp).toLocaleString()}</span>
              </div>
              
              <h4 className="font-medium text-white mb-1">{event.title}</h4>
              {event.description && <p className="text-sm text-gray-300">{event.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
