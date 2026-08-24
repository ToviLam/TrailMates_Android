export type ActivityType = 'running' | 'hiking' | 'biking' | 'mountain_biking' | 'skateboard' | 'water_sports';

export interface AvatarConfig {
  bodyType: 'slim' | 'athletic' | 'muscular' | 'average';
  skinTone: string; // Hex color
  outfitColor: string; // Hex color
  accessory: 'none' | 'helmet' | 'cap' | 'sunglasses' | 'headband';
  hairColor: string; // Hex color
  hairStyle: 'short' | 'long' | 'curly' | 'none';
  displayName: string;
}

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export interface User {
  id: string;
  name: string;
  avatarConfig: AvatarConfig;
  activities: ActivityType[];
  fitnessLevel: FitnessLevel;
  currentRouteId?: string;
  isDiscoverable: boolean;
  avatarUrl?: string; // Optional if we want custom profile photos, or default to SVG
  joinedAt: string;
  stats?: {
    totalWorkouts: number;
    totalDistance: number; // in km
    totalDuration: number; // in mins
    elevationGain: number; // in meters
  };
  bio?: string;
  age?: number;
  location?: string;
  privacySettings?: {
    showStatsToChallengers: boolean;
    defaultPostAudience: 'friends' | 'public';
    bioPrivate: boolean;
    agePrivate: boolean;
    locationPrivate: boolean;
  };
}

export interface Waypoint {
  lat: number;
  lng: number;
  ele?: number; // elevation in meters
  time?: string; // timestamp (ISO string)
  label?: string; // friendly name
}

export interface RoutePhoto {
  url: string;
  waypointIndex: number;
}

export interface Route {
  id: string;
  name: string;
  activityType: ActivityType;
  distance: number; // in km
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  elevation: number; // elevation gain in meters
  waypoints: Waypoint[];
  discoverableUsers: string[]; // List of user IDs
  startPointName: string;
  endPointName: string;
  photos?: RoutePhoto[];
  region?: string;
  gpxPath?: Waypoint[];
}

export interface Connection {
  id: string;
  userIds: [string, string]; // [user1, user2]
  status: 'pending' | 'connected' | 'rejected' | 'blocked';
  tier?: 'challenger' | 'friend';
  blockedBy?: string;
}

export interface Message {
  id: string;
  connectionId: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO String
}

export interface SessionStats {
  elapsedTime: number; // in seconds
  distanceCompleted: number; // in km
  currentPace: string; // "5:12 /km"
  caloriesBurned: number;
}

export interface Session {
  id: string;
  routeId: string;
  participants: string[]; // User IDs
  mode: 'compete' | 'together';
  stats: Record<string, SessionStats>; // Map of userId -> SessionStats
  status: 'waiting' | 'active' | 'completed';
  startTime?: string;
  winnerId?: string;
}

export interface FeedComment {
  id: string;
  userId: string;
  userName: string;
  userAvatarConfig: AvatarConfig;
  text: string;
  timestamp: string;
}

export interface FeedItem {
  id: string;
  userId: string;
  type: 'workout' | 'discoverable' | 'photo_share';
  userName: string;
  userAvatarConfig: AvatarConfig;
  routeId: string;
  routeName: string;
  activityType: ActivityType;
  timestamp: string;
  likes: string[]; // List of userIds who liked it
  reactions: Record<string, string[]>; // Map of emoji -> list of userIds
  comments: FeedComment[];
  workoutStats?: {
    distance: number;
    duration: number; // in mins
    elevation: number;
  };
  photoUrl?: string;
  caption?: string;
  audience?: 'friends' | 'public';
}

