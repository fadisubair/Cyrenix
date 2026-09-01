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

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Incidents', path: '/incidents', icon: ShieldAlert },
    { name: 'Investigations', path: '/investigations', icon: Activity },
    { name: 'Events', path: '/events', icon: ListChecks },
    { name: 'Findings', path: '/findings', icon: Target },
    { name: 'Attack Chains', path: '/attack-chains', icon: Crosshair },
    { name: 'Identities', path: '/identities', icon: Fingerprint },
    { name: 'Assets', path: '/assets', icon: Server },
    { name: 'Threat Intelligence', path: '/threat-intel', icon: Globe },
    { name: 'MITRE ATT&CK', path: '/mitre', icon: Target },
    { name: 'Response Center', path: '/response-center', icon: ShieldAlert },
    { name: 'Approvals', path: '/approvals', icon: CheckCircle },
    { name: 'Audit & Timeline', path: '/audit', icon: FileText },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-panel border-r border-border flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <Activity className="h-6 w-6 text-primary mr-2" />
          <span className="text-lg font-bold text-white tracking-wider">CYRENIX</span>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-400 hover:bg-border hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3 shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* System Status Panel */}
        <div className="p-4 border-t border-border bg-panel/50 shrink-0 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center text-gray-400"><Server className="h-3 w-3 mr-1" /> Backend</span>
            <span className={health ? "text-emerald-400" : "text-rose-400"}>{health ? "ONLINE" : "OFFLINE"}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center text-gray-400"><Database className="h-3 w-3 mr-1" /> Database</span>
            <span className={health ? "text-emerald-400" : "text-rose-400"}>{health ? "CONNECTED" : "ERROR"}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center text-gray-400"><Wifi className="h-3 w-3 mr-1" /> Telemetry</span>
            <span className="text-amber-400">PARTIAL</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center text-gray-400"><Radio className="h-3 w-3 mr-1" /> Wazuh</span>
            <span className="text-gray-500">NOT CONNECTED</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* TopBar */}
        <header className="h-16 bg-panel border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search globally..." 
                className="w-full bg-background border border-border rounded-md pl-10 pr-4 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    navigate(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
                  }
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary border-2 border-panel"></span>
            </button>
            
            <div className="h-6 w-px bg-border"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-white">{user?.username}</div>
                <div className="text-xs text-gray-400">{user?.role}</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-border flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-gray-400" />
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 text-gray-400 hover:text-rose-400 transition-colors"
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
