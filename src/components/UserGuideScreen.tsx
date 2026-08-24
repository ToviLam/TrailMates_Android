import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Compass, 
  MapPin, 
  Eye, 
  ShieldAlert, 
  Camera, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle, 
  Users, 
  ChevronDown,
  Info,
  ArrowRight,
  Zap,
  Lock,
  ChevronUp
} from 'lucide-react';

interface UserGuideScreenProps {
  onNavigateToScreen: (screen: string) => void;
  onClose?: () => void;
}

export const UserGuideScreen: React.FC<UserGuideScreenProps> = ({ onNavigateToScreen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'getting_started' | 'map_routes' | 'social_tiers' | 'ar_radar' | 'faq'>('getting_started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaqIndex(expandedFaqIndex === index ? null : index);
  };

  const stepsGettingStarted = [
    {
      title: "1. Create Profile",
      desc: "Tap Profile. Enter your details and customize visibility permissions.",
      icon: Users,
      color: "text-brand-green",
      bg: "bg-brand-green/10"
    },
    {
      title: "2. Build Your Avatar",
      desc: "Tap Redesign Avatar. Pick body, skin, hair, outfit colors, and sunglasses or helmets.",
      icon: Sparkles,
      color: "text-brand-pop",
      bg: "bg-brand-pop/10"
    },
    {
      title: "3. Choose Fitness Level",
      desc: "Select sports disciplines to let the proximity algorithm find compatible buddy matches.",
      icon: Zap,
      color: "text-brand-accent",
      bg: "bg-brand-accent/10"
    }
  ];

  const stepsMapRoutes = [
    {
      title: "Option A: Canvas Plotting",
      desc: "Tap Draw Route, click the map to add waypoint dots. Telemetry computes distance and elevation gains in real time.",
      type: "Manual Draw"
    },
    {
      title: "Option B: GPS Tracker",
      desc: "Open Draw Route and tap Start GPS Recording. TrailMates tracks and logs your active workout line.",
      type: "GPS Record"
    },
    {
      title: "Option C: GPX Logs",
      desc: "Click Import GPX File on the Draw screen to overlay and render your Garmin or Strava exported files.",
      type: "GPX Import"
    }
  ];

  const stepsSocialTiers = [
    {
      title: "Friend / Mate Tier",
      desc: "Friends see live workouts, view 'Friends Only' posts, send direct messages, and invite you to active runs.",
      icon: CheckCircle,
      badge: "Full Access",
      color: "text-brand-green bg-brand-green/10 border border-brand-green/20"
    },
    {
      title: "Challenger Tier",
      desc: "Challengers see only your public bio card and public posts. Live tracking and private messaging are restricted.",
      icon: Lock,
      badge: "Private Shield",
      color: "text-brand-pop bg-brand-pop/10 border border-brand-pop/20"
    }
  ];

  const faqs = [
    {
      q: "What is TrailMates?",
      a: "A proximity-based outdoor companion tracker for runners, cyclists, and hikers to draw and sync routes, match with training buddies, and race with simulated coaches."
    },
    {
      q: "Why can't a Challenger view my daily posts?",
      a: "If your post is set to 'Friends Only' (default), only fully approved Friends have access. This protects your home and workspace coordinates."
    },
    {
      q: "Do I need to select a region or country?",
      a: "No. TrailMates is coordinates-driven, using browser geolocation to find tracks and peers near you instantly."
    },
    {
      q: "Why isn't the live AR view showing my partner?",
      a: "The camera HUD tracking has a maximum range of 100 meters. Move closer to establish partner location sync."
    },
    {
      q: "Is my precise location shared with the public?",
      a: "Never. Your real-time location is only shared during active shared workouts with authorized Friends."
    },
    {
      q: "Can I block or unblock a user?",
      a: "Yes. Go to the People tab, click their card, and tap Block. Unblock them anytime inside the Blocked section on the Profile tab."
    }
  ];

  const filteredFaqs = faqs.filter(
    item => 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-base text-zinc-50" id="in-app-user-guide-screen">
      {/* Upper Brand Header Banner */}
      <div className="bg-zinc-950 px-5 py-4 shrink-0 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-green flex items-center justify-center shadow-lg shadow-brand-green/25">
            <BookOpen className="w-4.5 h-4.5 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-xs font-display font-black tracking-tight leading-none text-white">USER GUIDE</h1>
            <p className="text-[9px] text-zinc-400 mt-1 font-mono uppercase tracking-wider">Companion Manual</p>
          </div>
        </div>
        
        {onClose ? (
          <button 
            onClick={onClose}
            className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 px-3 py-1.5 rounded-lg border border-zinc-800 transition-all cursor-pointer"
          >
            Close
          </button>
        ) : (
          <button 
            onClick={() => onNavigateToScreen('profile')}
            className="text-[10px] font-black uppercase tracking-wider text-brand-green hover:opacity-90 bg-zinc-900 hover:bg-zinc-850 px-3 py-1.5 rounded-lg border border-zinc-800 transition-all cursor-pointer"
          >
            Back
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="bg-zinc-950/40 border-b border-zinc-800/60 p-2 overflow-x-auto shrink-0 flex gap-1 scrollbar-none">
        <button
          onClick={() => { setActiveTab('getting_started'); setExpandedFaqIndex(null); }}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border-0 ${
            activeTab === 'getting_started' ? 'bg-brand-green text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 bg-transparent'
          }`}
        >
          🚀 1. Setup
        </button>
        <button
          onClick={() => { setActiveTab('map_routes'); setExpandedFaqIndex(null); }}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border-0 ${
            activeTab === 'map_routes' ? 'bg-brand-green text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 bg-transparent'
          }`}
        >
          🗺️ 2. Trails
        </button>
        <button
          onClick={() => { setActiveTab('social_tiers'); setExpandedFaqIndex(null); }}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border-0 ${
            activeTab === 'social_tiers' ? 'bg-brand-green text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 bg-transparent'
          }`}
        >
          🛡️ 3. Safety
        </button>
        <button
          onClick={() => { setActiveTab('ar_radar'); setExpandedFaqIndex(null); }}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border-0 ${
            activeTab === 'ar_radar' ? 'bg-brand-green text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 bg-transparent'
          }`}
        >
          🕶️ 4. HUD
        </button>
        <button
          onClick={() => { setActiveTab('faq'); setExpandedFaqIndex(null); }}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border-0 ${
            activeTab === 'faq' ? 'bg-brand-green text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 bg-transparent'
          }`}
        >
          ❓ FAQ
        </button>
      </div>

      {/* Main Instruction Workspace */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-md mx-auto w-full pb-8">
        
        {/* TAB 1: GETTING STARTED */}
        {activeTab === 'getting_started' && (
          <div className="space-y-3">
            <div className="bg-surface/50 rounded-2xl p-4 border border-zinc-800/40 text-zinc-300">
              <h2 className="text-xs font-display font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-green" /> Getting Started
              </h2>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed font-semibold">
                Build your athlete identity, configure physical parameters, and link with nearby training buddies:
              </p>
            </div>

            <div className="space-y-2.5">
              {stepsGettingStarted.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="bg-surface/80 backdrop-blur-md rounded-2xl border border-zinc-800/60 p-4 flex gap-3">
                    <div className={`w-8 h-8 rounded-lg shrink-0 ${step.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${step.color}`} />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">{step.title}</h4>
                      <p className="text-[11px] text-zinc-400 leading-normal font-semibold">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onNavigateToScreen('profile')}
              className="w-full py-2.5 bg-brand-green hover:opacity-90 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-0"
            >
              Configure Profile <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TAB 2: MAP WORKSPACES & TRAILS */}
        {activeTab === 'map_routes' && (
          <div className="space-y-3">
            <div className="bg-surface/50 rounded-2xl p-4 border border-zinc-800/40 text-zinc-300">
              <h3 className="text-xs font-display font-black text-brand-green uppercase tracking-wider">🗺️ ROUTE CREATION</h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed font-semibold">
                We support three seamless options to map trail routes and sync telemetry data:
              </p>
            </div>

            <div className="space-y-2.5">
              {stepsMapRoutes.map((step, idx) => (
                <div key={idx} className="bg-surface/80 backdrop-blur-md rounded-2xl border border-zinc-800/60 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-brand-green bg-brand-green/10 px-2 py-0.5 rounded border border-brand-green/20 font-mono">
                      {step.type}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">STEP 0{idx + 1}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{step.title}</h4>
                  <p className="text-[11px] text-zinc-400 leading-normal font-semibold">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onNavigateToScreen('discover')}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer border border-zinc-800"
              >
                Go to Map
              </button>
              <button
                onClick={() => onNavigateToScreen('create_route')}
                className="flex-1 py-2 bg-brand-green hover:opacity-90 text-zinc-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer border-0"
              >
                Draw Route
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SAFETY TIERS & BLOCKING */}
        {activeTab === 'social_tiers' && (
          <div className="space-y-3">
            <div className="bg-surface/50 border border-zinc-800/40 rounded-2xl p-4 text-zinc-300">
              <h2 className="text-xs font-display font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-brand-pop" /> Geographical Safety
              </h2>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed font-semibold">
                Control your safety with separate authorization boundaries:
              </p>
            </div>

            <div className="space-y-2.5">
              {stepsSocialTiers.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="bg-surface/80 backdrop-blur-md rounded-2xl border border-zinc-800/60 p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-zinc-300" />
                        <h4 className="text-xs font-bold text-white">{step.title}</h4>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${step.color} font-mono`}>
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal font-semibold">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* BLOCKING UTILITY TIPS */}
            <div className="bg-zinc-950/80 rounded-2xl p-4 border border-zinc-800 space-y-2.5">
              <h3 className="text-xs font-display font-black uppercase tracking-wider text-brand-pop flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-pop" /> Privacy Shield Actions
              </h3>
              <div className="space-y-1.5 text-[10px] text-zinc-400 leading-normal font-semibold">
                <p>
                  🚫 <span className="font-bold text-white">How to Block:</span> In the <span className="text-brand-green font-bold">People</span> tab, select any profile card and tap <span className="text-brand-pop font-black">Block User</span>.
                </p>
                <p>
                  🛡️ <span className="font-bold text-white">Profile Shield:</span> Set profile visibility to <span className="text-brand-green font-bold">Private</span> inside Settings to screen who can view your active GPS coordinates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LIVE PROXIMITY HUD */}
        {activeTab === 'ar_radar' && (
          <div className="space-y-3">
            <div className="bg-surface/50 rounded-2xl p-4 border border-zinc-800/40 text-zinc-300">
              <p className="text-[9px] text-brand-green font-black uppercase tracking-wider font-mono">Workout HUD</p>
              <h3 className="text-xs font-display font-black text-white">Live Tracking Telemetry</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5 font-semibold">
                During joint workouts, the system fires up high-fidelity proximity HUD layers:
              </p>
            </div>

            <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-zinc-800/60 p-4 space-y-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-brand-green/10 border border-brand-green/20 text-[9px] font-mono font-black text-brand-green flex items-center justify-center shrink-0">1</span>
                  <span className="text-xs font-bold text-white">Camera AR vs Radar</span>
                </div>
                <p className="text-[11px] text-zinc-400 pl-5 leading-normal font-semibold">
                  Toggle dynamic avatar indicators in camera mode, or switch to concentric circular sonar radar grids.
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-brand-green/10 border border-brand-green/20 text-[9px] font-mono font-black text-brand-green flex items-center justify-center shrink-0">2</span>
                  <span className="text-xs font-bold text-white">Swivel Compass Slider</span>
                </div>
                <p className="text-[11px] text-zinc-400 pl-5 leading-normal font-semibold">
                  Drag the compass swivel slider to rotate your view coordinates 360° to locate nearby training mates.
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-brand-green/10 border border-brand-green/20 text-[9px] font-mono font-black text-brand-green flex items-center justify-center shrink-0">3</span>
                  <span className="text-xs font-bold text-white">Sprint Boost</span>
                </div>
                <p className="text-[11px] text-zinc-400 pl-5 leading-normal font-semibold">
                  Tap Sprint Push! to instantly increase speed, alter distance logs, and accelerate simulated calorie burn counters.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: INTERACTIVE FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guide questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-555 focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-colors font-semibold"
                id="input-faq-search"
              />
            </div>

            {/* List of FAQs */}
            <div className="space-y-2">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((item, idx) => {
                  const isExpanded = expandedFaqIndex === idx;
                  return (
                    <div key={idx} className="bg-surface/80 backdrop-blur-md rounded-2xl border border-zinc-800/60 overflow-hidden">
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left gap-2 hover:bg-zinc-800/20 transition-colors cursor-pointer bg-transparent border-0"
                        id={`btn-faq-toggle-${idx}`}
                      >
                        <span className="text-xs font-bold text-white leading-snug">
                          {item.q}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-zinc-800/40">
                          <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-zinc-400 uppercase font-mono">No Match Found</p>
                  <p className="text-[10px] text-zinc-555 mt-1">Try other search keywords.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
