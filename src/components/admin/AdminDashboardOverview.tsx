import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, FileUp, Activity, MousePointer2, TrendingUp, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from '../../lib/utils';

const MOCK_USAGE_DATA = [
  { name: 'Mon', usage: 400 },
  { name: 'Tue', usage: 300 },
  { name: 'Wed', usage: 600 },
  { name: 'Thu', usage: 800 },
  { name: 'Fri', usage: 500 },
  { name: 'Sat', usage: 900 },
  { name: 'Sun', usage: 700 },
];

const MOCK_TOOL_DATA = [
  { name: 'Smart AI', count: 120 },
  { name: 'OCR', count: 80 },
  { name: 'Extract', count: 65 },
  { name: 'Merge', count: 45 },
  { name: 'Split', count: 30 },
];

export function AdminDashboardOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalUploads: 0,
    topTool: 'Smart AI'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Mocking some other stats since we don't have tracking table yet
      setStats({
        totalUsers: usersCount || 0,
        activeUsers: Math.floor((usersCount || 0) * 0.4),
        totalUploads: 1240,
        topTool: 'Smart AI Parser'
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Files', value: stats.totalUploads, icon: FileUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Most Used Tool', value: stats.topTool, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h2>
        <p className="text-slate-500 font-medium italic">High-level activity and usage metrics</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={20} /> Usage Trends
            </h3>
            <select className="bg-slate-50 border-none text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500/20">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_USAGE_DATA}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px', 
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="usage" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
           <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-8">
            <MousePointer2 className="text-purple-600" size={20} /> Top Tools
          </h3>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_TOOL_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  width={70}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px', 
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
