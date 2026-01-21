
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, LayoutGrid, Star, MapPin, X, ArrowRight, ArrowLeft, CheckCircle2, 
  ShieldCheck, ChevronRight, Zap, Compass, SlidersHorizontal, RotateCcw, 
  Droplets, Zap as Electric, GraduationCap, Wrench, Leaf, Sparkles, 
  HeartPulse, Paintbrush, Wind, Truck, Dog, TrendingUp, User, Wallet, 
  Map as MapIcon, Clock, Briefcase, Award, Box, BadgeCheck, Loader2, 
  Sun, Moon, Hammer, Lightbulb, Navigation, Settings, Shield, 
  Map as LucideMap, Grid, ChevronDown, Heart, ShieldAlert, Trash2, 
  CheckCircle, Eye, LogOut, UserCheck, ShieldPlus, Calendar
} from 'lucide-react';
import { SERVICE_PROVIDERS, CATEGORIES, LOCATIONS } from './data';
import { ServiceProvider, FilterState, AppView, ServiceStatus, UserRole } from './types';

declare const L: any;

// --- Persistence Helpers ---
const STORAGE_KEYS = {
  PROVIDERS: 'servizo_providers_v1',
  SHORTLIST: 'servizo_shortlist_v1',
  THEME: 'servizo_theme',
  ROLE: 'servizo_role'
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// --- Specialized Components ---

// Added ScreenLoader component to fix "Cannot find name 'ScreenLoader'" error
const ScreenLoader: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white dark:bg-zinc-950 transition-all duration-500">
      <div className="flex flex-col items-center gap-6 text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <div className="flex flex-col items-center">
          <BrandIdentity size="sm" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mt-4 animate-pulse">Connecting to Specialist Network</p>
        </div>
      </div>
    </div>
  );
};

const ThemeToggle: React.FC<{ theme: string; setTheme: (t: 'light' | 'dark') => void }> = ({ theme, setTheme }) => (
  <button 
    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    className="fixed top-6 right-6 z-[110] p-3 glass-card rounded-full border border-zinc-200 dark:border-white/10 shadow-xl hover:scale-105 active:scale-95 transition-all"
  >
    {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
  </button>
);

const FilterDropdown: React.FC<{ filters: FilterState; setFilters: (f: FilterState) => void }> = ({ filters, setFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const availabilityOptions: ServiceStatus[] = ['Available', 'Busy', 'Offline'];
  
  const activeFilters = [
    filters.availability && `Status: ${filters.availability}`,
    filters.category && `Category: ${filters.category}`,
    filters.location && `Location: ${filters.location}`
  ].filter(Boolean);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 px-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl font-bold flex items-center gap-3 hover:border-blue-500 transition-all min-w-[140px]"
      >
        <SlidersHorizontal className="w-5 h-5" />
        <span>Filters</span>
        {activeFilters.length > 0 && (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{activeFilters.length}</span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-80 glass-card rounded-3xl border border-zinc-200 dark:border-white/10 shadow-6xl p-6 animate-in fade-in slide-in-from-top-2 z-50">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg">Filters</h3>
              <button 
                onClick={() => setFilters({ search: filters.search, category: '', location: '', availability: '' })}
                className="text-xs font-bold text-zinc-500 hover:text-blue-500 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 block">Availability Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {availabilityOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => setFilters({...filters, availability: filters.availability === status ? '' : status})}
                      className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all border ${
                        filters.availability === status 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-white dark:bg-white/5 text-zinc-500 border-zinc-200 dark:border-white/10 hover:border-blue-500'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 block">Category</label>
                <select 
                  value={filters.category} 
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 font-bold outline-none focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 block">Location</label>
                <select 
                  value={filters.location} 
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 font-bold outline-none focus:border-blue-500"
                >
                  <option value="">All Locations</option>
                  {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
            </div>
            
            {activeFilters.length > 0 && (
              <div className="pt-4 border-t border-zinc-100 dark:border-white/5">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Active Filters</p>
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter, i) => (
                    <span key={i} className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                      {filter}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const RoleSwitcher: React.FC<{ role: UserRole; setRole: (r: UserRole) => void }> = ({ role, setRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const roles: { id: UserRole; label: string; icon: any; color: string }[] = [
    { id: 'user', label: 'User', icon: User, color: 'text-indigo-500' },
    { id: 'provider', label: 'Provider', icon: Wrench, color: 'text-emerald-500' },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'text-rose-500' },
  ];

  return (
    <div className="fixed top-6 left-6 z-[110]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="glass-card flex items-center gap-3 px-5 py-3 rounded-full border border-zinc-200 dark:border-white/10 shadow-xl hover:scale-105 active:scale-95 transition-all"
      >
        {(() => {
          const current = roles.find(r => r.id === role);
          const Icon = current?.icon;
          return <><Icon className={`w-4 h-4 ${current?.color}`} /> <span className="text-[10px] font-black uppercase tracking-widest">{current?.label}</span></>;
        })()}
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-48 glass-card rounded-3xl border border-zinc-200 dark:border-white/10 shadow-6xl p-2 animate-in fade-in slide-in-from-top-2">
          {roles.map(r => (
            <button
              key={r.id}
              onClick={() => { setRole(r.id); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors ${role === r.id ? 'bg-zinc-100 dark:bg-white/10' : ''}`}
            >
              <r.icon className={`w-4 h-4 ${r.color}`} />
              <span className="text-xs font-bold">{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ServizoLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(10, 5)">
      <path d="M30 40C20 40 10 30 10 20C10 10 20 0 35 0C50 0 60 10 60 25C60 40 50 50 40 50" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" />
      <circle cx="60" cy="25" r="7" fill="#3B82F6" /><circle cx="40" cy="50" r="7" fill="#3B82F6" />
      <path d="M50 60C60 60 70 70 70 80C70 90 60 100 45 100C30 100 20 90 20 75C20 60 30 50 40 50" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" />
      <circle cx="20" cy="75" r="7" fill="#3B82F6" /><circle cx="40" cy="50" r="7" fill="#3B82F6" />
    </g>
  </svg>
);

const BrandIdentity: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => (
  <div className={`flex flex-col items-center justify-center gap-2 ${size === 'lg' ? 'mb-12' : ''}`}>
    <ServizoLogo className={`${size === 'lg' ? 'w-32 h-32 md:w-48 md:h-48' : 'w-10 h-10 md:w-14 md:h-14'}`} />
    <div className={`flex items-baseline font-black tracking-tighter text-zinc-900 dark:text-white ${size === 'lg' ? 'text-6xl md:text-8xl' : 'text-2xl md:text-3xl'}`}>
      <span>Serv</span><span className="relative inline-flex flex-col items-center"><span className="text-blue-500 absolute -top-[0.22em] inline-block w-[0.25em] h-[0.25em] rounded-full bg-blue-500"></span><span className="leading-none">ı</span></span><span>zo</span>
    </div>
  </div>
);

const CATEGORY_UI: Record<string, any> = {
  'Plumbing': { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  'Electrical': { icon: Electric, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  'Tutoring': { icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  'Mechanic': { icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  'Home Maintenance': { icon: Hammer, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  'Gardening': { icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  'Cleaning': { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  'Moving': { icon: Truck, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
  'Pet Care': { icon: Dog, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  'Beauty': { icon: Paintbrush, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  'Wellness': { icon: HeartPulse, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  'AC Repair': { icon: Wind, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  'Appliance Repair': { icon: Electric, color: 'text-amber-400', bg: 'bg-amber-400/10' },
};

const ProfileRing: React.FC<{ avatar: string; status: ServiceStatus; size?: 'sm' | 'lg'; verified?: boolean }> = ({ avatar, status, size = 'sm', verified }) => {
  const color = status === 'Available' ? 'border-emerald-500' : status === 'Busy' ? 'border-amber-500' : 'border-zinc-300 dark:border-zinc-700';
  return (
    <div className="relative inline-block shrink-0">
      <div className={`p-1 rounded-full border-2 ${color} transition-all duration-700 shadow-xl`}>
        <img src={avatar} className={`${size === 'lg' ? 'w-24 h-24 md:w-32 md:h-32' : 'w-14 h-14'} rounded-full object-cover grayscale hover:grayscale-0 transition-all`} alt="Profile" />
      </div>
      <div className={`absolute bottom-1 right-1 ${size === 'lg' ? 'w-6 h-6' : 'w-3 h-3'} rounded-full border-4 border-white dark:border-zinc-900 ${color.replace('border-', 'bg-')}`} />
      {verified && (
        <div className={`absolute top-0 right-0 bg-blue-500 ${size === 'lg' ? 'p-2' : 'p-1'} rounded-full border-4 border-white dark:border-zinc-900 shadow-xl`}>
          <BadgeCheck className={`${size === 'lg' ? 'w-5 h-5' : 'w-3 h-3'} text-white`} />
        </div>
      )}
    </div>
  );
};

// --- Interactive Map Component ---
const InteractiveMap: React.FC<{ providers: ServiceProvider[]; userCoords: any; onSelect: (p: ServiceProvider) => void; theme: string }> = ({ providers, userCoords, onSelect, theme }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const markers = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const findNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(coords);
          if (mapInst.current) {
            mapInst.current.setView([coords.lat, coords.lng], 15);
          }
        },
        () => alert('Location access denied')
      );
    }
  };

  useEffect(() => {
    if (!mapRef.current || typeof L === 'undefined') return;
    mapInst.current = L.map(mapRef.current, { attributionControl: false, zoomControl: false }).setView(userCoords ? [userCoords.lat, userCoords.lng] : [12.9716, 77.5946], 13);
    const tile = theme === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    L.tileLayer(tile, { maxZoom: 18 }).addTo(mapInst.current);
    markers.current = L.layerGroup().addTo(mapInst.current);
    return () => mapInst.current?.remove();
  }, [theme]);

  useEffect(() => {
    if (!markers.current) return;
    markers.current.clearLayers();
    
    // Add user location marker if available
    if (userLocation && typeof L !== 'undefined') {
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-xl animate-pulse"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8]
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(markers.current);
    }
    
    providers.forEach(p => {
      const icon = L.divIcon({
        className: 'marker',
        html: `<div class="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-xl"><img src="${p.avatar}" class="w-full h-full object-cover" /></div>`,
        iconSize: [40, 40], iconAnchor: [20, 20]
      });
      L.marker([p.lat, p.lng], { icon }).addTo(markers.current).on('click', () => onSelect(p));
    });
  }, [providers, userLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-white/5" />
      <button 
        onClick={findNearMe}
        className="absolute top-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all z-[1000]"
        title="Find workers near me"
      >
        <Navigation className="w-5 h-5" />
      </button>
    </div>
  );
};

// --- Main Pages ---

const HomePage: React.FC<{ onSearch: (q: string) => void }> = ({ onSearch }) => {
  const [q, setQ] = useState('');
  return (
    <div className="min-h-screen">
      <div className="pt-24 pb-48 flex flex-col items-center px-6">
        <BrandIdentity size="lg" />
        <div className="max-w-3xl w-full space-y-12 text-center">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">Find Elite <span className="text-blue-500">Service</span> Experts.</h1>
          <form onSubmit={(e) => { e.preventDefault(); onSearch(q); }} className="relative group">
            <input 
              type="text" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="w-full h-20 md:h-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-full px-12 text-xl md:text-3xl font-black outline-none shadow-premium-light dark:shadow-6xl focus:border-blue-500 transition-all"
            />
            <button type="submit" className="absolute right-3 top-3 bottom-3 px-8 md:px-12 bg-blue-600 text-white rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all">Go</button>
          </form>
        </div>
      </div>
      
      <section className="py-24 px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto text-center space-y-16">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Popular Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {CATEGORIES.slice(0, 6).map(cat => {
              const UI = CATEGORY_UI[cat];
              return (
                <div key={cat} className="glass-card p-6 rounded-3xl border border-zinc-200 dark:border-white/5 hover:scale-105 transition-all cursor-pointer">
                  <div className={`w-12 h-12 ${UI.bg} ${UI.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <UI.icon className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-sm">{cat}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      <footer className="py-16 px-6 border-t border-zinc-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <BrandIdentity size="sm" />
            <p className="text-zinc-500 text-sm">Connect with verified service professionals in your area.</p>
          </div>
          <div className="space-y-4">
            <h3 className="font-black text-lg">Services</h3>
            <div className="space-y-2 text-sm text-zinc-500">
              <p>Home Maintenance</p>
              <p>Professional Services</p>
              <p>Personal Care</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-black text-lg">Company</h3>
            <div className="space-y-2 text-sm text-zinc-500">
              <p>About Us</p>
              <p>Contact</p>
              <p>Privacy Policy</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-black text-lg">Support</h3>
            <div className="space-y-2 text-sm text-zinc-500">
              <p>Help Center</p>
              <p>Safety</p>
              <p>Terms of Service</p>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-zinc-200 dark:border-white/10 text-center text-sm text-zinc-500">
          <p>© 2024 Servizo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const WorkerListingsPage: React.FC<{ 
  providers: ServiceProvider[]; 
  onProfile: (p: ServiceProvider) => void;
  filters: FilterState; setFilters: any;
  role: UserRole;
  shortlist: string[];
  toggleShortlist: (id: string) => void;
  adminActions: { verify: (id: string) => void; reject: (id: string) => void; restore: (id: string) => void };
  theme: string;
}> = ({ providers, onProfile, filters, setFilters, role, shortlist, toggleShortlist, adminActions, theme }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  return (
    <div className="min-h-screen pt-12 pb-48 px-6 lg:px-12 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left"><h2 className="text-4xl md:text-6xl font-black tracking-tighter">Marketplace.</h2><p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Discover {providers.length} Verified Specialists</p></div>
        <div className="flex gap-2 p-1.5 bg-zinc-100 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10">
          <button onClick={() => setViewMode('grid')} className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>List</button>
          <button onClick={() => setViewMode('map')} className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>Map</button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400" />
          <input 
            type="text" value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})}
            placeholder="Filter by skill, name or location..."
            className="w-full h-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl pl-16 pr-6 font-bold outline-none"
          />
        </div>
        
        <FilterDropdown filters={filters} setFilters={setFilters} />
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.map(p => {
            const isShortlisted = shortlist.includes(p.id);
            const UI = CATEGORY_UI[p.category] || CATEGORY_UI['Cleaning'];
            return (
              <div key={p.id} className={`group glass-card p-8 rounded-[3rem] border transition-all hover:-translate-y-2 cursor-pointer flex flex-col justify-between min-h-[500px] ${p.isRejected ? 'opacity-40 grayscale border-rose-500/50' : 'border-zinc-200 dark:border-white/5'}`}>
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div onClick={() => !p.isRejected && onProfile(p)}><ProfileRing avatar={p.avatar} status={p.availability} verified={p.verified} /></div>
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleShortlist(p.id); }}
                        className={`p-3 rounded-full border transition-all ${isShortlisted ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-white/10 text-zinc-400'}`}
                      >
                        <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`} />
                      </button>
                      <div className={`px-4 py-1.5 rounded-full ${UI.bg} ${UI.color} text-[10px] font-black uppercase tracking-widest`}>{p.category}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-left" onClick={() => !p.isRejected && onProfile(p)}>
                    <h3 className="text-3xl font-black tracking-tight">{p.name}</h3>
                    <p className="text-sm font-bold text-zinc-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> {p.location.split(',')[0]}</p>
                    <p className="text-sm text-zinc-600 line-clamp-2">{p.description}</p>
                  </div>
                </div>

                {role === 'admin' ? (
                  <div className="pt-6 border-t border-zinc-100 dark:border-white/5 flex gap-2">
                    {!p.isRejected ? (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); adminActions.verify(p.id); }} className="flex-1 py-3 bg-blue-600/10 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-600/20 hover:bg-blue-600 hover:text-white transition-all">Verify</button>
                        <button onClick={(e) => { e.stopPropagation(); adminActions.reject(p.id); }} className="flex-1 py-3 bg-rose-600/10 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-600/20 hover:bg-rose-600 hover:text-white transition-all">Reject</button>
                      </>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); adminActions.restore(p.id); }} className="w-full py-3 bg-emerald-600/10 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-600/20 hover:bg-emerald-600 hover:text-white transition-all">Restore Listing</button>
                    )}
                  </div>
                ) : (
                  <div className="pt-8 flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Base Rate</p>
                      <p className="text-3xl font-black">{p.price}</p>
                    </div>
                    <button onClick={() => !p.isRejected && onProfile(p)} className="p-4 bg-blue-600 text-white rounded-full hover:scale-110 active:scale-95 transition-all"><ArrowRight className="w-6 h-6" /></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-[600px] glass-card rounded-[3rem] border border-zinc-200 dark:border-white/5 overflow-hidden">
          <InteractiveMap providers={providers} userCoords={{lat: 12.9716, lng: 77.5946}} onSelect={onProfile} theme={theme} />
        </div>
      )}
    </div>
  );
};

const ProfilePage: React.FC<{ provider: ServiceProvider; onBack: () => void; shortlist: string[]; toggleShortlist: (id: string) => void }> = ({ provider, onBack, shortlist, toggleShortlist }) => {
  const isShortlisted = shortlist.includes(provider.id);
  const images = [provider.avatar, "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400", "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400"];
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className="min-h-screen pt-12 pb-48 px-6 lg:px-24 max-w-7xl mx-auto space-y-16 animate-in slide-in-from-bottom-8">
      <button onClick={onBack} className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-zinc-500 hover:text-blue-500 transition-all"><ArrowLeft className="w-4 h-4" /> Back</button>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
          <div className="glass-card p-10 rounded-[4rem] text-center space-y-8 border border-zinc-200 dark:border-white/5 shadow-6xl">
            <ProfileRing avatar={provider.avatar} status={provider.availability} size="lg" verified={provider.verified} />
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tighter">{provider.name}</h1>
              <p className="text-blue-500 font-black uppercase tracking-widest text-xs">{provider.category} Expert</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-100 dark:bg-white/5 p-6 rounded-3xl"><p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Exp.</p><p className="text-xl font-black">{provider.yearsExperience}Y</p></div>
              <div className="bg-zinc-100 dark:bg-white/5 p-6 rounded-3xl"><p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Rating</p><p className="text-xl font-black">{provider.rating}</p></div>
            </div>
            <div className="flex gap-4">
              <button className="flex-1 py-6 bg-blue-600 text-white rounded-3xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl">Book Now</button>
              <button onClick={() => toggleShortlist(provider.id)} className={`p-6 rounded-3xl border transition-all ${isShortlisted ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-400'}`}><Heart className={`w-6 h-6 ${isShortlisted ? 'fill-current' : ''}`} /></button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-20 text-left">
          <section className="space-y-8">
            <h2 className="text-6xl font-black tracking-tighter">About Specialist.</h2>
            <p className="text-2xl text-zinc-500 leading-relaxed italic border-l-8 border-blue-500/20 pl-8">"{provider.longBio}"</p>
            <div className="relative">
              <img src={images[currentImage]} className="w-full h-64 object-cover rounded-[2rem] border border-zinc-200 dark:border-white/10 shadow-lg" alt="Work" />
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <button onClick={() => setCurrentImage(prev => prev === 0 ? images.length - 1 : prev - 1)} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"><ArrowLeft className="w-4 h-4" /></button>
                <button onClick={() => setCurrentImage(prev => prev === images.length - 1 ? 0 : prev + 1)} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"><ArrowRight className="w-4 h-4" /></button>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {images.slice(1).map((img, i) => <img key={i} src={img} onClick={() => setCurrentImage(i + 1)} className="w-full h-32 object-cover rounded-2xl border border-zinc-200 dark:border-white/10 shadow-lg cursor-pointer hover:scale-105 transition-all" alt="Work" />)}
            </div>
          </section>

          <section className="space-y-10">
            <h3 className="text-3xl font-black uppercase tracking-widest text-zinc-400">Expert Reviews</h3>
            <div className="space-y-6">
              {provider.reviews.map(r => (
                <div key={r.id} className="glass-card p-8 rounded-[3rem] border border-zinc-200 dark:border-white/5 space-y-4">
                  <div className="flex justify-between items-center"><h4 className="font-black text-xl">{r.user}</h4><div className="flex gap-1">{[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= r.rating ? 'text-amber-400 fill-current' : 'text-zinc-200 dark:text-zinc-800'}`} />)}</div></div>
                  <p className="text-lg text-zinc-500 italic">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC<{ role: UserRole; providers: ServiceProvider[]; updateProvider: (p: ServiceProvider) => void }> = ({ role, providers, updateProvider }) => {
  // Provider Role Simulation (Arjun Mehta)
  const myProfile = providers.find(p => p.id === '1')!;
  const [desc, setDesc] = useState(myProfile.description);

  const handleStatus = (status: ServiceStatus) => {
    updateProvider({ ...myProfile, availability: status });
  };

  const saveDesc = () => {
    updateProvider({ ...myProfile, description: desc });
  };

  if (role === 'admin') return (
    <div className="min-h-screen pt-24 pb-48 px-6 max-w-7xl mx-auto space-y-16 animate-in slide-in-from-right-10">
      <div className="space-y-4 text-left"><h1 className="text-7xl font-black tracking-tighter">Admin Console.</h1><p className="text-rose-500 font-black uppercase tracking-[0.5em] text-[10px]">Critical Infrastructure Access</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-10 rounded-[3rem] border border-zinc-200 dark:border-white/5"><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Active Listings</p><p className="text-5xl font-black">{providers.filter(p => !p.isRejected).length}</p></div>
        <div className="glass-card p-10 rounded-[3rem] border border-zinc-200 dark:border-white/5 text-rose-500"><p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Rejections</p><p className="text-5xl font-black">{providers.filter(p => p.isRejected).length}</p></div>
        <div className="glass-card p-10 rounded-[3rem] border border-zinc-200 dark:border-white/5 text-blue-500"><p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Verified</p><p className="text-5xl font-black">{providers.filter(p => p.verified).length}</p></div>
        <div className="glass-card p-10 rounded-[3rem] border border-zinc-200 dark:border-white/5 text-amber-500"><p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Pending</p><p className="text-5xl font-black">0</p></div>
      </div>
      <div className="glass-card p-1 rounded-[3rem] border border-zinc-200 dark:border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400"><tr className="p-8"><th className="p-8">Provider</th><th className="p-8">Category</th><th className="p-8">Status</th><th className="p-8 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
            {providers.map(p => (
              <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                <td className="p-8 font-bold flex items-center gap-4">
                  <img src={p.avatar} className="w-10 h-10 rounded-full" /> 
                  {p.name} 
                  {p.verified && <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-full"><BadgeCheck className="w-3 h-3 text-blue-500" /><span className="text-[9px] font-black text-blue-500 uppercase">Verified</span></div>}
                </td>
                <td className="p-8 text-sm">{p.category}</td>
                <td className="p-8"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${p.isRejected ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{p.isRejected ? 'Rejected' : 'Active'}</span></td>
                <td className="p-8 text-right flex justify-end gap-2">
                   <button onClick={() => updateProvider({...p, verified: !p.verified})} className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><ShieldCheck className="w-5 h-5" /></button>
                   <button onClick={() => updateProvider({...p, isRejected: !p.isRejected})} className={`p-2 rounded-xl transition-all ${p.isRejected ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'}`}><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-48 px-6 max-w-5xl mx-auto space-y-16 animate-in slide-in-from-left-10 text-left">
      <div className="space-y-4"><h1 className="text-7xl font-black tracking-tighter">My Dashboard.</h1><p className="text-emerald-500 font-black uppercase tracking-[0.5em] text-[10px]">Welcome back, Arjun</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="glass-card p-12 rounded-[4rem] border border-zinc-200 dark:border-white/5 space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Live Presence</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Available', 'Busy', 'Offline'] as ServiceStatus[]).map(s => (
                <button 
                  key={s} onClick={() => handleStatus(s)}
                  className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${myProfile.availability === s ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-white/5 text-zinc-500 border-zinc-200 dark:border-white/10'}`}
                >{s}</button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Headline Bio</label>
            <textarea 
              value={desc} onChange={(e) => setDesc(e.target.value)}
              className="w-full h-32 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 font-medium text-zinc-600 dark:text-zinc-400 outline-none focus:border-emerald-500"
            />
            <button onClick={saveDesc} className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">Update Listing</button>
          </div>
        </div>
        <div className="glass-card p-12 rounded-[4rem] border border-zinc-200 dark:border-white/5 flex flex-col justify-between">
          <div className="space-y-2"><p className="text-4xl font-black tracking-tight">Active Bookings</p><p className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Managing {myProfile.completedJobs} successful interventions</p></div>
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-zinc-300 dark:text-zinc-800"><Calendar className="w-24 h-24" /><p className="font-black uppercase tracking-widest text-xs">No pending appointments</p></div>
          <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10"><p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Weekly Earnings</p><p className="text-4xl font-black">₹12,450</p></div>
        </div>
      </div>
    </div>
  );
};

// URL Router Helper
const getRouteFromURL = (): { view: AppView; role: UserRole; providerId?: string } => {
  const path = window.location.pathname.slice(1);
  const segments = path.split('/');
  
  if (segments[0] === 'admin') return { view: 'dashboard', role: 'admin' };
  if (segments[0] === 'provider') return { view: 'dashboard', role: 'provider' };
  if (segments[0] === 'listings') return { view: 'listings', role: 'user' };
  if (segments[0] === 'profile' && segments[1]) return { view: 'profile', role: 'user', providerId: segments[1] };
  if (segments[0] === 'shortlist') return { view: 'shortlist', role: 'user' };
  
  return { view: 'home', role: 'user' };
};

const updateURL = (view: AppView, role: UserRole, providerId?: string) => {
  let path = '/';
  if (role === 'admin') path = '/admin';
  else if (role === 'provider') path = '/provider';
  else if (view === 'listings') path = '/listings';
  else if (view === 'profile' && providerId) path = `/profile/${providerId}`;
  else if (view === 'shortlist') path = '/shortlist';
  
  window.history.pushState({}, '', path);
};

export default function App() {
  const initialRoute = getRouteFromURL();
  const [role, setRole] = useState<UserRole>(() => initialRoute.role || (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'user');
  const [view, setView] = useState<AppView>(initialRoute.view);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ search: '', category: '', location: '', availability: '' });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'dark');
  const [shortlist, setShortlist] = useState<string[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.SHORTLIST) || '[]'));
  const [providersData, setProvidersData] = useState<ServiceProvider[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
    return saved ? JSON.parse(saved) : SERVICE_PROVIDERS;
  });

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const route = getRouteFromURL();
      setRole(route.role);
      setView(route.view);
      if (route.providerId) {
        const provider = providersData.find(p => p.id === route.providerId);
        setSelectedProvider(provider || null);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [providersData]);

  // Initialize provider from URL on mount
  useEffect(() => {
    if (initialRoute.providerId) {
      const provider = providersData.find(p => p.id === initialRoute.providerId);
      setSelectedProvider(provider || null);
    }
  }, [providersData]);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ROLE, role); }, [role]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SHORTLIST, JSON.stringify(shortlist)); }, [shortlist]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providersData)); }, [providersData]);

  const toggleShortlist = (id: string) => {
    setShortlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const updateProvider = (updated: ServiceProvider) => {
    setProvidersData(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const navigateTo = (v: AppView, p: ServiceProvider | null = null) => {
    setIsPageLoading(true);
    updateURL(v, role, p?.id);
    setTimeout(() => {
      setSelectedProvider(p); setView(v); window.scrollTo(0,0); setIsPageLoading(false);
    }, 800);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    const targetView = newRole === 'admin' || newRole === 'provider' ? 'dashboard' : 'home';
    updateURL(targetView, newRole);
    navigateTo(targetView);
  };

  const filtered = useMemo(() => {
    return providersData.filter(p => {
      // User only sees non-rejected
      if (role === 'user' && p.isRejected) return false;
      const s = filters.search.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s) || p.skills.some(sk => sk.toLowerCase().includes(s));
      const matchesCategory = !filters.category || p.category === filters.category;
      const matchesLocation = !filters.location || p.location.includes(filters.location);
      const matchesAvailability = !filters.availability || p.availability === filters.availability;
      
      return matchesSearch && matchesCategory && matchesLocation && matchesAvailability;
    });
  }, [providersData, filters, role]);

  return (
    <div className="min-h-screen transition-colors duration-500">
      <ScreenLoader isVisible={isPageLoading} />
      <RoleSwitcher role={role} setRole={handleRoleChange} />
      <ThemeToggle theme={theme} setTheme={setTheme} />
      
      <main className={isPageLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}>
        {view === 'home' && <HomePage onSearch={(q) => { setFilters({...filters, search: q}); navigateTo('listings'); }} />}
        {view === 'listings' && (
          <WorkerListingsPage 
            providers={filtered} 
            onProfile={(p) => navigateTo('profile', p)} 
            filters={filters} setFilters={setFilters} 
            role={role} shortlist={shortlist} toggleShortlist={toggleShortlist}
            adminActions={{ verify: (id) => updateProvider({...providersData.find(p => p.id === id)!, verified: true}), reject: (id) => updateProvider({...providersData.find(p => p.id === id)!, isRejected: true}), restore: (id) => updateProvider({...providersData.find(p => p.id === id)!, isRejected: false}) }}
            theme={theme}
          />
        )}
        {view === 'shortlist' && (
          <WorkerListingsPage 
            providers={providersData.filter(p => shortlist.includes(p.id) && !p.isRejected)} 
            onProfile={(p) => navigateTo('profile', p)} 
            filters={filters} setFilters={setFilters} 
            role={role} shortlist={shortlist} toggleShortlist={toggleShortlist}
            adminActions={{ verify: (id) => {}, reject: (id) => {}, restore: (id) => {} }}
            theme={theme}
          />
        )}
        {view === 'profile' && selectedProvider && <ProfilePage provider={selectedProvider} onBack={() => navigateTo('listings')} shortlist={shortlist} toggleShortlist={toggleShortlist} />}
        {view === 'dashboard' && <DashboardPage role={role} providers={providersData} updateProvider={updateProvider} />}
      </main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 dock-blur rounded-full flex gap-4 shadow-6xl">
        <button onClick={() => navigateTo('home')} className={`p-3 rounded-full ${view === 'home' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}><Compass /></button>
        <button onClick={() => navigateTo('listings')} className={`p-3 rounded-full ${view === 'listings' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}><Grid /></button>
        <button onClick={() => navigateTo('shortlist')} className={`p-3 rounded-full ${view === 'shortlist' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}><Heart /></button>
        <button onClick={() => navigateTo('dashboard')} className={`p-3 rounded-full ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>{role === 'admin' ? <ShieldCheck /> : <User />}</button>
      </div>
    </div>
  );
}
