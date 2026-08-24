import { User, Route, Connection, Message, ActivityType, FeedItem, Waypoint } from './types';

// Let's define default user ID as 'user-me'
export const CURRENT_USER_ID = 'user-me';

export const ACTIVITY_DETAILS: Record<ActivityType, { label: string; icon: string; color: string; bg: string; border: string; darkColor: string }> = {
  running: {
    label: 'Running',
    icon: 'Flame',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    darkColor: '#10b981',
  },
  hiking: {
    label: 'Hiking',
    icon: 'Compass',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    darkColor: '#d97706',
  },
  biking: {
    label: 'Biking',
    icon: 'Bike',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    darkColor: '#0ea5e9',
  },
  mountain_biking: {
    label: 'Mountain Biking',
    icon: 'Trees',
    color: 'text-lime-600',
    bg: 'bg-lime-50',
    border: 'border-lime-200',
    darkColor: '#65a30d',
  },
  skateboard: {
    label: 'Skateboarding',
    icon: 'Zap',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    darkColor: '#6366f1',
  },
  water_sports: {
    label: 'Water Sports',
    icon: 'Waves',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    darkColor: '#06b6d4',
  },
};

export const INITIAL_USER_ME: User = {
  id: CURRENT_USER_ID,
  name: 'Tovi Lam',
  fitnessLevel: 'intermediate',
  activities: ['running', 'hiking'],
  isDiscoverable: true,
  currentRouteId: 'route-1',
  joinedAt: '2026-01-15T12:00:00Z',
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

export const INITIAL_USERS: User[] = [
  INITIAL_USER_ME,
  {
    id: 'user-leo',
    name: "Leo 'Apex' Rivers",
    fitnessLevel: 'elite',
    activities: ['biking', 'mountain_biking'],
    isDiscoverable: true,
    currentRouteId: 'route-3',
    joinedAt: '2025-11-20T10:30:00Z',
    avatarConfig: {
      bodyType: 'muscular',
      skinTone: '#d2a172',
      outfitColor: '#0ea5e9',
      accessory: 'helmet',
      hairColor: '#1a1a1a',
      hairStyle: 'none',
      displayName: 'LeoApex',
    },
    stats: {
      totalWorkouts: 112,
      totalDistance: 2150.5,
      totalDuration: 6480,
      elevationGain: 18400,
    }
  },
  {
    id: 'user-sierra',
    name: 'Sierra Peak',
    fitnessLevel: 'advanced',
    activities: ['hiking', 'running'],
    isDiscoverable: true,
    currentRouteId: 'route-1',
    joinedAt: '2026-02-01T08:15:00Z',
    avatarConfig: {
      bodyType: 'slim',
      skinTone: '#ffd1b3',
      outfitColor: '#f97316',
      accessory: 'cap',
      hairColor: '#d97706',
      hairStyle: 'long',
      displayName: 'SierraSummit',
    },
    stats: {
      totalWorkouts: 45,
      totalDistance: 320.8,
      totalDuration: 2100,
      elevationGain: 4850,
    }
  },
  {
    id: 'user-jax',
    name: 'Jax Rider',
    fitnessLevel: 'intermediate',
    activities: ['skateboard'],
    isDiscoverable: true,
    currentRouteId: 'route-5',
    joinedAt: '2026-03-10T14:20:00Z',
    avatarConfig: {
      bodyType: 'average',
      skinTone: '#8c5a3c',
      outfitColor: '#6366f1',
      accessory: 'sunglasses',
      hairColor: '#4b5563',
      hairStyle: 'curly',
      displayName: 'JaxGlide',
    },
    stats: {
      totalWorkouts: 19,
      totalDistance: 68.2,
      totalDuration: 410,
      elevationGain: 120,
    }
  },
  {
    id: 'user-marina',
    name: 'Marina Swift',
    fitnessLevel: 'advanced',
    activities: ['water_sports', 'running'],
    isDiscoverable: true,
    currentRouteId: 'route-6',
    joinedAt: '2026-02-28T09:40:00Z',
    avatarConfig: {
      bodyType: 'athletic',
      skinTone: '#ffd1b3',
      outfitColor: '#06b6d4',
      accessory: 'headband',
      hairColor: '#fcd34d',
      hairStyle: 'long',
      displayName: 'WaterMarina',
    },
    stats: {
      totalWorkouts: 38,
      totalDistance: 204.5,
      totalDuration: 1320,
      elevationGain: 340,
    }
  },
  {
    id: 'user-cody',
    name: 'Cody Trailblazer',
    fitnessLevel: 'intermediate',
    activities: ['hiking', 'mountain_biking'],
    isDiscoverable: true,
    currentRouteId: 'route-4',
    joinedAt: '2025-12-05T16:50:00Z',
    avatarConfig: {
      bodyType: 'average',
      skinTone: '#512a18',
      outfitColor: '#65a30d',
      accessory: 'helmet',
      hairColor: '#1a1a1a',
      hairStyle: 'short',
      displayName: 'CodyWild',
    },
    stats: {
      totalWorkouts: 58,
      totalDistance: 450.2,
      totalDuration: 3420,
      elevationGain: 6100,
    }
  },
  {
    id: 'user-zoe',
    name: 'Zoe Pace',
    fitnessLevel: 'intermediate',
    activities: ['running', 'biking'],
    isDiscoverable: true,
    currentRouteId: 'route-8',
    joinedAt: '2026-04-12T11:10:00Z',
    avatarConfig: {
      bodyType: 'slim',
      skinTone: '#ffd1b3',
      outfitColor: '#ec4899',
      accessory: 'sunglasses',
      hairColor: '#ec4899',
      hairStyle: 'curly',
      displayName: 'ZoePaceMaker',
    },
    stats: {
      totalWorkouts: 12,
      totalDistance: 48.0,
      totalDuration: 310,
      elevationGain: 280,
    }
  }
];

const RAW_ROUTES: any[] = [
  {
    id: 'route-1',
    name: 'Emerald Ridge Crest',
    activityType: 'hiking',
    distance: 8.4,
    difficulty: 'moderate',
    elevation: 420,
    waypoints: [
      { x: 15, y: 35, label: 'Trailhead Parking' },
      { x: 30, y: 25, label: 'Pine Tree Rest' },
      { x: 45, y: 15, label: 'Coyote Pass Lookout' },
      { x: 60, y: 20, label: 'Granite Ridge' },
      { x: 75, y: 40, label: 'The Emerald Summit' }
    ],
    discoverableUsers: ['user-sierra', 'user-me'],
    startPointName: 'Canyon View Gateway',
    endPointName: 'Emerald Summit Vista',
    region: 'USA'
  },
  {
    id: 'route-2',
    name: 'Downtown Riverwalk Loop',
    activityType: 'running',
    distance: 5.0,
    difficulty: 'easy',
    elevation: 15,
    waypoints: [
      { x: 20, y: 80, label: 'Bridge Plaza' },
      { x: 40, y: 75, label: 'Waterfront Amphitheater' },
      { x: 60, y: 82, label: 'Marina Café' },
      { x: 80, y: 78, label: 'Eastside Footbridge' },
      { x: 50, y: 88, label: 'South Promenade' }
    ],
    discoverableUsers: ['user-zoe'],
    startPointName: 'City Bridge North',
    endPointName: 'City Bridge South',
    region: 'USA'
  },
  {
    id: 'route-3',
    name: 'Overlook Skyline Trail',
    activityType: 'biking',
    distance: 15.2,
    difficulty: 'hard',
    elevation: 680,
    waypoints: [
      { x: 10, y: 20, label: 'Foothill Station' },
      { x: 25, y: 40, label: 'Valley Windmill' },
      { x: 50, y: 30, label: 'Eagle Nest Overlook' },
      { x: 70, y: 55, label: 'Cloud Forest Stop' },
      { x: 90, y: 45, label: 'Skyline Hub' }
    ],
    discoverableUsers: ['user-leo'],
    startPointName: 'Valley Base Depot',
    endPointName: 'Skyline Ridge Observatory',
    region: 'USA'
  },
  {
    id: 'route-4',
    name: 'Redwood Canyon Run',
    activityType: 'hiking',
    distance: 6.2,
    difficulty: 'moderate',
    elevation: 180,
    waypoints: [
      { x: 35, y: 50, label: 'Cathedral Grove' },
      { x: 45, y: 60, label: 'Fern Creek Crossing' },
      { x: 55, y: 45, label: 'Giant Sentinel' },
      { x: 68, y: 58, label: 'Whispering Canopy' }
    ],
    discoverableUsers: ['user-cody'],
    startPointName: 'Fern Valley Trailhead',
    endPointName: 'Deep Forest Grove',
    region: 'USA'
  },
  {
    id: 'route-5',
    name: 'Asphalt Waves Skatepath',
    activityType: 'skateboard',
    distance: 3.5,
    difficulty: 'easy',
    elevation: 10,
    waypoints: [
      { x: 5, y: 90, label: 'West Skate Park' },
      { x: 25, y: 88, label: 'The Curved Rail' },
      { x: 48, y: 92, label: 'Sunset Plaza' },
      { x: 72, y: 86, label: 'Ocean Promenade' },
      { x: 95, y: 90, label: 'East Bowl Vista' }
    ],
    discoverableUsers: ['user-jax'],
    startPointName: 'West Coast Skatepark',
    endPointName: 'Pier Promenade Coast',
    region: 'USA'
  },
  {
    id: 'route-6',
    name: 'Bay Breeze Kayak Crossing',
    activityType: 'water_sports',
    distance: 4.2,
    difficulty: 'moderate',
    elevation: 0,
    waypoints: [
      { x: 80, y: 60, label: 'South Shore Launch' },
      { x: 65, y: 50, label: 'Mid-Bay Buoy 4' },
      { x: 52, y: 68, label: 'Gull Island Shallows' },
      { x: 38, y: 55, label: 'North Bay Cove' }
    ],
    discoverableUsers: ['user-marina'],
    startPointName: 'South Pier Beach',
    endPointName: 'North Cove Sands',
    region: 'USA'
  },
  {
    id: 'route-7',
    name: 'Gravity Ridge DH',
    activityType: 'mountain_biking',
    distance: 5.8,
    difficulty: 'hard',
    elevation: 350,
    waypoints: [
      { x: 15, y: 15, label: 'Summit Drop In' },
      { x: 28, y: 22, label: 'Double Down Rock Garden' },
      { x: 42, y: 18, label: 'Berm Paradise' },
      { x: 58, y: 26, label: 'Launch Pad Gap' },
      { x: 70, y: 32, label: 'Scree Runout' }
    ],
    discoverableUsers: [],
    startPointName: 'Thunder Mountain Summit',
    endPointName: 'Dusty Canyon Creek',
    region: 'USA'
  },
  {
    id: 'route-8',
    name: 'Zen Garden Jog',
    activityType: 'running',
    distance: 2.5,
    difficulty: 'easy',
    elevation: 5,
    waypoints: [
      { x: 50, y: 50, label: 'Bonsai Gate' },
      { x: 60, y: 48, label: 'Koi Pond Loop' },
      { x: 55, y: 58, label: 'Stone Arch Bridge' },
      { x: 45, y: 52, label: 'Bamboo Grove Pathway' }
    ],
    discoverableUsers: [],
    startPointName: 'Eastern Tea House',
    endPointName: 'Lotus Pavilion Gate',
    region: 'USA'
  },
  // Hong Kong Trails
  {
    id: 'hk-dragons-back',
    name: "Dragon's Back Ridge Walk",
    activityType: 'hiking',
    distance: 8.5,
    difficulty: 'moderate',
    elevation: 320,
    waypoints: [
      { lat: 22.2268, lng: 114.2402, label: "Shek O Road Trailhead", ele: 80 },
      { lat: 22.2338, lng: 114.2435, label: "Shek O Peak Viewpoint", ele: 284 },
      { lat: 22.2410, lng: 114.2452, label: "Dragon's Back Ridge Peak", ele: 320 },
      { lat: 22.2495, lng: 114.2481, label: "Pottinger Peak Gap Wood", ele: 150 },
      { lat: 22.2592, lng: 114.2496, label: "Big Wave Bay Beach Finisher", ele: 5 }
    ],
    discoverableUsers: [],
    startPointName: "Shek O Road Trailhead",
    endPointName: "Big Wave Bay Sandy Beach",
    region: 'Hong Kong'
  },
  {
    id: 'hk-lantau-peak',
    name: "Lantau Peak Sunrise Climb",
    activityType: 'hiking',
    distance: 4.5,
    difficulty: 'hard',
    elevation: 650,
    waypoints: [
      { lat: 22.2494, lng: 113.9213, label: "Pak Kung Au Gate", ele: 340 },
      { lat: 22.2542, lng: 113.9268, label: "Bird Rock Slope Staircase", ele: 680 },
      { lat: 22.2571, lng: 113.9304, label: "Lantau Peak Summit (Fung Wong Shan)", ele: 934 },
      { lat: 22.2608, lng: 113.9168, label: "Wisdom Path Wood Pillars", ele: 460 },
      { lat: 22.2625, lng: 113.9125, label: "Tian Tan Buddha Entry Plaza", ele: 440 }
    ],
    discoverableUsers: [],
    startPointName: "Pak Kung Au Base",
    endPointName: "Ngong Ping Giant Buddha",
    region: 'Hong Kong'
  },
  {
    id: 'hk-harbour-run',
    name: "Victoria Harbour Promenade Run",
    activityType: 'running',
    distance: 5.6,
    difficulty: 'easy',
    elevation: 10,
    waypoints: [
      { lat: 22.2872, lng: 114.1593, label: "Central Star Ferry Pier 3", ele: 4 },
      { lat: 22.2858, lng: 114.1685, label: "Tamar Park Great Lawn", ele: 6 },
      { lat: 22.2831, lng: 114.1738, label: "Wan Chai Ferry Promenade", ele: 5 },
      { lat: 22.2842, lng: 114.1802, label: "Wan Chai Harbourfront Slide", ele: 4 },
      { lat: 22.2855, lng: 114.1865, label: "East Coast Park Precinct", ele: 5 }
    ],
    discoverableUsers: [],
    startPointName: "Central Star Ferry Pier",
    endPointName: "East Coast Park Precinct",
    region: 'Hong Kong'
  },
  {
    id: 'hk-taimoshan-cycling',
    name: "Tai Mo Shan Road Bike Ascent",
    activityType: 'biking',
    distance: 11.2,
    difficulty: 'expert',
    elevation: 910,
    waypoints: [
      { lat: 22.3831, lng: 114.1145, label: "Tsuen Kam Highway Junction", ele: 150 },
      { lat: 22.4048, lng: 114.1088, label: "Country Park Visitor Centre", ele: 490 },
      { lat: 22.4075, lng: 114.1165, label: "Tai Mo Shan Scenic Lookout", ele: 640 },
      { lat: 22.4112, lng: 114.1232, label: "Upper Gated Mountain Path", ele: 820 },
      { lat: 22.4118, lng: 114.1238, label: "Weather Radar Summit Gate", ele: 957 }
    ],
    discoverableUsers: [],
    startPointName: "Tsuen Wan Base",
    endPointName: "Tai Mo Shan Radar Summit",
    region: 'Hong Kong'
  },
  {
    id: 'hk-saikung-kayak',
    name: "Sai Kung Tombolo Sea Kayak",
    activityType: 'water_sports',
    distance: 6.8,
    difficulty: 'moderate',
    elevation: 0,
    waypoints: [
      { lat: 22.3885, lng: 114.2752, label: "Sha Ha Beach Water Launch", ele: 0 },
      { lat: 22.3785, lng: 114.2825, label: "Port Shelter Deep Channel Crossing", ele: 0 },
      { lat: 22.3675, lng: 114.2915, label: "Sharp Island Tombolo Sandbar", ele: 1 },
      { lat: 22.3598, lng: 114.2988, label: "Kiu Tsui Beach Jetty Wharf", ele: 0 },
      { lat: 22.3610, lng: 114.3015, label: "Hap Mun Bay Sandy Beach Lagoon", ele: 0 }
    ],
    discoverableUsers: [],
    startPointName: "Sha Ha Sandy Beach",
    endPointName: "Hap Mun Bay Lagoon",
    region: 'Hong Kong'
  },
  {
    id: 'hk-stanley-sup',
    name: "Stanley Bay Paddleboard Loop",
    activityType: 'water_sports',
    distance: 3.4,
    difficulty: 'easy',
    elevation: 0,
    waypoints: [
      { lat: 22.2178, lng: 114.2125, label: "Stanley Main Beach Club", ele: 0 },
      { lat: 22.2124, lng: 114.2185, label: "Stanley Headland Cliff Channel", ele: 0 },
      { lat: 22.2105, lng: 114.2115, label: "Sea Cave Bluff Turnpoint", ele: 0 },
      { lat: 22.2148, lng: 114.2052, label: "Blake Pier Waterfront", ele: 0 },
      { lat: 22.2175, lng: 114.2122, label: "Stanley Main Beach Return", ele: 0 }
    ],
    discoverableUsers: [],
    startPointName: "Stanley Main Beach",
    endPointName: "Stanley Pier Waterfront",
    region: 'Hong Kong'
  },
  {
    id: 'hk-maonshan-skate',
    name: "Ma On Shan Waterfront Skatepath",
    activityType: 'skateboard',
    distance: 4.8,
    difficulty: 'easy',
    elevation: 5,
    waypoints: [
      { lat: 22.4278, lng: 114.2295, label: "Symphony Bay Promenade", ele: 4 },
      { lat: 22.4242, lng: 114.2321, label: "Ma On Shan Promenade Plaza", ele: 5 },
      { lat: 22.4185, lng: 114.2268, label: "Villa Athena Coastline", ele: 4 },
      { lat: 22.4112, lng: 114.2215, label: "Double Cove Boardwalk", ele: 5 },
      { lat: 22.4082, lng: 114.2158, label: "Wu Kai Sha Sandy Beach Jetty", ele: 3 }
    ],
    discoverableUsers: [],
    startPointName: "Symphony Bay Promenade",
    endPointName: "Wu Kai Sha Sandy Beach",
    region: 'Hong Kong'
  },
  // Canada Trails
  {
    id: 'ca-lake-louise',
    name: "Plain of Six Glaciers Trail",
    activityType: 'hiking',
    distance: 12.0,
    difficulty: 'moderate',
    elevation: 380,
    waypoints: [
      { lat: 51.4174, lng: -116.1772, label: "Lake Louise Chateau Pier", ele: 1731 },
      { lat: 51.4115, lng: -116.1965, label: "Lake Louise Delta Flats", ele: 1735 },
      { lat: 51.4018, lng: -116.2132, label: "Plain of Six Glaciers Moraine", ele: 1980 },
      { lat: 51.3925, lng: -116.2215, label: "Plain of Six Glaciers Teahouse", ele: 2100 },
      { lat: 51.3888, lng: -116.2285, label: "Glacial Scree Lookout Finisher", ele: 2240 }
    ],
    discoverableUsers: [],
    startPointName: "Lake Louise Shoreline Pier",
    endPointName: "Plain of Six Glaciers Teahouse",
    region: 'Canada'
  },
  {
    id: 'ca-stanley-seawall',
    name: "Stanley Park Seawall Loop",
    activityType: 'running',
    distance: 9.8,
    difficulty: 'easy',
    elevation: 15,
    waypoints: [
      { lat: 49.2905, lng: -123.1325, label: "Coal Harbour Entry Arch", ele: 3 },
      { lat: 49.3015, lng: -123.1205, label: "Brockton Point Light House", ele: 5 },
      { lat: 49.3142, lng: -123.1395, label: "Siwash Rock Scenic Lookout", ele: 4 },
      { lat: 49.3075, lng: -123.1535, label: "Third Beach Bay Boardwalk", ele: 3 },
      { lat: 49.2862, lng: -123.1432, label: "English Bay Beach Cactus Club", ele: 2 }
    ],
    discoverableUsers: [],
    startPointName: "Coal Harbour Entry",
    endPointName: "English Bay Beach Sand",
    region: 'Canada'
  },
  {
    id: 'ca-whistler-aline',
    name: "Whistler Gravity Downhill: A-Line",
    activityType: 'mountain_biking',
    distance: 3.5,
    difficulty: 'hard',
    elevation: 450,
    waypoints: [
      { lat: 50.1135, lng: -122.9525, label: "Fitzsimmons Chairdrop Gate", ele: 1120 },
      { lat: 50.1158, lng: -122.9548, label: "Rollercoaster Berms Track", ele: 940 },
      { lat: 50.1185, lng: -122.9562, label: "A-Line Tombstone Great Jump", ele: 810 },
      { lat: 50.1208, lng: -122.9535, label: "GLC Drop Spectator Arena", ele: 710 },
      { lat: 50.1215, lng: -122.9495, label: "Whistler Village Plaza", ele: 670 }
    ],
    discoverableUsers: [],
    startPointName: "Fitzsimmons Chairlift Top",
    endPointName: "Whistler Village Plaza Base",
    region: 'Canada'
  },
  {
    id: 'ca-toronto-kayak',
    name: "Toronto Island Lagoon Paddle",
    activityType: 'water_sports',
    distance: 5.2,
    difficulty: 'easy',
    elevation: 0,
    waypoints: [
      { lat: 43.6212, lng: -79.3908, label: "Hanlan's Point Beach Pier", ele: 75 },
      { lat: 43.6258, lng: -79.3812, label: "Long Pond Island Channel", ele: 75 },
      { lat: 43.6215, lng: -79.3735, label: "Centre Island Bridge Crossing", ele: 75 },
      { lat: 43.6198, lng: -79.3622, label: "Algonquin Island Protected Lagoon", ele: 75 },
      { lat: 43.6292, lng: -79.3555, label: "Ward's Island Ferry Pier Marina", ele: 75 }
    ],
    discoverableUsers: [],
    startPointName: "Hanlan's Point Beach Pier",
    endPointName: "Ward's Island Ferry Wharf",
    region: 'Canada'
  },
  // USA Trails
  {
    id: 'us-yosemite-loop',
    name: "Yosemite Valley Loop Trail",
    activityType: 'hiking',
    distance: 18.5,
    difficulty: 'moderate',
    elevation: 110,
    waypoints: [
      { lat: 37.7478, lng: -119.5935, label: "Lower Yosemite Falls Plaza", ele: 1210 },
      { lat: 37.7425, lng: -119.5742, label: "Half Dome Village Pine Forest", ele: 1215 },
      { lat: 37.7328, lng: -119.5912, label: "Sentinel Bridge El Capitan View", ele: 1208 },
      { lat: 37.7285, lng: -119.6358, label: "Bridalveil Fall Vista Trailhead", ele: 1212 },
      { lat: 37.7345, lng: -119.6295, label: "El Capitan Meadow Cathedral Rock", ele: 1218 }
    ],
    discoverableUsers: [],
    startPointName: "Lower Yosemite Falls",
    endPointName: "El Capitan Meadow Trailhead",
    region: 'USA'
  },
  {
    id: 'us-central-park',
    name: "Central Park Reservoir & Ramble Run",
    activityType: 'running',
    distance: 4.8,
    difficulty: 'easy',
    elevation: 15,
    waypoints: [
      { lat: 40.7794, lng: -73.9632, label: "East 79th Street Arch Gates", ele: 24 },
      { lat: 40.7871, lng: -73.9658, label: "Jacqueline Kennedy Onassis Track", ele: 27 },
      { lat: 40.7825, lng: -73.9715, label: "The Great Lawn Playing Fields", ele: 25 },
      { lat: 40.7765, lng: -73.9702, label: "The Ramble Wilderness Forest", ele: 23 },
      { lat: 40.7738, lng: -73.9711, label: "Bethesda Fountain Terrace", ele: 20 }
    ],
    discoverableUsers: [],
    startPointName: "East 79th Street Gates",
    endPointName: "Bethesda Fountain Terrace",
    region: 'USA'
  },
  {
    id: 'us-tahoe-kayak',
    name: "Lake Tahoe Emerald Bay Kayak",
    activityType: 'water_sports',
    distance: 7.2,
    difficulty: 'moderate',
    elevation: 0,
    waypoints: [
      { lat: 38.9392, lng: -120.0825, label: "Baldwin Beach Marina Wharf", ele: 1897 },
      { lat: 38.9482, lng: -120.0988, label: "Emerald Bay Mouth Buoy Tag", ele: 1897 },
      { lat: 38.9515, lng: -120.1042, label: "Vikingsholm Stone Castle Pier", ele: 1897 },
      { lat: 38.9528, lng: -120.1102, label: "Fannette Island Stone Teahouse", ele: 1910 },
      { lat: 38.9505, lng: -120.1145, label: "Eagle Point Scenic Camping Dock", ele: 1897 }
    ],
    discoverableUsers: [],
    startPointName: "Baldwin Beach Wharf",
    endPointName: "Eagle Point Dock",
    region: 'USA'
  }
];

// Helper to generate smooth, high-density, realistic curving trails to simulate high-precision GPX tracks
export const generateHighFidelityGpxPath = (waypoints: Waypoint[]): Waypoint[] => {
  if (!waypoints || waypoints.length < 2) return waypoints;

  const highFidelityPath: Waypoint[] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];

    // Generate 25 high-density intermediate points per segment for incredible precision
    const segmentPointsCount = 25;

    for (let j = 0; j < segmentPointsCount; j++) {
      const t = j / segmentPointsCount;

      // Cosine interpolation for organic speed transitions
      const cosT = (1 - Math.cos(t * Math.PI)) / 2;

      // Linear core
      let lat = start.lat + (end.lat - start.lat) * cosT;
      let lng = start.lng + (end.lng - start.lng) * cosT;
      let ele = (start.ele || 100) + ((end.ele || 100) - (start.ele || 100)) * cosT;

      // Add trail serpentine bends (curving paths) to make it look like a real winding mountain trail
      // rather than straight polygon segments
      const windingOffsetScale = 0.0016; // approx 150m side bends
      const windingFreq = 2.0; // wave frequency

      const angle = Math.atan2(end.lat - start.lat, end.lng - start.lng);
      const perpAngle = angle + Math.PI / 2;

      const bend = Math.sin(t * windingFreq * Math.PI) * windingOffsetScale;
      lat += Math.sin(perpAngle) * bend;
      lng += Math.cos(perpAngle) * bend;

      // Deterministic high-frequency pseudo-random GPS jitter/drift
      const seed = (i * 1000 + j) * 7.89231;
      const noiseLat = Math.sin(seed * 43.19421) * 0.00012;
      const noiseLng = Math.cos(seed * 37.19482) * 0.00012;
      lat += noiseLat;
      lng += noiseLng;

      // Add organic elevation changes
      ele += Math.sin(seed * 11.2) * 3.5;

      // Calculate time records
      const startTime = new Date(start.time || '2026-06-25T08:00:00Z');
      const endTime = new Date(end.time || '2026-06-25T08:30:00Z');
      const timeDiff = endTime.getTime() - startTime.getTime();
      const pointTime = new Date(startTime.getTime() + timeDiff * t);

      highFidelityPath.push({
        lat,
        lng,
        ele: Math.max(0, Math.round(ele)),
        time: pointTime.toISOString(),
        label: j === 0 ? start.label : undefined
      });
    }
  }

  // Final point
  const finalWp = waypoints[waypoints.length - 1];
  highFidelityPath.push({
    lat: finalWp.lat,
    lng: finalWp.lng,
    ele: finalWp.ele,
    time: finalWp.time,
    label: finalWp.label
  });

  return highFidelityPath;
};

// Map grid coordinates to realistic lat/lng near Golden Gate & Marin Headlands
export const INITIAL_ROUTES: Route[] = RAW_ROUTES.map((route, rIndex) => {
  const photos = rIndex === 0 ? [
    { url: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=400&q=80', waypointIndex: 1 },
    { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80', waypointIndex: 3 }
  ] : rIndex === 1 ? [
    { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80', waypointIndex: 2 }
  ] : [];

  const processedWaypoints = route.waypoints.map((wp: any, index: number) => {
    // If the waypoint already specifies real lat/lng, preserve them!
    if (wp.lat !== undefined && wp.lng !== undefined) {
      const time = new Date('2026-06-25T08:00:00Z');
      time.setMinutes(time.getMinutes() + index * 10);
      return {
        lat: wp.lat,
        lng: wp.lng,
        ele: wp.ele || 100,
        time: time.toISOString(),
        label: wp.label
      };
    }

    // Map x [0, 100] -> lng [-122.51, -122.44]
    // Map y [0, 100] -> lat [37.84, 37.75]
    const lat = 37.84 - (wp.y / 100) * 0.09;
    const lng = -122.51 + (wp.x / 100) * 0.07;
    const ele = 100 + Math.sin(wp.x / 10) * 50 + Math.cos(wp.y / 10) * 50;
    const time = new Date('2026-06-25T08:00:00Z');
    time.setMinutes(time.getMinutes() + index * 10);
    return {
      lat,
      lng,
      ele: Math.round(ele),
      time: time.toISOString(),
      label: wp.label
    };
  });

  return {
    ...route,
    waypoints: processedWaypoints,
    gpxPath: generateHighFidelityGpxPath(processedWaypoints),
    photos
  };
});

export const INITIAL_CONNECTIONS: Connection[] = [
  {
    id: 'conn-sierra',
    userIds: [CURRENT_USER_ID, 'user-sierra'],
    status: 'connected',
  },
  {
    id: 'conn-leo',
    userIds: [CURRENT_USER_ID, 'user-leo'],
    status: 'connected',
  },
  {
    id: 'conn-marina',
    userIds: [CURRENT_USER_ID, 'user-marina'],
    status: 'pending',
  },
  {
    id: 'conn-cody',
    userIds: [CURRENT_USER_ID, 'user-cody'],
    status: 'pending',
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    connectionId: 'conn-sierra',
    senderId: 'user-sierra',
    text: "Hey! I see you're discoverable on Emerald Ridge Crest today. Going hiking?",
    timestamp: '2026-06-25T08:00:00Z',
  },
  {
    id: 'm2',
    connectionId: 'conn-sierra',
    senderId: CURRENT_USER_ID,
    text: "Yes! Hoping to catch the summit view. What's your pace looking like?",
    timestamp: '2026-06-25T08:02:00Z',
  },
  {
    id: 'm3',
    connectionId: 'conn-sierra',
    senderId: 'user-sierra',
    text: "Moderate pace! Happy to do a joint AR workout. Let's do a challenge or a friendly run!",
    timestamp: '2026-06-25T08:04:00Z',
  },
  {
    id: 'm4',
    connectionId: 'conn-leo',
    senderId: 'user-leo',
    text: "Hey man, doing Skyline Ridge later, you down for a speed run?",
    timestamp: '2026-06-24T18:12:00Z',
  }
];

export const INITIAL_FEED_ITEMS: FeedItem[] = [
  {
    id: 'feed-1',
    userId: 'user-leo',
    type: 'workout',
    userName: "Leo 'Apex' Rivers",
    userAvatarConfig: {
      bodyType: 'muscular',
      skinTone: '#d2a172',
      outfitColor: '#0ea5e9',
      accessory: 'helmet',
      hairColor: '#1a1a1a',
      hairStyle: 'none',
      displayName: 'LeoApex'
    },
    routeId: 'hk-taimoshan-cycling',
    routeName: "Tai Mo Shan Road Bike Ascent",
    activityType: 'biking',
    timestamp: '2026-06-25T16:20:00Z',
    likes: ['user-sierra', 'user-jax'],
    reactions: {
      '🔥': ['user-sierra', 'user-jax'],
      '🙌': ['user-marina']
    },
    workoutStats: {
      distance: 11.2,
      duration: 48,
      elevation: 910
    },
    caption: "Smashed the climb today! The legs were screaming on the final segment past the radar gate but managed a new PR. Who's challenging this time next week? 🚴‍♂️⛰️🔋",
    comments: [
      {
        id: 'c-1',
        userId: 'user-sierra',
        userName: "Sierra Peak",
        userAvatarConfig: {
          bodyType: 'slim',
          skinTone: '#ffd1b3',
          outfitColor: '#f97316',
          accessory: 'cap',
          hairColor: '#d97706',
          hairStyle: 'long',
          displayName: 'SierraSummit'
        },
        text: "Incredible climb rate, Leo! That elevation change is no joke.",
        timestamp: '2026-06-25T16:35:00Z'
      },
      {
        id: 'c-2',
        userId: 'user-jax',
        userName: "Jax Rider",
        userAvatarConfig: {
          bodyType: 'average',
          skinTone: '#8c5a3c',
          outfitColor: '#6366f1',
          accessory: 'sunglasses',
          hairColor: '#4b5563',
          hairStyle: 'curly',
          displayName: 'JaxGlide'
        },
        text: "Pure power! ⚡",
        timestamp: '2026-06-25T16:40:00Z'
      }
    ]
  },
  {
    id: 'feed-2',
    userId: 'user-sierra',
    type: 'discoverable',
    userName: "Sierra Peak",
    userAvatarConfig: {
      bodyType: 'slim',
      skinTone: '#ffd1b3',
      outfitColor: '#f97316',
      accessory: 'cap',
      hairColor: '#d97706',
      hairStyle: 'long',
      displayName: 'SierraSummit'
    },
    routeId: 'ca-lake-louise',
    routeName: "Plain of Six Glaciers Trail",
    activityType: 'hiking',
    timestamp: '2026-06-25T15:00:00Z',
    likes: ['user-me'],
    reactions: {
      '❤️': ['user-me', 'user-marina'],
      '✨': ['user-cody']
    },
    caption: "Sierra Peak is hitting Plain of Six Glaciers Trail now! Beautiful morning for a mountain trek. Anyone down for a dual session or friendly challenge? 🏔️🚶‍♀️",
    comments: [
      {
        id: 'c-3',
        userId: 'user-me',
        userName: "Tovi Lam",
        userAvatarConfig: {
          bodyType: 'athletic',
          skinTone: '#ffd1b3',
          outfitColor: '#10b981',
          accessory: 'headband',
          hairColor: '#4a3728',
          hairStyle: 'short',
          displayName: 'ToviRunner'
        },
        text: "Stunning spot, wish I could join live! Go get it!",
        timestamp: '2026-06-25T15:15:00Z'
      }
    ]
  },
  {
    id: 'feed-3',
    userId: 'user-marina',
    type: 'photo_share',
    userName: "Marina Swift",
    userAvatarConfig: {
      bodyType: 'athletic',
      skinTone: '#ffd1b3',
      outfitColor: '#06b6d4',
      accessory: 'headband',
      hairColor: '#fcd34d',
      hairStyle: 'long',
      displayName: 'WaterMarina'
    },
    routeId: 'hk-stanley-sup',
    routeName: "Stanley Bay Paddleboard Loop",
    activityType: 'water_sports',
    timestamp: '2026-06-25T07:10:00Z',
    likes: ['user-me', 'user-leo', 'user-jax'],
    reactions: {
      '❤️': ['user-me', 'user-leo', 'user-jax'],
      '🙌': ['user-sierra']
    },
    photoUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
    caption: "Stunning glass water at Stanley Main Beach before my paddleboard session! Zero wind and absolute peace. 🌅🏄‍♀️",
    comments: []
  },
  {
    id: 'feed-4',
    userId: 'user-jax',
    type: 'workout',
    userName: "Jax Rider",
    userAvatarConfig: {
      bodyType: 'average',
      skinTone: '#8c5a3c',
      outfitColor: '#6366f1',
      accessory: 'sunglasses',
      hairColor: '#4b5563',
      hairStyle: 'curly',
      displayName: 'JaxGlide'
    },
    routeId: 'hk-maonshan-skate',
    routeName: "Ma On Shan Waterfront Skatepath",
    activityType: 'skateboard',
    timestamp: '2026-06-24T18:45:00Z',
    likes: ['user-marina'],
    reactions: {
      '🤙': ['user-marina'],
      '⚡': ['user-leo']
    },
    workoutStats: {
      distance: 4.8,
      duration: 25,
      elevation: 5
    },
    caption: "Waterfront cruise. Perfect cool breeze for skating tonight. 🛹🌊🌉",
    comments: [
      {
        id: 'c-4',
        userId: 'user-marina',
        userName: "Marina Swift",
        userAvatarConfig: {
          bodyType: 'athletic',
          skinTone: '#ffd1b3',
          outfitColor: '#06b6d4',
          accessory: 'headband',
          hairColor: '#fcd34d',
          hairStyle: 'long',
          displayName: 'WaterMarina'
        },
        text: "That path looks so smooth! Let's cross paths next time.",
        timestamp: '2026-06-24T19:00:00Z'
      }
    ]
  }
];

