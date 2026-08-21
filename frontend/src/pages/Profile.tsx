import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardBody } from '../components/Card';
import { User, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">User Profile</h1>
      
      <Card>
        <CardHeader title="Account Details" />
        <CardBody className="space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-slate-800">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-3xl font-medium">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-200">{user?.username}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-mono bg-brand/20 text-brand px-2 py-1 rounded border border-brand/30 flex items-center gap-1">
                  <Shield size={14} />
                  {user?.role}
                </span>
                {user?.is_active && (
                  <span className="text-xs font-mono bg-success/20 text-success px-2 py-1 rounded border border-success/30">
                    ACTIVE
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Email</label>
              <div className="text-slate-300 font-mono text-sm">{user?.email}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Role Type</label>
              <div className="text-slate-300 text-sm">
                {user?.role === 'ANALYST' 
                  ? 'Security Analyst (Read & Write). Can approve and execute response actions.' 
                  : 'Viewer (Read Only). Cannot modify or execute response actions.'}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Profile;
