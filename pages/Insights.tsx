
import React, { useState, useEffect, useRef } from 'react';
import { supabase, uploadImage } from '../supabase';
import { Insight } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  Video,
  FileText,
  Eye,
  XCircle,
  Calendar,
  Loader2,
  Upload,
  Search as SearchIcon,
  Globe,
  Clock,
  Star,
  Zap
} from 'lucide-react';

const Insights: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingInsight, setEditingInsight] = useState<Partial<Insight> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setInsights(data);
    }
    setLoading(false);
  };

  const handleEdit = (insight: Insight) => {
    setEditingInsight(insight);
    setIsEditorOpen(true);
  };

  const handleNew = () => {
    setEditingInsight({
      title: '',
      slug: '',
      category: 'Strategic Thinking',
      author_name: 'Stravigo Editorial',
      content_format: 'article',
      is_published: false,
      is_featured: false,
      content_body: '',
      seo_meta_title: '',
      seo_meta_description: ''
    });
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this insight?')) {
      const { error } = await supabase.from('insights').delete().eq('id', id);
      if (!error) {
        setInsights(prev => prev.filter(i => i.id !== id));
      } else {
        alert('Error deleting: ' + error.message);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingInsight) return;

    setUploading(true);
    const { url, error } = await uploadImage(file);
    if (url) {
      setEditingInsight({ ...editingInsight, featured_image_url: url });
    } else {
      alert(error || 'Failed to upload image. Please check file size and type.');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const stripMarkdown = (md: string) => {
    return md
      .replace(/[#*`>]/g, '') // Remove simple markdown symbols
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Keep link text
      .trim();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInsight) return;
    setSaving(true);

    // Ensure only one insight is featured
    if (editingInsight.is_featured) {
      // Unfeature all other insights first
      await supabase
        .from('insights')
        .update({ is_featured: false })
        .eq('is_featured', true);
    }

    // Auto-fill SEO metadata if missing
    const seoTitle = editingInsight.seo_meta_title?.trim() || editingInsight.title?.trim() || '';
    const plainBody = stripMarkdown(editingInsight.content_body || '');
    const seoDesc = editingInsight.seo_meta_description?.trim() || 
                    editingInsight.excerpt?.trim() || 
                    plainBody.substring(0, 155).trim() + (plainBody.length > 155 ? '...' : '');

    // Handle published_at timestamp
    let publishedAt = editingInsight.published_at;
    if (editingInsight.is_published && !publishedAt) {
      publishedAt = new Date().toISOString();
    } else if (!editingInsight.is_published) {
      publishedAt = undefined;
    }

    const payload = {
      ...editingInsight,
      seo_meta_title: seoTitle,
      seo_meta_description: seoDesc,
      published_at: publishedAt,
      updated_at: new Date().toISOString()
    };

    let error;
    if (editingInsight.id) {
      const { error: err } = await supabase
        .from('insights')
        .update(payload)
        .eq('id', editingInsight.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('insights')
        .insert([payload]);
      error = err;
    }

    setSaving(false);
    if (!error) {
      setIsEditorOpen(false);
      fetchInsights();
    } else {
      alert('Error: ' + error.message);
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    if (current) return; // Already featured

    setLoading(true);
    // 1. Unfeature all
    await supabase.from('insights').update({ is_featured: false }).eq('is_featured', true);
    // 2. Feature selected
    await supabase.from('insights').update({ is_featured: true }).eq('id', id);
    
    await fetchInsights();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight italic">The Stravigo Eagle</h2>
          <p className="text-[#888] mt-1">Deploying strategic intelligence and industry-shaping articles.</p>
        </div>
        <button 
          onClick={handleNew}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-bold hover:bg-[#eee] transition-all shadow-xl"
        >
          <Plus size={18} />
          Draft New Intelligence
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-[#555] flex flex-col items-center gap-2">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-[10px] uppercase font-black tracking-widest">Scanning Editorial Archive</span>
          </div>
        ) : insights.length === 0 ? (
          <div className="col-span-full py-20 text-center text-[#555] bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">No insights published.</div>
        ) : insights.map((insight) => (
          <div key={insight.id} className={`bg-[#0a0a0a] border ${insight.is_featured ? 'border-white/40 ring-1 ring-white/10' : 'border-[#1a1a1a]'} rounded-xl overflow-hidden group hover:border-white/20 transition-all flex flex-col shadow-lg relative`}>
            
            <div className="h-48 bg-[#111] relative overflow-hidden">
              {insight.featured_image_url ? (
                <img src={insight.featured_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#333]">
                  {insight.content_format === 'video' ? <Video size={48} /> : <FileText size={48} />}
                </div>
              )}
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-[9px] uppercase tracking-widest font-black rounded-full border border-white/10">
                  {insight.category}
                </span>
                {insight.is_featured && (
                  <span className="px-3 py-1 bg-white text-black text-[9px] uppercase tracking-widest font-black rounded-full flex items-center gap-1 shadow-xl">
                    <Star size={10} fill="currentColor" /> Featured
                  </span>
                )}
              </div>

              {!insight.is_published && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="px-4 py-1.5 bg-yellow-500/90 text-black text-[9px] font-black uppercase tracking-widest rounded-lg">Draft Phase</span>
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-[#555] font-black uppercase tracking-widest">
                  <Calendar size={12} className="text-[#333]" />
                  {new Date(insight.created_at).toLocaleDateString()}
                </div>
                {insight.published_at && (
                  <div className="flex items-center gap-1.5 text-[9px] text-green-500 font-black uppercase tracking-tighter">
                    <Globe size={10} /> Live
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg leading-tight line-clamp-2 hover:text-white transition-colors cursor-pointer font-display">
                {insight.title}
              </h3>
              <p className="text-xs text-[#666] line-clamp-3 leading-relaxed">
                {insight.excerpt || stripMarkdown(insight.content_body).substring(0, 100) + '...'}
              </p>
            </div>

            <div className="px-6 py-4 bg-[#0d0d0d] border-t border-[#1a1a1a] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#222] to-[#444] border border-white/5"></div>
                <span className="text-[10px] font-bold text-[#555] tracking-tight">{insight.author_name}</span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => toggleFeatured(insight.id, insight.is_featured)}
                  className={`p-2 rounded-lg transition-colors ${insight.is_featured ? 'text-white' : 'text-[#222] hover:text-white'}`}
                  title={insight.is_featured ? "Primary Feature" : "Make Featured"}
                >
                  <Star size={14} fill={insight.is_featured ? "currentColor" : "none"} />
                </button>
                <button onClick={() => handleEdit(insight)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#555] hover:text-white">
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(insight.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insight Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-5xl h-[95vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-[#1a1a1a] flex justify-between items-center shrink-0 bg-[#0d0d0d]">
              <div>
                <h3 className="text-2xl font-bold font-display italic tracking-tight">{editingInsight?.id ? 'Refine Intelligence' : 'Draft New Article'}</h3>
                <p className="text-[10px] text-[#555] uppercase tracking-[0.2em] font-black mt-1">Stravigo Editorial Engine</p>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <XCircle size={32} className="text-[#333] hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">Headline</label>
                    <input 
                      type="text" 
                      value={editingInsight?.title} 
                      onChange={e => setEditingInsight({...editingInsight!, title: e.target.value})}
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-4 focus:border-white outline-none font-bold text-xl transition-all"
                      placeholder="Article Title..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">URL Segment (Slug)</label>
                    <input 
                      type="text" 
                      value={editingInsight?.slug} 
                      onChange={e => setEditingInsight({...editingInsight!, slug: e.target.value})}
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 focus:border-white outline-none font-mono text-xs text-[#888]"
                      placeholder="url-friendly-slug"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">Content Modality</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button" 
                        onClick={() => setEditingInsight({...editingInsight!, content_format: 'article'})}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${editingInsight?.content_format === 'article' ? 'bg-white text-black border-white' : 'bg-[#111] text-[#555] border-[#222] hover:border-[#333]'}`}
                      >
                        <FileText size={16} /> Article
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditingInsight({...editingInsight!, content_format: 'video'})}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${editingInsight?.content_format === 'video' ? 'bg-white text-black border-white' : 'bg-[#111] text-[#555] border-[#222] hover:border-[#333]'}`}
                      >
                        <Video size={16} /> Video
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">Insight Vertical</label>
                    <select 
                      value={editingInsight?.category} 
                      onChange={e => setEditingInsight({...editingInsight!, category: e.target.value})}
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 focus:border-white outline-none text-sm font-bold appearance-none cursor-pointer"
                    >
                      <option>Strategic Thinking</option>
                      <option>Market Trends</option>
                      <option>Culture</option>
                      <option>Case Studies</option>
                      <option>Research</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">Featured Visual Asset</label>
                <div className="flex gap-6">
                  <div className="w-32 h-32 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center overflow-hidden shrink-0 group relative shadow-inner">
                    {editingInsight?.featured_image_url ? (
                      <img src={editingInsight.featured_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-[#222]" size={40} />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={editingInsight?.featured_image_url || ''} 
                        onChange={e => setEditingInsight({...editingInsight!, featured_image_url: e.target.value})}
                        className="flex-1 bg-[#111] border border-[#222] rounded-xl px-4 py-3 focus:border-white outline-none text-xs font-mono"
                        placeholder="Paste image URL or upload..."
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-[#eee] transition-all"
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
                    <p className="text-[10px] text-[#444] uppercase tracking-widest leading-relaxed">Recommended for maximum impact: 1920x1080px. Max 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">Content Body (Strategic Narrative)</label>
                <textarea 
                  rows={15}
                  value={editingInsight?.content_body} 
                  onChange={e => setEditingInsight({...editingInsight!, content_body: e.target.value})}
                  className="w-full bg-[#111] border border-[#222] rounded-2xl px-8 py-8 focus:border-white outline-none font-mono text-sm leading-relaxed"
                  placeholder="## Start your story here..."
                  required
                />
              </div>

              {/* SEO and Featured Status Tracking Section */}
              <div className="space-y-8 pt-10 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <SearchIcon size={14} className="text-[#333]" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#333]">Editorial Configuration & SEO Intelligence</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">Meta Title</label>
                      <input 
                        type="text" 
                        value={editingInsight?.seo_meta_title || ''} 
                        onChange={e => setEditingInsight({...editingInsight!, seo_meta_title: e.target.value})}
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-3 focus:border-white outline-none text-sm font-semibold transition-all"
                        placeholder="Auto-fills from title if empty"
                      />
                      <p className="text-[9px] text-[#333] uppercase font-bold tracking-tighter italic">Ideal length: 50-60 chars.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#444] font-black">Meta Description</label>
                      <textarea 
                        rows={3}
                        value={editingInsight?.seo_meta_description || ''} 
                        onChange={e => setEditingInsight({...editingInsight!, seo_meta_description: e.target.value})}
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-3 focus:border-white outline-none text-sm leading-relaxed transition-all"
                        placeholder="Auto-fills from content summary if empty"
                      />
                      <p className="text-[9px] text-[#333] uppercase font-bold tracking-tighter italic">Ideal length: 150-160 chars.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-12 bg-[#050505] border border-[#1a1a1a] p-8 rounded-2xl shadow-inner">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${editingInsight?.is_published ? 'bg-green-500' : 'bg-[#222]'}`}>
                      <div className={`absolute top-1.5 left-1.5 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${editingInsight?.is_published ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={editingInsight?.is_published}
                      onChange={e => setEditingInsight({...editingInsight!, is_published: e.target.checked})}
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest">Public Visibility</span>
                      <span className="text-[8px] text-[#444] uppercase font-bold tracking-widest">Publish to live feed</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group border-l border-white/5 pl-12">
                    <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${editingInsight?.is_featured ? 'bg-white' : 'bg-[#222]'}`}>
                      <div className={`absolute top-1.5 left-1.5 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${editingInsight?.is_featured ? 'translate-x-6 bg-black' : ''}`}></div>
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={editingInsight?.is_featured}
                      onChange={e => setEditingInsight({...editingInsight!, is_featured: e.target.checked})}
                    />
                    <div className="flex flex-col text-white/40">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Featured Caveat</span>
                      <span className="text-[8px] uppercase font-bold tracking-widest">Primary post highlight (Only one)</span>
                    </div>
                  </label>

                  {editingInsight?.published_at && (
                    <div className="flex items-center gap-3 border-l border-white/5 pl-12">
                      <Clock size={16} className="text-[#333]" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#555]">Initial Launch</span>
                        <span className="text-[10px] text-white font-mono">{new Date(editingInsight.published_at!).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-10 flex justify-end gap-6 border-t border-[#1a1a1a]">
                <button type="button" onClick={() => setIsEditorOpen(false)} className="px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-[#444] hover:text-white" disabled={saving || uploading}>Discard Draft</button>
                <button 
                  type="submit" 
                  className="px-14 py-4 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#eee] transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] flex items-center gap-2" 
                  disabled={saving || uploading}
                >
                  {saving ? <Loader2 className="animate-spin w-4 h-4 text-black" /> : <Zap size={16} />}
                  {saving ? 'Synchronizing...' : (editingInsight?.id ? 'Deploy Intelligence' : 'Publish Article')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
