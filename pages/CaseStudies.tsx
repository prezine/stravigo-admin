
import React, { useState, useEffect, useRef } from 'react';
import { supabase, uploadImage } from '../supabase';
import { CaseStudy } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Loader2,
  Upload
} from 'lucide-react';

const CaseStudies: React.FC = () => {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Partial<CaseStudy> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setCaseStudies(data);
    }
    setLoading(false);
  };

  const handleEdit = (cs: CaseStudy) => {
    setEditingCase(cs);
    setIsEditorOpen(true);
  };

  const handleNew = () => {
    setEditingCase({
      title: '',
      slug: '',
      sector: '',
      headline_summary: '',
      service_type: 'business',
      is_published: false,
      is_featured: false,
      tags: [],
      background: '',
      strategic_approach: '',
      impact: ''
    });
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently remove this case study from the portfolio?')) {
      const { error } = await supabase.from('case_studies').delete().eq('id', id);
      if (!error) {
        setCaseStudies(prev => prev.filter(c => c.id !== id));
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCase) return;

    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setEditingCase({ ...editingCase, featured_image_url: url });
    } else {
      alert('Failed to upload image. Ensure "stravigo-storage" bucket exists and is public.');
    }
    setUploading(false);
  };

  const saveCaseStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase) return;
    setSaving(true);

    const payload = { 
      ...editingCase,
      updated_at: new Date().toISOString()
    };
    
    let error;
    if (payload.id) {
      const { error: err } = await supabase
        .from('case_studies')
        .update(payload)
        .eq('id', payload.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('case_studies')
        .insert([payload]);
      error = err;
    }

    setSaving(false);
    if (!error) {
      setIsEditorOpen(false);
      fetchCaseStudies();
    } else {
      alert('Error saving case study: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display">Our Work</h2>
          <p className="text-[#888] mt-1">Manage featured campaigns and high-impact case studies.</p>
        </div>
        <button 
          onClick={handleNew}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-bold hover:bg-[#e5e5e5] transition-all"
        >
          <Plus size={18} />
          New Case Study
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1a1a1a] flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button className="px-4 py-1.5 text-xs font-bold rounded-full bg-white text-black">All</button>
            <button className="px-4 py-1.5 text-xs font-bold rounded-full text-[#555] hover:text-white transition-colors">Business</button>
            <button className="px-4 py-1.5 text-xs font-bold rounded-full text-[#555] hover:text-white transition-colors">Individuals</button>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111] border border-[#222] rounded-lg">
            <Search size={14} className="text-[#555]" />
            <input type="text" placeholder="Search projects..." className="bg-transparent border-none focus:ring-0 text-xs w-48 text-white" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase tracking-widest text-[#555] border-b border-[#1a1a1a]">
              <tr>
                <th className="px-6 py-4 font-bold">Project / Client</th>
                <th className="px-6 py-4 font-bold">Sector</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold text-center">Home Feature</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-[#555]"><Loader2 className="animate-spin mx-auto mb-2" /> Loading portfolio...</td></tr>
              ) : caseStudies.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-[#555]">No campaigns found.</td></tr>
              ) : caseStudies.map((cs) => (
                <tr key={cs.id} className="hover:bg-[#0d0d0d] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-[#1a1a1a] overflow-hidden flex items-center justify-center border border-[#222]">
                        {cs.featured_image_url ? (
                          <img src={cs.featured_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-[#333]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm group-hover:text-white transition-colors">{cs.title}</p>
                        <p className="text-[10px] text-[#555] font-mono tracking-tighter uppercase">{cs.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[#aaa]">{cs.sector}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs uppercase tracking-widest font-bold text-[#666]">{cs.service_type}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {cs.is_featured ? (
                      <CheckCircle size={16} className="mx-auto text-yellow-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#222] mx-auto"></div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${cs.is_published ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-[#333]'}`}></div>
                      <span className="text-xs font-bold uppercase tracking-tighter">{cs.is_published ? 'Live' : 'Draft'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(cs)} className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(cs.id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-[#444]" title="Delete">
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

      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col shadow-2xl">
            <div className="px-8 py-5 border-b border-[#1a1a1a] flex justify-between items-center bg-[#0d0d0d]">
              <div>
                <h3 className="text-2xl font-bold font-display">{editingCase?.id ? 'Refine Campaign' : 'Initiate Case Study'}</h3>
                <p className="text-[10px] text-[#555] uppercase tracking-widest mt-1">Stravigo Portfolio Management</p>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <XCircle size={28} className="text-[#333] hover:text-white" />
              </button>
            </div>
            
            <form onSubmit={saveCaseStudy} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Campaign Title</label>
                  <input 
                    type="text" 
                    value={editingCase?.title} 
                    onChange={e => setEditingCase({...editingCase!, title: e.target.value})}
                    className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 focus:ring-1 focus:ring-white outline-none font-bold text-lg"
                    placeholder="e.g., Nutrify Brand Evolution"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">URL Segment (Slug)</label>
                  <input 
                    type="text" 
                    value={editingCase?.slug} 
                    onChange={e => setEditingCase({...editingCase!, slug: e.target.value})}
                    className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 focus:ring-1 focus:ring-white outline-none font-mono text-sm"
                    placeholder="nutrify-brand-evolution"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Featured Asset (Image)</label>
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center overflow-hidden shrink-0 group relative">
                      {editingCase?.featured_image_url ? (
                        <img src={editingCase.featured_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-[#222]" size={32} />
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={editingCase?.featured_image_url || ''} 
                          onChange={e => setEditingCase({...editingCase!, featured_image_url: e.target.value})}
                          className="flex-1 bg-[#111] border border-[#222] rounded-lg px-4 py-2 focus:ring-1 focus:ring-white outline-none text-xs"
                          placeholder="Paste asset URL..."
                        />
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-[#eee] transition-all"
                        >
                          <Upload size={14} /> Upload
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                        />
                      </div>
                      <p className="text-[10px] text-[#555] uppercase tracking-widest leading-relaxed">Recommended: 1600x900px, WebP or JPEG. Assets are stored in stravigo-storage.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Sector</label>
                    <input 
                      type="text" 
                      value={editingCase?.sector} 
                      onChange={e => setEditingCase({...editingCase!, sector: e.target.value})}
                      className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-2 focus:ring-1 focus:ring-white outline-none"
                      placeholder="Health & Wellness"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Category</label>
                    <select 
                      value={editingCase?.service_type} 
                      onChange={e => setEditingCase({...editingCase!, service_type: e.target.value as any})}
                      className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-2 focus:ring-1 focus:ring-white outline-none"
                    >
                      <option value="business">Stravigo for Business</option>
                      <option value="individuals">Stravigo for Individuals</option>
                      <option value="entertainment">Stravigo for Entertainment</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Headline Summary</label>
                <textarea 
                  rows={2}
                  value={editingCase?.headline_summary} 
                  onChange={e => setEditingCase({...editingCase!, headline_summary: e.target.value})}
                  className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 focus:ring-1 focus:ring-white outline-none text-sm italic"
                  placeholder="The one-sentence hook that defines this hit."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Background (The Challenge)</label>
                  <textarea 
                    rows={5}
                    value={editingCase?.background || ''} 
                    onChange={e => setEditingCase({...editingCase!, background: e.target.value})}
                    className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 focus:ring-1 focus:ring-white outline-none text-sm leading-relaxed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Strategic Approach (The Magic)</label>
                  <textarea 
                    rows={5}
                    value={editingCase?.strategic_approach || ''} 
                    onChange={e => setEditingCase({...editingCase!, strategic_approach: e.target.value})}
                    className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 focus:ring-1 focus:ring-white outline-none text-sm leading-relaxed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Impact & Results</label>
                <textarea 
                  rows={3}
                  value={editingCase?.impact || ''} 
                  onChange={e => setEditingCase({...editingCase!, impact: e.target.value})}
                  className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 focus:ring-1 focus:ring-white outline-none text-sm leading-relaxed"
                />
              </div>

              <div className="flex gap-10 items-center bg-[#0d0d0d] border border-[#1a1a1a] p-6 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border ${editingCase?.is_published ? 'bg-white border-white' : 'border-[#333]'} flex items-center justify-center transition-all duration-300`}>
                    {editingCase?.is_published && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={editingCase?.is_published}
                    onChange={e => setEditingCase({...editingCase!, is_published: e.target.checked})}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest">Publish Live</span>
                    <span className="text-[10px] text-[#555]">Make this campaign visible to the world.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border ${editingCase?.is_featured ? 'bg-yellow-500 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-[#333]'} flex items-center justify-center transition-all duration-300`}>
                    {editingCase?.is_featured && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={editingCase?.is_featured}
                    onChange={e => setEditingCase({...editingCase!, is_featured: e.target.checked})}
                  />
                   <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest">Homepage Feature</span>
                    <span className="text-[10px] text-[#555]">Highlight this in "Our Greatest Hits".</span>
                  </div>
                </label>
              </div>

              <div className="pt-8 flex justify-end gap-4 border-t border-[#1a1a1a]">
                <button type="button" onClick={() => setIsEditorOpen(false)} className="px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all" disabled={saving}>Discard</button>
                <button 
                  type="submit" 
                  className="px-12 py-3 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-[#e5e5e5] transition-all flex items-center gap-2"
                  disabled={saving}
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? 'Syncing...' : 'Save Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseStudies;
