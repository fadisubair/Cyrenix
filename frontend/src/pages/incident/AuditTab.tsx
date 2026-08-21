import React, { useState, useEffect } from 'react';
import { getIncidentTimeline } from '../../api/timeline';
import { TimelineEvent } from '../../types';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { format } from 'date-fns';
import { Activity, ShieldAlert, CheckCircle2, Play, Search, Network, BrainCircuit, Shield } from 'lucide-react';

const AuditTab = ({ incidentId }: { incidentId: string }) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIncidentTimeline(incidentId)
      .then(setTimeline)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [incidentId]);

  if (loading) return <LoadingState message="Loading incident timeline..." />;
  if (timeline.length === 0) return <EmptyState message="No timeline events recorded for this incident." />;

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'EVENT': return <Activity size={16} />;
      case 'FINDING': return <ShieldAlert size={16} />;
      case 'REASONING': return <BrainCircuit size={16} />;
      case 'RESPONSE_RECOMMENDATION': return <Shield size={16} />;
      case 'AUDIT_LOG': return <CheckCircle2 size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getEventColor = (type: string) => {
    switch(type) {
      case 'EVENT': return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'FINDING': return 'bg-danger/20 text-danger border-danger/30';
      case 'REASONING': return 'bg-warning/20 text-warning border-warning/30';
      case 'RESPONSE_RECOMMENDATION': return 'bg-info/20 text-info border-info/30';
      case 'AUDIT_LOG': return 'bg-success/20 text-success border-success/30';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h2 className="text-xl font-bold text-slate-200 mb-8">Incident Audit Timeline</h2>
      
      <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-8">
        {timeline.map((event, index) => (
          <div key={`${event.timestamp}-${index}`} className="relative">
            <div className={`absolute -left-12 mt-1.5 w-8 h-8 rounded-full border flex items-center justify-center ${getEventColor(event.event_type)}`}>
              {getEventIcon(event.event_type)}
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-800/50">
                    {event.event_type}
                  </span>
                  <span className="text-sm text-slate-500 font-mono">
                    {format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">Src: {event.source_type}</span>
              </div>
              
              <h4 className="text-slate-200 font-medium text-base mb-2">{event.title}</h4>
              <p className="text-slate-400 text-sm mb-3">{event.description}</p>
              
              {Object.keys(event.data || {}).length > 0 && (
                <div className="bg-slate-950 p-3 rounded text-xs font-mono text-slate-500 border border-slate-800/50 overflow-x-auto">
                  <pre className="m-0 text-info/80">{JSON.stringify(event.data, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTab;
