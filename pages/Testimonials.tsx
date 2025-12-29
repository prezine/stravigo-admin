
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Testimonial } from '../types';
import { 
  Quote, 
  Star, 
  Trash2, 
  User, 
  Loader2, 
  Plus, 
  XCircle, 
  CheckCircle2, 
  Edit2, 
  Layers,
  ShieldCheck,
  Building2,
  Briefcase
} from 'lucide-react';

const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingT, setEditingT] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setTestimonials(data);
    setLoading(false);
  };

  const handleEdit = (t: Testimonial) => {
    setEditingT(t);
    setIsEditorOpen(true);
  };

  const handleNew = () => {
    setEditingT({ 
      feedback: '', 
      customer_name: '', 
      designation: '',
      company: '',
      service_type: 'Stravigo For Business',
      is_approved: true, 
      is_anonymous: false,
      is_featured: false
    });
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingT) return;
    setSaving(true);

    let error;
    if (editingT.id) {
      const { error: err } = await supabase
        .from('testimonials')
        .update(editingT)
        .eq('id', editingT.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('testimonials')
        .insert([editingT]);
      error = err;
    }

    setSaving(false);
    if (!error) {
      setIsEditorOpen(false);
      fetchTestimonials();
    } else {
      alert('Error saving testimonial: ' + error.message);
    }
  };

  const toggleStatus = async (id: string, field: 'is_approved' | 'is_featured', current: boolean) => {
    const { error } = await supabase.from('testimonials').update({ [field]: !current }).eq('id', id);
    if (!error) {
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, [field]: !current } : t));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently remove this testimonial from the records?')) {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (!error) setTestimonials(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight italic">Social Proof & Praise</h2>
          <p className="text-[#888] mt-1">Curating the voices of market leaders who believe in the Stravigo magic.</p>
        </div>
        <button 
          onClick={handleNew}
          className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#eee] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <Plus size={18} /> Add Strategic Feedback
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-24 text-center text-[#555] flex flex-col items-center gap-4">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest">Scanning Social Proof Archive</span>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-[#0a0a0a] border border-dashed border-[#1a1a1a] rounded-3xl text-[#222] flex flex-col items-center gap-4">
            <Quote size={48} strokeWidth={1} />
            <p className="text-xs font-black uppercase tracking-widest">Awaiting first customer endorsement.</p>
          </div>
        ) : testimonials.map((t) => (
          <div key={t.id} className={`bg-[#0a0a0a] border ${t.is_approved ? 'border-[#1a1a1a]' : 'border-red-900/20 opacity-60'} p-8 rounded-3xl relative group transition-all hover:border-white/10 flex flex-col`}>
            <Quote className="absolute top-6 right-6 text-white/5 group-hover:text-white/10 transition-colors" size={56} />
            
            <div className="relative z-10 flex flex-col h-full space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill="white" className="text-white" />)}
                </div>
                {t.service_type && (
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/5 rounded text-[#555]">
                    {t.service_type}
                  </span>
                )}
              </div>
              
              <p className="text-sm leading-relaxed text-[#eee] italic flex-1">
                "{t.feedback}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center border border-white/5 shrink-0">
                  <User size={20} className="text-[#333]" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white leading-tight truncate">{t.is_anonymous ? 'Anonymous' : t.customer_name}</p>
                  <p className="text-[10px] text-[#555] font-black uppercase tracking-widest truncate mt-0.5">
                    {t.designation} {t.company ? `@ ${t.company}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleStatus(t.id, 'is_approved', t.is_approved)}
                    className={`px-3 py-1.5 text-[9px] font-black rounded-lg border uppercase tracking-widest transition-all ${t.is_approved ? 'bg-white text-black border-white' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                  >
                    {t.is_approved ? 'Public' : 'Hidden'}
                  </button>
                  <button 
                    onClick={() => toggleStatus(t.id, 'is_featured', t.is_featured)}
                    className={`px-3 py-1.5 text-[9px] font-black rounded-lg border uppercase tracking-widest transition-all ${t.is_featured ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20' : 'bg-black text-[#333] border-[#1a1a1a]'}`}
                  >
                    Featured
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(t)} className="p-2 text-[#222] hover:text-white transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-[#222] hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-2xl rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="px-10 py-6 border-b border-[#1a1a1a] flex justify-between items-center bg-[#0d0d0d]">
              <div>
                <h3 className="font-bold font-display italic text-2xl">{editingT?.id ? 'Refine Praise' : 'Add Strategic Feedback'}</h3>
                <p className="text-[10px] text-[#555] uppercase tracking-[0.2em] font-black mt-1">Customer Experience Intelligence</p>
              </div>
              <button onClick={() => setIsEditorOpen(false)}><XCircle size={24} className="text-[#333] hover:text-white transition-colors" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">The Feedback (Customer's Voice)</label>
                <textarea 
                  placeholder="Capture the raw impact..." 
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl p-6 text-sm italic leading-relaxed focus:border-white outline-none transition-all" 
                  rows={5}
                  required
                  value={editingT?.feedback || ''}
                  onChange={e => setEditingT({...editingT!, feedback: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">Customer Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
                    <input 
                      type="text"
                      placeholder="e.g., Precious Tom" 
                      className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-12 py-3.5 text-sm font-bold focus:border-white outline-none" 
                      value={editingT?.customer_name || ''}
                      onChange={e => setEditingT({...editingT!, customer_name: e.target.value})}
                      required={!editingT?.is_anonymous}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">Service Playground</label>
                  <div className="relative">
                    <Layers size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
                    <select 
                      className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-12 py-3.5 text-sm font-bold focus:border-white outline-none appearance-none cursor-pointer"
                      value={editingT?.service_type || 'Stravigo For Business'}
                      onChange={e => setEditingT({...editingT!, service_type: e.target.value})}
                    >
                      <option value="Stravigo For Business">Stravigo For Business</option>
                      <option value="Stravigo For Individuals">Stravigo For Individuals</option>
                      <option value="Stravigo For Entertainment">Stravigo For Entertainment</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">Designation (Role)</label>
                  <div className="relative">
                    <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
                    <input 
                      type="text"
                      placeholder="e.g., CEO / Founder" 
                      className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-12 py-3.5 text-sm font-bold focus:border-white outline-none" 
                      value={editingT?.designation || ''}
                      onChange={e => setEditingT({...editingT!, designation: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">Company</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
                    <input 
                      type="text"
                      placeholder="e.g., Pandascrow Inc" 
                      className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-12 py-3.5 text-sm font-bold focus:border-white outline-none" 
                      value={editingT?.company || ''}
                      onChange={e => setEditingT({...editingT!, company: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-8 items-center bg-[#0d0d0d] border border-white/5 p-6 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${editingT?.is_anonymous ? 'bg-white' : 'bg-[#222]'}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${editingT?.is_anonymous ? 'translate-x-5 bg-black' : ''}`}></div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={editingT?.is_anonymous || false}
                    onChange={e => setEditingT({...editingT!, is_anonymous: e.target.checked})}
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#444]">Anonymous Posting</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${editingT?.is_featured ? 'bg-yellow-500' : 'bg-[#222]'}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${editingT?.is_featured ? 'translate-x-5' : ''}`}></div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={editingT?.is_featured || false}
                    onChange={e => setEditingT({...editingT!, is_featured: e.target.checked})}
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#444]">Pin to Highlights</span>
                </label>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsEditorOpen(false)} 
                  className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                  disabled={saving}
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="px-12 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-[#eee] transition-all flex items-center gap-2 shadow-xl"
                  disabled={saving}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  {saving ? 'Syncing...' : (editingT?.id ? 'Save Changes' : 'Publish Praise')}
                </button>
              </div>
            </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
