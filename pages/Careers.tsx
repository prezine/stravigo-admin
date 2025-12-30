
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { JobOpening, Applicant } from '../types';
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
  Building,
  Mail,
  FileText,
  ExternalLink,
  ChevronDown,
  UserCircle,
  ClipboardList,
  Phone,
  Linkedin,
  Globe,
  ArrowUpRight,
  AlignLeft
} from 'lucide-react';

const Careers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vacancies' | 'applicants'>('vacancies');
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<JobOpening> | null>(null);
  const [viewingApplicant, setViewingApplicant] = useState<Applicant | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTab === 'vacancies') {
      fetchJobs();
    } else {
      fetchApplicants();
    }
  }, [activeTab]);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('job_openings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setJobs(data);
    setLoading(false);
  };

  const fetchApplicants = async () => {
    setLoading(true);
    // Explicitly fetching job_openings(role_title) to display which role they applied for
    const { data, error } = await supabase
      .from('job_applicants')
      .select('*, job_openings(role_title)')
      .order('created_at', { ascending: false });
    
    if (data) setApplicants(data);
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
      excerpt: '',
      is_active: true
    });
    setIsEditorOpen(true);
  };

  const handleViewApplicant = (applicant: Applicant) => {
    setViewingApplicant(applicant);
    setIsApplicantModalOpen(true);
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

  const updateApplicantStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('job_applicants')
      .update({ status })
      .eq('id', id);
    
    if (!error) {
      setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a));
      if (viewingApplicant?.id === id) {
        setViewingApplicant(prev => prev ? { ...prev, status: status as any } : null);
      }
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

  const handleDeleteApplicant = async (id: string) => {
    if (confirm('Are you sure you want to remove this applicant from the talent pool?')) {
      const { error } = await supabase.from('job_applicants').delete().eq('id', id);
      if (!error) fetchApplicants();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-500/10 text-blue-500',
      reviewed: 'bg-purple-500/10 text-purple-500',
      interviewing: 'bg-yellow-500/10 text-yellow-500',
      hired: 'bg-green-500/10 text-green-500',
      rejected: 'bg-red-500/10 text-red-500',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${styles[status] || 'bg-[#1a1a1a] text-[#555]'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold font-display tracking-tighter italic">Human Strategy</h2>
          <p className="text-[#888] mt-2 max-w-xl">Curating a workforce of doers, dreamers, and culturally intelligent disruptors.</p>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
          <button 
            onClick={() => setActiveTab('vacancies')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'vacancies' ? 'bg-white text-black' : 'text-[#555] hover:text-white'}`}
          >
            Vacancies
          </button>
          <button 
            onClick={() => setActiveTab('applicants')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'applicants' ? 'bg-white text-black' : 'text-[#555] hover:text-white'}`}
          >
            Talent Pool
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center text-[#555] flex flex-col items-center gap-6">
           <Loader2 className="animate-spin w-12 h-12 text-white/20" />
           <span className="text-[10px] uppercase font-black tracking-[0.3em]">Synchronizing Talent Pipeline</span>
        </div>
      ) : activeTab === 'vacancies' ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={handleNew}
              className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#eee] transition-all shadow-lg"
            >
              <Plus size={18} /> Publish New Role
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {jobs.length === 0 ? (
              <div className="p-24 text-center bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl text-[#222] flex flex-col items-center gap-4">
                <Users size={48} strokeWidth={1} />
                <p className="text-xs font-black uppercase tracking-widest">No active vacancies currently listed.</p>
              </div>
            ) : jobs.map(job => (
              <div key={job.id} className={`bg-[#0a0a0a] border transition-all p-8 rounded-3xl flex items-center justify-between gap-6 group ${job.is_active ? 'border-[#1a1a1a] hover:border-white/10' : 'border-red-900/10 opacity-60 shadow-inner'}`}>
                <div className="flex gap-8 items-center flex-1">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 border border-white/5 ${job.is_active ? 'bg-white/5 text-white group-hover:bg-white group-hover:text-black' : 'bg-[#111] text-[#333]'}`}>
                    <Briefcase size={28} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold font-display italic tracking-tight">{job.role_title}</h3>
                      <span className="text-[9px] px-3 py-1 rounded bg-white/5 text-[#555] uppercase font-black tracking-[0.2em] border border-white/5">{job.team}</span>
                    </div>
                    {job.excerpt && (
                      <p className="text-sm text-[#888] line-clamp-1 max-w-2xl font-medium mb-2 italic">
                        {job.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-[#444]">
                      <div className="flex items-center gap-2"><MapPin size={14} className="text-[#222]" /> {job.location}</div>
                      <div className="flex items-center gap-2"><Building size={14} className="text-[#222]" /> {job.business_division}</div>
                      <div className="flex items-center gap-2"><Clock size={14} className="text-[#222]" /> {job.work_type}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right mr-8">
                    <p className="text-[9px] font-black text-[#222] uppercase tracking-[0.3em] mb-2">Visibility</p>
                    <button 
                      onClick={() => toggleJobStatus(job.id, job.is_active)}
                      className={`flex items-center gap-2 text-xs font-bold transition-colors ${job.is_active ? 'text-green-500 hover:text-green-400' : 'text-red-500 hover:text-red-400'}`}
                    >
                      {job.is_active ? <ToggleRight size={28} strokeWidth={1.5} /> : <ToggleLeft size={28} strokeWidth={1.5} />}
                      {job.is_active ? 'Accepting' : 'Paused'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(job)}
                      className="p-4 bg-[#0a0a0a] hover:bg-white hover:text-black rounded-2xl border border-[#1a1a1a] text-[#555] transition-all"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(job.id)}
                      className="p-4 bg-[#0a0a0a] hover:bg-red-500/10 rounded-2xl border border-[#1a1a1a] text-[#222] hover:text-red-500 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase tracking-widest text-[#444] border-b border-[#1a1a1a]">
                <tr>
                  <th className="px-8 py-5 font-black">Candidate</th>
                  <th className="px-8 py-5 font-black">Applied Role</th>
                  <th className="px-8 py-5 font-black">Phase</th>
                  <th className="px-8 py-5 font-black">Applied On</th>
                  <th className="px-8 py-5 font-black text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {applicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-[#222] italic text-sm">
                      No applications have been submitted to the Stravigo talent engine yet.
                    </td>
                  </tr>
                ) : applicants.map((applicant) => (
                  <tr key={applicant.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#111] to-[#222] border border-white/5 flex items-center justify-center text-white/30 group-hover:text-white transition-colors">
                          <UserCircle size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">{applicant.full_name}</p>
                          <p className="text-[10px] text-[#444] font-medium mt-0.5">{applicant.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-[#888]">{applicant.job_openings?.role_title || 'General Application'}</span>
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(applicant.status)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#333]">
                        <Clock size={12} />
                        {new Date(applicant.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleViewApplicant(applicant)}
                          className="px-4 py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#eee] transition-all"
                        >
                          Review Detail
                        </button>
                        <button 
                          onClick={() => handleDeleteApplicant(applicant.id)}
                          className="p-2 text-[#222] hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vacancy Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-10 py-8 border-b border-[#1a1a1a] flex justify-between items-center bg-[#0d0d0d]">
              <div>
                <h3 className="text-2xl font-bold font-display italic tracking-tight">{editingJob?.id ? 'Refine Vacancy' : 'New Career Opportunity'}</h3>
                <p className="text-[10px] text-[#555] uppercase tracking-[0.3em] font-black mt-1">Stravigo Organizational Intelligence</p>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <XCircle size={32} className="text-[#333] hover:text-white" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">Role Title</label>
                  <input 
                    type="text" 
                    value={editingJob?.role_title} 
                    onChange={e => setEditingJob({...editingJob!, role_title: e.target.value})}
                    className="w-full bg-[#111] border border-[#1a1a1a] rounded-2xl px-6 py-4 focus:border-white outline-none font-bold text-lg"
                    placeholder="e.g., Lead Strategist"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">Team / Department</label>
                  <input 
                    type="text" 
                    value={editingJob?.team} 
                    onChange={e => setEditingJob({...editingJob!, team: e.target.value})}
                    className="w-full bg-[#111] border border-[#1a1a1a] rounded-2xl px-6 py-4 focus:border-white outline-none font-bold"
                    placeholder="e.g., Creative Intelligence"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">Division</label>
                  <select 
                    value={editingJob?.business_division} 
                    onChange={e => setEditingJob({...editingJob!, business_division: e.target.value})}
                    className="w-full bg-[#111] border border-[#1a1a1a] rounded-2xl px-6 py-4 focus:border-white outline-none text-sm appearance-none font-bold cursor-pointer"
                  >
                    <option>Strategy & BD</option>
                    <option>Creative & Brand</option>
                    <option>Operations</option>
                    <option>Tech & Innovation</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">Work Style</label>
                  <select 
                    value={editingJob?.work_type} 
                    onChange={e => setEditingJob({...editingJob!, work_type: e.target.value})}
                    className="w-full bg-[#111] border border-[#1a1a1a] rounded-2xl px-6 py-4 focus:border-white outline-none text-sm appearance-none font-bold cursor-pointer"
                  >
                    <option>Hybrid</option>
                    <option>Remote</option>
                    <option>On-site</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">Location</label>
                  <input 
                    type="text" 
                    value={editingJob?.location} 
                    onChange={e => setEditingJob({...editingJob!, location: e.target.value})}
                    className="w-full bg-[#111] border border-[#1a1a1a] rounded-2xl px-6 py-4 focus:border-white outline-none text-sm font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-[#444] font-black flex items-center gap-2">
                  <AlignLeft size={14} /> Short Preview (excerpt)
                </label>
                <textarea 
                  rows={2}
                  value={editingJob?.excerpt} 
                  onChange={e => setEditingJob({...editingJob!, excerpt: e.target.value})}
                  className="w-full bg-[#111] border border-[#1a1a1a] rounded-2xl px-8 py-6 focus:border-white outline-none text-sm leading-relaxed italic"
                  placeholder="Summarize the core impact of this role in 1-2 sentences..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">Job Description (Markdown Enabled)</label>
                <textarea 
                  rows={10}
                  value={editingJob?.description} 
                  onChange={e => setEditingJob({...editingJob!, description: e.target.value})}
                  className="w-full bg-[#111] border border-[#1a1a1a] rounded-3xl px-8 py-8 focus:border-white outline-none text-sm leading-relaxed font-mono"
                  placeholder="## Responsibilities... \n - Drive strategic value..."
                  required
                />
              </div>

              <div className="flex justify-end gap-6 pt-8 border-t border-[#1a1a1a]">
                <button type="button" onClick={() => setIsEditorOpen(false)} className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-[#444] hover:text-white" disabled={saving}>Discard Draft</button>
                <button 
                  type="submit" 
                  className="px-14 py-4 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-[#eee] transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] flex items-center gap-2"
                  disabled={saving}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Syncing...' : 'Deploy Vacancy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicant Viewer Modal */}
      {isApplicantModalOpen && viewingApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-5xl h-[90vh] rounded-[2.5rem] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-12 py-10 border-b border-[#1a1a1a] flex justify-between items-start bg-[#0d0d0d]">
              <div className="flex gap-8 items-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-white/5 to-white/10 flex items-center justify-center text-white border border-white/10 shadow-xl">
                  <UserCircle size={48} strokeWidth={1} />
                </div>
                <div>
                  <h3 className="text-4xl font-bold font-display italic tracking-tight">{viewingApplicant.full_name}</h3>
                  <p className="text-xs text-white/40 mt-1 uppercase font-black tracking-widest flex items-center gap-2">
                    <Briefcase size={12} /> Applied for: <span className="text-white">{viewingApplicant.job_openings?.role_title || 'General'}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <button onClick={() => setIsApplicantModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <XCircle size={32} className="text-[#333] hover:text-white" />
                </button>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/5">
                  {(['new', 'reviewed', 'interviewing', 'hired', 'rejected'] as const).map(s => (
                    <button 
                      key={s}
                      onClick={() => updateApplicantStatus(viewingApplicant.id, s)}
                      className={`px-3 py-1 text-[8px] font-black uppercase tracking-tighter rounded-full transition-all ${viewingApplicant.status === s ? 'bg-white text-black' : 'text-[#444] hover:text-white'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 space-y-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#333] border-b border-white/5 pb-2">Intelligence Brief</h4>
                    <div className="space-y-5">
                      <div className="flex items-start gap-4 group">
                        <div className="p-2 bg-white/5 rounded-lg text-[#333] group-hover:text-white transition-colors">
                          <Mail size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-[#333] uppercase">Email Infrastructure</p>
                          <a href={`mailto:${viewingApplicant.email}`} className="text-sm font-bold text-[#888] hover:text-white transition-colors underline decoration-white/10">{viewingApplicant.email}</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 group">
                        <div className="p-2 bg-white/5 rounded-lg text-[#333] group-hover:text-white transition-colors">
                          <Phone size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-[#333] uppercase">Voice Connectivity</p>
                          <p className="text-sm font-bold text-[#888]">{viewingApplicant.phone || 'Not Provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 group">
                        <div className="p-2 bg-white/5 rounded-lg text-[#333] group-hover:text-white transition-colors">
                          <Linkedin size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-[#333] uppercase">Professional Profile</p>
                          {viewingApplicant.linkedin_url ? (
                             <a href={viewingApplicant.linkedin_url} target="_blank" className="text-sm font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1">LinkedIn <ExternalLink size={12} /></a>
                          ) : <p className="text-sm font-bold text-[#333]">Not Listed</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#333] border-b border-white/5 pb-2">Asset Vault</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <a 
                        href={viewingApplicant.resume_url} 
                        target="_blank" 
                        className="flex items-center justify-between p-4 bg-[#111] border border-[#1a1a1a] rounded-2xl hover:border-white/20 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-[#333] group-hover:text-white" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Master Resume</span>
                        </div>
                        <ArrowUpRight size={14} className="text-[#222]" />
                      </a>
                      {viewingApplicant.portfolio_url && (
                        <a 
                          href={viewingApplicant.portfolio_url} 
                          target="_blank" 
                          className="flex items-center justify-between p-4 bg-[#111] border border-[#1a1a1a] rounded-2xl hover:border-white/20 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Globe size={18} className="text-[#333] group-hover:text-white" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Portfolio Archive</span>
                          </div>
                          <ArrowUpRight size={14} className="text-[#222]" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#333]">Recruitment Questionnaire</h4>
                       <div className="flex items-center gap-2 text-[10px] text-[#222] font-black uppercase tracking-widest">
                         <ClipboardList size={12} />
                         {viewingApplicant.answers?.length || 0} Responses
                       </div>
                    </div>
                    
                    <div className="space-y-8">
                      {viewingApplicant.answers && viewingApplicant.answers.length > 0 ? (
                        viewingApplicant.answers.map((qa, index) => (
                          <div key={index} className="space-y-3 bg-[#0d0d0d] p-8 rounded-[2rem] border border-white/5 relative group">
                            <div className="absolute -left-3 top-8 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-black shadow-xl">
                              {index + 1}
                            </div>
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] leading-relaxed">
                              {qa.question}
                            </h5>
                            <p className="text-sm leading-relaxed text-[#aaa] font-medium border-l border-white/5 pl-4 py-1 italic">
                              "{qa.answer}"
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="py-20 text-center border border-dashed border-[#1a1a1a] rounded-[2rem] bg-[#050505]/50 flex flex-col items-center gap-4">
                          <CheckCircle2 size={32} className="text-[#1a1a1a]" />
                          <p className="text-xs font-black uppercase tracking-widest text-[#333]">No structured responses detected.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-12 py-8 bg-[#0d0d0d] border-t border-[#1a1a1a] flex justify-between items-center shrink-0">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#333]">Internal Reference: {viewingApplicant.id}</p>
               <div className="flex gap-4">
                 <button className="px-10 py-3 bg-[#111] text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 hover:border-white/20 transition-all">Download Dossier</button>
                 <button 
                  onClick={() => window.open(`mailto:${viewingApplicant.email}`)}
                  className="px-10 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#eee] transition-all shadow-xl"
                 >
                   Initiate Interview
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Careers;
