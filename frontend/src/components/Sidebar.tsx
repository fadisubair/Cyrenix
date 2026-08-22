import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, AlertTriangle, List, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Incidents', path: '/incidents', icon: ShieldAlert },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-brand p-1.5 rounded-lg text-white">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wider text-slate-100">CYRENIX</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">SOC Console</p>
        </div>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-brand/10 text-brand font-medium'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                <item.icon size={18} />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 flex-shrink-0 font-medium">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.username}</p>
              <p className="text-[10px] uppercase font-mono text-slate-500 tracking-wider truncate">{user?.role}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full btn btn-secondary text-xs py-1.5"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
