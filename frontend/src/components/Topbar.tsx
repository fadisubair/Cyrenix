import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

const Topbar = () => {
  return (
    <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-slate-200 lg:hidden">
          <Menu size={20} />
        </button>
        
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search Incidents, Events, Entities..." 
            className="bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 rounded-md pl-9 pr-4 py-1.5 focus:outline-none focus:border-brand w-80"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative text-slate-400 hover:text-slate-200">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-brand rounded-full"></span>
        </button>
      </div>
    </div>
  );
};

export default Topbar;
