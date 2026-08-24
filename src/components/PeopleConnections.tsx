import React, { useState } from 'react';
import { User, Connection, Route, ActivityType } from '../types';
import { ACTIVITY_DETAILS } from '../mockData';
import { AvatarViewer } from './AvatarViewer';
import { 
  Search, 
  UserCheck, 
  MessageSquare, 
  Zap, 
  Play, 
  UserPlus, 
  Flame, 
  Users, 
  Hourglass, 
  Lock, 
  Unlock, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  Eye, 
  Sliders, 
  UserX,
  Award,
  Compass,
  Clock,
  Landmark
} from 'lucide-react';

interface PeopleConnectionsProps {
  users: User[];
  connections: Connection[];
  routes: Route[];
  currentUser: User;
  onConnect: (targetUserId: string, tier?: 'challenger' | 'friend') => void;
  onInitiateChat: (targetUserId: string) => void;
  onInitiateSession: (routeId: string, opponentId: string, mode: 'compete' | 'together') => void;
  onChangeConnectionTier: (targetUserId: string, tier: 'challenger' | 'friend') => void;
  onRemoveConnection: (targetUserId: string) => void;
  onBlockUser: (targetUserId: string) => void;
  onUnblockUser: (targetUserId: string) => void;
}

export const PeopleConnections: React.FC<PeopleConnectionsProps> = ({
  users,
  connections,
  routes,
  currentUser,
  onConnect,
  onInitiateChat,
  onInitiateSession,
  onChangeConnectionTier,
  onRemoveConnection,
  onBlockUser,
  onUnblockUser,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'mates' | 'pending' | 'blocked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInspectorUser, setSelectedInspectorUser] = useState<User | null>(null);

  // Helper: Find connection details
  const getConnectionDetails = (targetUserId: string) => {
    const conn = connections.find(c => 
      (c.userIds[0] === currentUser.id && c.userIds[1] === targetUserId) ||
      (c.userIds[1] === currentUser.id && c.userIds[0] === targetUserId)
    );
    return conn ? { status: conn.status, tier: conn.tier || 'friend' } : null;
  };

  // Filter nearby users
  const nearbyUsers = users.filter(user => user.id !== currentUser.id);

  const filteredUsers = nearbyUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.avatarConfig.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const details = getConnectionDetails(user.id);
    if (filterTab === 'mates') {
      return details?.status === 'connected';
    } else if (filterTab === 'pending') {
      return details?.status === 'pending';
    } else if (filterTab === 'blocked') {
      return details?.status === 'blocked';
    }
    
    // Default ('all'): Hide blocked users
    return details?.status !== 'blocked';
  });

  return (
    <div className="flex flex-col h-full bg-base text-zinc-50 overflow-hidden" id="people-lobby-container">
      {/* Header and Search */}
      <div className="p-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 shadow-md shrink-0 z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-white text-base leading-none flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-green" /> Active Lobby
            </h1>
            <p className="text-[10px] text-zinc-400 mt-1 font-mono uppercase tracking-wider">Interact with local training mates</p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-550 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mates by name..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green"
            id="search-people-input"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-zinc-950/60 p-0.5 rounded-xl text-xs font-bold border border-zinc-800">
          <button
            onClick={() => setFilterTab('all')}
            className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer border-0 ${
              filterTab === 'all' ? 'bg-brand-green text-zinc-950 font-black shadow-xs' : 'text-zinc-400 hover:text-zinc-200 bg-transparent'
            }`}
            id="tab-all-people"
          >
            All ({nearbyUsers.filter(u => getConnectionDetails(u.id)?.status !== 'blocked').length})
          </button>
          <button
            onClick={() => setFilterTab('mates')}
            className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer border-0 ${
              filterTab === 'mates' ? 'bg-brand-green text-zinc-950 font-black shadow-xs' : 'text-zinc-400 hover:text-zinc-200 bg-transparent'
            }`}
            id="tab-mates-only"
          >
            Mates ({connections.filter(c => c.status === 'connected').length})
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer border-0 ${
              filterTab === 'pending' ? 'bg-brand-green text-zinc-950 font-black shadow-xs' : 'text-zinc-400 hover:text-zinc-200 bg-transparent'
            }`}
            id="tab-pending-only"
          >
            Pending ({connections.filter(c => c.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterTab('blocked')}
            className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer border-0 ${
              filterTab === 'blocked' ? 'bg-brand-green text-zinc-950 font-black shadow-xs' : 'text-zinc-400 hover:text-zinc-200 bg-transparent'
            }`}
            id="tab-blocked-only"
          >
            Blocked ({connections.filter(c => c.status === 'blocked' && c.blockedBy === currentUser.id).length})
          </button>
        </div>
      </div>

      {/* Lobby User Cards (Scrollable List) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const details = getConnectionDetails(user.id);
            const status = details?.status || null;
            const tier = details?.tier || 'friend';
            const userRoute = routes.find(r => r.id === user.currentRouteId);
            const isChallenger = status === 'connected' && tier === 'challenger';

            return (
              <div
                key={user.id}
                className="bg-surface/80 backdrop-blur-md rounded-3xl border border-zinc-800/60 p-4 shadow-lg hover:border-brand-green/20 transition-all space-y-3"
                id={`lobby-card-${user.id}`}
              >
                {/* Top Section: Avatar, display details */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedInspectorUser(user)}
                      className="text-left focus:outline-none cursor-pointer bg-transparent border-0"
                      title="Inspect user profile layers"
                    >
                      <AvatarViewer config={user.avatarConfig} className="w-12 h-12 shrink-0 border border-zinc-800 rounded-xl hover:opacity-85 transition-opacity animate-none" />
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedInspectorUser(user)}
                          className="font-display font-black text-sm text-white hover:text-brand-green hover:underline leading-none text-left cursor-pointer bg-transparent border-0"
                        >
                          {user.name}
                        </button>
                        <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full capitalize font-mono">
                          {user.fitnessLevel}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-zinc-400 mt-1">@{user.avatarConfig.displayName}</p>
                    </div>
                  </div>

                  {/* Status & Tier Badges */}
                  <div className="flex flex-col items-end gap-1">
                    {status === 'connected' && (
                      <div className="flex gap-1 items-center">
                        {tier === 'friend' ? (
                          <span className="bg-brand-green/10 text-brand-green text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-brand-green/20 font-mono">
                            <ShieldCheck className="w-2.5 h-2.5" /> FRIEND
                          </span>
                        ) : (
                          <span className="bg-brand-pop/10 text-brand-pop text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-brand-pop/20 font-mono">
                            <Lock className="w-2.5 h-2.5" /> PACER
                          </span>
                        )}
                        <span className="bg-zinc-955 text-zinc-400 text-[9px] font-bold px-1.5 py-0.5 rounded-lg border border-zinc-800 font-mono">
                          MATED
                        </span>
                      </div>
                    )}
                    {status === 'pending' && (
                      <span className="bg-brand-accent/10 text-brand-accent text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-brand-accent/20 animate-pulse font-mono">
                        <Hourglass className="w-3 h-3" /> PENDING
                      </span>
                    )}
                  </div>
                </div>

                {/* Preferred sports icons row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Preferred:</span>
                    <div className="flex gap-1">
                      {user.activities.map((act) => (
                        <span
                          key={act}
                          className="text-xs px-1.5 py-0.5 rounded bg-zinc-950/60 border border-zinc-800"
                          title={ACTIVITY_DETAILS[act].label}
                        >
                          {act === 'running' && '🏃'}
                          {act === 'hiking' && '🥾'}
                          {act === 'biking' && '🚴'}
                          {act === 'mountain_biking' && '🚵'}
                          {act === 'skateboard' && '🛹'}
                          {act === 'water_sports' && '🛶'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSelectedInspectorUser(user)}
                      className="text-[10px] font-bold text-zinc-400 hover:text-zinc-200 flex items-center gap-1 bg-zinc-950/40 hover:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800/60 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> Inspect Layers
                    </button>
                    {status === 'blocked' ? (
                      <button
                        onClick={() => onUnblockUser(user.id)}
                        className="text-[10px] font-bold text-brand-green hover:text-white hover:bg-zinc-900 flex items-center gap-1 bg-zinc-950/40 px-2.5 py-1 rounded-lg border border-brand-green/20 cursor-pointer"
                        id={`btn-unblock-card-${user.id}`}
                      >
                        <Check className="w-3 h-3" /> Unblock
                      </button>
                    ) : (
                      <button
                        onClick={() => onBlockUser(user.id)}
                        className="text-[10px] font-bold text-brand-pop hover:text-white hover:bg-zinc-900 flex items-center gap-1 bg-zinc-950/40 px-2.5 py-1 rounded-lg border border-brand-pop/20 cursor-pointer"
                        id={`btn-block-card-${user.id}`}
                      >
                        <UserX className="w-3 h-3" /> Block
                      </button>
                    )}
                  </div>
                </div>

                {/* Current activity trail report */}
                {userRoute ? (
                  <div className="bg-zinc-950/40 rounded-xl p-2.5 border border-zinc-800 text-xs">
                    <p className="text-[9px] text-zinc-550 uppercase font-black tracking-wider leading-none font-mono">Currently on Trail</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className="font-bold text-zinc-200 truncate">{userRoute.name}</span>
                      <span className="font-mono text-brand-green font-bold shrink-0">{userRoute.distance}km</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-zinc-500 italic">
                    Not currently active on any route.
                  </div>
                )}

                {/* Interactive Connection Tier Control */}
                {status === 'connected' && (
                  <div className="bg-zinc-950/40 rounded-xl p-2 border border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-300">
                    <span className="flex items-center gap-1 font-mono text-[9px] text-zinc-400 uppercase">
                      <Sliders className="w-3 h-3 text-zinc-500" /> PRIVACY TIER:
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onChangeConnectionTier(user.id, 'friend')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-colors cursor-pointer border-0 ${
                          tier === 'friend' 
                            ? 'bg-brand-green text-zinc-950 shadow-sm' 
                            : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-850'
                        }`}
                      >
                        Friend
                      </button>
                      <button
                        onClick={() => onChangeConnectionTier(user.id, 'challenger')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-colors cursor-pointer border-0 ${
                          tier === 'challenger' 
                            ? 'bg-brand-pop text-zinc-950 shadow-sm' 
                            : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-850'
                        }`}
                      >
                        Challenger
                      </button>
                    </div>
                  </div>
                )}

                {/* BOTTOM ACTION BUTTONS ROW */}
                <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-end gap-2">
                  {status === null && (
                    <div className="flex gap-2 w-full justify-between items-center">
                      <span className="text-[9px] font-bold text-zinc-400 font-mono uppercase">CHOOSE SECURITY TIER:</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onConnect(user.id, 'friend')}
                          className="px-3 py-1.5 bg-brand-green hover:opacity-90 text-zinc-950 rounded-xl text-[10px] font-black shadow-sm transition-all flex items-center gap-1 cursor-pointer border-0"
                          id={`btn-connect-friend-${user.id}`}
                        >
                          <UserPlus className="w-3 h-3" /> Friend Request
                        </button>
                        <button
                          onClick={() => onConnect(user.id, 'challenger')}
                          className="px-3 py-1.5 bg-brand-pop hover:opacity-90 text-zinc-950 rounded-xl text-[10px] font-black shadow-sm transition-all flex items-center gap-1 cursor-pointer border-0"
                          id={`btn-connect-challenger-${user.id}`}
                        >
                          <Zap className="w-3 h-3" /> Challenger Request
                        </button>
                      </div>
                    </div>
                  )}

                  {status === 'pending' && (
                    <div className="flex gap-2 w-full justify-between items-center">
                      <span className="text-[9px] font-bold text-zinc-400 font-mono uppercase">APPROVE LEVEL:</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onConnect(user.id, 'friend')}
                          className="px-3 py-1.5 bg-brand-green hover:opacity-90 text-zinc-950 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer border-0"
                          id={`btn-approve-friend-${user.id}`}
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Friend Tier
                        </button>
                        <button
                          onClick={() => onConnect(user.id, 'challenger')}
                          className="px-3 py-1.5 bg-brand-pop hover:opacity-90 text-zinc-950 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer border-0"
                          id={`btn-approve-challenger-${user.id}`}
                        >
                          <Lock className="w-3.5 h-3.5" /> Challenger
                        </button>
                      </div>
                    </div>
                  )}

                  {status === 'connected' && (
                    <>
                      {isChallenger ? (
                        <div className="mr-auto text-[9px] font-bold text-brand-pop bg-brand-pop/10 border border-brand-pop/20 px-2 py-1 rounded-lg flex items-center gap-1 font-mono">
                          <Lock className="w-2.5 h-2.5" /> CHAT RESTRICTED (PACER ONLY)
                        </div>
                      ) : (
                        <button
                          onClick={() => onInitiateChat(user.id)}
                          className="p-2 text-zinc-300 hover:text-white bg-zinc-950/40 hover:bg-zinc-900 rounded-xl border border-zinc-800/60 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold mr-auto"
                          title="Open Private Chat"
                          id={`btn-chat-with-${user.id}`}
                        >
                          <MessageSquare className="w-4 h-4 text-brand-green" /> Chat Friend
                        </button>
                      )}

                      <button
                        onClick={() => onRemoveConnection(user.id)}
                        className="px-2.5 py-2 bg-zinc-950/40 hover:bg-brand-pop/10 hover:text-brand-pop text-zinc-400 hover:border-brand-pop/20 rounded-xl text-[11px] font-bold border border-zinc-800 transition-all flex items-center gap-1 cursor-pointer"
                        title="Remove connection"
                        id={`btn-remove-mate-${user.id}`}
                      >
                        Remove
                      </button>

                      {userRoute && (
                        <>
                          <button
                            onClick={() => onInitiateSession(userRoute.id, user.id, 'together')}
                            className="px-3.5 py-2 bg-brand-green hover:opacity-90 text-zinc-950 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1 cursor-pointer border-0"
                            id={`btn-join-session-${user.id}`}
                          >
                            <Play className="w-3 h-3 fill-zinc-950 text-zinc-950" /> Join Workout
                          </button>

                          <button
                            onClick={() => onInitiateSession(userRoute.id, user.id, 'compete')}
                            className="px-3.5 py-2 bg-brand-pop hover:opacity-90 text-zinc-950 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1 cursor-pointer border-0"
                            id={`btn-race-session-${user.id}`}
                          >
                            <Zap className="w-3 h-3 fill-zinc-950 text-zinc-950" /> Race Challenge
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-zinc-800/40 rounded-3xl border border-zinc-800/50 text-zinc-500">
            <Users className="w-10 h-10 text-zinc-650 mx-auto mb-2" />
            <p className="text-xs font-semibold text-zinc-400 uppercase font-mono">No athletes found</p>
            <p className="text-[10px] text-zinc-550 mt-1">Try switching tabs or adjusting search filter.</p>
          </div>
        )}
      </div>

      {/* DETAILED PROFILE INSPECTOR MODAL */}
      {selectedInspectorUser && (() => {
        const details = getConnectionDetails(selectedInspectorUser.id);
        const status = details?.status || null;
        const tier = details?.tier || 'friend';
        
        // Private Profile is visible if they are approved Friend tier
        const isFriend = status === 'connected' && tier === 'friend';
        const stats = selectedInspectorUser.stats;

        // Custom privacy settings on details
        const showStats = isFriend || selectedInspectorUser.privacySettings?.showStatsToChallengers;
        const showBio = isFriend || !selectedInspectorUser.privacySettings?.bioPrivate;
        const showAgeLoc = isFriend || (!selectedInspectorUser.privacySettings?.agePrivate && !selectedInspectorUser.privacySettings?.locationPrivate);

        return (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="profile-inspector-modal">
            <div className="bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-800 flex flex-col max-h-[90vh]">
              {/* Cover Banner */}
              <div className="bg-gradient-to-br from-brand-green to-brand-blue text-zinc-950 p-5 relative shrink-0">
                <button
                  onClick={() => setSelectedInspectorUser(null)}
                  className="absolute top-4 right-4 p-1.5 bg-zinc-950/10 hover:bg-zinc-950/20 rounded-full text-zinc-950 transition-colors cursor-pointer border-0"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center text-center space-y-2 mt-2">
                  <div className="w-24 h-24 bg-zinc-950/15 rounded-full p-1.5 border border-zinc-950/10 flex items-center justify-center">
                    <AvatarViewer config={selectedInspectorUser.avatarConfig} className="w-20 h-20 animate-none" />
                  </div>
                  <div>
                    <h2 className="text-base font-display font-black leading-tight text-zinc-950">
                      {selectedInspectorUser.name}
                    </h2>
                    <p className="text-[11px] text-zinc-900 font-mono mt-0.5 font-bold">@{selectedInspectorUser.avatarConfig.displayName}</p>
                  </div>

                  <div className="flex gap-1.5">
                    <span className="bg-zinc-955/10 text-zinc-900 text-[9px] font-bold px-2.5 py-0.5 rounded-full capitalize font-mono border border-zinc-950/10">
                      {selectedInspectorUser.fitnessLevel}
                    </span>
                    <span className="bg-zinc-955/10 text-zinc-900 text-[9px] font-bold px-2.5 py-0.5 rounded-full font-mono border border-zinc-950/10">
                      EST. {new Date(selectedInspectorUser.joinedAt).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Body info */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* Layer Status Header */}
                {isFriend ? (
                  <div className="bg-brand-green/10 text-brand-green p-3 rounded-2xl border border-brand-green/25 flex items-center gap-2 text-xs">
                    <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                    <div>
                      <p className="font-extrabold text-[10px] leading-tight text-white uppercase font-mono">APPROVED FRIEND PROFILE UNLOCKED</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">All personal bio, metrics, and training stats are fully unlocked.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-brand-pop/10 text-brand-pop p-3 rounded-2xl border border-brand-pop/25 flex items-start gap-2 text-xs">
                    <Lock className="w-4 h-4 text-brand-pop shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-extrabold text-[10px] leading-tight text-white uppercase font-mono">
                        {status === 'connected' ? 'PACER PROFILE LAYER ONLY' : 'PUBLIC PROFILE LAYER ONLY'}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Detailed statistics, location, and biography are private. Upgrade connection to reveal.
                      </p>
                      {status === 'connected' && (
                        <button
                          onClick={() => {
                            onChangeConnectionTier(selectedInspectorUser.id, 'friend');
                            setSelectedInspectorUser(prev => prev ? { ...prev } : null);
                          }}
                          className="mt-2 px-2.5 py-1 bg-brand-green text-zinc-950 rounded-lg text-[9px] font-black hover:opacity-95 transition-colors shadow-2xs cursor-pointer border-0"
                        >
                          Upgrade Tier to Friend
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Preferred sports */}
                <div className="bg-zinc-950/40 rounded-2xl border border-zinc-800 p-3 space-y-2">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider font-mono">Preferred Disciplines</h4>
                  <div className="flex gap-1.5 flex-wrap">
                    {selectedInspectorUser.activities.map((act) => (
                      <span
                        key={act}
                        className="text-xs font-bold bg-zinc-900 text-zinc-300 border border-zinc-800 px-3 py-1 rounded-xl flex items-center gap-1"
                      >
                        <span>
                          {act === 'running' && '🏃'}
                          {act === 'hiking' && '🥾'}
                          {act === 'biking' && '🚴'}
                          {act === 'mountain_biking' && '🚵'}
                          {act === 'skateboard' && '🛹'}
                          {act === 'water_sports' && '🛶'}
                        </span>
                        {ACTIVITY_DETAILS[act].label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* PERSONAL LAYER DETAILS */}
                <div className="bg-zinc-950/40 rounded-2xl border border-zinc-800 p-3 space-y-2.5 relative overflow-hidden">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider font-mono">Biography</h4>
                  
                  {showBio || isFriend ? (
                    <div className="space-y-2 text-xs text-zinc-300 leading-relaxed font-semibold">
                      <p className="italic text-zinc-200">
                        "{selectedInspectorUser.bio || 'Exploring mountain and coastal paths on weekends.'}"
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 font-mono text-[10px] text-zinc-555">
                        {selectedInspectorUser.age && (
                          <p>Age: <span className="text-zinc-300 font-sans font-bold">{selectedInspectorUser.age} yrs</span></p>
                        )}
                        {selectedInspectorUser.location && (
                          <p>Location: <span className="text-zinc-300 font-sans font-bold">{selectedInspectorUser.location}</span></p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 flex flex-col items-center text-center space-y-1.5 text-zinc-500">
                      <Lock className="w-5 h-5 text-zinc-650" />
                      <p className="text-[11px] italic">Biography details are locked.</p>
                    </div>
                  )}
                </div>

                {/* TRAINING STATISTICS */}
                <div className="bg-zinc-950/40 rounded-2xl border border-zinc-800 p-3 space-y-2 relative overflow-hidden">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider font-mono">Performance Metrics</h4>

                  {showStats || isFriend ? (
                    stats ? (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                          <Award className="w-5 h-5 text-brand-pop shrink-0" />
                          <div>
                            <p className="text-[8px] font-bold text-zinc-500 uppercase leading-none font-mono">Workouts</p>
                            <p className="text-xs font-black text-white mt-1 font-mono">{stats.totalWorkouts}</p>
                          </div>
                        </div>

                        <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                          <Compass className="w-5 h-5 text-brand-green shrink-0" />
                          <div>
                            <p className="text-[8px] font-bold text-zinc-500 uppercase leading-none font-mono">Distance</p>
                            <p className="text-xs font-black text-white mt-1 font-mono">{stats.totalDistance} <span className="text-[8px] font-normal font-sans">km</span></p>
                          </div>
                        </div>

                        <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-brand-blue shrink-0" />
                          <div>
                            <p className="text-[8px] font-bold text-zinc-500 uppercase leading-none font-mono">Duration</p>
                            <p className="text-xs font-black text-white mt-1 font-mono">{Math.round(stats.totalDuration / 60)} <span className="text-[8px] font-normal font-sans font-sans">hrs</span></p>
                          </div>
                        </div>

                        <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                          <Landmark className="w-5 h-5 text-brand-accent shrink-0" />
                          <div>
                            <p className="text-[8px] font-bold text-zinc-500 uppercase leading-none font-mono">Climbed</p>
                            <p className="text-xs font-black text-white mt-1 font-mono">+{stats.elevationGain} <span className="text-[8px] font-normal font-sans">m</span></p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-500 italic">No statistical history available.</p>
                    )
                  ) : (
                    <div className="py-6 flex flex-col items-center text-center space-y-1.5 text-zinc-500">
                      <Lock className="w-6 h-6 text-zinc-650" />
                      <p className="text-[11px] font-bold text-zinc-400">Training metrics are locked.</p>
                      <p className="text-[10px] text-zinc-500 max-w-[200px]">Unlock metrics by upgrading to approved Friend tier.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button Footer with safety actions */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-850 flex items-center justify-between shrink-0 gap-2">
                <div className="flex gap-1.5">
                  {status === 'connected' && (
                    <button
                      onClick={() => {
                        onRemoveConnection(selectedInspectorUser.id);
                        setSelectedInspectorUser(null);
                      }}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-brand-pop/10 hover:text-brand-pop text-zinc-400 border border-zinc-800 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      id={`btn-remove-modal-${selectedInspectorUser.id}`}
                    >
                      Remove Mate
                    </button>
                  )}
                  {status === 'blocked' ? (
                    <button
                      onClick={() => {
                        onUnblockUser(selectedInspectorUser.id);
                        setSelectedInspectorUser(null);
                      }}
                      className="px-3 py-1.5 bg-brand-green hover:opacity-90 text-zinc-950 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer border-0"
                      id={`btn-unblock-modal-${selectedInspectorUser.id}`}
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onBlockUser(selectedInspectorUser.id);
                        setSelectedInspectorUser(null);
                      }}
                      className="px-3 py-1.5 bg-brand-pop/15 hover:bg-brand-pop hover:text-slate-950 text-brand-pop rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-brand-pop/25"
                      id={`btn-block-modal-${selectedInspectorUser.id}`}
                    >
                      Block
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSelectedInspectorUser(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-755 text-white rounded-xl text-xs font-bold cursor-pointer border-0"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
