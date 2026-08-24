import React, { useState } from 'react';
import { Compass, Sparkles, MapPin, ArrowRight, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';

interface LandingScreenProps {
  onLoginSuccess: (email: string) => void;
  onRegisterStart: (name: string, email: string) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onLoginSuccess,
  onRegisterStart
}) => {
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeMode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Please fill in all credentials.');
        return;
      }
      // Log in with any credentials since this is a prototype, but make it feel real!
      onLoginSuccess(email.trim());
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('Please complete all registration fields.');
        return;
      }
      onRegisterStart(name.trim(), email.trim());
    }
  };

  const handleQuickLogin = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('••••••••');
    setTimeout(() => {
      onLoginSuccess(presetEmail);
    }, 400);
  };

  return (
    <div className="flex flex-col h-full bg-base text-zinc-50 overflow-y-auto relative" id="landing-screen-container">
      {/* Background Ambience Graphics */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(45,212,191,0.06)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      
      {/* Top Banner Hero Area */}
      <div className="px-6 pt-12 pb-6 text-center space-y-4 relative z-10 shrink-0">
        <div className="w-14 h-14 bg-gradient-to-tr from-brand-green to-brand-blue rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-brand-green/20 animate-pulse">
          <Compass className="w-7 h-7 text-zinc-950" />
        </div>
        
        <div className="space-y-1">
          <h1 className="font-display font-black text-2xl tracking-tight text-white flex items-center justify-center gap-1.5">
            TrailMates <span className="text-[10px] bg-brand-green/20 text-brand-green px-2 py-0.5 rounded-full border border-brand-green/20 font-mono tracking-normal capitalize font-medium">Prototype</span>
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Discover trails, customize your workout avatar, and train in simulated AR with local fitness buddies.
          </p>
        </div>
      </div>
 
      {/* Auth Card Panel */}
      <div className="flex-1 px-6 pb-8 flex flex-col justify-center relative z-10 max-w-sm mx-auto w-full">
        <div className="bg-surface/80 backdrop-blur-md rounded-3xl p-5 border border-zinc-700/60 shadow-xl space-y-4">
          
          {/* Tabs header */}
          <div className="flex bg-zinc-950/40 p-1 rounded-xl text-xs font-bold border border-zinc-800">
            <button
              onClick={() => {
                setActiveMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                activeMode === 'login' ? 'bg-zinc-750 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'
              }`}
              id="landing-tab-login"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                activeMode === 'register' ? 'bg-zinc-750 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'
              }`}
              id="landing-tab-register"
            >
              Create Account
            </button>
          </div>
 
          {/* Form action */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {activeMode === 'register' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                    id="landing-input-name"
                  />
                </div>
              </div>
            )}
 
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  id="landing-input-email"
                />
              </div>
            </div>
 
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  id="landing-input-password"
                />
              </div>
            </div>
 
            {errorMessage && (
              <p className="text-[10px] font-semibold text-rose-400 animate-pulse text-center" id="landing-error-message">
                ⚠️ {errorMessage}
              </p>
            )}
 
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-green hover:to-brand-blue text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-brand-green/10 hover:shadow-brand-green/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0"
              id="landing-btn-submit"
            >
              {activeMode === 'login' ? 'Sign In to Discover' : 'Continue to Avatar Designer'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
 
          {/* Quick Demo Pre-fill helper */}
          {activeMode === 'login' && (
            <div className="pt-3 border-t border-zinc-700/50 space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 text-center">Demo Quick Accounts</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('tovi@tovilam.net')}
                  className="flex-1 py-1.5 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/40 rounded-lg text-[10px] font-bold text-zinc-300 transition-all cursor-pointer"
                  id="demo-login-tovi"
                >
                  👩‍💻 Tovi Lam (Lead)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('sierra@peak.com')}
                  className="flex-1 py-1.5 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/40 rounded-lg text-[10px] font-bold text-zinc-300 transition-all cursor-pointer"
                  id="demo-login-sierra"
                >
                  🏔️ Sierra Peak
                </button>
              </div>
            </div>
          )}
 
        </div>
 
        {/* Brand Footnote */}
        <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
          <span>Local simulated playground data only.</span>
        </div>
      </div>
    </div>
  );
};
