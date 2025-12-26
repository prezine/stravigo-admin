
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  Settings, 
  MessageSquare, 
  UserPlus, 
  Image as ImageIcon,
  Bell,
  Search,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import CaseStudies from './pages/CaseStudies';
import Insights from './pages/Insights';
import Leads from './pages/Leads';
import Testimonials from './pages/Testimonials';
import Services from './pages/Services';
import Careers from './pages/Careers';

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-[#1a1a1a] text-[#ffffff] border-l-4 border-white' 
        : 'text-[#888888] hover:text-white hover:bg-[#111111]'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const AppContent = () => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-[#1a1a1a] transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold tracking-tighter font-display uppercase italic">Stravigo</h1>
            <p className="text-[10px] text-[#555] tracking-widest uppercase mt-1">Admin Portal</p>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
            <SidebarLink to="/case-studies" icon={Briefcase} label="Our Work" active={location.pathname === '/case-studies'} />
            <SidebarLink to="/insights" icon={FileText} label="Insights" active={location.pathname === '/insights'} />
            <SidebarLink to="/leads" icon={Users} label="Leads" active={location.pathname === '/leads'} />
            <SidebarLink to="/testimonials" icon={MessageSquare} label="Testimonials" active={location.pathname === '/testimonials'} />
            <SidebarLink to="/services" icon={Settings} label="Services" active={location.pathname === '/services'} />
            <SidebarLink to="/careers" icon={UserPlus} label="Careers" active={location.pathname === '/careers'} />
          </nav>

          <div className="p-4 border-t border-[#1a1a1a]">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#333] to-[#666]"></div>
              <div>
                <p className="text-xs font-semibold">Admin User</p>
                <p className="text-[10px] text-[#666]">Stravigo Team</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center justify-between px-6 sticky top-0 z-40">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="lg:hidden text-white"
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          
          <div className="hidden md:flex items-center bg-[#111] px-3 py-1.5 rounded-full border border-[#222] w-64 transition-all focus-within:w-80">
            <Search size={16} className="text-[#555]" />
            <input 
              type="text" 
              placeholder="Search content..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-white placeholder-[#555]"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-[#888] hover:text-white relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-[#1a1a1a]"></div>
            <p className="text-xs font-medium text-[#888]">November 2025</p>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/services" element={<Services />} />
            <Route path="/careers" element={<Careers />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
