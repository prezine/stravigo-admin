
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Layout, Save, ChevronRight, Zap, Globe, Loader2, CheckCircle } from 'lucide-react';

const Services: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'business' | 'individuals' | 'entertainment'>('business');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serviceData, setServiceData] = useState<any>(null);

  useEffect(() => {
    fetchServiceContent();
  }, [activeTab]);

  const fetchServiceContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('service_type', activeTab)
      .single();
    
    if (data) setServiceData(data);
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!serviceData) return;
    setSaving(true);
    const { error } = await supabase
      .from('services')
      .update({
        hero_title: serviceData.hero_title,
        hero_description: serviceData.hero_description,
        intro_text: serviceData.intro_text,
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceData.id);
    
    setSaving(false);
    if (!error) {
      alert('Service configuration synced successfully.');
    } else {
      alert('Sync error: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight">Service Playgrounds</h2>
          <p className="text-[#888] mt-1">Refining core positioning and value propositions.</p>
        </div>
        <button 
          onClick={handleUpdate}
          disabled={saving || loading}
          className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#eee] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? 'Syncing...' : 'Save Configuration'}
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl w-fit">
        {(['business', 'individuals', 'entertainment'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-white text-black' : 'text-[#555] hover:text-[#aaa]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-[#555] animate-pulse">
          Retrieving Playground State...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-2xl space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-3">
                  <Layout size={20} className="text-white/20" />
                  Primary Presence
                </h3>
                <CheckCircle size={16} className="text-green-500/20" />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">Headline Promise</label>
                <textarea 
                  rows={2}
                  value={serviceData?.hero_title || ''}
                  onChange={e => setServiceData({...serviceData, hero_title: e.target.value})}
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-4 focus:border-white outline-none text-xl font-bold font-display transition-colors"
                  placeholder="The bold statement..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">Strategic Overview</label>
                <textarea 
                  rows={4}
                  value={serviceData?.hero_description || ''}
                  onChange={e => setServiceData({...serviceData, hero_description: e.target.value})}
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-4 focus:border-white outline-none text-sm text-[#888] leading-relaxed transition-colors"
                  placeholder="Elaborate on the solution..."
                />
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-2xl space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-3">
                <Zap size={20} className="text-white/20" />
                Contextual Intro
              </h3>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#444]">Philosophy Section Text</label>
                <textarea 
                  rows={4}
                  value={serviceData?.intro_text || ''}
                  onChange={e => setServiceData({...serviceData, intro_text: e.target.value})}
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-4 focus:border-white outline-none text-sm leading-relaxed transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] p-8 rounded-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#444] mb-6">Playground Metrics</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-xs text-[#555] font-bold">Offerings</span>
                  <span className="text-sm font-black font-mono">08</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-xs text-[#555] font-bold">Leads via Page</span>
                  <span className="text-sm font-black font-mono">142</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#555] font-bold">Conversion %</span>
                  <span className="text-sm font-black font-mono text-green-500">4.2%</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-2xl group hover:border-white/10 transition-all">
              <Globe size={24} className="mb-6 text-[#222] group-hover:text-white transition-colors" />
              <h4 className="font-bold text-white mb-3">Live Portal</h4>
              <p className="text-xs text-[#555] leading-relaxed mb-6">Real-time content sync is active. Updates reflect immediately on the frontend.</p>
              <button className="w-full py-3 bg-[#111] hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2">
                External Link <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
