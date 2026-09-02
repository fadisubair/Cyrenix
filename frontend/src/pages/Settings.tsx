import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, Radio, Check, Save } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    alertThreshold: 'medium',
    emailNotifications: true,
    slackNotifications: false,
    autoCorrelate: true,
    autoMitigateHighConfidence: false,
    dataRetentionDays: 90,
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save delay
    setTimeout(() => {
      setIsSaving(false);
    }, 800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setSettings({
      ...settings,
      [e.target.name]: value
    });
  };

  return (
    <div className="space-y-6 flex flex-col h-full max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-wide">Platform Settings</h1>
          <p className="text-zinc-400">Configure global platform behavior and integrations</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50"
          disabled={isSaving}
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> Save Changes</>
          )}
        </button>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Settings Navigation */}
        <div className="w-64 bg-panel border border-border rounded-md p-2 flex flex-col gap-1 shrink-0">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}`}
          >
            <SettingsIcon className="h-4 w-4 mr-3" /> General
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}`}
          >
            <Bell className="h-4 w-4 mr-3" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}`}
          >
            <Shield className="h-4 w-4 mr-3" /> Analysis Engine
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'integrations' ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}`}
          >
            <Radio className="h-4 w-4 mr-3" /> Integrations
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'data' ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}`}
          >
            <Database className="h-4 w-4 mr-3" /> Data Management
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-panel border border-border rounded-md overflow-y-auto p-8">
          
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-medium text-zinc-100 mb-4">Platform Configuration</h3>
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Default Incident Alert Threshold</label>
                    <select 
                      name="alertThreshold"
                      value={settings.alertThreshold}
                      onChange={handleChange}
                      className="w-full bg-zinc-950 border border-border rounded-md px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-zinc-100"
                    >
                      <option value="low">Low (Notify on all incidents)</option>
                      <option value="medium">Medium (Notify on Medium+ incidents)</option>
                      <option value="high">High (Notify only on High/Critical incidents)</option>
                    </select>
                    <p className="mt-1 text-xs text-zinc-500">Determines the minimum severity required to trigger global alerts.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-medium text-zinc-100 mb-4">Notification Preferences</h3>
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center justify-between p-4 bg-zinc-950 border border-border rounded-md">
                    <div>
                      <div className="font-medium text-zinc-100">Email Notifications</div>
                      <div className="text-sm text-zinc-500">Receive critical alerts via email</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-zinc-100 after:border-zinc-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-zinc-950 border border-border rounded-md">
                    <div>
                      <div className="font-medium text-zinc-100">Slack / Webhook Integration</div>
                      <div className="text-sm text-zinc-500">Send notifications to connected workspaces</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="slackNotifications" checked={settings.slackNotifications} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-zinc-100 after:border-zinc-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-medium text-zinc-100 mb-4">CYRENIX AI Analysis Engine</h3>
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center justify-between p-4 bg-zinc-950 border border-border rounded-md">
                    <div>
                      <div className="font-medium text-zinc-100">Automatic Event Correlation</div>
                      <div className="text-sm text-zinc-500">Automatically link related events to form attack chains</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="autoCorrelate" checked={settings.autoCorrelate} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-zinc-100 after:border-zinc-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-zinc-950 border border-border rounded-md">
                    <div>
                      <div className="font-medium text-zinc-100">Auto-mitigate High Confidence Threats</div>
                      <div className="text-sm text-zinc-500 flex items-center mt-1">
                        <Badge variant="warning">Warning</Badge>
                        <span className="ml-2">Execute response actions without approval if confidence {">"} 95%</span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="autoMitigateHighConfidence" checked={settings.autoMitigateHighConfidence} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-zinc-100 after:border-zinc-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-medium text-zinc-100 mb-4">Connected Systems</h3>
                <div className="space-y-4 max-w-2xl">
                  
                  <div className="border border-border bg-zinc-950 rounded-md p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <Radio className="h-6 w-6 text-emerald-500 mr-3" />
                        <div>
                          <h4 className="font-medium text-zinc-100">Wazuh SIEM</h4>
                          <div className="text-xs text-zinc-500">Endpoint telemetry provider</div>
                        </div>
                      </div>
                      <Badge variant="success">Connected</Badge>
                    </div>
                    <div className="text-sm text-zinc-400 bg-zinc-900 p-3 rounded border border-border/50 font-mono">
                      Endpoint: https://wazuh-manager.local:55000<br/>
                      Last Sync: Just now
                    </div>
                  </div>

                  <div className="border border-border bg-zinc-950 rounded-md p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <Shield className="h-6 w-6 text-zinc-500 mr-3" />
                        <div>
                          <h4 className="font-medium text-zinc-100">VirusTotal</h4>
                          <div className="text-xs text-zinc-500">Threat Intelligence provider</div>
                        </div>
                      </div>
                      <Badge variant="default">Not Configured</Badge>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-medium bg-zinc-800/30 hover:bg-zinc-800/50 text-zinc-100 rounded border border-border transition-colors">
                      Configure API Key
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-medium text-zinc-100 mb-4">Data Management</h3>
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Event Retention Period (Days)</label>
                    <input 
                      type="number"
                      name="dataRetentionDays"
                      value={settings.dataRetentionDays}
                      onChange={handleChange}
                      className="w-full bg-zinc-950 border border-border rounded-md px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-zinc-100"
                    />
                    <p className="mt-1 text-xs text-zinc-500">Raw events older than this period will be archived automatically.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
