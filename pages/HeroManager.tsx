
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Page } from '../types';
import { 
  Type, 
  Save, 
  Loader2, 
  Monitor, 
  Eye, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  LayoutTemplate,
  RefreshCw
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
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('title', { ascending: true });
    
    if (data) {
      setPages(data);
      // Auto-select first page if none selected
      if (data.length > 0 && !selectedPage) {
        setSelectedPage(data[0]);
      } else if (selectedPage) {
        // Refresh the currently selected page data
        const current = data.find(p => p.id === selectedPage.id);
        if (current) setSelectedPage(current);
      }
    }
    setLoading(false);
  };

  const handleInitialize = async () => {
    setInitializing(true);
    const defaultPages = [
      { slug: 'home', title: 'Home Page', hero_title: 'We Build the Brands Everyone Talks About', hero_description: 'Stravigo blends strategy, culture, and creativity to help businesses dominate attention.', hero_cta_text: 'Talk To Stravigo', hero_cta_link: '/contact' },
      { slug: 'about', title: 'About Stravigo', hero_title: 'Trusted by Market Leaders', hero_description: 'We help brands, individuals, and entertainers become impossible to ignore.', hero_cta_text: 'Our Story', hero_cta_link: '/about' },
      { slug: 'our-work', title: 'Our Work', hero_title: 'Your Brand. Our Strategy. Endless Possibilities.', hero_description: 'Deep dive into some of the campaigns that have defined us.', hero_cta_text: 'See Hits', hero_cta_link: '/case-studies' },
      { slug: 'insights', title: 'The Stravigo Eagle', hero_title: 'In-depth Insights & Analysis', hero_description: 'Ideas and challenges shaping today’s world.', hero_cta_text: 'Read Reports', hero_cta_link: '/insights' },
      { slug: 'careers', title: 'Culture & Careers', hero_title: 'Powered By Doers & Dreamers', hero_description: 'If you want to grow fast and think boldly — welcome home.', hero_cta_text: 'Join Us', hero_cta_link: '/careers' }
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
        hero_title: selectedPage.hero_title,
        hero_description: selectedPage.hero_description,
        hero_cta_text: selectedPage.hero_cta_text,
        hero_cta_link: selectedPage.hero_cta_link,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedPage.id);

    setSaving(false);
    if (!error) {
      // Small visual feedback is better than a jarring alert
      // but keeping alert for now as per previous patterns
      alert(`${selectedPage.title} Hero Section Updated.`);
      fetchPages();
    } else {
      alert('Error updating page: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight italic">Global Hero Editor</h2>
          <p className="text-[#888] mt-1">Manage the first impression of every page on the Stravigo website.</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={fetchPages}
            className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-full text-[#444] hover:text-white transition-all"
            title="Reload Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || !selectedPage}
            className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#eee] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Syncing...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Page List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333] block">Select Channel</label>
          
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden p-2 space-y-1 shadow-inner">
            {loading && pages.length === 0 ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-[#111] animate-pulse rounded-lg mb-1" />)
            ) : pages.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <LayoutTemplate size={32} className="mx-auto text-[#1a1a1a]" />
                <p className="text-[10px] uppercase font-black tracking-widest text-[#444]">No Pages Detected</p>
                <button 
                  onClick={handleInitialize}
                  disabled={initializing}
                  className="w-full py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#eee] transition-all flex items-center justify-center gap-2"
                >
                  {initializing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Initialize Core
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
                  {selectedPage?.id === page.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-50" />
                  )}
                </button>
              ))
            )}
          </div>
          
          <div className="p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
            <Sparkles size={20} className="text-[#333] mb-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">Editor Intelligence</h4>
            <p className="text-[10px] leading-relaxed text-[#444]">
              The Hero section defines the brand's gravitas. Ensure headlines are punchy, strategy-driven, and results-obsessed. 
            </p>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3">
          {!selectedPage ? (
            <div className="h-[500px] flex flex-col items-center justify-center text-[#222] border border-dashed border-[#1a1a1a] rounded-3xl bg-[#0a0a0a]/30">
              <Monitor size={64} strokeWidth={1} />
              <p className="mt-4 font-black uppercase tracking-widest text-xs">Select a channel to refine presence</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-3xl space-y-10 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-8">
                   <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 border border-white/10">
                      <Type size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl font-display uppercase tracking-tight italic text-white">{selectedPage.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <p className="text-[10px] text-[#555] uppercase font-black tracking-widest">Channel: stravigo.com/{selectedPage.slug === 'home' ? '' : selectedPage.slug}</p>
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
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Preview Live</span>
                  </a>
                </div>

                <form className="space-y-12">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">The Big Bold Statement (Hero Title)</label>
                      <span className="text-[9px] text-[#222] uppercase font-black tracking-widest">Headline Level 1</span>
                    </div>
                    <textarea 
                      rows={2}
                      value={selectedPage.hero_title || ''}
                      onChange={e => setSelectedPage({...selectedPage, hero_title: e.target.value})}
                      className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-8 py-8 focus:border-white focus:ring-1 focus:ring-white/20 outline-none text-4xl md:text-5xl font-bold font-display tracking-tight leading-tight transition-all placeholder:text-[#111]"
                      placeholder="e.g., We Build the Brands Everyone Talks About"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">Strategic Narrative (Hero Description)</label>
                      <span className="text-[9px] text-[#222] uppercase font-black tracking-widest">Secondary Narrative</span>
                    </div>
                    <textarea 
                      rows={5}
                      value={selectedPage.hero_description || ''}
                      onChange={e => setSelectedPage({...selectedPage, hero_description: e.target.value})}
                      className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-8 py-8 focus:border-white focus:ring-1 focus:ring-white/20 outline-none text-lg text-[#888] leading-relaxed transition-all placeholder:text-[#111]"
                      placeholder="Explain the strategy behind the narrative..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">Primary Action (CTA Text)</label>
                      <input 
                        type="text"
                        value={selectedPage.hero_cta_text || ''}
                        onChange={e => setSelectedPage({...selectedPage, hero_cta_text: e.target.value})}
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-8 py-5 focus:border-white outline-none text-xs font-black uppercase tracking-widest transition-all"
                        placeholder="e.g., Talk To Stravigo"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">Destination Path (Link)</label>
                      <input 
                        type="text"
                        value={selectedPage.hero_cta_link || ''}
                        onChange={e => setSelectedPage({...selectedPage, hero_cta_link: e.target.value})}
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-8 py-5 focus:border-white outline-none text-xs font-mono text-[#555] transition-all"
                        placeholder="e.g., #contact-us"
                      />
                    </div>
                  </div>
                </form>

                <div className="pt-10 border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-center gap-4">
                   <div className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-[#222]">
                    <ShieldCheck size={14} />
                    Verified deployment. Changes impact live production environment.
                   </div>
                   <div className="text-[9px] text-[#333] uppercase font-black tracking-widest">
                    Last Synced: {selectedPage.updated_at ? new Date(selectedPage.updated_at).toLocaleString() : 'Never'}
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
