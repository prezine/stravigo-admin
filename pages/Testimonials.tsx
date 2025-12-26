
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Testimonial } from '../types';
import { Quote, Star, Trash2, User, Loader2, Plus, XCircle, CheckCircle2 } from 'lucide-react';

const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingT, setEditingT] = useState<Partial<Testimonial> | null>(null);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingT) return;
    const { error } = await supabase.from('testimonials').insert([editingT]);
    if (!error) {
      setIsEditorOpen(false);
      fetchTestimonials();
    }
  };

  const toggleStatus = async (id: string, field: 'is_approved' | 'is_featured', current: boolean) => {
    const { error } = await supabase.from('testimonials').update({ [field]: !current }).eq('id', id);
    if (!error) {
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, [field]: !current } : t));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this testimonial?')) {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (!error) setTestimonials(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight">Social Proof</h2>
          <p className="text-[#888] mt-1">Voices that believe in the Stravigo magic.</p>
        </div>
        <button 
          onClick={() => { setEditingT({ feedback: '', customer_name: '', is_approved: true, is_anonymous: false }); setIsEditorOpen(true); }}
          className="px-6 py-2.5 bg-white text-black rounded-full font-bold hover:bg-[#eee] transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Add Feedback
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-[#555] flex flex-col items-center gap-2">
            <Loader2 className="animate-spin" /> Fetching testimonials...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-[#0a0a0a] border border-dashed border-[#1a1a1a] rounded-xl text-[#555]">
            No testimonials found.
          </div>
        ) : testimonials.map((t) => (
          <div key={t.id} className={`bg-[#0a0a0a] border ${t.is_approved ? 'border-[#1a1a1a]' : 'border-red-900/20 opacity-60'} p-6 rounded-xl relative group transition-all`}>
            <Quote className="absolute top-4 right-4 text-[#111]" size={40} />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill="white" className="text-white" />)}
              </div>
              
              <p className="text-sm leading-relaxed text-[#eee] italic mb-8 flex-1">
                "{t.feedback}"
              </p>

              <div className="flex items-center gap-3 pt-6 border-t border-[#1a1a1a]">
                <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center border border-[#1a1a1a]">
                  <User size={18} className="text-[#555]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{t.is_anonymous ? 'Anonymous' : t.customer_name}</p>
                  <p className="text-[9px] text-[#444] uppercase font-black tracking-widest">{t.designation} {t.company ? `@ ${t.company}` : ''}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleStatus(t.id, 'is_approved', t.is_approved)}
                    className={`px-3 py-1 text-[9px] font-black rounded-full border uppercase tracking-widest transition-all ${t.is_approved ? 'bg-white text-black border-white' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                  >
                    {t.is_approved ? 'Live' : 'Hidden'}
                  </button>
                  <button 
                    onClick={() => toggleStatus(t.id, 'is_featured', t.is_featured)}
                    className={`px-3 py-1 text-[9px] font-black rounded-full border uppercase tracking-widest transition-all ${t.is_featured ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20' : 'bg-black text-[#555] border-[#1a1a1a]'}`}
                  >
                    Featured
                  </button>
                </div>
                <button onClick={() => handleDelete(t.id)} className="text-[#333] hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-lg rounded-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#1a1a1a] flex justify-between items-center">
              <h3 className="font-bold font-display text-lg">New Testimonial</h3>
              <button onClick={() => setIsEditorOpen(false)}><XCircle className="text-[#333]" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <textarea 
                placeholder="The feedback..." 
                className="w-full bg-[#111] border border-[#222] rounded-lg p-3 text-sm focus:border-white outline-none" 
                rows={4}
                required
                onChange={e => setEditingT({...editingT!, feedback: e.target.value})}
              />
              <input 
                placeholder="Customer Name" 
                className="w-full bg-[#111] border border-[#222] rounded-lg p-3 text-sm focus:border-white outline-none" 
                onChange={e => setEditingT({...editingT!, customer_name: e.target.value})}
              />
              <input 
                placeholder="Company / Designation" 
                className="w-full bg-[#111] border border-[#222] rounded-lg p-3 text-sm focus:border-white outline-none" 
                onChange={e => setEditingT({...editingT!, designation: e.target.value})}
              />
              <button type="submit" className="w-full py-3 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-lg">Add to Records</button>
            </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
