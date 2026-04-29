import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Activity, Clock, Users, Zap, TrendingUp, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

const MOCK_TOOL_DISTRIBUTION = [
  { name: 'Extract', value: 400 },
  { name: 'OCR', value: 300 },
  { name: 'Smart AI', value: 500 },
  { name: 'Merge', value: 200 },
  { name: 'Other', value: 100 },
];

const MOCK_DAILY_SESSIONS = [
  { day: 'Mon', sessions: 240, active: 180 },
  { day: 'Tue', sessions: 300, active: 220 },
  { day: 'Wed', sessions: 450, active: 310 },
  { day: 'Thu', sessions: 420, active: 290 },
  { day: 'Fri', sessions: 510, active: 380 },
  { day: 'Sat', sessions: 590, active: 450 },
  { day: 'Sun', sessions: 550, active: 410 },
];

export function AdminStatistics() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd fetch actual analytics here
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Analytics & Intelligence</h2>
        <p className="text-slate-500 font-medium italic">Deep dive into application usage and feature performance</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Rate</h4>
              <p className="text-xs text-slate-400 font-bold">VS LAST WEEK</p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-slate-900">72.4%</p>
            <p className="text-xs font-bold text-green-500 pb-1 mb-1">+5.2%</p>
          </div>
          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full w-[72.4%]" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">AVG Session</h4>
              <p className="text-xs text-slate-400 font-bold">USER ENGAGEMENT</p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-slate-900">12:45</p>
            <p className="text-xs font-bold text-indigo-500 pb-1 mb-1">m/s</p>
          </div>
          <div className="mt-4 flex gap-1 items-end h-6">
            {[40, 60, 30, 80, 45, 90, 50, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-100 rounded-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Growth Retention</h4>
              <p className="text-xs text-slate-400 font-bold">MONTHLY COHORT</p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-slate-900">88.1%</p>
            <p className="text-xs font-bold text-purple-500 pb-1 mb-1">High</p>
          </div>
          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full w-[88.1%]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={20} /> Sessions Over Time
            </h3>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_DAILY_SESSIONS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
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
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="active" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
           <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-8">
            <Activity className="text-pink-600" size={20} /> Feature Popularity
          </h3>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_TOOL_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {MOCK_TOOL_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px', 
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-3">
             {MOCK_TOOL_DISTRIBUTION.map((tool, index) => (
               <div key={tool.name} className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                   <span className="text-xs font-bold text-slate-600">{tool.name}</span>
                 </div>
                 <span className="text-xs font-black text-slate-900">{tool.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
