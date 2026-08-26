import React, { useEffect, useState } from 'react';
import { incidentsApi } from '../api';
import { Incident } from '../types';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await incidentsApi.getAll();
        setIncidents(data);
      } catch (error) {
        console.error('Failed to fetch incidents', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  if (isLoading) {
    return <div className="text-gray-400">Loading dashboard...</div>;
  }

  const openIncidents = incidents.filter(i => i.status !== 'CLOSED' && i.status !== 'RESOLVED');
  const highCritical = incidents.filter(i => i.severity === 'HIGH' || i.severity === 'CRITICAL');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">Dashboard</h1>
        <p className="text-gray-400">Security Operations Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-panel border border-border p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Incidents</p>
              <p className="text-3xl font-bold text-white mt-2">{incidents.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-panel border border-border p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Open Incidents</p>
              <p className="text-3xl font-bold text-white mt-2">{openIncidents.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-panel border border-border p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">High / Critical</p>
              <p className="text-3xl font-bold text-white mt-2">{highCritical.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-panel border border-border p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Resolved</p>
              <p className="text-3xl font-bold text-white mt-2">
                {incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Incidents could go here */}
    </div>
  );
};
