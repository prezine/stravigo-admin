
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
  Globe,
  Building,
  Mail,
  FileText,
  ExternalLink,
  ChevronDown,
  UserCircle,
  ClipboardList
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

      {activeTab === 'vacancies' ? (
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
              <div key={job.id} className={`bg-[#0a0a0a] border transition-all p-8 rounded-3xl flex items-center justify-between gap-6 group ${job.is_active ? 'border-[#1a1a1a] hover:border-white/10' : 'border-red-900/10 opacity-60 shadow-inner'}`}>
                <div className="flex gap-8 items-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 border border-white/5 ${job.is_active ? 'bg-white/5 text-white group-hover:bg-white group-hover:text-black' : 'bg-[#111] text-[#333]'}`}>
                    <Briefcase size={28} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold font-display italic tracking-tight">{job.role_title}</h3>
                      <span className="text-[9px] px-3 py-1 rounded bg-white/5 text-[#555] uppercase font-black tracking-[0.2em] border border-white/5">{job.team}</span>
                    </div>
                    <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-[#444]">
                      <div className="flex items-center gap-2"><MapPin size={14} className="text-[#222]" /> {job.location}</div>
                      <div className="flex items-center gap-2"><Users size={14} className="text-[#222]" /> {job.business_division}</div>
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
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="py-24 text-center text-[#555] flex flex-col items-center gap-4">
                 <Loader2 className="animate-spin" />
                 <span className="text-[10px] uppercase font-black tracking-