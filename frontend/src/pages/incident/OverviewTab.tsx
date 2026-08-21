import React, { useState } from 'react';
import { Incident } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/Card';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { analyzeIncident } from '../../api/investigations';
import { BrainCircuit, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const OverviewTab = ({ incident }: { incident: Incident }) => {
  const { user } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeResult('IDLE');
    setErrorMessage('');
    try {
      await analyzeIncident(incident.id);
      setAnalyzeResult('SUCCESS');
    } catch (err: any) {
      setAnalyzeResult('ERROR');
      setErrorMessage(err.response?.data?.detail || 'Failed to analyze incident');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader title="Incident Summary" />
        <CardBody className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</label>
            <p className="mt-1 text-slate-300 text-sm">{incident.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Created</label>
              <p className="mt-1 text-slate-300 font-mono text-sm">{format(new Date(incident.created_at), 'MMM dd, yyyy HH:mm:ss')}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Updated</label>
              <p className="mt-1 text-slate-300 font-mono text-sm">{format(new Date(incident.updated_at), 'MMM dd, yyyy HH:mm:ss')}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">First Seen Activity</label>
              <p className="mt-1 text-slate-300 font-mono text-sm">{format(new Date(incident.first_seen), 'MMM dd, yyyy HH:mm:ss')}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Last Seen Activity</label>
              <p className="mt-1 text-slate-300 font-mono text-sm">{format(new Date(incident.last_seen), 'MMM dd, yyyy HH:mm:ss')}</p>
            </div>
          </div>
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader title="Analyst Context" />
        <CardBody>
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded p-4 text-sm text-slate-400 font-mono flex flex-col justify-center items-center opacity-70 min-h-[100px]">
              <p>Additional analyst context/notes will appear here.</p>
            </div>
            
            {user?.role === 'ANALYST' && (
              <div className="mt-4 border-t border-slate-800 pt-4">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Automated Analysis</h3>
                <p className="text-xs text-slate-500 mb-4">Run the Cyrenix investigation engine on this incident's events to discover findings and build a reasoning chain.</p>
                
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full btn btn-primary py-2 flex items-center justify-center gap-2"
                >
                  {analyzing ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                  {analyzing ? 'Analyzing Incident...' : 'Analyze Incident'}
                </button>
                
                {analyzeResult === 'SUCCESS' && (
                  <div className="mt-3 bg-success/10 border border-success/20 text-success p-3 rounded flex items-center gap-2 text-sm">
                    <CheckCircle size={16} /> Analysis complete. Check the Findings tab.
                  </div>
                )}
                
                {analyzeResult === 'ERROR' && (
                  <div className="mt-3 bg-danger/10 border border-danger/20 text-danger p-3 rounded flex items-center gap-2 text-sm">
                    <AlertCircle size={16} /> {errorMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default OverviewTab;
