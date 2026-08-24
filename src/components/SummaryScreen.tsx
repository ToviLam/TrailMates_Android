import React, { useState } from 'react';
import { User, Route } from '../types';
import { AvatarViewer } from './AvatarViewer';
import { Award, Share2, Compass, CheckCircle, Flame, Clock, TrendingUp } from 'lucide-react';

interface SummaryScreenProps {
  route: Route;
  partner: User;
  currentUser: User;
  duration: number; // in secs
  distance: number; // in km
  calories: number;
  winnerId?: string;
  onClose: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  route,
  partner,
  currentUser,
  duration,
  distance,
  calories,
  winnerId,
  onClose
}) => {
  const [shared, setShared] = useState(false);

  // Calculate formatted minutes/seconds
  const m = Math.floor(duration / 60);
  const s = duration % 60;
  const timeStr = `${m}m ${s}s`;

  // Calculate average pace in MM:SS /km
  const totalMin = duration / 60;
  let paceStr = "4:50";
  if (distance > 0) {
    const rawPace = totalMin / distance;
    const paceMin = Math.floor(rawPace);
    const paceSec = Math.floor((rawPace - paceMin) * 60);
    paceStr = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;
  }

  // Determine result message
  const isWinner = winnerId === currentUser.id;
  const isCompete = winnerId !== undefined;

  const handleShare = () => {
    setShared(true);
    setTimeout(() => {
      setShared(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full bg-base overflow-y-auto" id="summary-screen-container">
      {/* Visual Header Cards with Celebration */}
      <div className="bg-gradient-to-b from-brand-green/20 to-base text-white p-6 text-center border-b border-zinc-800 relative overflow-hidden shrink-0">
        {/* Radial Dot Texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 space-y-2">
          <div className="w-12 h-12 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <Award className="w-6 h-6 text-brand-green fill-brand-green/20" />
          </div>
          <h1 className="font-display font-black text-xl tracking-tight uppercase text-white">Workout Completed!</h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">Awesome job! You finished training on <strong className="text-white">{route.name}</strong> with your mate.</p>
        </div>
      </div>

      {/* Main Body Report */}
      <div className="p-4 space-y-4 max-w-md mx-auto w-full flex-1">
        
        {/* Match Result announcement */}
        <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-5 shadow-xl text-center space-y-3">
          <h2 className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Workout Verdict</h2>
          
          {isCompete ? (
            <div className="space-y-2">
              <p className={`text-base font-black tracking-tight ${isWinner ? 'text-brand-green' : 'text-zinc-200'}`}>
                {isWinner ? '🏆 YOU WON THE CHALLENGE!' : `🥈 @${partner.avatarConfig.displayName} took 1st!`}
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                {isWinner 
                  ? "Your sprint boost paid off. You took the lead and crossed the finish checkpoint first!" 
                  : `You kept a great pace, but @${partner.avatarConfig.displayName} finished just slightly ahead.`}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-base font-black text-white">🤝 Completed Joint Session</p>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                You trained in perfect harmony! Matching paces and crossing checkpoints together. Great camaraderie!
              </p>
            </div>
          )}

          {/* Connected athlete summary */}
          <div className="flex items-center justify-center gap-6 pt-3 border-t border-zinc-800">
            <div className="flex flex-col items-center">
              <div className="p-1 bg-zinc-950/60 rounded-full border border-zinc-800">
                <AvatarViewer config={currentUser.avatarConfig} className="w-10 h-10 animate-none" />
              </div>
              <span className="text-[9px] font-bold text-zinc-400 mt-1">Me ({distance.toFixed(1)}km)</span>
            </div>
            <div className="text-zinc-650 text-xs font-black font-mono">VS</div>
            <div className="flex flex-col items-center">
              <div className="p-1 bg-zinc-950/60 rounded-full border border-zinc-800">
                <AvatarViewer config={partner.avatarConfig} className="w-10 h-10 animate-none" />
              </div>
              <span className="text-[9px] font-bold text-zinc-400 mt-1">@{partner.avatarConfig.displayName} ({(distance * 0.98).toFixed(1)}km)</span>
            </div>
          </div>
        </div>

        {/* Workout Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-4 shadow-xl">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Compass className="w-4 h-4 text-brand-green" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Distance</span>
            </div>
            <p className="text-xl font-black text-white font-mono mt-2 leading-none">
              {distance} <span className="text-xs font-normal text-zinc-400 font-sans">km</span>
            </p>
          </div>

          <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-4 shadow-xl">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Clock className="w-4 h-4 text-brand-blue" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Active Time</span>
            </div>
            <p className="text-xl font-black text-white font-mono mt-2 leading-none">
              {timeStr}
            </p>
          </div>

          <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-4 shadow-xl">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <TrendingUp className="w-4 h-4 text-brand-blue" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Avg Pace</span>
            </div>
            <p className="text-xl font-black text-white font-mono mt-2 leading-none">
              {paceStr} <span className="text-xs font-normal text-zinc-400 font-sans">/km</span>
            </p>
          </div>

          <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-4 shadow-xl">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Flame className="w-4 h-4 text-brand-accent" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Energy</span>
            </div>
            <p className="text-xl font-black text-white font-mono mt-2 leading-none">
              {calories} <span className="text-xs font-normal text-zinc-400 font-sans">kcal</span>
            </p>
          </div>
        </div>

        {/* Vector SVG Performance Graph */}
        <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Pace Performance Graph</h3>
            <span className="text-[9px] bg-zinc-950/60 text-brand-green border border-zinc-800 font-bold px-2 py-0.5 rounded-full font-mono">Sprint intervals</span>
          </div>

          {/* SVG line graph representing pace fluctuations */}
          <div className="h-28 relative bg-zinc-950/60 rounded-2xl border border-zinc-800 p-2 overflow-hidden">
            <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="curve-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Back grids */}
              <line x1="0" y1="5" x2="100" y2="5" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="15" x2="100" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

              {/* Area path */}
              <path
                d="M 0 25 Q 15 10, 30 18 T 60 8 T 90 20 L 100 25 L 100 30 L 0 30 Z"
                fill="url(#curve-grad)"
              />

              {/* Line path (Me) */}
              <path
                d="M 0 25 Q 15 10, 30 18 T 60 8 T 90 20 L 100 25"
                fill="none"
                stroke="#2DD4BF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Line path (Partner) */}
              <path
                d="M 0 22 Q 20 18, 40 12 T 70 15 T 100 18"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeDasharray="1.5,1.5"
              />

              {/* Dot markers */}
              <circle cx="60" cy="8" r="1.5" fill="#2DD4BF" />
              <text x="60" y="5" fontSize="2.5" fill="#2DD4BF" fontWeight="bold" textAnchor="middle" className="font-mono">Sprint Boost! ⚡</text>
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-brand-green rounded" /> Me
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-brand-blue border-dashed border-brand-blue border-t rounded" /> Partner
            </div>
            <span>Time Progress ➔</span>
          </div>
        </div>

        {/* Shared Feed Success Prompt */}
        {shared && (
          <div className="p-3 bg-brand-green/10 text-brand-green text-xs font-bold rounded-2xl border border-brand-green/20 flex items-center gap-2 animate-fade-in" id="toast-share-success">
            <CheckCircle className="w-4 h-4 text-brand-green shrink-0" />
            Saved to your persistent fitness diary & shared to active feed!
          </div>
        )}

        {/* Social actions and close */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleShare}
            className="flex-1 py-3 px-4 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 border border-zinc-800 cursor-pointer"
            id="btn-share-workout"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Report
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-brand-green hover:opacity-90 text-zinc-950 rounded-xl text-xs font-black shadow-md transition-colors cursor-pointer border-0 uppercase tracking-wider"
            id="btn-back-to-discover"
          >
            Return to Trails Map
          </button>
        </div>
      </div>
    </div>
  );
};
