
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Users, 
  FileText, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Lead } from '../types';

const dataPlaceholder = [
  { name: 'Mon', leads: 4 },
  { name: 'Tue', leads: 7 },
  { name: 'Wed', leads: 5 },
  { name: 'Thu', leads: 12 },
  { name: 'Fri', leads: 9 },
  { name: 'Sat', leads: 3 },
  { name: 'Sun', leads: 6 },
];

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-xl hover:border-[#333] transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg bg-white/5`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <h3 className="text-[#888] text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    leads: 0,
    caseStudies: 0,
    insights: 0,
    activeJobs: 0
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // We fetch count and data separately for better clarity
        const leadsCount = await supabase.from('leads').select('*', { count: 'exact', head: true });
        const casesCount = await supabase.from('case_studies').select('*', { count: 'exact', head: true });
        const insightsCount = await supabase.from('insights').select('*', { count: 'exact', head: true });
        const jobsCount = await supabase.from('job_openings').select('*', { count: 'exact', head: true }).eq('is_active', true);
        
        const recentLeadsRes = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentLeadsRes.error) throw recentLeadsRes.error;

        setStats({
          leads: leadsCount.count || 0,
          caseStudies: casesCount.count || 0,
          insights: insightsCount.count || 0,
          activeJobs: jobsCount.count || 0
        });

        if (recentLeadsRes.data) {
          setRecentLeads(recentLeadsRes.data);
        }
      } catch (err: any) {
        console.error("Dashboard data fetch error:", err);
        setError(err.message || "Failed to sync with Supabase");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-white w-10 h-10" />
        <p className="text-xs uppercase tracking-[0.2em] font-black text-[#333]">Synchronizing Core Systems</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-sm">
          <AlertCircle size={18} />
          <p>Connectivity Issue: {error}. Check your RLS policies or database connection.</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display italic">Stravigo Intelligence</h2>
          <p className="text-[#888] mt-1">Real-time performance monitoring and lead acquisition metrics.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#1a1a1a] p-1.5 rounded-lg">
          <button className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md bg-white text-black transition-all">Live</button>
          <button onClick={() => window.location.reload()} className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#111] text-[#555] transition-all">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Leads" value={stats.leads} icon={Users} trend={12} />
        <StatCard title="Active Projects" value={stats.caseStudies} icon={Briefcase} trend={4} />
        <StatCard title="Eagle Insights" value={stats.insights} icon={FileText} trend={-2} />
        <StatCard title="Open Careers" value={stats.activeJobs} icon={TrendingUp} trend={8} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg uppercase tracking-widest text-[#333]">Acquisition Pipeline</h3>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-1.5 text-white">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span>New Inquiries</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataPlaceholder}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                <XAxis dataKey="name" stroke="#333" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis stroke="#333" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl flex flex-col shadow-2xl">
          <h3 className="font-bold text-lg uppercase tracking-widest text-[#333] mb-6">Recent Activity</h3>
          <div className="space-y-8 flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {recentLeads.length > 0 ? recentLeads.map((lead) => (
              <div key={lead.id} className="flex gap-4 items-start group">
                <div className="w-10 h-10 rounded-full bg-[#111] border border-[#1a1a1a] flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold group-hover:text-white transition-colors">{lead.full_name}</p>
                  <p className="text-[10px] text-[#555] uppercase font-black tracking-widest mt-1">
                    {lead.page_source || 'Website'} • {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-[#333] mt-0.5 italic truncate max-w-[150px]">{lead.email}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <Clock size={32} className="text-[#1a1a1a]" />
                <p className="text-[#333] text-xs font-black uppercase tracking-widest">Awaiting New Signals</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => window.location.hash = '#/leads'}
            className="w-full mt-8 py-3 bg-[#111] hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-[#222] transition-all"
          >
            Access CRM
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
