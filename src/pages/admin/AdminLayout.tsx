import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Zap,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Projects', path: '/admin/projects', icon: Briefcase },
    { name: 'Team', path: '/admin/team', icon: Users },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
    { name: 'Blog', path: '/admin/blog', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col relative z-20">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_20px_rgba(255,77,0,0.3)]">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tighter">Pumpkin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div className="px-4 mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Main Menu</p>
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group",
                  isActive 
                    ? "bg-brand/10 text-brand border border-brand/20" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-brand" : "group-hover:scale-110 transition-transform")} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_10px_rgba(255,77,0,1)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-400/5 transition-all w-full group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        {/* Topbar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#050505]/50 backdrop-blur-xl relative z-10">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 focus:border-brand/50 transition-all outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full border-2 border-[#050505]" />
            </button>
            
            <div className="h-8 w-[1px] bg-white/10" />
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold">Admin User</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold shadow-lg">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
