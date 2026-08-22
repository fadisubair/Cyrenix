import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { getIncidents } from '../api/incidents';
import { getEvents } from '../api/events';
import { Incident, Event } from '../types';
import { Card, CardHeader, CardBody } from '../components/Card';
import { StatusBadge, SeverityBadge } from '../components/Badges';
import { LoadingState, EmptyState } from '../components/EmptyState';
import { format } from 'date-fns';

const Dashboard = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [incidentsData, eventsData] = await Promise.all([
          getIncidents(),
          getEvents()
        ]);
        setIncidents(incidentsData);
        setEvents(eventsData.slice(0, 10)); // Just recent events
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingState message="Loading SOC Dashboard..." />;

  const openIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED');
  const highCriticalIncidents = openIncidents.filter(i => i.severity === 'HIGH' || i.severity === 'CRITICAL');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">SOC Dashboard</h1>
          <p className="text-slate-400 text-sm">CYRENIX real-time security posture</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Incidents" value={incidents.length} icon={Activity} color="text-info" />
        <StatCard title="Open Incidents" value={openIncidents.length} icon={ShieldAlert} color="text-warning" />
        <StatCard title="High/Critical" value={highCriticalIncidents.length} icon={AlertOctagon} color="text-danger" />
        <StatCard title="Active Findings" value={openIncidents.reduce((acc, inc) => acc + (inc.confidence > 0.5 ? 1 : 0), 0)} icon={CheckCircle2} color="text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col h-[500px]">
          <CardHeader title="Recent Incidents" />
          <CardBody className="overflow-y-auto p-0 flex-1">
            {incidents.length === 0 ? (
              <div className="h-full"><EmptyState message="No incidents detected" /></div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {incidents.slice(0, 8).map((incident) => (
                    <tr 
                      key={incident.id} 
                      onClick={() => navigate(`/incidents/${incident.id}`)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-slate-400">{String(incident.id).substring(0, 8)}</td>
                      <td className="px-4 py-3"><SeverityBadge severity={incident.severity} /></td>
                      <td className="px-4 py-3 font-medium text-slate-300 truncate max-w-[200px]">{incident.title}</td>
                      <td className="px-4 py-3"><StatusBadge status={incident.status} /></td>
                      <td className="px-4 py-3 text-slate-500">{format(new Date(incident.created_at), 'MMM dd, HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>

        <Card className="flex flex-col h-[500px]">
          <CardHeader title="Recent Events" />
          <CardBody className="overflow-y-auto p-0 flex-1">
            {events.length === 0 ? (
              <div className="h-full"><EmptyState message="No recent events" /></div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Event Type</th>
                    <th className="px-4 py-3">Source/User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{format(new Date(event.timestamp), 'HH:mm:ss')}</td>
                      <td className="px-4 py-3 font-medium text-slate-300">{event.event_type}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                        {event.username || event.source_ip || event.hostname || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <Card>
    <CardBody className="flex items-center p-6">
      <div className={`p-3 rounded-full bg-slate-950 border border-slate-800 ${color} mr-4`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-100 mt-1">{value}</h3>
      </div>
    </CardBody>
  </Card>
);

export default Dashboard;
