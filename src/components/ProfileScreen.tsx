import React, { useState } from 'react';
import { User, ActivityType, Connection } from '../types';
import { ACTIVITY_DETAILS } from '../mockData';
import { AvatarViewer } from './AvatarViewer';
import { 
  Settings, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Compass, 
  Clock, 
  Award, 
  Landmark, 
  RefreshCw, 
  LogOut, 
  Shield, 
  Lock, 
  Unlock, 
  Globe, 
  Check, 
  Eye, 
  EyeOff,
  BookOpen,
  Link2,
  UserX,
  Activity,
  Flame,
  Smartphone,
  Heart,
  X
} from 'lucide-react';

interface ProfileScreenProps {
  user: User;
  onRedesignAvatar: () => void;
  onLogout: () => void;
  onUpdateProfile: (updatedFields: Partial<User>) => void;
  onOpenGuide: () => void;
  connections: Connection[];
  users: User[];
  onUnblockUser: (targetUserId: string) => void;
}

const PLATFORM_DETAILS: Record<string, {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  color: string;
  scopes: string[];
  importedWorkout: string;
}> = {
  strava: {
    id: 'strava',
    name: 'Strava',
    logo: '🚴',
    tagline: 'Run, ride, and swim sync',
    color: '#F97316',
    scopes: ['read', 'activity:read_all', 'profile:read_all'],
    importedWorkout: 'Sunset Ridge Trail Ride 🚴 (18.5 km)'
  },
  fitbit: {
    id: 'fitbit',
    name: 'Fitbit',
    logo: '🌸',
    tagline: 'Heart-rate & steps tracking',
    color: '#0EA5E9',
    scopes: ['activity', 'heartrate', 'profile', 'location'],
    importedWorkout: 'Morning Fat Burn Run 🏃 (6.8 km)'
  },
  googlefit: {
    id: 'googlefit',
    name: 'Google Fit',
    logo: '❤️',
    tagline: 'Android ecosystem sync',
    color: '#EF4444',
    scopes: ['fitness.activity.read', 'fitness.location.read', 'fitness.heart_rate.read'],
    importedWorkout: 'Coastal Path Sunset Walk 🥾 (4.2 km)'
  },
  applehealth: {
    id: 'applehealth',
    name: 'Apple Health (iOS)',
    logo: '🍎',
    tagline: 'iOS device fitness sync',
    color: '#F43F5E',
    scopes: ['Workout History', 'Heart Rate Logs', 'GPS Route Mapping'],
    importedWorkout: 'Bay Area Half-Marathon Prep ⚡ (12.0 km)'
  },
  samsunghealth: {
    id: 'samsunghealth',
    name: 'Samsung Health',
    logo: '📱',
    tagline: 'Samsung wearables tracking',
    color: '#6366F1',
    scopes: ['com.samsung.health.exercise', 'com.samsung.health.heart_rate', 'com.samsung.health.step_count'],
    importedWorkout: 'Downtown Bike Commute 🚵 (10.2 km)'
  }
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  user, 
  onRedesignAvatar, 
  onLogout,
  onUpdateProfile,
  onOpenGuide,
  connections,
  users,
  onUnblockUser
}) => {
  const { name, fitnessLevel, activities, avatarConfig, joinedAt, stats } = user;

  // Editable Profile Fields State
  const [bio, setBio] = useState(user.bio || 'Exploring mountain and coastal paths on weekends.');
  const [age, setAge] = useState<string>(user.age ? user.age.toString() : '27');
  const [location, setLocation] = useState(user.location || 'San Francisco, CA');
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>(user.activities || []);

  React.useEffect(() => {
    setSelectedActivities(user.activities || []);
  }, [user.activities]);

  // Connected External Fitness Apps State
  const [connectedApps, setConnectedApps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('matepace_connected_apps');
      return saved ? JSON.parse(saved) : {
        strava: false,
        fitbit: false,
        googlefit: false,
        applehealth: false,
        samsunghealth: false
      };
    } catch {
      return {
        strava: false,
        fitbit: false,
        googlefit: false,
        applehealth: false,
        samsunghealth: false
      };
    }
  });

  // Save connected apps state to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('matepace_connected_apps', JSON.stringify(connectedApps));
    } catch (e) {
      console.error(e);
    }
  }, [connectedApps]);

  const [connectingApp, setConnectingApp] = useState<string | null>(null);

  // High-fidelity interactive OAuth Simulation state
  const [activeOAuthModal, setActiveOAuthModal] = useState<{
    id: string;
    name: string;
    logo: string;
    tagline: string;
    color: string;
    scopes: string[];
    importedWorkout: string;
  } | null>(null);

  const [oauthStep, setOauthStep] = useState<'consent' | 'handshake' | 'success'>('consent');

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'info' | 'error';
  }>({ show: false, message: '', type: 'success' });

  React.useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleToggleApp = (appId: string) => {
    if (connectedApps[appId]) {
      // Disconnect directly
      setConnectedApps(prev => ({ ...prev, [appId]: false }));
      const platformName = PLATFORM_DETAILS[appId]?.name || appId;
      setToast({
        show: true,
        message: `Successfully disconnected from ${platformName}.`,
        type: 'info'
      });
    } else {
      // Start the high-fidelity Simulated OAuth Flow!
      const platform = PLATFORM_DETAILS[appId];
      if (platform) {
        setActiveOAuthModal(platform);
        setOauthStep('consent');
      } else {
        // Fallback
        setConnectingApp(appId);
        setTimeout(() => {
          setConnectedApps(prev => ({ ...prev, [appId]: true }));
          setConnectingApp(null);
        }, 1200);
      }
    }
  };

  const handleOAuthAuthorize = () => {
    if (!activeOAuthModal) return;
    setOauthStep('handshake');
    setTimeout(() => {
      const appId = activeOAuthModal.id;
      setConnectedApps(prev => ({ ...prev, [appId]: true }));
      setOauthStep('success');
      setToast({
        show: true,
        message: `Connected to ${activeOAuthModal.name}! Synced ${activeOAuthModal.importedWorkout}.`,
        type: 'success'
      });
    }, 2000);
  };

  // Realistic mock/simulated workouts synced from external platforms
  const MOCK_SYNCED_WORKOUTS = [
    {
      id: 'sync-strava-1',
      source: 'strava',
      name: 'Sunset Ridge Trail Ride 🚴',
      activityType: 'mountain_biking',
      distance: 18.5,
      duration: 52,
      elevation: 450,
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hrs ago
    },
    {
      id: 'sync-fitbit-1',
      source: 'fitbit',
      name: 'Morning Fat Burn Run 🏃',
      activityType: 'running',
      distance: 6.8,
      duration: 32,
      elevation: 65,
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hrs ago
    },
    {
      id: 'sync-googlefit-1',
      source: 'googlefit',
      name: 'Coastal Path Sunset Walk 🥾',
      activityType: 'hiking',
      distance: 4.5,
      duration: 48,
      elevation: 35,
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
    },
    {
      id: 'sync-applehealth-1',
      source: 'applehealth',
      name: 'Bay Area Half-Marathon Prep ⚡',
      activityType: 'running',
      distance: 12.0,
      duration: 58,
      elevation: 110,
      timestamp: new Date(Date.now() - 3600000 * 36).toISOString() // 1.5 days ago
    },
    {
      id: 'sync-samsunghealth-1',
      source: 'samsunghealth',
      name: 'Downtown Bike Commute 🚵',
      activityType: 'biking',
      distance: 10.2,
      duration: 25,
      elevation: 40,
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
    }
  ];

  const nativeWorkouts = [
    {
      id: 'native-1',
      source: 'native',
      name: 'Crissy Field Waterfront Jog 🏃',
      activityType: 'running',
      distance: 5.2,
      duration: 24,
      elevation: 15,
      timestamp: new Date(Date.now() - 3600000 * 72).toISOString() // 3 days ago
    },
    {
      id: 'native-2',
      source: 'native',
      name: 'Twin Peaks Morning Ascent 🥾',
      activityType: 'hiking',
      distance: 3.8,
      duration: 21,
      elevation: 140,
      timestamp: new Date(Date.now() - 3600000 * 96).toISOString() // 4 days ago
    }
  ];

  // Merge native and connected synced workouts dynamically!
  const displayedHistory = [
    ...nativeWorkouts,
    ...MOCK_SYNCED_WORKOUTS.filter(w => connectedApps[w.source] === true)
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Privacy & Profile Layers Settings State
  const [showStatsToChallengers, setShowStatsToChallengers] = useState(
    user.privacySettings?.showStatsToChallengers ?? false
  );
  const [defaultPostAudience, setDefaultPostAudience] = useState<'friends' | 'public'>(
    user.privacySettings?.defaultPostAudience ?? 'friends'
  );
  const [bioPrivate, setBioPrivate] = useState(
    user.privacySettings?.bioPrivate ?? true
  );
  const [agePrivate, setAgePrivate] = useState(
    user.privacySettings?.agePrivate ?? true
  );
  const [locationPrivate, setLocationPrivate] = useState(
    user.privacySettings?.locationPrivate ?? true
  );

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    onUpdateProfile({
      bio,
      age: age ? parseInt(age) || undefined : undefined,
      location,
      activities: selectedActivities,
      privacySettings: {
        showStatsToChallengers,
        defaultPostAudience,
        bioPrivate,
        agePrivate,
        locationPrivate
      }
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-base overflow-y-auto" id="profile-container">
      {/* Upper Profile Cover Banner */}
      <div className="bg-gradient-to-r from-brand-green to-brand-blue text-slate-950 p-6 shadow-sm relative shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        
        <div className="relative z-10 flex flex-col items-center text-center mt-2 space-y-3">
          {/* Large Avatar container */}
          <div className="relative w-28 h-28 bg-white/10 backdrop-blur-md rounded-full border border-white/20 p-2 shadow-xl flex items-center justify-center overflow-visible">
            <AvatarViewer config={avatarConfig} className="w-24 h-24 animate-none" />
            
            <button
              onClick={onRedesignAvatar}
              className="absolute -bottom-1 -right-1 p-2 bg-zinc-950 text-white rounded-full hover:bg-zinc-900 transition-colors shadow-md border border-zinc-800 cursor-pointer"
              title="Redesign Avatar Customization"
              id="btn-rebuild-avatar-floating"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h2 className="text-lg font-display font-black tracking-tight leading-none text-slate-950">
              {name}
            </h2>
            <p className="text-xs text-slate-900 font-mono mt-1.5 font-medium">@{avatarConfig.displayName}</p>
          </div>

          <div className="flex gap-1.5 justify-center">
            <span className="bg-white/25 backdrop-blur-xs text-slate-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Level {fitnessLevel}
            </span>
            <span className="bg-white/25 backdrop-blur-xs text-slate-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" /> Since {new Date(joinedAt).getFullYear()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats and Preference Blocks */}
      <div className="p-4 space-y-4 max-w-md mx-auto w-full flex-1 pb-8">
        
        {/* Dynamic Cumulative Stats */}
        {stats && (
          <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-brand-green" /> Career Training Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 flex items-center gap-2.5">
                <Award className="w-8 h-8 text-brand-pop shrink-0" />
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase leading-none">Workouts</p>
                  <p className="text-sm font-black text-white mt-1 font-mono">{stats.totalWorkouts}</p>
                </div>
              </div>

              <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 flex items-center gap-2.5">
                <Compass className="w-8 h-8 text-brand-green shrink-0" />
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase leading-none">Distance</p>
                  <p className="text-sm font-black text-white mt-1 font-mono">{stats.totalDistance} <span className="text-[10px] font-normal text-zinc-400">km</span></p>
                </div>
              </div>

              <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 flex items-center gap-2.5">
                <Clock className="w-8 h-8 text-brand-blue shrink-0" />
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase leading-none">Duration</p>
                  <p className="text-sm font-black text-white mt-1 font-mono">{Math.round(stats.totalDuration / 60)} <span className="text-[10px] font-normal text-zinc-400">hrs</span></p>
                </div>
              </div>

              <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 flex items-center gap-2.5">
                <Landmark className="w-8 h-8 text-brand-accent shrink-0" />
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase leading-none">Climbed</p>
                  <p className="text-sm font-black text-white mt-1 font-mono">+{stats.elevationGain} <span className="text-[10px] font-normal text-zinc-400">m</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC TRAINING HISTORY & SYNCED PLATFORM ACTIVITIES */}
        <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-5 shadow-xl space-y-4" id="profile-training-history-panel">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-brand-pop animate-pulse" /> My Training Activity History
            </h3>
            <span className="text-[9px] font-bold text-brand-pop bg-brand-pop/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-brand-pop/20">
              {displayedHistory.length} Activities
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
            Workouts logged native in-app, as well as live synced GPS paths from your connected platforms. Connecting apps in settings below will instantly auto-sync activities.
          </p>

          <div className="space-y-3">
            {displayedHistory.map((workout) => {
              // source badges
              let badgeColor = 'bg-zinc-900 text-zinc-400 border-zinc-800';
              let badgeLabel = 'In-App Log';
              if (workout.source === 'strava') {
                badgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
                badgeLabel = 'Strava Sync';
              } else if (workout.source === 'fitbit') {
                badgeColor = 'bg-brand-pop/10 text-brand-pop border-brand-pop/20';
                badgeLabel = 'Fitbit Sync';
              } else if (workout.source === 'googlefit') {
                badgeColor = 'bg-brand-green/10 text-brand-green border-brand-green/20';
                badgeLabel = 'Google Fit';
              } else if (workout.source === 'applehealth') {
                badgeColor = 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
                badgeLabel = 'Apple Health';
              } else if (workout.source === 'samsunghealth') {
                badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                badgeLabel = 'Samsung Health';
              }

              return (
                <div 
                  key={workout.id}
                  className="p-3 bg-zinc-950/60 hover:bg-zinc-950/90 rounded-2xl border border-zinc-800 flex flex-col gap-2.5 transition-all hover:border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-white tracking-tight truncate max-w-[200px]">
                      {workout.name}
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
                      {badgeLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-zinc-900 px-2 py-1.5 rounded-xl border border-zinc-800">
                      <p className="text-[8px] font-bold text-zinc-500 uppercase leading-none">Distance</p>
                      <p className="text-xs font-black text-brand-green mt-1 font-mono">{workout.distance} <span className="text-[9px] font-normal text-zinc-500 font-sans">km</span></p>
                    </div>
                    <div className="bg-zinc-900 px-2 py-1.5 rounded-xl border border-zinc-800">
                      <p className="text-[8px] font-bold text-zinc-500 uppercase leading-none">Duration</p>
                      <p className="text-xs font-black text-brand-green mt-1 font-mono">{workout.duration} <span className="text-[9px] font-normal text-zinc-500 font-sans">min</span></p>
                    </div>
                    <div className="bg-zinc-900 px-2 py-1.5 rounded-xl border border-zinc-800">
                      <p className="text-[8px] font-bold text-zinc-500 uppercase leading-none">Climbed</p>
                      <p className="text-xs font-black text-brand-green mt-1 font-mono">+{workout.elevation} <span className="text-[9px] font-normal text-zinc-500 font-sans">m</span></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-zinc-500 font-mono mt-0.5">
                    <span className="capitalize">Sport: {workout.activityType.replace('_', ' ')}</span>
                    <span>{new Date(workout.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 1. LAYERED PROFILE EDITOR & GRANULAR PRIVACY SETTINGS FORM */}
        <form onSubmit={handleSaveSettings} className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-5 shadow-xl space-y-4" id="layered-profile-privacy-form">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Shield className="w-4 h-4 text-brand-green" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Profile Layer & Privacy Controls
            </h3>
          </div>

          {/* Core Profile Data */}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Biography Tagline (Private layer by default)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Share your goals..."
                className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green"
                id="profile-bio-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="27"
                  className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green"
                  id="profile-age-input"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green"
                  id="profile-location-input"
                />
              </div>
            </div>
          </div>

          {/* Granular Visibility toggles for layers */}
          <div className="bg-zinc-950/40 rounded-xl p-3 border border-zinc-800 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
              Layer Visibility Configurations
            </h4>

            {/* Toggle 1: Biography */}
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-semibold text-zinc-350">
                {bioPrivate ? <Lock className="w-3.5 h-3.5 text-brand-pop" /> : <Unlock className="w-3.5 h-3.5 text-brand-green" />}
                Biography is Private
              </span>
              <input
                type="checkbox"
                checked={bioPrivate}
                onChange={(e) => setBioPrivate(e.target.checked)}
                className="w-4 h-4 text-brand-green accent-brand-green cursor-pointer"
                id="toggle-bio-private"
              />
            </div>

            {/* Toggle 2: Age */}
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-semibold text-zinc-350">
                {agePrivate ? <Lock className="w-3.5 h-3.5 text-brand-pop" /> : <Unlock className="w-3.5 h-3.5 text-brand-green" />}
                Age is Private
              </span>
              <input
                type="checkbox"
                checked={agePrivate}
                onChange={(e) => setAgePrivate(e.target.checked)}
                className="w-4 h-4 text-brand-green accent-brand-green cursor-pointer"
                id="toggle-age-private"
              />
            </div>

            {/* Toggle 3: Location */}
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-semibold text-zinc-350">
                {locationPrivate ? <Lock className="w-3.5 h-3.5 text-brand-pop" /> : <Unlock className="w-3.5 h-3.5 text-brand-green" />}
                Location is Private
              </span>
              <input
                type="checkbox"
                checked={locationPrivate}
                onChange={(e) => setLocationPrivate(e.target.checked)}
                className="w-4 h-4 text-brand-green accent-brand-green cursor-pointer"
                id="toggle-location-private"
              />
            </div>

            {/* Toggle 4: Statistics to Challengers */}
            <div className="flex items-center justify-between text-xs pt-2.5 border-t border-zinc-800">
              <div className="flex flex-col max-w-[80%]">
                <span className="flex items-center gap-1 font-bold text-white leading-tight">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-green" />
                  Show Stats to Challengers
                </span>
                <span className="text-[9px] text-zinc-500 mt-0.5 leading-tight font-semibold">
                  Let challenger-tier connections view your training distance and duration on public profile.
                </span>
              </div>
              <input
                type="checkbox"
                checked={showStatsToChallengers}
                onChange={(e) => setShowStatsToChallengers(e.target.checked)}
                className="w-4 h-4 text-brand-green accent-brand-green cursor-pointer"
                id="toggle-show-stats-challengers"
              />
            </div>
          </div>

          {/* DEFAULT FEED POST AUDIENCE */}
          <div className="space-y-2">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Default Post Audience Setting
              </label>
              <span className="text-[9px] text-zinc-550 font-semibold leading-tight mt-0.5">
                Choose who can read your shared posts/workouts on the feed by default.
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDefaultPostAudience('friends')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1 transition-all cursor-pointer border-0 ${
                  defaultPostAudience === 'friends'
                    ? 'bg-brand-green/10 border border-brand-green text-brand-green font-black'
                    : 'bg-zinc-950/60 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 font-semibold'
                }`}
                id="btn-audience-friends"
              >
                <Lock className="w-3.5 h-3.5" /> Approved Friends Only
              </button>

              <button
                type="button"
                onClick={() => setDefaultPostAudience('public')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1 transition-all cursor-pointer border-0 ${
                  defaultPostAudience === 'public'
                    ? 'bg-brand-blue/10 border border-brand-blue text-brand-blue font-black'
                    : 'bg-zinc-950/60 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 font-semibold'
                }`}
                id="btn-audience-public"
              >
                <Globe className="w-3.5 h-3.5" /> Public (Visible to all)
              </button>
            </div>
            <p className="text-[9px] text-brand-pop font-semibold italic bg-brand-pop/10 border border-brand-pop/20 px-2.5 py-1.5 rounded-xl">
              * Note: Challengers will NEVER be able to see your posts on the feed, even if posts are set to Public.
            </p>
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-brand-green hover:opacity-95 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer border-0 uppercase tracking-wider"
            id="btn-save-privacy-settings"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-slate-950" /> Settings Successfully Updated!
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" /> Save Profile Layers & Privacy Settings
              </>
            )}
          </button>
        </form>

        {/* Selected Disciplines */}
        <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">My Fitness Disciplines</h3>
            <span className="text-[10px] text-zinc-550 font-bold">Tap to toggle</span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
            Configure your preferred activities. Be sure to click "Save Profile Layers & Privacy Settings" above to save changes.
          </p>
          
          <div className="grid grid-cols-2 gap-2.5">
            {(Object.keys(ACTIVITY_DETAILS) as ActivityType[]).map((act) => {
              const details = ACTIVITY_DETAILS[act];
              const isSelected = selectedActivities.includes(act);
              return (
                <button
                  type="button"
                  key={act}
                  onClick={() => {
                    if (isSelected) {
                      // Prevent unchecking if it's the last one
                      if (selectedActivities.length <= 1) {
                        return;
                      }
                      setSelectedActivities(selectedActivities.filter((a) => a !== act));
                    } else {
                      setSelectedActivities([...selectedActivities, act]);
                    }
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'border-brand-green bg-brand-green/10 text-white font-bold shadow-md'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-500 hover:bg-zinc-900'
                  }`}
                  id={`profile-activity-${act}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">
                      {act === 'running' && '🏃'}
                      {act === 'hiking' && '🥾'}
                      {act === 'biking' && '🚴'}
                      {act === 'mountain_biking' && '🚵'}
                      {act === 'skateboard' && '🛹'}
                      {act === 'water_sports' && '🛶'}
                    </span>
                    <span className={`text-[11px] truncate ${isSelected ? 'text-white' : 'text-zinc-500'}`}>
                      {details.label}
                    </span>
                  </div>
                  {isSelected ? (
                    <span className="text-[9px] font-bold text-brand-green bg-brand-green/10 px-1.5 py-0.5 rounded border border-brand-green/25 uppercase tracking-wider shrink-0">
                      Preferred
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-zinc-650 px-1.5 py-0.5 rounded border border-zinc-800 uppercase tracking-wider shrink-0">
                      Off
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONNECTED FITNESS PLATFORMS (STRAVA, FITBIT, ETC.) */}
        <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-5 shadow-xl space-y-4" id="profile-connected-platforms">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
            <Link2 className="w-4 h-4 text-brand-green" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Connected Fitness Platforms
            </h3>
          </div>

          <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
            Synchronize and import activities directly from your existing favorite fitness hardware and apps. Synced GPS paths will appear automatically in your Training History.
          </p>

          <div className="space-y-2.5 pt-1">
            {[
              { id: 'strava', name: 'Strava', logo: '🚴', tagline: 'Run, ride, and swim sync' },
              { id: 'fitbit', name: 'Fitbit', logo: '🌸', tagline: 'Heart-rate & steps tracking' },
              { id: 'googlefit', name: 'Google Fit', logo: '❤️', tagline: 'Android ecosystem sync' },
              { id: 'applehealth', name: 'Apple Health (iOS)', logo: '🍎', tagline: 'iOS device fitness sync' },
              { id: 'samsunghealth', name: 'Samsung Health', logo: '📱', tagline: 'Samsung wearables tracking' },
            ].map(platform => {
              const isConnected = connectedApps[platform.id] === true;
              const isConnecting = connectingApp === platform.id;
              const details = PLATFORM_DETAILS[platform.id];
              
              return (
                <div 
                  key={platform.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isConnected 
                      ? 'bg-brand-green/5 border-brand-green/20 hover:bg-brand-green/10' 
                      : 'bg-zinc-950/60 hover:bg-zinc-950/90 border-zinc-800'
                  }`}
                  id={`platform-card-${platform.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span 
                      className="text-xl shrink-0 p-1 bg-zinc-900 rounded-xl border border-zinc-800"
                      style={isConnected && details ? { borderColor: `${details.color}40` } : undefined}
                    >
                      {platform.logo}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-black text-white leading-none">{platform.name}</p>
                        {isConnected && (
                          <span className="flex h-1.5 w-1.5 relative shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-green"></span>
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-zinc-555 mt-1 font-semibold truncate">{platform.tagline}</p>
                      {isConnected && details && (
                        <p className="text-[8px] font-mono text-brand-green mt-0.5 font-bold">
                          ✓ Synced: {details.importedWorkout.split(' (')[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isConnecting}
                    onClick={() => handleToggleApp(platform.id)}
                    className={`py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                      isConnected
                        ? 'bg-brand-pop/10 border border-brand-pop/20 text-brand-pop hover:bg-brand-pop/20'
                        : isConnecting
                          ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 animate-pulse'
                          : 'bg-brand-green hover:opacity-90 text-slate-950 shadow font-black'
                    }`}
                    id={`btn-toggle-app-${platform.id}`}
                  >
                    {isConnecting ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                      </span>
                    ) : isConnected ? (
                      'Disconnect'
                    ) : (
                      'Connect App'
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-[8px] text-zinc-500 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-850 font-mono leading-relaxed">
            <span className="font-bold text-zinc-400">🔒 SECURE DECOUPLED OAUTH HOOKS</span><br />
            {`// Code Hook: OAuth callback initiates standard client flow. Upon authorization, redirect triggers access_token handshake and maps coordinates back to our local profile via standard database pipelines.`}
          </div>
        </div>

        {/* BLOCKED USERS MANAGEMENT SECTION */}
        <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-5 shadow-xl space-y-4" id="profile-blocked-users">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
            <UserX className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Blocked Connections
            </h3>
          </div>

          <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
            Manage users you have blocked. Blocked users cannot see your posts on the feed, find you on the discover map, or send you companion connection requests.
          </p>

          {/* List of blocked users */}
          {(() => {
            const blockedConnections = connections.filter(c => 
              c.status === 'blocked' && 
              (c.userIds[0] === user.id || c.userIds[1] === user.id)
            );

            if (blockedConnections.length === 0) {
              return (
                <div className="text-center py-4 bg-zinc-950/40 rounded-2xl border border-zinc-800 border-dashed">
                  <p className="text-[10px] font-bold text-zinc-555 uppercase tracking-wide">No Blocked Users</p>
                </div>
              );
            }

            return (
              <div className="space-y-2">
                {blockedConnections.map(conn => {
                  const blockedId = conn.userIds.find(id => id !== user.id);
                  const blockedUserObj = users.find(u => u.id === blockedId);

                  if (!blockedUserObj) return null;

                  return (
                    <div 
                      key={conn.id}
                      className="flex items-center justify-between p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800"
                      id={`blocked-item-${blockedUserObj.id}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 flex items-center justify-center">
                          <AvatarViewer config={blockedUserObj.avatarConfig} className="w-8 h-8 animate-none" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-white truncate leading-none">{blockedUserObj.name}</p>
                          <p className="text-[8px] text-zinc-500 mt-1 font-mono uppercase font-bold">{blockedUserObj.fitnessLevel}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onUnblockUser(blockedUserObj.id)}
                        className="py-1 px-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        id={`btn-unblock-profile-${blockedUserObj.id}`}
                      >
                        Unblock
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Quick actions list */}
        <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-4 shadow-xl space-y-2">
          <button
            onClick={onOpenGuide}
            className="w-full py-3 px-4 bg-brand-green hover:opacity-95 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer border-0 uppercase tracking-wider"
            id="btn-open-guide"
          >
            <BookOpen className="w-4 h-4 text-slate-950 fill-current" /> Open Companion User Guide & FAQ
          </button>

          <button
            onClick={onRedesignAvatar}
            className="w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            id="btn-rebuild-avatar-main"
          >
            <Sparkles className="w-4 h-4 text-brand-accent fill-brand-accent" /> Customize My Avatar Character
          </button>

          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 bg-brand-pop/10 hover:bg-brand-pop/20 text-brand-pop border border-brand-pop/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            id="btn-logout"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out Account
          </button>
        </div>
      </div>

      {/* FLOATING TOAST ALERTS */}
      {toast.show && (
        <div 
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 rounded-2xl shadow-2xl text-xs font-bold text-white animate-fade-in"
          id="toast-notification-banner"
        >
          {toast.type === 'success' ? (
            <div className="w-4 h-4 bg-brand-green/20 text-brand-green border border-brand-green/30 rounded-full flex items-center justify-center font-black">✓</div>
          ) : toast.type === 'error' ? (
            <div className="w-4 h-4 bg-brand-pop/20 text-brand-pop border border-brand-pop/30 rounded-full flex items-center justify-center font-black">!</div>
          ) : (
            <div className="w-4 h-4 bg-brand-blue/20 text-brand-blue border border-brand-blue/30 rounded-full flex items-center justify-center font-black">i</div>
          )}
          <span>{toast.message}</span>
          <button 
            type="button" 
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            className="ml-2 hover:text-white text-zinc-400 border-0 bg-transparent cursor-pointer p-0 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* INTERACTIVE SIMULATED OAUTH MODAL OVERLAY */}
      {activeOAuthModal && (
        <div 
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" 
          id="oauth-simulation-modal"
        >
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 animate-in scale-in duration-200">
            {oauthStep === 'consent' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xl shrink-0 p-2 bg-zinc-950 rounded-xl border border-zinc-800">
                    {activeOAuthModal.logo}
                  </span>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase tracking-wider text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded-full">
                      OAuth 2.0 Secure
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    Authorize MatePace
                  </h4>
                  <p className="text-[10px] text-zinc-300 font-semibold leading-relaxed">
                    wants access to sync your <span className="font-bold" style={{ color: activeOAuthModal.color }}>{activeOAuthModal.name}</span> activity logs & profile data.
                  </p>
                </div>

                <div className="bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800 space-y-2.5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
                    Requested Permissions:
                  </p>
                  <div className="space-y-2">
                    {activeOAuthModal.scopes.map((scope) => (
                      <div key={scope} className="flex items-start gap-2 text-[10px] text-zinc-300 font-bold">
                        <Check className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                        <span>{scope}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[8px] text-zinc-400 font-mono leading-normal bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  <span className="font-bold text-zinc-300">Redirect URI callback:</span><br />
                  {`${window.location.origin}/auth/${activeOAuthModal.id}/callback`}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveOAuthModal(null)}
                    className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleOAuthAuthorize}
                    className="flex-1 py-2 bg-brand-green hover:opacity-95 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0 shadow"
                  >
                    Authorize
                  </button>
                </div>
              </div>
            )}

            {oauthStep === 'handshake' && (
              <div className="py-8 text-center space-y-4">
                <RefreshCw className="w-8 h-8 text-brand-green animate-spin mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-wider text-white">
                    Exchanging Auth Code...
                  </p>
                  <p className="text-[9px] text-zinc-555 font-mono">
                    GET /api/auth/token?code=auth_code_sim_782f9c
                  </p>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                  <div className="bg-brand-green h-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            )}

            {oauthStep === 'success' && (
              <div className="text-center space-y-4 py-3">
                <div className="w-12 h-12 bg-brand-green/20 border border-brand-green/30 rounded-full flex items-center justify-center mx-auto text-brand-green">
                  <Check className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    Connection Synced!
                  </h4>
                  <p className="text-[10px] text-zinc-300 font-semibold max-w-[240px] mx-auto leading-relaxed">
                    Your <span className="font-bold" style={{ color: activeOAuthModal.color }}>{activeOAuthModal.name}</span> account is connected. We've imported the following activity into your training history:
                  </p>
                  <p className="text-[10px] font-black text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-xl inline-block mt-2 border border-brand-green/20">
                    {activeOAuthModal.importedWorkout}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveOAuthModal(null)}
                  className="w-full py-2 bg-brand-green text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0 shadow"
                >
                  Go to My History
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
