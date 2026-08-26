import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  LogOut,
  Activity,
  User as UserIcon,
  Server
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
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Incidents', path: '/incidents', icon: ShieldAlert },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-panel border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
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
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border bg-panel/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm text-gray-300">
              <Server className="h-4 w-4 mr-2" />
              Backend Status:
            </div>
            {health === null ? (
              <Badge>Checking</Badge>
            ) : health ? (
              <Badge variant="success">Online</Badge>
            ) : (
              <Badge variant="danger">Offline</Badge>
            )}
          </div>
          <div className="flex items-center mb-4">
             <div className="h-8 w-8 rounded-full bg-border flex items-center justify-center mr-3">
               <UserIcon className="h-4 w-4 text-gray-400" />
             </div>
             <div>
               <div className="text-sm font-medium text-white">{user?.username}</div>
               <div className="text-xs text-gray-400">{user?.role}</div>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-400 rounded-md hover:bg-border hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
