
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Lead } from '../types';
import { 
  Mail, 
  Phone, 
  Clock, 
  Building2, 
  Trash2, 
  Filter,
  MessageSquare,
  Loader2,
  ChevronDown,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
  }, [filterStatus]);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
      
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error: supabaseError } = await query;
      
      if (supabaseError) throw supabaseError;
      
      if (data) {
        setLeads(data);
      } else {
        setLeads([]);
      }
    } catch (err: any) {
      console.error("Lead fetch error:", err);
      setError(err.message || "Failed to fetch leads from Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (!error) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: status as any } : l));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Permanently remove this lead from the pipeline?')) {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (!error) setLeads(prev => prev.filter(l => l.id !== id));
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'new': return { label: 'New Inquiry', color: 'bg-blue-500', text: 'text-blue-500' };
      case 'contacted': return { label: 'Contacted', color: 'bg-yellow-500', text: 'text-yellow-500' };
      case 'converted': return { label: 'Converted', color: 'bg-green-500', text: 'text-green-500' };
      default: return { label: 'Archived', color: 'bg-[#333]', text: 'text-[#555]' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display italic">Lead Reservoir</h2>
          <p className="text-[#888] mt-1">Nurturing potential partnerships and global growth opportunities.</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-white transition-colors cursor-pointer"
          >
            <option value="all">All Channels</option>
            <option value="new">Unprocessed</option>
            <option value="contacted">In Dialogue</option>
            <option value="converted">Successes</option>
          </select>
          <button 
            onClick={fetchLeads} 
            className="p-2.5 bg-[#111] border border-[#1a1a1a] rounded-lg hover:border-white transition-all text-[#555] hover:text-white"
            title="Force Sync"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-500">
          <AlertCircle size={24} />
          <div>
            <p className="font-bold uppercase text-xs tracking-widest">Sync Failure</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="p-24 text-center text-[#555] flex flex-col items-center gap-6">
            <Loader2 className="animate-spin w-12 h-12 text-white/20" />
            <span className="uppercase tracking-[0.3em] font-black text-[10px]">Scanning Database Infrastructure</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-24 text-center text-[#222] bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl flex flex-col items-center gap-4">
            <AlertCircle size={48} strokeWidth={1} />
            <p className="uppercase tracking-widest font-black text-xs">No active inquiries found in the reservoir.</p>
          </div>
        ) : leads.map((lead) => {
          const status = getStatusDisplay(lead.status);
          return (
            <div key={lead.id} className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-2xl group hover:border-white/20 transition-all duration-500 shadow-xl">
              <div className="flex flex-col xl:flex-row justify-between gap-8">
                <div className="space-y-6 flex-1">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className={`w-3 h-3 rounded-full ${status.color} shadow-[0_0_15px_rgba(255,255,255,0.1)]`}></div>
                    <h3 className="text-3xl font-bold font-display tracking-tight text-white/90">{lead.full_name}</h3>
                    <div className="flex gap-2">
                      <span className="text-[9px] px-3 py-1.5 rounded bg-white/5 text-[#555] uppercase font-black tracking-widest border border-white/5">
                        {lead.service_interest || 'General'}
                      </span>
                      <span className="text-[9px] px-3 py-1.5 rounded bg-white/5 text-[#555] uppercase font-black tracking-widest border border-white/5">
                        {lead.page_source || 'Unknown Origin'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12 text-xs font-medium">
                    <div className="flex items-center gap-3 text-[#888] group/item">
                      <Mail size={16} strokeWidth={1.5} className="text-[#333] group-hover/item:text-white transition-colors" />
                      <a href={`mailto:${lead.email}`} className="hover:text-white transition-colors truncate underline decoration-white/10 underline-offset-4">{lead.email}</a>
                    </div>
                    {lead.phone_number && (
                      <div className="flex items-center gap-3 text-[#888] group/item">
                        <Phone size={16} strokeWidth={1.5} className="text-[#333] group-hover/item:text-white transition-colors" />
                        <span>{lead.phone_number}</span>
                      </div>
                    )}
                    {(lead.company || lead.title) && (
                      <div className="flex items-center gap-3 text-[#888] group/item">
                        <Building2 size={16} strokeWidth={1.5} className="text-[#333] group-hover/item:text-white transition-colors" />
                        <span className="line-clamp-1">{lead.company} {lead.title ? `(${lead.title})` : ''}</span>
                      </div>
                    )}
                  </div>

                  {lead.message && (
                    <div className="bg-[#050505] p-6 rounded-2xl border border-[#1a1a1a] relative group/msg overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/msg:opacity-10 transition-opacity">
                         <MessageSquare size={48} />
                      </div>
                      <p className="text-[10px] text-[#333] uppercase tracking-[0.2em] font-black mb-4 flex items-center gap-2">
                        Strategic Intent
                      </p>
                      <p className="text-sm leading-relaxed text-[#aaa] relative z-10 font-medium italic">"{lead.message}"</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end justify-between gap-8 shrink-0 pt-2">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#222] mb-2">Timestamp</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#555]">
                      <Clock size={12} />
                      {new Date(lead.created_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative group/status">
                      <button className={`flex items-center gap-3 px-6 py-2.5 rounded-full border border-[#1a1a1a] text-[10px] font-black uppercase tracking-[0.2em] hover:border-white hover:bg-white hover:text-black transition-all duration-300`}>
                        {status.label} <ChevronDown size={14} />
                      </button>
                      <div className="absolute right-0 bottom-full mb-3 w-56 bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl opacity-0 translate-y-4 pointer-events-none group-hover/status:opacity-100 group-hover/status:translate-y-0 group-hover/status:pointer-events-auto transition-all z-30">
                        <div className="px-4 py-3 border-b border-[#1a1a1a] bg-[#111]">
                          <p className="text-[9px] font-black text-[#444] uppercase tracking-widest">Escalate Status</p>
                        </div>
                        {['new', 'contacted', 'converted', 'archived'].map((s) => (
                          <button 
                            key={s} 
                            onClick={() => updateStatus(lead.id, s)}
                            className="w-full px-5 py-4 text-left text-[10px] uppercase font-bold tracking-widest text-[#555] hover:text-white hover:bg-white/5 transition-all border-b border-[#1a1a1a] last:border-0"
                          >
                            Mark as {s.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(lead.id)}
                      className="p-3.5 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-all border border-red-500/10 shadow-lg hover:shadow-red-500/20"
                      title="Purge Lead"
                    >
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leads;
