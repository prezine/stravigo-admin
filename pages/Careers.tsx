
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { JobOpening } from '../types';
import { Plus, MapPin, Briefcase, Users, Clock, Trash2, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

const Careers: React.FC = () => {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('job_openings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setJobs(data);
    setLoading(false);
  };

  const toggleJobStatus = async (id: string, current: boolean) => {
    await supabase.from('job_openings').update({ is_active: !current }).eq('id', id);
    fetchJobs();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight">Culture & Careers</h2>
          <p className="text-[#888] mt-1">Manage open roles and recruitment pipelines.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-bold hover:bg-[#eee] transition-all">
          <Plus size={18} /> Add Role
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-20 text-center text-[#555]">Loading career listings...</div>
        ) : jobs.length === 0 ? (
          <div className="p-20 text-center bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-[#555]">No open roles currently listed.</div>
        ) : jobs.map(job => (
          <div key={job.id} className={`bg-[#0a0a0a] border transition-all p-6 rounded-xl flex items-center justify-between gap-6 ${job.is_active ? 'border-[#1a1a1a]' : 'border-red-900/20 opacity-60'}`}>
            <div className="flex gap-6 items-center">
              <div className={`p-4 rounded-xl ${job.is_active ? 'bg-white text-black' : 'bg-[#1a1a1a] text-[#555]'}`}>
                <Briefcase size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{job.role_title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#111] text-[#555] uppercase font-mono">{job.team}</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-[#555]">
                  <div className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</div>
                  <div className="flex items-center gap-1.5"><Users size={14} /> {job.business_division}</div>
                  <div className="flex items-center gap-1.5"><Clock size={14} /> {job.work_type}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <p className="text-xs font-bold text-[#555] uppercase tracking-widest mb-1">Status</p>
                <button 
                  onClick={() => toggleJobStatus(job.id, job.is_active)}
                  className={`flex items-center gap-2 text-sm font-semibold ${job.is_active ? 'text-green-500' : 'text-red-500'}`}
                >
                  {job.is_active ? <ToggleRight /> : <ToggleLeft />}
                  {job.is_active ? 'Active' : 'Hidden'}
                </button>
              </div>
              <button className="p-3 hover:bg-[#111] rounded-xl border border-[#1a1a1a] text-[#555] hover:text-white transition-colors">
                <Edit2 size={18} />
              </button>
              <button className="p-3 hover:bg-red-500/10 rounded-xl border border-[#1a1a1a] text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Careers;
