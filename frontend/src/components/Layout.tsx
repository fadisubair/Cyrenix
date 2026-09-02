import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  LogOut,
  Activity,
  User as UserIcon,
  Server,
  Database,
  Wifi,
  Radio,
  Search,
  Bell,
  Fingerprint,
  Target,
  Globe,
  Crosshair,
  ListChecks,
  CheckCircle,
  FileText,
  Settings
} from 'lucide-react';
import { healthApi } from '../api';
import { Badge } from './Badge';
import { ThemeToggle } from './ThemeToggle';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthApi.check();
        setHealth(true);
      } catch {
        setHealth(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Overview', path: '/', icon: LayoutDashboard },
        { name: 'Incidents', path: '/incidents', icon: ShieldAlert },
        { name: 'Investigations', path: '/investigations', icon: Activity },
        { name: 'Response', path: '/response-center', icon: ShieldAlert },
        { name: 'Approvals', path: '/approvals', icon: CheckCircle },
      ]
    },
    {
      title: 'ANALYSIS',
      items: [
        { name: 'Events', path: '/events', icon: ListChecks },
        { name: 'Findings', path: '/findings', icon: Target },
        { name: 'Attack Chains', path: '/attack-chains', icon: Crosshair },
        { name: 'Identities', path: '/identities', icon: Fingerprint },
        { name: 'Assets', path: '/assets', icon: Server },
        { name: 'Intelligence', path: '/threat-intel', icon: Globe },
        { name: 'MITRE ATT&CK', path: '/mitre', icon: Target },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Audit', path: '/audit', icon: FileText },
        { name: 'Search', path: '/search', icon: Search },
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-panel border-r border-border flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <Activity className="h-6 w-6 text-primary mr-2" />
          <span className="text-lg font-bold text-zinc-100 tracking-wider">CYRENIX</span>
        </div>
        
        <nav className="flex-1 py-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-6 px-3">
              <h3 className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-widest uppercase">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-zinc-900 text-zinc-100 border-l-2 border-indigo-500 pl-2.5' 
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border-l-2 border-transparent pl-2.5'
                      }`
                    }
                  >
                    <item.icon className={`h-4 w-4 mr-3 shrink-0`} />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* System Status Panel */}
        <div className="px-6 py-4 border-t border-border bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <div className={`h-1.5 w-1.5 rounded-full ${health ? 'bg-emerald-500/50' : 'bg-red-500/50'}`}></div>
            <span>Platform {health ? "Online" : "Degraded"}</span>
          </div>
          <div className="text-[10px] text-zinc-600 font-mono">v1.2.0-stable</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* TopBar */}
        <header className="h-16 bg-panel border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search globally..." 
                className="w-full bg-background border border-border rounded-md pl-10 pr-4 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all placeholder:text-zinc-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    navigate(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
                  }
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button className="relative text-zinc-400 hover:text-zinc-100 transition-colors rounded-md p-1 hover:bg-zinc-800/50 flex items-center justify-center h-8 w-8 focus:outline-none focus:ring-1 focus:ring-zinc-600">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary border border-panel"></span>
              </button>
            </div>
            
            <div className="h-6 w-px bg-border"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-zinc-100">{user?.username}</div>
                <div className="text-xs text-zinc-400">{user?.role}</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-border flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-zinc-400" />
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 text-zinc-400 hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
