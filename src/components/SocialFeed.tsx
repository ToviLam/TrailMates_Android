import React, { useState } from 'react';
import { User, Route, Connection, FeedItem, ActivityType, FeedComment } from '../types';
import { AvatarViewer } from './AvatarViewer';
import { ACTIVITY_DETAILS } from '../mockData';
import { 
  Heart, 
  MessageSquare, 
  Send, 
  UserPlus, 
  UserCheck, 
  Flame, 
  Sparkles, 
  MapPin, 
  Users, 
  Zap, 
  Compass, 
  Smile, 
  Share2, 
  Activity, 
  Plus, 
  TrendingUp, 
  Check, 
  ArrowRight,
  Tv,
  Lock,
  Globe,
  Eye,
  EyeOff,
  UserX,
  Camera,
  X
} from 'lucide-react';

interface SocialFeedProps {
  currentUser: User;
  users: User[];
  routes: Route[];
  connections: Connection[];
  feedItems: FeedItem[];
  onSetFeedItems: React.Dispatch<React.SetStateAction<FeedItem[]>>;
  onConnect: (targetUserId: string, tier?: 'challenger' | 'friend') => void;
  onInitiateSession: (routeId: string, opponentId: string, mode: 'compete' | 'together') => void;
  onSelectRoute: (routeId: string) => void;
  onNavigateToScreen: (screen: 'discover' | 'create_route' | 'people' | 'profile' | 'chat') => void;
  onStartNewRecording?: () => void;
}

const EMOJI_PRESETS = ['🔥', '🙌', '❤️', '⚡', '🤙', '✨'];

export const SocialFeed: React.FC<SocialFeedProps> = ({
  currentUser,
  users,
  routes,
  connections,
  feedItems,
  onSetFeedItems,
  onConnect,
  onInitiateSession,
  onSelectRoute,
  onNavigateToScreen,
  onStartNewRecording,
}) => {
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<string | null>(null);

  // Post Composer State
  const [composeText, setComposeText] = useState('');
  const [composeActivity, setComposeActivity] = useState<ActivityType>('running');
  const [composeRouteId, setComposeRouteId] = useState('');
  const [composeAudience, setComposeAudience] = useState<'friends' | 'public'>('friends'); // private by default!
  const [composePhotoUrl, setComposePhotoUrl] = useState<string | null>(null);

  // Helper: Find connection status details
  const getConnectionDetails = (targetUserId: string) => {
    const conn = connections.find(c => 
      (c.userIds[0] === currentUser.id && c.userIds[1] === targetUserId) ||
      (c.userIds[1] === currentUser.id && c.userIds[0] === targetUserId)
    );
    return conn ? { status: conn.status, tier: conn.tier || 'friend' } : null;
  };

  // Follow/Friend a user
  const handleFollowClick = (userId: string) => {
    onConnect(userId, 'friend'); // Defaults to friend tier when clicked
  };

  // Like a post
  const handleLikePost = (postId: string) => {
    onSetFeedItems(prev => prev.map(item => {
      if (item.id === postId) {
        const alreadyLiked = item.likes.includes(currentUser.id);
        const newLikes = alreadyLiked 
          ? item.likes.filter(id => id !== currentUser.id)
          : [...item.likes, currentUser.id];
        return { ...item, likes: newLikes };
      }
      return item;
    }));
  };

  // React with Emoji
  const handleReactPost = (postId: string, emoji: string) => {
    onSetFeedItems(prev => prev.map(item => {
      if (item.id === postId) {
        const reactions = { ...item.reactions };
        const usersWhoReacted = reactions[emoji] || [];
        const alreadyReacted = usersWhoReacted.includes(currentUser.id);

        if (alreadyReacted) {
          reactions[emoji] = usersWhoReacted.filter(id => id !== currentUser.id);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        } else {
          reactions[emoji] = [...usersWhoReacted, currentUser.id];
        }

        return { ...item, reactions };
      }
      return item;
    }));
    setActiveEmojiPicker(null);
  };

  // Add Comment
  const handleAddComment = (postId: string) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    const newComment: FeedComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatarConfig: currentUser.avatarConfig,
      text,
      timestamp: new Date().toISOString()
    };

    onSetFeedItems(prev => prev.map(item => {
      if (item.id === postId) {
        return { ...item, comments: [...item.comments, newComment] };
      }
      return item;
    }));

    setNewCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  // Handle social post photo uploading
  const handleComposePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setComposePhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Publish custom written post
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeText.trim()) return;

    const selectedRoute = routes.find(r => r.id === composeRouteId);

    const newPost: FeedItem = {
      id: `post-custom-${Date.now()}`,
      userId: currentUser.id,
      type: composePhotoUrl ? 'photo_share' : 'workout',
      userName: currentUser.name,
      userAvatarConfig: currentUser.avatarConfig,
      routeId: composeRouteId || (routes && routes.length > 0 ? routes[0].id : ''),
      routeName: selectedRoute ? selectedRoute.name : 'Custom Street Path',
      activityType: composeActivity,
      timestamp: new Date().toISOString(),
      likes: [],
      reactions: {},
      comments: [],
      workoutStats: {
        distance: selectedRoute ? selectedRoute.distance : 4.2,
        duration: selectedRoute ? Math.round(selectedRoute.distance * 6) : 25,
        elevation: selectedRoute ? selectedRoute.elevation : 35
      },
      caption: composeText.trim(),
      audience: composeAudience,
      photoUrl: composePhotoUrl || undefined
    };

    onSetFeedItems(prev => [newPost, ...prev]);
    setComposeText('');
    setComposeRouteId('');
    setComposePhotoUrl(null);
  };

  // Filter feed items based on granular connection layers and privacy
  const canSeePost = (item: FeedItem) => {
    // 1. Own posts are always visible
    if (item.userId === currentUser.id) return true;

    const details = getConnectionDetails(item.userId);
    const status = details?.status || null;
    const tier = details?.tier || 'friend';

    // Blocked users are completely invisible
    if (status === 'blocked') {
      return false;
    }

    // 2. "Challengers cannot see posts at all."
    if (status === 'connected' && tier === 'challenger') {
      return false;
    }

    // 3. Post visibility layers
    const postAudience = item.audience || 'friends'; // Private (friends-only) by default!
    if (postAudience === 'friends') {
      return status === 'connected' && tier === 'friend';
    }

    // Public post is visible to unconnected users too (as long as they aren't explicit challengers)
    return true;
  };

  const visibleFeedItems = feedItems.filter(canSeePost);

  // Get all active discoverable people nearby (exclude blocked users)
  const activeNearbyMates = users.filter(u => {
    if (u.id === currentUser.id || !u.isDiscoverable) return false;
    const details = getConnectionDetails(u.id);
    return details?.status !== 'blocked';
  });

  return (
    <div className="flex flex-col h-full bg-base text-zinc-50 overflow-hidden" id="social-feed-container">
      
      {/* Social-first Header */}
      <div className="p-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 shrink-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-green/10 rounded-2xl border border-brand-green/20 flex items-center justify-center animate-pulse">
              <Zap className="w-5 h-5 text-brand-green fill-brand-green" />
            </div>
            <div>
              <h1 className="font-display font-black text-white text-base tracking-tight leading-none">
                MATEPACE
              </h1>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1 font-mono">
                TRAINING HUB
              </p>
            </div>
          </div>
 
          {/* Quick Active Indicators */}
          <div className="flex items-center gap-1.5 bg-brand-accent/10 border border-brand-accent/20 px-3 py-1.5 rounded-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
            </span>
            <span className="text-[10px] font-extrabold text-brand-accent font-mono">
              {activeNearbyMates.length} ONLINE
            </span>
          </div>
        </div>
      </div>
 
      <div className="flex-1 overflow-y-auto space-y-4 p-4 pb-8" id="social-feed-scroll">
        
        {/* ENERGETIC QUICK START FITNESS ACTION HUB */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-green to-brand-blue p-5 text-slate-950 shadow-lg shadow-brand-green/10 transition-all hover:scale-[1.01] active:scale-95 duration-200" id="quick-start-fitness-hub">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-white/20 blur-xl pointer-events-none" />
          
          <div className="relative space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-slate-950/10 rounded-xl text-slate-950 shrink-0">
                <Flame className="w-5 h-5 fill-current" />
              </span>
              <div>
                <h2 className="text-sm font-display font-black uppercase tracking-tight">READY TO WORKOUT?</h2>
                <p className="text-[9px] text-slate-850 font-bold tracking-wide uppercase font-mono">Select your discipline</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-900 leading-snug">
              Start on a mapped trail to compete with paced ghost coaches, or record your live GPS track.
            </p>
            
            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
              <button
                onClick={() => onNavigateToScreen('discover')}
                className="py-2.5 px-3 bg-slate-950 hover:bg-slate-900 text-brand-green rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                id="hub-btn-start-trail"
              >
                <Compass className="w-4 h-4 text-brand-green" /> Discover Trails
              </button>
              <button
                onClick={() => {
                  if (onStartNewRecording) {
                    onStartNewRecording();
                  } else {
                    onNavigateToScreen('create_route');
                  }
                }}
                className="py-2.5 px-3 bg-zinc-100 hover:bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                id="hub-btn-record-gps"
              >
                <Plus className="w-4 h-4 text-brand-green" /> Record Live GPS
              </button>
            </div>
          </div>
        </div>
 
        {/* SECTION 1: ACTIVE DISCOVERABLE CAROUSEL */}
        <div className="space-y-2 bg-surface/80 backdrop-blur-md rounded-3xl p-4 border border-zinc-700/60 shadow-lg" id="active-mates-carousel-section">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-accent" /> Active Lobby Mates
            </h3>
            <span className="text-[9px] font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full font-mono border border-brand-accent/20">
              PROXIMITY
            </span>
          </div>
 
          {activeNearbyMates.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none py-1">
              {activeNearbyMates.map(user => {
                const details = getConnectionDetails(user.id);
                const status = details?.status || null;
                const tier = details?.tier || 'friend';
                const isMyFriend = status === 'connected' && tier === 'friend';
                const isMyChallenger = status === 'connected' && tier === 'challenger';
                const hasPending = status === 'pending';
                const userRoute = routes.find(r => r.id === user.currentRouteId);
 
                return (
                  <div 
                    key={user.id} 
                    className="flex flex-col items-center p-3 bg-zinc-950/40 border border-zinc-800 rounded-2xl w-28 shrink-0 relative shadow-md hover:border-brand-green/30 transition-all group"
                  >
                    {/* Activity Indicator Badge */}
                    {userRoute && (
                      <span className="absolute top-1 right-1 bg-brand-accent text-zinc-950 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm capitalize scale-95 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" />
                        Live
                      </span>
                    )}
 
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border-2 border-brand-accent p-0.5 shadow-sm">
                        <AvatarViewer config={user.avatarConfig} className="w-14 h-14" />
                      </div>
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-brand-accent border-2 border-zinc-900" />
                    </div>
 
                    <h4 className="text-[11px] font-black text-white text-center truncate w-full mt-2 leading-tight">
                      {user.name.split(' ')[0]}
                    </h4>
                    <p className="text-[9px] text-zinc-400 font-mono font-bold leading-none mt-0.5">
                      @{user.avatarConfig.displayName}
                    </p>
 
                    {/* Tier badge indication */}
                    {isMyFriend && (
                      <span className="text-[8px] font-bold text-brand-green bg-brand-green/10 border border-brand-green/25 px-1.5 py-0.5 rounded mt-1.5 scale-90">
                        Friend
                      </span>
                    )}
                    {isMyChallenger && (
                      <span className="text-[8px] font-bold text-brand-pop bg-brand-pop/10 border border-brand-pop/25 px-1.5 py-0.5 rounded mt-1.5 scale-90">
                        Challenger
                      </span>
                    )}
 
                    {/* Join / Invite Button */}
                    {userRoute ? (
                      <button
                        onClick={() => {
                          onSelectRoute(userRoute.id);
                          onInitiateSession(userRoute.id, user.id, 'together');
                        }}
                        className="mt-3 w-full py-1 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-90 text-slate-950 text-[9px] font-black uppercase rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer border-0"
                      >
                        <Zap className="w-2.5 h-2.5 fill-slate-950 text-slate-950" /> JOIN
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollowClick(user.id)}
                        className={`mt-3 w-full py-1 text-[9px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-0 ${
                          isMyFriend 
                            ? 'bg-brand-green/10 border border-brand-green/20 text-brand-green'
                            : isMyChallenger
                            ? 'bg-brand-pop/10 border border-brand-pop/20 text-brand-pop'
                            : hasPending
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200'
                        }`}
                      >
                        {isMyFriend ? (
                          <>
                            <UserCheck className="w-2.5 h-2.5" /> FRIENDS
                          </>
                        ) : isMyChallenger ? (
                          <>
                            <Lock className="w-2.5 h-2.5" /> PACER
                          </>
                        ) : hasPending ? (
                          <>
                            <Check className="w-2.5 h-2.5" /> PENDING
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-2.5 h-2.5" /> ADD
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center bg-zinc-950/40 rounded-2xl border border-zinc-800">
              <p className="text-xs text-zinc-500 italic">No other users online right now.</p>
              <button 
                onClick={() => onNavigateToScreen('people')}
                className="mt-1.5 text-[10px] font-bold text-brand-green hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Go browse the people lobby <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
 
        {/* SECTION 2: DISCOVERABLE GROUP / PROMPT BOX */}
        {activeNearbyMates.some(u => u.currentRouteId) && (
          <div className="bg-surface/90 border border-brand-accent/20 rounded-3xl p-4 text-white shadow-lg flex items-center justify-between" id="group-workout-prompt-box">
            <div className="space-y-1">
              <span className="bg-brand-accent/20 text-brand-accent border border-brand-accent/20 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                🚨 Live Active Session
              </span>
              <h4 className="text-xs font-bold leading-tight">
                Join a live workout session!
              </h4>
              <p className="text-[10px] text-zinc-400 max-w-[240px]">
                Active lobby members are currently out on trails. Tap to connect coordinates.
              </p>
            </div>
            <button
              onClick={() => {
                onNavigateToScreen('discover');
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-brand-green to-brand-blue text-slate-950 text-[10px] font-black rounded-xl hover:opacity-90 shadow-sm transition-all shrink-0 cursor-pointer border-0"
            >
              OPEN MAP
            </button>
          </div>
        )}
 
        {/* INTEGRATED POST COMPOSER */}
        <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-700/60 p-4 shadow-lg space-y-3.5" id="social-post-composer">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-1.5">
              <AvatarViewer config={currentUser.avatarConfig} className="w-7 h-7" />
              <h3 className="text-xs font-display font-black uppercase tracking-wider text-white">
                Share Workout Update
              </h3>
            </div>
            <span className="text-[9px] font-bold text-zinc-400 font-mono">
              PRIVATE SECURITY
            </span>
          </div>
 
          <form onSubmit={handlePublishPost} className="space-y-3">
            <textarea
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              placeholder="What's your workout goal today? (Posts will be friends-only by default)"
              rows={2}
              className="w-full text-xs font-medium bg-zinc-950/60 border border-zinc-700 rounded-2xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green"
              required
              id="compose-caption-textarea"
            />
 
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-400 mb-1 font-mono">Associate Trail</label>
                <select
                  value={composeRouteId}
                  onChange={(e) => setComposeRouteId(e.target.value)}
                  className="w-full p-2 bg-zinc-950/60 border border-zinc-800 text-zinc-300 rounded-xl font-bold text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20"
                  id="compose-route-select"
                >
                  <option value="">General update</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.distance}km)</option>
                  ))}
                </select>
              </div>
 
              <div>
                <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-400 mb-1 font-mono">Sport Discipline</label>
                <select
                  value={composeActivity}
                  onChange={(e) => setComposeActivity(e.target.value as ActivityType)}
                  className="w-full p-2 bg-zinc-950/60 border border-zinc-800 text-zinc-300 rounded-xl font-bold text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20"
                  id="compose-activity-select"
                >
                  <option value="running">Running 🏃</option>
                  <option value="biking">Cycling 🚴</option>
                  <option value="hiking">Hiking 🥾</option>
                  <option value="mountain_biking">MTB 🚵</option>
                  <option value="skateboard">Skate 🛹</option>
                  <option value="water_sports">Water 🛶</option>
                </select>
              </div>
            </div>
 
            {/* AUDIENCE SELECTOR */}
            <div className="bg-zinc-950/40 p-2.5 rounded-2xl border border-zinc-800 flex items-center justify-between text-[10px]">
              <div className="flex flex-col">
                <span className="font-bold text-white">Post Audience:</span>
                <span className="text-[8px] text-zinc-500 mt-0.5 leading-none font-mono">
                  Challengers are restricted
                </span>
              </div>
 
              <div className="flex gap-1.5 font-bold">
                <button
                  type="button"
                  onClick={() => setComposeAudience('friends')}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 text-[9px] uppercase tracking-wider transition-colors cursor-pointer ${
                    composeAudience === 'friends'
                      ? 'bg-brand-green/10 border-brand-green/30 text-brand-green'
                      : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                  }`}
                  id="compose-audience-friends"
                >
                  <Lock className="w-3 h-3" /> Friends
                </button>
                <button
                  type="button"
                  onClick={() => setComposeAudience('public')}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 text-[9px] uppercase tracking-wider transition-colors cursor-pointer ${
                    composeAudience === 'public'
                      ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                      : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                  }`}
                  id="compose-audience-public"
                >
                  <Globe className="w-3 h-3" /> Public
                </button>
              </div>
            </div>
 
            {/* PHOTO UPLOADER */}
            <div className="bg-zinc-950/40 p-2.5 rounded-2xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-white">Attach Workout Snapshot:</span>
                {composePhotoUrl && (
                  <button
                    type="button"
                    onClick={() => setComposePhotoUrl(null)}
                    className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>
 
              {composePhotoUrl ? (
                <div className="relative rounded-xl overflow-hidden h-28 border border-zinc-800">
                  <img src={composePhotoUrl} className="w-full h-full object-cover" alt="Compose preview" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border border-dashed border-zinc-700 hover:border-brand-green/40 bg-zinc-900/40 rounded-xl py-4 cursor-pointer transition-colors text-[10px] text-zinc-400">
                  <Camera className="w-5 h-5 text-zinc-500 mb-1" />
                  <span className="font-bold">Upload Snapshot</span>
                  <span className="text-[8px] text-zinc-500 mt-0.5">JPEG / PNG media uploads</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleComposePhotoUpload}
                    className="hidden"
                    id="btn-upload-post-photo"
                  />
                </label>
              )}
            </div>
 
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-90 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-0"
              id="btn-publish-social-post"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Update
            </button>
          </form>
        </div>
 
        {/* SECTION 3: THE SOCIAL FEED OF EXPERIENCES */}
        <div className="space-y-3" id="social-activities-list-container">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1 font-mono">
            Activity Feed
          </h2>
 
          {visibleFeedItems.length > 0 ? (
            visibleFeedItems.map((item) => {
              const hasLiked = item.likes.includes(currentUser.id);
              const details = getConnectionDetails(item.userId);
              const status = details?.status || null;
              const isFriend = status === 'connected' && details?.tier === 'friend';
              const postAudience = item.audience || 'friends';
 
              return (
                <div 
                  key={item.id} 
                  className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-700/60 shadow-lg overflow-hidden flex flex-col hover:border-brand-green/20 transition-all"
                  id={`feed-card-${item.id}`}
                >
                  {/* Card Header: User profile info */}
                  <div className="p-3.5 flex items-center justify-between border-b border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800">
                        <AvatarViewer config={item.userAvatarConfig} className="w-11 h-11" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                           <span className="text-xs font-bold text-white leading-tight">{item.userName}</span>
                           <span className="h-1 w-1 rounded-full bg-zinc-700" />
                           <span className="text-[9px] font-bold text-zinc-400 capitalize font-mono">@{item.userAvatarConfig.displayName}</span>
                        </div>
                         
                        <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono mt-0.5">
                          <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span className="capitalize">{item.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
 
                    {/* Audience settings badge and follow/friend button */}
                    <div className="flex items-center gap-2">
                      {/* Post Visibility Badge Indicator */}
                      {postAudience === 'friends' ? (
                        <span className="text-[8px] font-bold bg-brand-green/10 text-brand-green border border-brand-green/20 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-mono" title="Friends Only (Private)">
                          <Lock className="w-2.5 h-2.5" /> FRIENDS
                        </span>
                      ) : (
                        <span className="text-[8px] font-bold bg-brand-blue/10 text-brand-blue border border-brand-blue/20 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-mono" title="Public Post">
                          <Globe className="w-2.5 h-2.5" /> PUBLIC
                        </span>
                      )}
 
                      {item.userId !== currentUser.id && (
                        <button
                          onClick={() => handleFollowClick(item.userId)}
                          className={`px-2.5 py-1 text-[9px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer border-0 ${
                            isFriend 
                              ? 'bg-zinc-900 text-zinc-500 border border-zinc-850'
                              : 'bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-90 text-slate-950 font-black'
                          }`}
                        >
                          {isFriend ? (
                            <>
                              <Check className="w-2.5 h-2.5" /> MATES
                            </>
                          ) : (
                            <>
                              <Plus className="w-2.5 h-2.5" /> ADD
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
 
                  {/* Card Body: Caption */}
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-zinc-200 leading-relaxed break-words whitespace-pre-wrap">
                      {item.caption}
                    </p>
                  </div>
 
                  {/* Card Body: Workout Stats (if type workout) */}
                  {item.type === 'workout' && item.workoutStats && (
                    <div className="px-4 pb-3">
                      <div className="grid grid-cols-3 gap-2 bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800 text-center">
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-wider text-brand-green font-mono">Distance</span>
                          <span className="text-xs font-black text-white">{item.workoutStats.distance} km</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-wider text-brand-green font-mono">Duration</span>
                          <span className="text-xs font-black text-white">{item.workoutStats.duration} m</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-wider text-brand-green font-mono">Elevation</span>
                          <span className="text-xs font-black text-white">+{item.workoutStats.elevation}m</span>
                        </div>
                      </div>
 
                      <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-300 bg-zinc-950/40 px-3 py-1.5 rounded-xl border border-zinc-800">
                        <span className="flex items-center gap-1.5 font-bold truncate">
                          <MapPin className="w-3.5 h-3.5 text-brand-green" />
                          {item.routeName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase text-zinc-300 bg-zinc-800 shrink-0">
                          {item.activityType}
                        </span>
                      </div>
                    </div>
                  )}
 
                  {/* Card Body: Discoverable Prompt (if type discoverable) */}
                  {item.type === 'discoverable' && (
                    <div className="px-4 pb-3">
                      <div className="bg-zinc-950/40 border border-brand-green/20 rounded-2xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-brand-green/10 rounded-xl flex items-center justify-center">
                            <Compass className="w-4 h-4 text-brand-green" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white">Active on: {item.routeName}</p>
                            <p className="text-[9px] text-brand-accent font-medium">Ready to sync live coordinates</p>
                          </div>
                        </div>
 
                        <button
                          onClick={() => {
                            onSelectRoute(item.routeId);
                            onNavigateToScreen('discover');
                          }}
                          className="py-1.5 px-3 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-90 text-slate-950 rounded-xl text-[9px] font-black flex items-center gap-1 transition-all shadow-xs cursor-pointer border-0"
                        >
                          <Zap className="w-3 h-3 fill-slate-950 text-slate-950" /> JOIN
                        </button>
                      </div>
                    </div>
                  )}
 
                  {/* Card Body: Photo (if type photo_share) */}
                  {item.type === 'photo_share' && item.photoUrl && (
                    <div className="px-4 pb-3">
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-xs group">
                        <img 
                          src={item.photoUrl} 
                          alt={item.routeName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-bold text-white flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-brand-green" />
                          {item.routeName}
                        </div>
                      </div>
                    </div>
                  )}
 
                  {/* Card Footer: Social Actions */}
                  <div className="px-3.5 py-2 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between text-zinc-400 relative shrink-0">
                    <div className="flex items-center gap-3">
                      {/* Like Action */}
                      <button 
                        onClick={() => handleLikePost(item.id)}
                        className={`flex items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-black transition-all cursor-pointer border-0 ${
                          hasLiked 
                            ? 'text-brand-pop bg-brand-pop/10' 
                            : 'hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${hasLiked ? 'fill-brand-pop text-brand-pop' : ''}`} />
                        <span>{item.likes.length}</span>
                      </button>
 
                      {/* Comment trigger */}
                      <button 
                        onClick={() => setActiveCommentBox(activeCommentBox === item.id ? null : item.id)}
                        className={`flex items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-black hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer border-0 ${
                          activeCommentBox === item.id ? 'bg-zinc-800 text-white' : ''
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{item.comments.length}</span>
                      </button>
 
                      {/* Emoji Reaction Trigger */}
                      <div className="relative">
                        <button 
                          onClick={() => setActiveEmojiPicker(activeEmojiPicker === item.id ? null : item.id)}
                          className={`flex items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-black hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer border-0 ${
                            activeEmojiPicker === item.id ? 'bg-zinc-800 text-white' : ''
                          }`}
                        >
                          <Smile className="w-4 h-4" />
                          <span className="text-[9px] font-bold text-brand-green">React</span>
                        </button>
 
                        {/* Floating Emoji Picker Popover */}
                        {activeEmojiPicker === item.id && (
                          <div className="absolute bottom-8 left-0 bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl shadow-xl flex gap-1.5 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
                            {EMOJI_PRESETS.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => handleReactPost(item.id, emoji)}
                                className="p-1 hover:bg-zinc-800 rounded-lg text-sm hover:scale-125 transition-all cursor-pointer border-0"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
 
                    {/* Render existing small reactions */}
                    <div className="flex gap-1">
                      {Object.entries(item.reactions).map(([emoji, listVal]) => {
                        const list = listVal as string[];
                        if (list.length === 0) return null;
                        const amIn = list.includes(currentUser.id);
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReactPost(item.id, emoji)}
                            className={`px-1.5 py-0.5 rounded-lg text-[9px] font-extrabold flex items-center gap-0.5 border cursor-pointer ${
                              amIn ? 'bg-brand-pop/10 border-brand-pop/20 text-brand-pop' : 'bg-zinc-950/40 border-zinc-800 text-zinc-400'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[8px]">{list.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
 
                  {/* Card Comments Drawer */}
                  {(activeCommentBox === item.id || item.comments.length > 0) && (
                    <div className="bg-zinc-950/40 px-4 py-3 border-t border-zinc-800 space-y-2">
                      
                      {/* Render comments */}
                      {item.comments.length > 0 && (
                        <div className="space-y-2.5 max-h-48 overflow-y-auto font-sans">
                          {item.comments.filter(comment => {
                            const details = getConnectionDetails(comment.userId);
                            return details?.status !== 'blocked';
                          }).map((comment) => (
                            <div key={comment.id} className="flex gap-2 text-xs items-start">
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 mt-0.5">
                                <AvatarViewer config={comment.userAvatarConfig} className="w-7 h-7" />
                              </div>
                              <div className="bg-zinc-900 px-3 py-2 rounded-2xl flex-1 border border-zinc-850">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white text-[10px]">{comment.userName}</span>
                                  <span className="text-[8px] text-zinc-500 font-mono font-bold">
                                    {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-[10px] text-zinc-350 font-medium mt-0.5 break-all leading-normal">{comment.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
 
                      {/* Add comment input */}
                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="text"
                          placeholder="Write comments..."
                          value={newCommentText[item.id] || ''}
                          onChange={(e) => setNewCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(item.id);
                          }}
                          className="flex-1 bg-zinc-950/60 border border-zinc-850 px-3 py-1.5 rounded-xl text-[10px] text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-green/20"
                        />
                        <button
                          onClick={() => handleAddComment(item.id)}
                          className="p-2 bg-brand-green hover:opacity-90 text-slate-950 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center shrink-0 border-0"
                        >
                          <Send className="w-3 h-3 fill-slate-950" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-zinc-800/40 rounded-3xl border border-zinc-800 text-zinc-500">
              <EyeOff className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-400 uppercase">Lobby Quiet</p>
              <p className="text-[10px] text-zinc-500 mt-1">
                Approved Friends updates display here. Connect with friends or publish an update!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
