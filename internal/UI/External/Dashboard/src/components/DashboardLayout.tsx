import { Outlet, Link, useLocation } from 'react-router';
import { BarChart3, Mic, Upload, Radio, Settings, Home } from 'lucide-react';
import logo from 'figma:asset/966e1088bba6a777e504debf5381b9001d102f77.png';
import { currentPodcaster } from '../data/mockData';

export function DashboardLayout() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'OVERVIEW', icon: Home },
    { path: '/episodes', label: 'EPISODES', icon: Radio },
    { path: '/analytics', label: 'ANALYTICS', icon: BarChart3 },
    { path: '/upload', label: 'UPLOAD', icon: Upload },
    { path: '/recording', label: 'RECORD', icon: Mic },
    { path: '/settings', label: 'SETTINGS', icon: Settings },
  ];
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#070B1A] text-[#BCC5D0]">
      {/* Header */}
      <header className="bg-[#0B1226] border-b-4 border-[#C89E3E] shadow-lg">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Electra Logo" className="h-16" />
            <div>
              <p className="text-xs text-[#8A94A6] tracking-widest">BROADCAST NETWORK</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-[#E8C97A] tracking-wide">{currentPodcaster.name.toUpperCase()}</p>
              <p className="text-xs text-[#8A94A6]">{currentPodcaster.podcastName}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#1A2744] border-2 border-[#C89E3E] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1655947715189-e7edcae154cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvZGNhc3RlciUyMHN0dWRpb3xlbnwxfHx8fDE3NzA2OTQ2MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                alt={currentPodcaster.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-[#0B1226] border-r border-[#1D1B35] min-h-[calc(100vh-88px)]">
          <div className="p-4 space-y-1">
            <p className="text-xs text-[#8A94A6] tracking-widest px-3 py-2" style={{ fontFamily: 'monospace' }}>
              MY SHOW
            </p>
            {navItems.slice(0, 3).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm
                    ${active 
                      ? 'bg-[#1A2744] text-[#D4A94E]' 
                      : 'text-[#BCC5D0] hover:bg-[#1A2744] hover:text-[#D4A94E]'
                    }
                  `}
                  style={{ fontFamily: 'system-ui' }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <p className="text-xs text-[#8A94A6] tracking-widest px-3 py-2 pt-4" style={{ fontFamily: 'monospace' }}>
              SESSION TOOLS
            </p>
            {navItems.slice(3).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm
                    ${active 
                      ? 'bg-[#1A2744] text-[#D4A94E]' 
                      : 'text-[#BCC5D0] hover:bg-[#1A2744] hover:text-[#D4A94E]'
                    }
                  `}
                  style={{ fontFamily: 'system-ui' }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}