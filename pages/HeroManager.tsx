
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Page } from '../types';
import { 
  Type, 
  Save, 
  Loader2, 
  Monitor, 
  Eye, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  LayoutTemplate,
  RefreshCw,
  Globe,
  Search
} from 'lucide-react';

const HeroManager: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('title', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setPages(data);
        // Auto-select first page if none selected or refresh selected
        if (data.length > 0) {
          if (!selectedPage) {
            setSelectedPage(data[0]);
          } else {
            const refreshed = data.find(p => p.id === selectedPage.id);
            if (refreshed) setSelectedPage(refreshed);
          }
        }
      }
    } catch (err: any) {
      console.error("Fetch Pages Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    setInitializing(true);
    const defaultPages = [
      { 
        slug: 'home', 
        title: 'Stravigo', 
        hero_title: 'We Build the Brands Everyone Talks About !', 
        hero_description: 'Stravigo blends strategy, culture, and creativity to help businesses dominate attention.', 
        hero_cta_text: 'Talk To Stravigo', 
        hero_cta_link: '/contact',
        meta_title: 'Stravigo - We Build the Brands Everyone Talks About',
        meta_description: 'Stravigo blends strategy, culture, and creativity to help businesses dominate attention.'
      },
      { 
        slug: 'about', 
        title: 'About Stravigo', 
        hero_title: 'Trusted by Market Leaders', 
        hero_description: 'We help brands, individuals, and entertainers become impossible to ignore.', 
        hero_cta_text: 'Our Story', 
        hero_cta_link: '/about',
        meta_title: 'About Stravigo',
        meta_description: 'We help brands, individuals, and entertainers become impossible to ignore.'
      },
      { 
        slug: 'our-work', 
        title: 'Our Work', 
        hero_title: 'Your Brand. Our Strategy. Endless Possibilities.', 
        hero_description: 'Deep dive into some of the campaigns that have defined us.', 
        hero_cta_text: 'See Hits', 
        hero_cta_link: '/case-studies',
        meta_title: 'Our Work',
        meta_description: 'Deep dive into some of the campaigns that have defined us.'
      },
      { 
        slug: 'insights', 
        title: 'The Stravigo Eagle', 
        hero_title: 'In-depth Insights & Analysis', 
        hero_description: 'Ideas and challenges shaping today’s world.', 
        hero_cta_text: 'Read Reports', 
        hero_cta_link: '/insights',
        meta_title: 'The Stravigo Eagle',
        meta_description: 'Ideas and challenges shaping today’s world.'
      },
      { 
        slug: 'careers', 
        title: 'Culture & Careers', 
        hero_title: 'Powered By Doers & Dreamers', 
        hero_description: 'If you want to grow fast and think boldly — welcome home.', 
        hero_cta_text: 'Join Us', 
        hero_cta_link: '/careers',
        meta_title: 'Culture & Careers',
        meta_description: 'If you want to grow fast and think boldly — welcome home.'
      }
    ];

    const { error } = await supabase.from('pages').insert(defaultPages);
    
    if (error) {
      alert('Initialization failed: ' + error.message);
    } else {
      await fetchPages();
    }
    setInitializing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;

    setSaving(true);
    const { error } = await supabase
      .from('pages')
      .update({
        title: selectedPage.title,
        hero_title: selectedPage.hero_title,
        hero_description: selectedPage.hero_description,
        hero_cta_text: selectedPage.hero_cta_text,
        hero_cta_link: selectedPage.hero_cta_link,
        meta_title: selectedPage.meta_title || selectedPage.title,
        meta_description: selectedPage.meta_description || selectedPage.hero_description,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedPage.id);

    setSaving(false);
    if (!error) {
      alert(`${selectedPage.title} Deployment Successful.`);
      fetchPages();
    } else {
      alert('Deployment error: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight italic">Global Hero & SEO Editor</h2>
          <p className="text-[#888] mt-1">Refine the digital presence and search credibility of every channel.</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={fetchPages}
            className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-full text-[#444] hover:text-white transition-all"
            title="Force Sync Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || !selectedPage}
            className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#eee] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Synchronizing...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Page List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333] block">Select Channel</label>
          
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden p-2 space-y-1 shadow-inner min-h-[100px]">
            {loading && pages.length === 0 ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-[#111] animate-pulse rounded-lg mb-1" />)
            ) : pages.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <LayoutTemplate size={32} className="mx-auto text-[#1a1a1a]" />
                <p className="text-[10px] uppercase font-black tracking-widest text-[#444]">Repository Empty</p>
                <button 
                  onClick={handleInitialize}
                  disabled={initializing}
                  className="w-full py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#eee] transition-all flex items-center justify-center gap-2"
                >
                  {initializing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Auto-Initialize
                </button>
              </div>
            ) : (
              pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center justify-between group relative overflow-hidden ${
                    selectedPage?.id === page.id 
                      ? 'bg-white text-black shadow-lg shadow-white/5' 
                      : 'text-[#888] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 z-10">
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedPage?.id === page.id ? 'bg-black' : 'bg-[#222]'}`} />
                    <span className="font-bold text-sm tracking-tight">{page.title}</span>
                  </div>
                  <ChevronRight size={14} className={`z-10 ${selectedPage?.id === page.id ? 'text-black' : 'text-[#222] group-hover:text-[#555]'}`} />
                </button>
              ))
            )}
          </div>
          
          <div className="p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
            <Sparkles size={20} className="text-[#333] mb-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">Editor Pro-Tip</h4>
            <p className="text-[10px] leading-relaxed text-[#444]">
              Relevance is currency. Your Meta Titles should be a perfect balance of keywords and punchy branding.
            </p>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3">
          {!selectedPage ? (
            <div className="h-[500px] flex flex-col items-center justify-center text-[#222] border border-dashed border-[#1a1a1a] rounded-3xl bg-[#0a0a0a]/30">
              <Monitor size={64} strokeWidth={1} />
              <p className="mt-4 font-black uppercase tracking-widest text-xs">Awaiting Channel Selection</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-3xl space-y-12 shadow-2xl">
                
                {/* Header Information */}
                <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-8">
                   <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 border border-white/10">
                      <Type size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl font-display uppercase tracking-tight italic text-white">Refining: {selectedPage.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-[10px] text-[#555] uppercase font-black tracking-widest">Active Route: /{selectedPage.slug === 'home' ? '' : selectedPage.slug}</p>
                      </div>
                    </div>
                  </div>
                  <a 
                    href={`https://stravigo.com/${selectedPage.slug === 'home' ? '' : selectedPage.slug}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-4 bg-[#111] border border-[#222] hover:bg-white hover:text-black rounded-2xl transition-all text-[#555] flex items-center gap-2 group"
                  >
                    <Eye size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">View Live</span>
                  </a>
                </div>

                <form className="space-y-12">
                  {/* Internal Branding Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={14} className="text-[#333]" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#333]">Internal Metadata</h4>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">Page Display Title</label>
                      <input 
                        type="text"
                        value={selectedPage.title || ''}
                        onChange={e => setSelectedPage({...selectedPage, title: e.target.value})}
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-6 py-4 focus:border-white outline-none text-sm font-bold transition-all"
                        placeholder="e.g., Stravigo"
                      />
                    </div>
                  </div>

                  {/* Primary Hero Section */}
                  <div className="space-y-8 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <Sparkles size={14} className="text-[#333]" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#333]">Hero Presence (Above the Fold)</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">Big Bold Statement (H1)</label>
                      <textarea 
                        rows={2}
                        value={selectedPage.hero_title || ''}
                        onChange={e => setSelectedPage({...selectedPage, hero_title: e.target.value})}
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-8 py-8 focus:border-white focus:ring-1 focus:ring-white/20 outline-none text-4xl md:text-5xl font-bold font-display tracking-tight leading-tight transition-all"
                        placeholder="Enter primary headline..."
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">Strategic Narrative (Subtext)</label>
                      <textarea 
                        rows={4}
                        value={selectedPage.hero_description || ''}
                        onChange={e => setSelectedPage({...selectedPage, hero_description: e.target.value})}
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-8 py-6 focus:border-white outline-none text-lg text-[#888] leading-relaxed transition-all"
                        placeholder="Detail the brand story..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">CTA Label</label>
                        <input 
                          type="text"
                          value={selectedPage.hero_cta_text || ''}
                          onChange={e => setSelectedPage({...selectedPage, hero_cta_text: e.target.value})}
                          className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-6 py-4 focus:border-white outline-none text-xs font-black uppercase tracking-widest transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">CTA Redirect</label>
                        <input 
                          type="text"
                          value={selectedPage.hero_cta_link || ''}
                          onChange={e => setSelectedPage({...selectedPage, hero_cta_link: e.target.value})}
                          className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-6 py-4 focus:border-white outline-none text-xs font-mono text-[#555] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEO Meta Tags Section */}
                  <div className="space-y-8 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-white/40">
                      <Search size={14} />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Search Engine Optimization (Meta)</h4>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">Meta Title Tag</label>
                      <input 
                        type="text"
                        value={selectedPage.meta_title || ''}
                        onChange={e => setSelectedPage({...selectedPage, meta_title: e.target.value})}
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-6 py-4 focus:border-white outline-none text-sm font-semibold transition-all border-l-4 border-l-blue-900/30"
                        placeholder="Recommended: 50-60 characters"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">Meta Description Tag</label>
                      <textarea 
                        rows={3}
                        value={selectedPage.meta_description || ''}
                        onChange={e => setSelectedPage({...selectedPage, meta_description: e.target.value})}
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-6 py-4 focus:border-white outline-none text-sm leading-relaxed transition-all border-l-4 border-l-blue-900/30"
                        placeholder="Recommended: 150-160 characters"
                      />
                    </div>
                  </div>
                </form>

                <div className="pt-10 border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-center gap-4">
                   <div className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-[#222]">
                    <Globe size={14} />
                    Impact: Global. Changes affect SEO ranking and primary web visuals.
                   </div>
                   <div className="text-[9px] text-[#333] uppercase font-black tracking-widest">
                    Presence Verified: {selectedPage.updated_at ? new Date(selectedPage.updated_at).toLocaleString() : 'First Deployment'}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroManager;
