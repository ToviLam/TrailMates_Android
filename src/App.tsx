/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  User,
  Route,
  Connection,
  Message,
  AvatarConfig,
  FitnessLevel,
  ActivityType,
  FeedItem
} from './types';
import {
  INITIAL_USERS,
  INITIAL_ROUTES,
  INITIAL_CONNECTIONS,
  INITIAL_MESSAGES,
  CURRENT_USER_ID,
  ACTIVITY_DETAILS,
  INITIAL_FEED_ITEMS
} from './mockData';
import { AvatarBuilder } from './components/AvatarBuilder';
import { MapView } from './components/MapView';
import { CreateRoute } from './components/CreateRoute';
import { PeopleConnections } from './components/PeopleConnections';
import { ChatView } from './components/ChatView';
import { LiveWorkout } from './components/LiveWorkout';
import { SummaryScreen } from './components/SummaryScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AvatarViewer } from './components/AvatarViewer';
import { LandingScreen } from './components/LandingScreen';
import { SocialFeed } from './components/SocialFeed';
import { UserGuideScreen } from './components/UserGuideScreen';
import { Home, Compass, PlusCircle, Users, UserCheck, Sparkles, MessageSquare, Flame, HelpCircle } from 'lucide-react';

export default function App() {
  // --- APPLICATION STATE ---
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [connections, setConnections] = useState<Connection[]>(() => {
    try {
      const saved = localStorage.getItem('matepace_connections');
      return saved ? JSON.parse(saved) : INITIAL_CONNECTIONS;
    } catch {
      return INITIAL_CONNECTIONS;
    }
  });
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [feedItems, setFeedItems] = useState<FeedItem[]>(INITIAL_FEED_ITEMS);
  const [autoStartRecording, setAutoStartRecording] = useState<boolean>(false);

  // Sync connections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('matepace_connections', JSON.stringify(connections));
    } catch (e) {
      console.error('Failed to sync connections to localStorage', e);
    }
  }, [connections]);

  // Authentication & Registration state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [registrationName, setRegistrationName] = useState<string>('');
  const [registrationEmail, setRegistrationEmail] = useState<string>('');
  
  // Navigation Screens state
  const [currentScreen, setCurrentScreen] = useState<
    'feed' | 'discover' | 'create_route' | 'people' | 'profile' | 'avatar_builder' | 'chat' | 'live_workout' | 'summary' | 'guide'
  >('feed');

  // Interactive flow states
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  
  const [activeSession, setActiveSession] = useState<{
    routeId: string;
    partnerId: string;
    mode: 'compete' | 'together';
  } | null>(null);

  const [activeSessionSummary, setActiveSessionSummary] = useState<{
    route: Route;
    partner: User;
    duration: number;
    distance: number;
    calories: number;
    winnerId?: string;
  } | null>(null);

  // Get active current user reference
  const currentUser = users.find(u => u.id === CURRENT_USER_ID) || INITIAL_USERS[0];

  // Sync active route ID to selected
  useEffect(() => {
    if (selectedRouteId) {
      // update user's currentRouteId
      setUsers(prev => prev.map(u => {
        if (u.id === CURRENT_USER_ID) {
          return { ...u, currentRouteId: selectedRouteId };
        }
        return u;
      }));
    }
  }, [selectedRouteId]);

  // --- ACTIONS & HANDLERS ---

  // 1. Save modified Profile & Avatar Config
  const handleSaveAvatar = (newConfig: AvatarConfig, newFitness: FitnessLevel, newActivities: ActivityType[]) => {
    setUsers(prev => prev.map(u => {
      if (u.id === CURRENT_USER_ID) {
        return {
          ...u,
          name: registrationName || u.name,
          avatarConfig: {
            ...newConfig,
            displayName: registrationName ? registrationName.replace(/\s+/g, '') : newConfig.displayName
          },
          fitnessLevel: newFitness,
          activities: newActivities
        };
      }
      return u;
    }));

    if (registrationName) {
      setRegistrationName('');
      setRegistrationEmail('');
      setIsLoggedIn(true);
      setCurrentScreen('feed');
    } else {
      setCurrentScreen('profile');
    }
  };

  // Auth action handlers
  const handleLoginSuccess = (email: string) => {
    // If they log in as 'sierra@peak.com', let's pre-load some beautiful Sierra Peak stats/avatar configurations onto our current active user
    if (email === 'sierra@peak.com') {
      setUsers(prev => prev.map(u => {
        if (u.id === CURRENT_USER_ID) {
          return {
            ...u,
            name: 'Sierra Peak',
            fitnessLevel: 'elite',
            activities: ['hiking', 'mountain_biking'],
            avatarConfig: {
              bodyType: 'athletic',
              skinTone: '#ffd1b3',
              outfitColor: '#0ea5e9',
              accessory: 'helmet',
              hairColor: '#d97706',
              hairStyle: 'long',
              displayName: 'SierraMountain',
            },
            stats: {
              totalWorkouts: 48,
              totalDistance: 312.5,
              totalDuration: 2150,
              elevationGain: 4320,
            }
          };
        }
        return u;
      }));
    } else {
      // Default / standard login reset to Tovi Lam config
      setUsers(prev => prev.map(u => {
        if (u.id === CURRENT_USER_ID) {
          return {
            ...u,
            name: 'Tovi Lam',
            fitnessLevel: 'intermediate',
            activities: ['running', 'hiking'],
            avatarConfig: {
              bodyType: 'athletic',
              skinTone: '#ffd1b3',
              outfitColor: '#10b981',
              accessory: 'headband',
              hairColor: '#4a3728',
              hairStyle: 'short',
              displayName: 'ToviRunner',
            },
            stats: {
              totalWorkouts: 24,
              totalDistance: 138.4,
              totalDuration: 940,
              elevationGain: 1250,
            }
          };
        }
        return u;
      }));
    }
    setIsLoggedIn(true);
    setCurrentScreen('feed');
  };

  const handleRegisterStart = (name: string, email: string) => {
    setRegistrationName(name);
    setRegistrationEmail(email);
    setCurrentScreen('avatar_builder');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('feed');
  };

  // 2. Add New Drawn Route
  const handlePublishRoute = (newRoute: Route, makeDiscoverable: boolean) => {
    // Add user as discoverable on route if toggled
    const updatedRoute = {
      ...newRoute,
      discoverableUsers: makeDiscoverable ? [...newRoute.discoverableUsers, CURRENT_USER_ID] : newRoute.discoverableUsers
    };

    setRoutes(prev => [updatedRoute, ...prev]);
    setSelectedRouteId(updatedRoute.id);
    
    // update current user's route
    setUsers(prev => prev.map(u => {
      if (u.id === CURRENT_USER_ID) {
        return { ...u, currentRouteId: updatedRoute.id, isDiscoverable: makeDiscoverable };
      }
      return u;
    }));

    setCurrentScreen('discover');
  };

  // 3. Connect / Request Buddy Connection
  const handleConnect = (targetUserId: string, tier: 'challenger' | 'friend' = 'friend') => {
    const existingConn = connections.find(c => 
      (c.userIds[0] === CURRENT_USER_ID && c.userIds[1] === targetUserId) ||
      (c.userIds[1] === CURRENT_USER_ID && c.userIds[0] === targetUserId)
    );

    if (existingConn) {
      if (existingConn.status === 'pending') {
        // Approve/Accept the connection
        setConnections(prev => prev.map(c => {
          if (c.id === existingConn.id) {
            return { ...c, status: 'connected', tier };
          }
          return c;
        }));
      }
    } else {
      // Create new connection request
      const newConn: Connection = {
        id: `conn-custom-${Date.now()}`,
        userIds: [CURRENT_USER_ID, targetUserId],
        status: 'pending',
        tier
      };
      setConnections(prev => [...prev, newConn]);
    }
  };

  const handleChangeConnectionTier = (targetUserId: string, tier: 'challenger' | 'friend') => {
    setConnections(prev => prev.map(c => {
      if ((c.userIds[0] === CURRENT_USER_ID && c.userIds[1] === targetUserId) ||
          (c.userIds[1] === CURRENT_USER_ID && c.userIds[0] === targetUserId)) {
        return { ...c, tier };
      }
      return c;
    }));
  };

  const handleRemoveConnection = (targetUserId: string) => {
    setConnections(prev => prev.filter(c => 
      !((c.userIds[0] === CURRENT_USER_ID && c.userIds[1] === targetUserId) ||
        (c.userIds[1] === CURRENT_USER_ID && c.userIds[0] === targetUserId))
    ));
  };

  const handleBlockUser = (targetUserId: string) => {
    setConnections(prev => {
      const existingConn = prev.find(c => 
        (c.userIds[0] === CURRENT_USER_ID && c.userIds[1] === targetUserId) ||
        (c.userIds[1] === CURRENT_USER_ID && c.userIds[0] === targetUserId)
      );

      if (existingConn) {
        return prev.map(c => {
          if (c.id === existingConn.id) {
            return { ...c, status: 'blocked', blockedBy: CURRENT_USER_ID };
          }
          return c;
        });
      } else {
        const newConn: Connection = {
          id: `conn-block-${Date.now()}`,
          userIds: [CURRENT_USER_ID, targetUserId],
          status: 'blocked',
          blockedBy: CURRENT_USER_ID
        };
        return [...prev, newConn];
      }
    });
  };

  const handleUnblockUser = (targetUserId: string) => {
    setConnections(prev => prev.filter(c => 
      !(((c.userIds[0] === CURRENT_USER_ID && c.userIds[1] === targetUserId) ||
         (c.userIds[1] === CURRENT_USER_ID && c.userIds[0] === targetUserId)) && c.status === 'blocked')
    ));
  };

  // 4. Send Message & Setup Automatic Simulated Response
  const handleSendMessage = (text: string) => {
    if (!activeChatUserId) return;

    // Find or create connection ID
    let conn = connections.find(c => 
      (c.userIds[0] === CURRENT_USER_ID && c.userIds[1] === activeChatUserId) ||
      (c.userIds[1] === CURRENT_USER_ID && c.userIds[0] === activeChatUserId)
    );

    let connId = conn?.id;
    if (!conn) {
      // Auto-connect if sending first message
      connId = `conn-custom-${Date.now()}`;
      const newConn: Connection = {
        id: connId,
        userIds: [CURRENT_USER_ID, activeChatUserId],
        status: 'connected'
      };
      setConnections(prev => [...prev, newConn]);
    } else if (conn.status !== 'connected') {
      // Auto upgrade to connected
      setConnections(prev => prev.map(c => {
        if (c.id === conn!.id) return { ...c, status: 'connected' };
        return c;
      }));
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      connectionId: connId!,
      senderId: CURRENT_USER_ID,
      text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulated Athlete Reply after 1.2s to breathe life into the prototype!
    const partner = users.find(u => u.id === activeChatUserId);
    if (!partner) return;

    setTimeout(() => {
      const buddyReplies = [
        `That sounds awesome! Let's get moving. Ready to train together?`,
        `Oh great pace! I'm at the start gateway of ${routes.find(r => r.id === partner.currentRouteId)?.name || 'the trail'} now. Hit 'Join' to sync up!`,
        `Nice equipment customizer design! I'm down for a competitive challenge race today!`,
        `Perfect! Let's sync up on the AR HUD overlay and see who can sustain the climb!`,
        `Just finished fueling up. See you on the track! ⚡`
      ];
      
      const randomReply = buddyReplies[Math.floor(Math.random() * buddyReplies.length)];
      
      const replyMessage: Message = {
        id: `reply-${Date.now()}`,
        connectionId: connId!,
        senderId: activeChatUserId,
        text: randomReply,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, replyMessage]);
    }, 1200);
  };

  // 5. Toggle Discoverability Status
  const handleToggleDiscoverable = (routeId: string, discoverable: boolean) => {
    // Toggle current user status
    setUsers(prev => prev.map(u => {
      if (u.id === CURRENT_USER_ID) {
        return { ...u, isDiscoverable: discoverable, currentRouteId: routeId };
      }
      return u;
    }));

    // Add or remove user from route list
    setRoutes(prev => prev.map(r => {
      if (r.id === routeId) {
        const list = r.discoverableUsers.includes(CURRENT_USER_ID)
          ? (discoverable ? r.discoverableUsers : r.discoverableUsers.filter(uid => uid !== CURRENT_USER_ID))
          : (discoverable ? [...r.discoverableUsers, CURRENT_USER_ID] : r.discoverableUsers);
        return { ...r, discoverableUsers: list };
      }
      return r;
    }));
  };

  // 6. Initiate Session (Together or Compete)
  const handleInitiateSession = (routeId: string, partnerId: string, mode: 'compete' | 'together') => {
    setActiveSession({
      routeId,
      partnerId,
      mode
    });
    setCurrentScreen('live_workout');
  };

  // 7. Finish Workout (Trigger Report Summary)
  const handleFinishWorkout = (stats: {
    duration: number;
    distance: number;
    calories: number;
    winnerId?: string;
  }) => {
    if (!activeSession) return;

    const routeObj = routes.find(r => r.id === activeSession.routeId) || routes[0];
    let partnerObj = users.find(u => u.id === activeSession.partnerId);

    if (activeSession.partnerId === 'virtual-pacer') {
      partnerObj = {
        id: 'virtual-pacer',
        name: 'Virtual Ghost Coach',
        fitnessLevel: currentUser.fitnessLevel || 'intermediate',
        activities: [routeObj?.activityType || 'running'],
        isDiscoverable: true,
        currentRouteId: activeSession.routeId,
        joinedAt: new Date().toISOString(),
        avatarConfig: {
          bodyType: 'athletic',
          skinTone: '#cbd5e1',
          outfitColor: '#10b981',
          accessory: 'sunglasses',
          hairColor: '#38bdf8',
          hairStyle: 'short',
          displayName: 'GhostCoach',
        },
        stats: {
          totalWorkouts: 125,
          totalDistance: 780,
          totalDuration: 4200,
          elevationGain: 6400
        }
      };
    } else if (!partnerObj) {
      partnerObj = users[1] || INITIAL_USERS[1];
    }

    setActiveSessionSummary({
      route: routeObj,
      partner: partnerObj,
      duration: stats.duration,
      distance: stats.distance,
      calories: stats.calories,
      winnerId: stats.winnerId
    });

    // Award career stats to profile dynamically!
    setUsers(prev => prev.map(u => {
      if (u.id === CURRENT_USER_ID && u.stats) {
        return {
          ...u,
          stats: {
            totalWorkouts: u.stats.totalWorkouts + 1,
            totalDistance: parseFloat((u.stats.totalDistance + stats.distance).toFixed(1)),
            totalDuration: u.stats.totalDuration + Math.round(stats.duration / 60),
            elevationGain: u.stats.elevationGain + routeObj.elevation
          }
        };
      }
      return u;
    }));

    setActiveSession(null);
    setCurrentScreen('summary');
  };

  // Switch to private chat screen
  const handleInitiateChat = (targetUserId: string) => {
    setActiveChatUserId(targetUserId);
    setCurrentScreen('chat');
  };

  // --- RENDERING ROUTER ---

  const renderActiveWorkspace = () => {
    switch (currentScreen) {
      case 'feed':
        return (
          <SocialFeed
            currentUser={currentUser}
            users={users}
            routes={routes}
            connections={connections}
            feedItems={feedItems}
            onSetFeedItems={setFeedItems}
            onConnect={handleConnect}
            onInitiateSession={handleInitiateSession}
            onSelectRoute={(routeId) => {
              setSelectedRouteId(routeId);
              setCurrentScreen('discover');
            }}
            onNavigateToScreen={(screen) => {
              setCurrentScreen(screen);
            }}
            onStartNewRecording={() => {
              setAutoStartRecording(true);
              setCurrentScreen('create_route');
            }}
          />
        );
      case 'discover':
        return (
          <MapView
            routes={routes}
            users={users}
            currentUser={currentUser}
            connections={connections}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            onToggleDiscoverable={handleToggleDiscoverable}
            onInitiateSession={handleInitiateSession}
            onInitiateChat={handleInitiateChat}
            onAddPhotoToRoute={(routeId, photo) => {
              setRoutes(prev => prev.map(r => {
                if (r.id === routeId) {
                  return {
                    ...r,
                    photos: [...(r.photos || []), photo]
                  };
                }
                return r;
              }));
            }}
          />
        );
      case 'create_route':
        return (
          <CreateRoute
            onPublishRoute={handlePublishRoute}
            autoStartRecording={autoStartRecording}
            onRecordingStarted={() => setAutoStartRecording(false)}
          />
        );
      case 'people':
        return (
          <PeopleConnections
            users={users}
            connections={connections}
            routes={routes}
            currentUser={currentUser}
            onConnect={handleConnect}
            onInitiateChat={handleInitiateChat}
            onInitiateSession={handleInitiateSession}
            onChangeConnectionTier={handleChangeConnectionTier}
            onRemoveConnection={handleRemoveConnection}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            user={currentUser}
            onRedesignAvatar={() => setCurrentScreen('avatar_builder')}
            onLogout={handleLogout}
            onUpdateProfile={(updatedUser: Partial<User>) => {
              setUsers(prev => prev.map(u => u.id === CURRENT_USER_ID ? { ...u, ...updatedUser } : u));
            }}
            onOpenGuide={() => setCurrentScreen('guide')}
            connections={connections}
            users={users}
            onUnblockUser={handleUnblockUser}
          />
        );
      case 'avatar_builder':
        return (
          <AvatarBuilder
            initialConfig={currentUser.avatarConfig}
            initialFitnessLevel={currentUser.fitnessLevel}
            initialActivities={currentUser.activities}
            onSave={handleSaveAvatar}
          />
        );
      case 'chat':
        if (!activeChatUserId) return null;
        const partner = users.find(u => u.id === activeChatUserId)!;
        const conn = connections.find(c => 
          (c.userIds[0] === CURRENT_USER_ID && c.userIds[1] === activeChatUserId) ||
          (c.userIds[1] === CURRENT_USER_ID && c.userIds[0] === activeChatUserId)
        );
        const chatMsgs = messages.filter(m => m.connectionId === conn?.id);
        
        return (
          <ChatView
            partner={partner}
            messages={chatMsgs}
            connectionId={conn?.id || ''}
            onSendMessage={handleSendMessage}
            onBack={() => setCurrentScreen('people')}
            isChallenger={conn?.tier === 'challenger'}
          />
        );
      case 'live_workout':
        if (!activeSession) return null;
        const activeRouteObj = routes.find(r => r.id === activeSession.routeId) || routes[0];
        let activePartnerObj = users.find(u => u.id === activeSession.partnerId);

        if (activeSession.partnerId === 'virtual-pacer') {
          activePartnerObj = {
            id: 'virtual-pacer',
            name: 'Virtual Ghost Coach',
            fitnessLevel: currentUser.fitnessLevel || 'intermediate',
            activities: [activeRouteObj?.activityType || 'running'],
            isDiscoverable: true,
            currentRouteId: activeSession.routeId,
            joinedAt: new Date().toISOString(),
            avatarConfig: {
              bodyType: 'athletic',
              skinTone: '#cbd5e1',
              outfitColor: '#10b981',
              accessory: 'sunglasses',
              hairColor: '#38bdf8',
              hairStyle: 'short',
              displayName: 'GhostCoach',
            },
            stats: {
              totalWorkouts: 125,
              totalDistance: 780,
              totalDuration: 4200,
              elevationGain: 6400
            }
          };
        } else if (!activePartnerObj) {
          activePartnerObj = users[1] || INITIAL_USERS[1];
        }
        
        return (
          <LiveWorkout
            route={activeRouteObj}
            partner={activePartnerObj}
            currentUser={currentUser}
            users={users}
            connections={connections}
            mode={activeSession.mode}
            onFinish={handleFinishWorkout}
          />
        );
      case 'summary':
        if (!activeSessionSummary) return null;
        return (
          <SummaryScreen
            route={activeSessionSummary.route}
            partner={activeSessionSummary.partner}
            currentUser={currentUser}
            duration={activeSessionSummary.duration}
            distance={activeSessionSummary.distance}
            calories={activeSessionSummary.calories}
            winnerId={activeSessionSummary.winnerId}
            onClose={() => {
              setActiveSessionSummary(null);
              setCurrentScreen('feed');
            }}
          />
        );
      case 'guide':
        return (
          <UserGuideScreen
            onNavigateToScreen={(screen) => setCurrentScreen(screen as any)}
            onClose={() => setCurrentScreen('profile')}
          />
        );
      default:
        return null;
    }
  };

  // Whether to show the bottom navigation tabs (only on main workspace tabs)
  const showNav = isLoggedIn && ['feed', 'discover', 'create_route', 'people', 'profile'].includes(currentScreen);

  // If not logged in and not in registration avatar builder step, show Landing
  const showLanding = !isLoggedIn && currentScreen !== 'avatar_builder';

  return (
    <div className="flex justify-center items-center min-h-screen bg-black font-sans p-0 sm:p-4">
      
      {/* Mobile Frame Container Box */}
      <div className="w-full h-screen sm:h-[820px] sm:max-w-[420px] sm:rounded-[36px] bg-base shadow-2xl border-0 sm:border-8 sm:border-zinc-800/80 overflow-hidden flex flex-col relative" id="mobile-frame-container">
        
        {/* Background Ambience Graphics */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(45,212,191,0.04)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        {/* Mock Notch / Dynamic Island Detail for mobile elegance */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-b-xl z-50 pointer-events-none hidden sm:block">
          <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-800 absolute right-4 top-1" />
        </div>

        {/* Screen Workspace content */}
        <div className="flex-1 overflow-hidden relative flex flex-col h-full">
          {showLanding ? (
            <LandingScreen
              onLoginSuccess={handleLoginSuccess}
              onRegisterStart={handleRegisterStart}
            />
          ) : (
            renderActiveWorkspace()
          )}
        </div>

        {/* BOTTOM TAB NAVIGATION BAR */}
        {showNav && (
          <div className="h-16 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800/80 flex items-center justify-around px-2 pb-0 shrink-0 z-20 shadow-lg" id="app-bottom-navbar">
            <button
              onClick={() => setCurrentScreen('feed')}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
                currentScreen === 'feed' ? 'text-brand-green font-bold bg-brand-green/10' : 'text-slate-400 hover:text-slate-200'
              }`}
              id="nav-tab-feed"
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] leading-none">Feed</span>
            </button>
 
            <button
              onClick={() => setCurrentScreen('discover')}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
                currentScreen === 'discover' ? 'text-brand-green font-bold bg-brand-green/10' : 'text-slate-400 hover:text-slate-200'
              }`}
              id="nav-tab-discover"
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] leading-none">Discover</span>
            </button>
 
            <button
              onClick={() => setCurrentScreen('create_route')}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
                currentScreen === 'create_route' ? 'text-brand-green font-bold bg-brand-green/10' : 'text-slate-400 hover:text-slate-200'
              }`}
              id="nav-tab-create"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-[10px] leading-none">Draw Route</span>
            </button>
 
            <button
              onClick={() => setCurrentScreen('people')}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
                currentScreen === 'people' ? 'text-brand-green font-bold bg-brand-green/10' : 'text-slate-400 hover:text-slate-200'
              }`}
              id="nav-tab-people"
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] leading-none">People</span>
            </button>
 
            <button
              onClick={() => setCurrentScreen('profile')}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
                currentScreen === 'profile' ? 'text-brand-green font-bold bg-brand-green/10' : 'text-slate-400 hover:text-slate-200'
              }`}
              id="nav-tab-profile"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-zinc-800 border border-zinc-700/60">
                <AvatarViewer config={currentUser.avatarConfig} className="w-7 h-7" />
              </div>
              <span className="text-[10px] leading-none">Profile</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

