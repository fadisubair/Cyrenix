import React, { useState, useEffect } from 'react';
import { getFindings, getFindingEvidence } from '../../api/findings';
import { Finding, Event } from '../../types';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { Card, CardHeader, CardBody } from '../../components/Card';
import { StatusBadge, ConfidenceBadge } from '../../components/Badges';
import { format } from 'date-fns';
import { Search } from 'lucide-react';

const FindingsTab = ({ incidentId }: { incidentId: string }) => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [evidence, setEvidence] = useState<Event[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  useEffect(() => {
    getFindings({ incident_id: incidentId })
      .then(data => {
        setFindings(data);
        if (data.length > 0) {
          handleSelectFinding(data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [incidentId]);

  const handleSelectFinding = (finding: Finding) => {
    setSelectedFinding(finding);
    setEvidenceLoading(true);
    getFindingEvidence(finding.id)
      .then(setEvidence)
      .catch(console.error)
      .finally(() => setEvidenceLoading(false));
  };

  if (loading) return <LoadingState message="Loading findings..." />;
  if (findings.length === 0) return <EmptyState message="No findings for this incident" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-1 border-r border-slate-800 pr-4 space-y-4 overflow-y-auto">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Detected Findings</h3>
        {findings.map(finding => (
          <div 
            key={finding.id}
            onClick={() => handleSelectFinding(finding)}
            className={`p-4 rounded-lg cursor-pointer transition-colors border ${
              selectedFinding?.id === finding.id 
                ? 'bg-slate-800 border-brand/50' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-mono text-brand bg-brand/10 px-2 py-0.5 rounded">{finding.finding_type}</span>
              <StatusBadge status={finding.status} />
            </div>
            <h4 className="font-medium text-slate-200 text-sm mb-1">{finding.title}</h4>
            <div className="flex justify-between items-center text-xs mt-3">
              <span className="text-slate-500">{format(new Date(finding.created_at), 'MMM dd, HH:mm')}</span>
              <ConfidenceBadge confidence={finding.confidence} />
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-2 overflow-y-auto pr-2">
        {selectedFinding ? (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Finding Details" />
              <CardBody className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 mb-2">{selectedFinding.title}</h2>
                  <div className="flex gap-4 text-sm border-b border-slate-800 pb-4 mb-4">
                    <span className="text-slate-400">Type: <span className="text-slate-200">{selectedFinding.finding_type}</span></span>
                    <span className="text-slate-400">Status: <StatusBadge status={selectedFinding.status} /></span>
                    <span className="text-slate-400">Confidence: <ConfidenceBadge confidence={selectedFinding.confidence} /></span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Description</h4>
                      <p className="text-slate-300 text-sm">{selectedFinding.description}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Rationale</h4>
                      <div className="bg-slate-900 p-4 rounded border border-slate-800 text-sm text-slate-300">
                        {selectedFinding.rationale}
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="pt-2">
              <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
                <Search size={18} className="text-brand" /> 
                Supporting Evidence
              </h3>
              
              {evidenceLoading ? (
                <LoadingState message="Loading evidence..." />
              ) : evidence.length === 0 ? (
                <EmptyState message="No direct evidence events linked to this finding" />
              ) : (
                <div className="space-y-3">
                  {evidence.map((ev) => (
                    <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">{ev.event_type}</span>
                          <span className="text-xs text-slate-500">{format(new Date(ev.timestamp), 'yyyy-MM-dd HH:mm:ss')}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-500">ID: {String(ev.id).substring(0, 8)}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                        {ev.source_ip && <div><span className="text-slate-500 block text-xs">Source IP</span><span className="text-slate-300 font-mono">{ev.source_ip}</span></div>}
                        {ev.username && <div><span className="text-slate-500 block text-xs">Username</span><span className="text-slate-300 font-mono">{ev.username}</span></div>}
                        {ev.hostname && <div><span className="text-slate-500 block text-xs">Hostname</span><span className="text-slate-300 font-mono">{ev.hostname}</span></div>}
                        {ev.action && <div><span className="text-slate-500 block text-xs">Action</span><span className="text-slate-300 font-mono">{ev.action}</span></div>}
                      </div>
                      
                      <div className="bg-slate-950 p-3 rounded border border-slate-800/50 mt-2 overflow-x-auto">
                        <pre className="text-xs text-info font-mono m-0">{JSON.stringify(ev.raw_data || ev, null, 2)}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            Select a finding to view details and evidence
          </div>
        )}
      </div>
    </div>
  );
};

export default FindingsTab;
