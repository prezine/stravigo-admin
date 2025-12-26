
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
  Upload
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
      content_body: ''
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
    const url = await uploadImage(file);
    if (url) {
      setEditingInsight({ ...editingInsight, featured_image_url: url });
    } else {
      alert('Failed to upload image. Ensure "stravigo-storage" bucket exists and is public.');
    }
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInsight) return;
    setSaving(true);

    let error;
    if (editingInsight.id) {
      const { error: err } = await supabase
        .from('insights')
        .update(editingInsight)
        .eq('id', editingInsight.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('insights')
        .insert([editingInsight]);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight">The Stravigo Eagle</h2>
          <p className="text-[#888] mt-1">Manage articles, trends, and strategic insights.</p>
        </div>
        <button 
          onClick={handleNew}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-bold hover:bg-[#eee] transition-all"
        >
          <Plus size={18} />
          New Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-[#555] flex flex-col items-center gap-2">
            <Loader2 className="animate-spin" />
            <span>Loading articles...</span>
          </div>
        ) : insights.length === 0 ? (
          <div className="col-span-full py-20 text-center text-[#555] bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">No insights published.</div>
        ) : insights.map((insight) => (
          <div key={insight.id} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden group hover:border-white/20 transition-all flex flex-col">
            <div className="h-48 bg-[#111] relative overflow-hidden">
              {insight.featured_image_url ? (
                <img src={insight.featured_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#333]">
                  {insight.content_format === 'video' ? <Video size={48} /> : <FileText size={48} />}
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-[10px] uppercase tracking-widest font-bold rounded-full">
                  {insight.category}
                </span>
              </div>
              {!insight.is_published && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="px-4 py-1.5 bg-yellow-500 text-black text-[10px] font-bold uppercase rounded-lg">Draft</span>
                </div>
              )}
            </div>
            
            <div className="p-5 space-y-3 flex-1">
              <div className="flex items-center gap-2 text-[10px] text-[#555] font-medium uppercase tracking-widest">
                <Calendar size={12} />
                {new Date(insight.created_at).toLocaleDateString()}
                <span>•</span>
                {insight.content_format}
              </div>
              <h3 className="font-bold text-lg leading-tight line-clamp-2 hover:text-white transition-colors cursor-pointer">
                {insight.title}
              </h3>
              <p className="text-xs text-[#888] line-clamp-2 leading-relaxed">
                {insight.excerpt || 'No summary provided for this article.'}
              </p>
            </div>

            <div className="px-5 py-4 bg-[#0d0d0d] border-t border-[#1a1a1a] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#333]"></div>
                <span className="text-[10px] font-medium text-[#555]">{insight.author_name}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(insight)} className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors text-[#888] hover:text-white">
                  <Edit2 size={14} />
                </button>
                <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors text-[#888] hover:text-white">
                  <Eye size={14} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-4xl h-[90vh] rounded-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center shrink-0">
              <h3 className="text-2xl font-bold font-display">Article Composer</h3>
              <button onClick={() => setIsEditorOpen(false)}><XCircle size={28} className="text-[#333] hover:text-white" /></button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Title</label>
                    <input 
                      type="text" 
                      value={editingInsight?.title} 
                      onChange={e => setEditingInsight({...editingInsight!, title: e.target.value})}
                      className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 focus:ring-1 focus:ring-white outline-none font-medium text-lg"
                      placeholder="Insight Headline"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Slug</label>
                    <input 
                      type="text" 
                      value={editingInsight?.slug} 
                      onChange={e => setEditingInsight({...editingInsight!, slug: e.target.value})}
                      className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-2 focus:ring-1 focus:ring-white outline-none font-mono text-sm"
                      placeholder="url-friendly-slug"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Format</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button" 
                        onClick={() => setEditingInsight({...editingInsight!, content_format: 'article'})}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${editingInsight?.content_format === 'article' ? 'bg-white text-black border-white' : 'bg-[#111] text-[#555] border-[#222]'}`}
                      >
                        <FileText size={16} /> Article
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditingInsight({...editingInsight!, content_format: 'video'})}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${editingInsight?.content_format === 'video' ? 'bg-white text-black border-white' : 'bg-[#111] text-[#555] border-[#222]'}`}
                      >
                        <Video size={16} /> Video
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Category</label>
                    <select 
                      value={editingInsight?.category} 
                      onChange={e => setEditingInsight({...editingInsight!, category: e.target.value})}
                      className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-white outline-none text-sm"
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
                <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Featured Visual (Image)</label>
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center overflow-hidden shrink-0 group relative">
                    {editingInsight?.featured_image_url ? (
                      <img src={editingInsight.featured_image_url} alt="" className="w-full h-full object-cover" />
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
                        value={editingInsight?.featured_image_url || ''} 
                        onChange={e => setEditingInsight({...editingInsight!, featured_image_url: e.target.value})}
                        className="flex-1 bg-[#111] border border-[#222] rounded-lg px-4 py-2 focus:ring-1 focus:ring-white outline-none text-xs"
                        placeholder="Paste visual URL..."
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
                    <p className="text-[10px] text-[#555] uppercase tracking-widest leading-relaxed">Recommended aspect ratio 16:9. Assets are hosted on stravigo-storage.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Content Body (Markdown/HTML)</label>
                <textarea 
                  rows={10}
                  value={editingInsight?.content_body} 
                  onChange={e => setEditingInsight({...editingInsight!, content_body: e.target.value})}
                  className="w-full bg-[#111] border border-[#222] rounded-lg px-6 py-4 focus:ring-1 focus:ring-white outline-none font-mono text-sm leading-relaxed"
                  placeholder="Draft your brilliant ideas here..."
                  required
                />
              </div>

              <div className="pt-8 border-t border-[#1a1a1a] flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${editingInsight?.is_published ? 'bg-green-500' : 'bg-[#222]'}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${editingInsight?.is_published ? 'translate-x-5' : ''}`}></div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={editingInsight?.is_published}
                    onChange={e => setEditingInsight({...editingInsight!, is_published: e.target.checked})}
                  />
                  <span className="text-sm font-semibold uppercase tracking-widest text-[#888]">Publish Instantly</span>
                </label>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsEditorOpen(false)} className="px-8 py-3 rounded-full text-sm font-bold hover:bg-[#111] transition-all" disabled={saving || uploading}>Discard</button>
                  <button type="submit" className="px-12 py-3 bg-white text-black rounded-full font-bold hover:bg-[#eee] transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] flex items-center gap-2" disabled={saving || uploading}>
                    {saving && <Loader2 className="animate-spin w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Article'}
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

export default Insights;
