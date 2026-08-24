import React, { useState } from 'react';
import { AvatarConfig, FitnessLevel, ActivityType } from '../types';
import { AvatarViewer } from './AvatarViewer';
import { Sparkles, Check, ChevronRight, User as UserIcon } from 'lucide-react';
import { ACTIVITY_DETAILS } from '../mockData';

interface AvatarBuilderProps {
  initialConfig: AvatarConfig;
  initialFitnessLevel: FitnessLevel;
  initialActivities: ActivityType[];
  onSave: (config: AvatarConfig, fitnessLevel: FitnessLevel, activities: ActivityType[]) => void;
}

const SKIN_TONES = [
  { color: '#ffd1b3', name: 'Fair' },
  { color: '#eab308', name: 'Golden' },
  { color: '#d2a172', name: 'Tan' },
  { color: '#8c5a3c', name: 'Bronze' },
  { color: '#512a18', name: 'Dark' },
];

const OUTFIT_COLORS = [
  { color: '#2DD4BF', name: 'Mint' },
  { color: '#38BDF8', name: 'Sky Blue' },
  { color: '#A3E635', name: 'Lime' },
  { color: '#F472B6', name: 'Bubblegum' },
  { color: '#f97316', name: 'Amber' },
  { color: '#232327', name: 'Charcoal' },
];

const HAIR_COLORS = [
  { color: '#1a1a1a', name: 'Black' },
  { color: '#4a3728', name: 'Brown' },
  { color: '#d97706', name: 'Blonde' },
  { color: '#dc2626', name: 'Red' },
  { color: '#94a3b8', name: 'Silver' },
];

export const AvatarBuilder: React.FC<AvatarBuilderProps> = ({
  initialConfig,
  initialFitnessLevel,
  initialActivities,
  onSave,
}) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(initialFitnessLevel);
  const [preferredActivities, setPreferredActivities] = useState<ActivityType[]>(initialActivities);
  const [activeTab, setActiveTab] = useState<'identity' | 'body' | 'outfit' | 'fitness'>('identity');

  const handleActivityToggle = (act: ActivityType) => {
    if (preferredActivities.includes(act)) {
      if (preferredActivities.length > 1) {
        setPreferredActivities(preferredActivities.filter(item => item !== act));
      }
    } else {
      setPreferredActivities([...preferredActivities, act]);
    }
  };

  const handleSave = () => {
    onSave(config, fitnessLevel, preferredActivities);
  };

  return (
    <div className="flex flex-col h-full bg-base text-zinc-50 overflow-hidden" id="avatar-builder-container">
      {/* Header */}
      <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
            <Sparkles className="w-5 h-5 text-brand-green animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-black text-white text-base leading-none">Avatar Builder</h1>
            <p className="text-[10px] text-zinc-400 mt-1 font-mono uppercase tracking-wider">Design your virtual trail persona</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-90 text-slate-950 rounded-xl text-xs font-black shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer border-0"
          id="btn-save-avatar"
        >
          <Check className="w-4 h-4" /> Save Configuration
        </button>
      </div>

      {/* Main Layout (Scrollable Preview + Controls) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        
        {/* Left Side: Large Real-time Live Preview */}
        <div className="w-full md:w-5/12 bg-zinc-950/40 p-6 flex flex-col items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-zinc-800">
          <div className="relative w-48 h-48 bg-zinc-900 rounded-3xl shadow-xl border border-zinc-700/60 flex items-center justify-center p-4 overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(#232327_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
            
            {/* The Avatar itself */}
            <AvatarViewer config={config} className="w-40 h-40 z-10" animate={true} />
            
            {/* Display tag */}
            <div className="absolute bottom-3 bg-zinc-950/90 text-brand-green border border-zinc-800 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide z-10 shadow-sm">
              @{config.displayName || 'TRAILMATE'}
            </div>
          </div>
          
          <div className="mt-4 text-center max-w-xs">
            <h3 className="font-display font-black text-white text-sm">
              {config.displayName || 'Unnamed Athlete'}
            </h3>
            <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">
              Level {fitnessLevel} • {preferredActivities.length} disciplines
            </p>
          </div>
        </div>

        {/* Right Side: Options Customizer Panel */}
        <div className="flex-1 flex flex-col bg-base overflow-hidden">
          {/* Subtabs Navigation */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1 shrink-0">
            <button
              onClick={() => setActiveTab('identity')}
              className={`flex-1 py-3 text-center text-xs font-bold rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === 'identity'
                  ? 'bg-gradient-to-r from-brand-green to-brand-blue text-slate-950 font-black shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 bg-transparent'
              }`}
              id="tab-identity"
            >
              Identity
            </button>
            <button
              onClick={() => setActiveTab('body')}
              className={`flex-1 py-3 text-center text-xs font-bold rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === 'body'
                  ? 'bg-gradient-to-r from-brand-green to-brand-blue text-slate-950 font-black shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 bg-transparent'
              }`}
              id="tab-body"
            >
              Body & Face
            </button>
            <button
              onClick={() => setActiveTab('outfit')}
              className={`flex-1 py-3 text-center text-xs font-bold rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === 'outfit'
                  ? 'bg-gradient-to-r from-brand-green to-brand-blue text-slate-950 font-black shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 bg-transparent'
              }`}
              id="tab-outfit"
            >
              Gear & Hair
            </button>
            <button
              onClick={() => setActiveTab('fitness')}
              className={`flex-1 py-3 text-center text-xs font-bold rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === 'fitness'
                  ? 'bg-gradient-to-r from-brand-green to-brand-blue text-slate-950 font-black shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 bg-transparent'
              }`}
              id="tab-fitness"
            >
              Fitness
            </button>
          </div>

          {/* Option Contents (Scrollable Container) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-zinc-900/60">
            
            {/* TAB 1: IDENTITY */}
            {activeTab === 'identity' && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Athlete Display Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">@</span>
                    <input
                      type="text"
                      value={config.displayName}
                      onChange={(e) => setConfig({ ...config, displayName: e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15) })}
                      placeholder="e.g. SpeedDemon"
                      className="w-full pl-8 pr-4 py-3 bg-zinc-950/60 border border-zinc-700 rounded-xl text-white font-medium text-sm focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                      id="input-display-name"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">Alphanumeric characters only, max 15. Appears in augmented workouts.</p>
                </div>

                <hr className="border-zinc-800" />

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">
                    Preferred Disciplines
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(Object.keys(ACTIVITY_DETAILS) as ActivityType[]).map((act) => {
                      const details = ACTIVITY_DETAILS[act];
                      const isSelected = preferredActivities.includes(act);
                      return (
                        <button
                          key={act}
                          onClick={() => handleActivityToggle(act)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-green/10 border-brand-green text-brand-green font-bold'
                              : 'bg-zinc-950/40 border-zinc-800 text-zinc-300 hover:bg-zinc-950/80'
                          }`}
                          id={`activity-btn-${act}`}
                        >
                          <span className="text-lg">
                            {act === 'running' && '🏃'}
                            {act === 'hiking' && '🥾'}
                            {act === 'biking' && '🚴'}
                            {act === 'mountain_biking' && '🚵'}
                            {act === 'skateboard' && '🛹'}
                            {act === 'water_sports' && '🛶'}
                          </span>
                          <div>
                            <p className={`text-xs font-black leading-none ${isSelected ? 'text-brand-green' : 'text-zinc-200'}`}>{details.label}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">Preferred</p>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-brand-green ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BODY & FACE */}
            {activeTab === 'body' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Body Type Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    Build / Silhouette
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['slim', 'average', 'athletic', 'muscular'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setConfig({ ...config, bodyType: type })}
                        className={`py-3 px-4 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                          config.bodyType === type
                            ? 'border-brand-green bg-brand-green/10 text-brand-green font-black'
                            : 'border-zinc-800 bg-zinc-950/40 text-zinc-300 hover:bg-zinc-950/80'
                        }`}
                        id={`body-type-${type}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-zinc-800" />

                {/* Skin Tone Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    Skin Tone
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone.color}
                        onClick={() => setConfig({ ...config, skinTone: tone.color })}
                        className={`w-10 h-10 rounded-full border-2 relative transition-transform cursor-pointer ${
                          config.skinTone === tone.color
                            ? 'border-brand-green scale-110 shadow-lg'
                            : 'border-zinc-800 shadow-sm hover:scale-105'
                        }`}
                        style={{ backgroundColor: tone.color }}
                        title={tone.name}
                        id={`skin-tone-${tone.name}`}
                      >
                        {config.skinTone === tone.color && (
                          <span className="absolute inset-0 flex items-center justify-center text-slate-950 text-xs drop-shadow font-black">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OUTFIT & HAIR */}
            {activeTab === 'outfit' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Outfit Jersey Color */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    Gear Jersey Color
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {OUTFIT_COLORS.map((color) => (
                      <button
                        key={color.color}
                        onClick={() => setConfig({ ...config, outfitColor: color.color })}
                        className={`w-10 h-10 rounded-full border-2 relative transition-transform cursor-pointer ${
                          config.outfitColor === color.color
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-zinc-800 shadow-sm hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                        id={`outfit-${color.name}`}
                      >
                        {config.outfitColor === color.color && (
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs drop-shadow font-black">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-zinc-800" />

                {/* Hair Styles */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    Hair Style
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['none', 'short', 'long', 'curly'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setConfig({ ...config, hairStyle: style })}
                        className={`py-2 px-1 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                          config.hairStyle === style
                            ? 'border-brand-green bg-brand-green/10 text-brand-green font-bold'
                            : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-950/80'
                        }`}
                        id={`hair-style-${style}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair Color */}
                {config.hairStyle !== 'none' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Hair Dye
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {HAIR_COLORS.map((hair) => (
                        <button
                          key={hair.color}
                          onClick={() => setConfig({ ...config, hairColor: hair.color })}
                          className={`w-8 h-8 rounded-full border-2 relative transition-transform cursor-pointer ${
                            config.hairColor === hair.color
                              ? 'border-brand-green scale-110 shadow-md'
                              : 'border-zinc-800 shadow-xs hover:scale-105'
                          }`}
                          style={{ backgroundColor: hair.color }}
                          title={hair.name}
                          id={`hair-color-${hair.name}`}
                        >
                          {config.hairColor === hair.color && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] drop-shadow font-black">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <hr className="border-zinc-800" />

                {/* Accessory selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    Equipped Accessory
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'none', label: 'No Accessory', desc: 'Natural path look' },
                      { id: 'helmet', label: 'Safety Helmet', desc: 'Biking & mountain safety' },
                      { id: 'cap', label: 'Sports Cap', desc: 'Keep out the glare' },
                      { id: 'sunglasses', label: 'Active Glasses', desc: 'Reflective trail shields' },
                      { id: 'headband', label: 'Forehead Band', desc: 'Classic moisture absorber' }
                    ].map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setConfig({ ...config, accessory: acc.id as any })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          config.accessory === acc.id
                            ? 'border-brand-green bg-brand-green/10'
                            : 'border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950/80'
                        }`}
                        id={`accessory-btn-${acc.id}`}
                      >
                        <p className={`text-xs font-bold leading-tight ${config.accessory === acc.id ? 'text-brand-green' : 'text-zinc-200'}`}>
                          {acc.label}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-normal">{acc.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FITNESS LEVEL */}
            {activeTab === 'fitness' && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Target Fitness Level
                  </label>
                  <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
                    Adjusts your automatic pacer speeds, difficulty curves, and recommendations.
                  </p>
                  
                  <div className="space-y-2.5">
                    {[
                      { id: 'beginner', label: 'Beginner (Recreational)', desc: 'Focuses on building raw endurance. Prefers walks, light jogs, or fun rides.' },
                      { id: 'intermediate', label: 'Intermediate (Active Train)', desc: 'Consistent athlete. Comfortable runs or hilly pacer sessions.' },
                      { id: 'advanced', label: 'Advanced (Competitive)', desc: 'Trains regularly. Handles heavy vertical climbs, technical paths, and high paces.' },
                      { id: 'elite', label: 'Elite (Racer)', desc: 'Peak athletic capacity. High tempos, ultra marathons, and extreme gradients.' }
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        onClick={() => setFitnessLevel(lvl.id as FitnessLevel)}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          fitnessLevel === lvl.id
                            ? 'border-brand-green bg-brand-green/10'
                            : 'border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950/80'
                        }`}
                        id={`fitness-lvl-${lvl.id}`}
                      >
                        <div className="pr-4">
                          <p className={`text-sm font-black ${fitnessLevel === lvl.id ? 'text-brand-green' : 'text-zinc-200'}`}>
                            {lvl.label}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{lvl.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          fitnessLevel === lvl.id ? 'border-brand-green bg-brand-green text-slate-950' : 'border-zinc-800'
                        }`}>
                          {fitnessLevel === lvl.id && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              Profile Customizer
            </div>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-90 text-slate-950 rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider font-mono border-0"
              id="btn-footer-save"
            >
              Apply Settings <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
