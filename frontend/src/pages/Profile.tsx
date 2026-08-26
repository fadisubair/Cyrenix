import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Mail, Shield, Calendar } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-gray-400">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">User Profile</h1>
        <p className="text-gray-400">Manage your account details and view permissions</p>
      </div>

      <div className="bg-panel border border-border rounded-lg overflow-hidden">
        <div className="p-8 flex items-center gap-6 border-b border-border bg-background/30">
          <div className="h-24 w-24 rounded-full bg-border flex items-center justify-center">
            <UserIcon className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user.username}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Shield className={`h-4 w-4 ${user.role === 'ANALYST' ? 'text-primary' : 'text-gray-500'}`} />
              <span className="text-sm font-medium text-gray-300">{user.role}</span>
              {user.is_active && (
                <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-emerald-900/50 text-emerald-400 border border-emerald-800">
                  ACTIVE
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Account Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded bg-background border border-border flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium text-white">{user.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded bg-background border border-border flex items-center justify-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-white">{user.username}@cyrenix.local</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded bg-background border border-border flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
