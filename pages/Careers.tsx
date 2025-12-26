
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { JobOpening } from '../types';
import { 
  Plus, 
  MapPin, 
  Briefcase, 
  Users, 
  Clock, 
  Trash2, 
  Edit2, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  XCircle,
  Save,
  CheckCircle2,
  Globe,
  Building
} from 'lucide-react';

const Careers: React.FC = () => {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<JobOpening> | null>(null);
  const [saving, setSaving] = useState(false);

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

  const handleEdit = (job: JobOpening) => {
    setEditingJob(job);
    setIsEditorOpen(true);
  };

  const handleNew = () => {
    setEditingJob({
      role_title: '',
      business_division: 'Strategy & BD',
      team: 'Operations',
      work_type: 'Hybrid',
      location: 'Lagos, Nigeria',
      description: '',
      is_active: true
    });
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setSaving(true);

    let error;
    if (editingJob.id) {
      const { error: err } = await supabase
        .from('job_openings')
        .update(editingJob)
        .eq('id', editingJob.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('job_openings')
        .insert([editingJob]);
      error = err;
    }

    setSaving(false);
    if (!error) {
      setIsEditorOpen(false);
      fetchJobs();
    } else {
      alert('Recruitment system error: ' + error.message);
    }
  };

  const toggleJobStatus = async (id: string, current: boolean) => {
    await supabase.from('job_openings').update({ is_active: !current }).eq('id', id);
    fetchJobs();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently close this vacancy? This will remove it from the public listings.')) {
      const { error } = await supabase.from('job_openings').delete().eq('id', id);
      if (!error) fetchJobs();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight">Culture & Careers</h2>
          <p className="text-[#888] mt-1">Manage open roles and recruitment pipelines for doers and dreamers.</p>
        </div>
        <button 
          onClick={handleNew}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-bold hover:bg-[#eee] transition-all"
        >
          <Plus size={18} /> Publish New Role
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-24 text-center text-[#555] flex flex-col items-center gap-4">
             <Loader2 className="animate-spin" />
             <span className="text-[10px] uppercase font-black tracking-widest">Scanning Talent Pipeline</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-24 text-center bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl text-[#222] flex flex-col items-center gap-4">
            <Users size={48} strokeWidth={1} />
            <p className="text-xs font-black uppercase tracking-widest">No active vacancies currently listed.</p>
          </div>
        ) : jobs.map(job => (
          <div key={job.id} className={`bg-[#0a0a0a] border transition-all p-6 rounded-2xl flex items-center justify-between gap-6 group ${job.is_active ? 'border-[#1a1a1a] hover:border-white/10' : 'border-red-900/10 opacity-60'}`}>
            <div className="flex gap-6 items-center">
              <div className={`p-4 rounded-xl transition-all duration-500 ${job.is_active ? 'bg-white/5 text-white group-hover:bg-white group-hover:text-black' : 'bg-[#111] text-[#333]'}`}>
                <Briefcase size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-display italic tracking-tight">{job.role_title}</h3>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-[#111] text-[#555] uppercase font-black tracking-widest border border-white/5">{job.team}</span>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-[#555]">
                  <div className="flex items-center gap-1.5"><MapPin size={12} className="text-[#333]" /> {job.location}</div>
                  <div className="flex items-center gap-1.5"><Users size={12} className="text-[#333]" /> {job.business_division}</div>
                  <div className="flex items-center gap-1.5"><Clock size={12} className="text-[#333]" /> {job.work_type}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right mr-6">
                <p className="text-[9px] font-black text-[#222] uppercase tracking-widest mb-1">Visibility</p>
                <button 
                  onClick={() => toggleJobStatus(job.id, job.is_active)}
                  className={`flex items-center gap-2 text-xs font-bold ${job.is_active ? 'text-green-500' : 'text-red-500'}`}
                >
                  {job.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  {job.is_active ? 'Active' : 'Archived'}
                </button>
              </div>
              <button 
                onClick={() => handleEdit(job)}
                className="p-3.5 hover:bg-white hover:text-black rounded-xl border border-[#1a1a1a] text-[#555] transition-all"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => handleDelete(job.id)}
                className="p-3.5 hover:bg-red-500/10 rounded-xl border border-[#1a1a1a] text-[#222] hover:text-red-500 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Role Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl flex flex-col shadow-2xl">
            <div className="px-10 py-6 border-b border-[#1a1a1a] flex justify-between items-center bg-[#0d0d0d]">
              <div>
                <h3 className="text-2xl font-bold font-display italic">{editingJob?.id ? 'Refine Vacancy' : 'New Career Path'}</h3>
                <p className="text-[10px] text-[#555] uppercase tracking-[0.2em] font-black mt-1">Stravigo Recruitment Hub</p>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <XCircle size={28} className="text-[#333] hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <label className="text-[10px] uppercase font-black tracking-widest text-[#333]">Role Title</label>
                <input 
                  type="text" 
                  value={editingJob?.role_title} 
                  onChange={e => setEditingJob({...editingJob!, role_title: e.target.value})}
                  className="w-full bg-[#111] border border-[#1a1a1a] rounded-2xl px-6 py-4 focus:border-white outline-none font-bold text-xl transition-all"
                  placeholder="e.g., Lead Brand Strategist"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#333]">Business Division</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
                    <select 
                      value={editingJob?.business_division} 
                      onChange={e => setEditingJob({...editingJob!, business_division: e.target.value})}
                      className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-12 py-3.5 focus:border-white outline-none text-sm appearance-none font-semibold transition-all"
                    >
                      <option>Strategy & BD</option>
                      <option>Creative & Content</option>
                      <option>Digital & Tech</option>
                      <option>PR & Media</option>
                      <option>Operations</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#333]">Team</label>
                  <div className="relative">
                    <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
                    <input 
                      type="text" 
                      value={editingJob?.team} 
                      onChange={e => setEditingJob({...editingJob!, team: e.target.value})}
                      className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-12 py-3.5 focus:border-white outline-none text-sm font-semibold transition-all"
                      placeholder="e.g., Creative Design"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#333]">Work Type</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
                    <select 
                      value={editingJob?.work_type} 
                      onChange={e => setEditingJob({...editingJob!, work_type: e.target.value})}
                      className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-12 py-3.5 focus:border-white outline-none text-sm appearance-none font-semibold transition-all"
                    >
                      <option>Full-time</option>
                      <option>Contract</option>
                      <option>Hybrid</option>
                      <option>Remote</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#333]">Location</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
                    <input 
                      type="text" 
                      value={editingJob?.location} 
                      onChange={e => setEditingJob({...editingJob!, location: e.target.value})}
                      className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-12 py-3.5 focus:border-white outline-none text-sm font-semibold transition-all"
                      placeholder="e.g., Lagos, Nigeria"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase font-black tracking-widest text-[#333]">Role Context & Overview</label>
                <textarea 
                  rows={8}
                  value={editingJob?.description} 
                  onChange={e => setEditingJob({...editingJob!, description: e.target.value})}
                  className="w-full bg-[#111] border border-[#1a1a1a] rounded-2xl px-6 py-4 focus:border-white outline-none text-sm leading-relaxed transition-all"
                  placeholder="Detail the expectations, responsibilities, and requirements..."
                  required
                />
              </div>

              <div className="pt-8 flex justify-between items-center border-t border-[#1a1a1a]">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${editingJob?.is_active ? 'bg-green-500' : 'bg-[#222]'}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${editingJob?.is_active ? 'translate-x-5' : ''}`}></div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={editingJob?.is_active}
                    onChange={e => setEditingJob({...editingJob!, is_active: e.target.checked})}
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#444]">Accepting Applications</span>
                </label>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsEditorOpen(false)} className="px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all">Discard</button>
                  <button 
                    type="submit" 
                    className="px-10 py-3 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-[#eee] transition-all flex items-center gap-2"
                    disabled={saving}
                  >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    {saving ? 'Synchronizing...' : 'Save & Publish'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Careers;
