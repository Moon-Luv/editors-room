import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  Layers, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Download
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Button } from '@/components/ui/button';
import { supabase } from '@/src/lib/supabase';
import { motion } from 'motion/react';
import { format } from 'date-fns';

const data = [
  { name: 'Jan', revenue: 4000, users: 2400 },
  { name: 'Feb', revenue: 3000, users: 1398 },
  { name: 'Mar', revenue: 2000, users: 9800 },
  { name: 'Apr', revenue: 2780, users: 3908 },
  { name: 'May', revenue: 1890, users: 4800 },
  { name: 'Jun', revenue: 2390, users: 3800 },
  { name: 'Jul', revenue: 3490, users: 4300 },
];

const serviceData = [
  { name: 'Web Dev', value: 400, color: '#3b82f6' },
  { name: 'Cloud', value: 300, color: '#a855f7' },
  { name: 'Security', value: 300, color: '#ec4899' },
  { name: 'AI/ML', value: 200, color: '#10b981' },
];

const stats = [
  { label: 'Total Revenue', value: '$124,500', change: '+12.5%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Active Projects', value: '24', change: '+3', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'New Users', value: '1,240', change: '+18%', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { label: 'Services Used', value: '450', change: '-2.4%', icon: Layers, color: 'text-pink-500', bg: 'bg-pink-500/10' },
];

const recentBookings = [
  { id: 1, user: 'John Doe', service: 'Web Development', date: '2024-03-29', time: '10:00 AM', status: 'Confirmed' },
  { id: 2, user: 'Jane Smith', service: 'Cloud Migration', date: '2024-03-29', time: '02:30 PM', status: 'Pending' },
  { id: 3, user: 'Robert Brown', service: 'Cybersecurity Audit', date: '2024-03-30', time: '11:15 AM', status: 'Confirmed' },
  { id: 4, user: 'Emily Davis', service: 'AI Strategy', date: '2024-03-31', time: '09:00 AM', status: 'Cancelled' },
];

export const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [counts, setCounts] = useState({
    projects: 0,
    services: 0,
    users: 0,
    bookings: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const [projectsRes, servicesRes, usersRes, bookingsRes] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
      ]);

      setCounts({
        projects: projectsRes.count || 0,
        services: servicesRes.count || 0,
        users: usersRes.count || 0,
        bookings: bookingsRes.count || 0
      });
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email?.split('@')[0] || 'Admin'}. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-border bg-muted/50">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.change.startsWith('+') ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
              )}>
                {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold">Revenue & Growth</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs text-muted-foreground">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-xs text-muted-foreground">Users</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="currentColor" 
                  opacity={0.3}
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="currentColor" 
                  opacity={0.3}
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#a855f7" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Service Distribution Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <h3 className="text-lg font-bold mb-8">Service Usage</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold">1.2k</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {serviceData.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: service.color }}></div>
                  <span className="text-sm text-muted-foreground">{service.name}</span>
                </div>
                <span className="text-sm font-bold">{service.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Recent Bookings</h3>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">View All</Button>
          </div>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {booking.user.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{booking.user}</p>
                    <p className="text-xs text-muted-foreground">{booking.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Calendar className="w-3 h-3" />
                    {booking.date}
                  </div>
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    booking.status === 'Confirmed' ? "bg-emerald-500/10 text-emerald-500" :
                    booking.status === 'Pending' ? "bg-amber-500/10 text-amber-500" :
                    "bg-rose-500/10 text-rose-500"
                  )}>
                    {booking.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Alerts & Notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">System Alerts</h3>
            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <div className="p-2 rounded-lg bg-amber-500/10 h-fit">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-amber-500">Database Backup Pending</p>
                <p className="text-sm text-muted-foreground mt-1">The scheduled backup for today has not been completed yet.</p>
                <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="p-2 rounded-lg bg-emerald-500/10 h-fit">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-emerald-500">System Update Successful</p>
                <p className="text-sm text-muted-foreground mt-1">All core modules have been updated to version 2.4.0.</p>
                <p className="text-xs text-muted-foreground mt-2">5 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <div className="p-2 rounded-lg bg-blue-500/10 h-fit">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-blue-500">New Service Request</p>
                <p className="text-sm text-muted-foreground mt-1">A new custom service request has been submitted by Nexus Corp.</p>
                <p className="text-xs text-muted-foreground mt-2">Yesterday</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
