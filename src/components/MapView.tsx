import React, { useState, useEffect, useRef } from 'react';
import { Route, User, ActivityType, Waypoint, Connection } from '../types';
import { ACTIVITY_DETAILS } from '../mockData';
import { AvatarViewer } from './AvatarViewer';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Compass, Eye, Filter, ArrowRight, Zap, Check, Flame, Users, Download, Camera, Image as ImageIcon, Plus, Info, Layers, Search, Locate, Play } from 'lucide-react';

// Read Google Maps API key from secrets or env
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  '';

// Check if key is structurally valid (Google keys start with AIza and are 30+ chars)
const isProbablyValidKey = (key: string) => {
  const cleaned = key ? key.trim() : '';
  return cleaned.startsWith('AIza') && cleaned.length >= 30;
};

interface MapViewProps {
  routes: Route[];
  users: User[];
  currentUser: User;
  connections: Connection[];
  onSelectRoute: (routeId: string) => void;
  onToggleDiscoverable: (routeId: string, discoverable: boolean) => void;
  onInitiateSession: (routeId: string, opponentId: string, mode: 'compete' | 'together') => void;
  onInitiateChat: (userId: string) => void;
  onAddPhotoToRoute: (routeId: string, photo: { url: string; waypointIndex: number }) => void;
}

// Custom Polyline Component to draw the Google Maps track
const RoutePolyline: React.FC<{
  path: google.maps.LatLngLiteral[];
  strokeColor: string;
  strokeWeight?: number;
  strokeOpacity?: number;
}> = ({ path, strokeColor, strokeWeight = 5, strokeOpacity = 0.95 }) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || path.length === 0) return;

    // Clear previous polyline if any
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor,
      strokeOpacity,
      strokeWeight,
    });

    polyline.setMap(map);
    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, [map, path, strokeColor, strokeWeight, strokeOpacity]);

  return null;
};

// Component to handle automatic map panning/bounds adjustment
const MapAutoFitter: React.FC<{ waypoints: { lat: number; lng: number }[] }> = ({ waypoints }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || waypoints.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    waypoints.forEach(wp => bounds.extend(wp));
    map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
  }, [map, waypoints.map(w => `${w.lat},${w.lng}`).join('|')]);

  return null;
};

// Component to handle auto-panning bounds when no specific route is active (fitting all matching routes)
const AllRoutesAutoFitter: React.FC<{ routes: Route[] }> = ({ routes }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || routes.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;
    routes.forEach(r => {
      r.waypoints.forEach(wp => {
        bounds.extend({ lat: wp.lat, lng: wp.lng });
        hasPoints = true;
      });
    });
    if (hasPoints) {
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
    }
  }, [map, routes.map(r => r.id).sort().join(',')]);

  return null;
};

// Custom button component rendered inside Google Maps APIProvider to locate and pan to user's real-time GPS position
const LocateMeButton: React.FC<{
  userLocation: { lat: number; lng: number };
  setUserLocation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>;
  onLocate: () => void;
}> = ({ userLocation, setUserLocation, onLocate }) => {
  const map = useMap();

  const handleLocate = () => {
    onLocate();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          if (map) {
            map.panTo(loc);
            map.setZoom(16); // High-fidelity zoom-in just like real Google Maps
          }
        },
        (error) => {
          console.warn("Locate me failed, centering on last known user location", error);
          if (map) {
            map.panTo(userLocation);
            map.setZoom(16);
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      if (map) {
        map.panTo(userLocation);
        map.setZoom(16);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleLocate}
      className="absolute top-4 right-4 z-30 bg-zinc-950/90 hover:bg-zinc-800 text-brand-green p-3 rounded-full shadow-lg border border-zinc-800/80 transition-all flex items-center justify-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-green hover:scale-105 active:scale-95 border-0"
      title="Locate My Current Location"
      id="btn-locate-me-google"
    >
      <Locate className="w-5 h-5 text-brand-green animate-pulse" />
    </button>
  );
};

export const MapView: React.FC<MapViewProps> = ({
  routes,
  users,
  currentUser,
  connections,
  onSelectRoute,
  onToggleDiscoverable,
  onInitiateSession,
  onInitiateChat,
  onAddPhotoToRoute
}) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | 'all'>('all');
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number>(0);
  const [googleMapsAuthFailed, setGoogleMapsAuthFailed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [hasManuallyCentered, setHasManuallyCentered] = useState(false);

  // GPS and Proximity State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(() => {
    if (routes && routes.length > 0 && routes[0].waypoints && routes[0].waypoints.length > 0) {
      return { lat: routes[0].waypoints[0].lat, lng: routes[0].waypoints[0].lng };
    }
    return { lat: 37.8267, lng: -122.4828 }; // Fallback to SF Golden Gate
  });
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  const [filterByViewport, setFilterByViewport] = useState<boolean>(true);

  // Auto Geolocation Detector
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation failed or denied, using trailhead default location.", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  // Distance helper (Haversine formula in km)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getRouteDistance = (route: Route) => {
    if (!route.waypoints || route.waypoints.length === 0) return 999999;
    const startWp = route.waypoints[0];
    return getDistance(userLocation.lat, userLocation.lng, startWp.lat, startWp.lng);
  };

  // Dynamic check for runtime auth failure
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps Auth Failure detected. Degrading to high-tech Simulated Vector Map fallback.");
      setGoogleMapsAuthFailed(true);
    };
  }, []);

  // Reset active route if it doesn't match the selected activity
  useEffect(() => {
    if (activeRouteId) {
      const currentActive = routes.find(r => r.id === activeRouteId);
      if (currentActive) {
        const matchesActivity = selectedActivity === 'all' || currentActive.activityType === selectedActivity;
        if (!matchesActivity) {
          setActiveRouteId(null);
          onSelectRoute('');
        }
      }
    }
  }, [selectedActivity, activeRouteId, routes, onSelectRoute]);

  // Viewport filtering logic
  const viewportRoutesRaw = routes.filter(r => {
    const matchesActivity = selectedActivity === 'all' || r.activityType === selectedActivity;
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.startPointName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.endPointName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesViewport = true;
    if (filterByViewport && mapBounds && r.waypoints && r.waypoints.length > 0) {
      const startWp = r.waypoints[0];
      const { north, south, east, west } = mapBounds;
      const latOk = startWp.lat >= south && startWp.lat <= north;
      const lngOk = west <= east
        ? startWp.lng >= west && startWp.lng <= east
        : startWp.lng >= west || startWp.lng <= east;
      matchesViewport = latOk && lngOk;
    }
    return matchesActivity && matchesSearch && matchesViewport;
  });

  const isShowingBackupNearest = filterByViewport && mapBounds && viewportRoutesRaw.length === 0;

  // Base filtered routes (viewport-independent) to fit bounds without feedback loops on panning/zooming
  const baseFilteredRoutes = routes.filter(r => {
    const matchesActivity = selectedActivity === 'all' || r.activityType === selectedActivity;
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.startPointName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.endPointName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesActivity && matchesSearch;
  });

  // Filter, search and sort routes (nearest first!)
  const searchedRoutes = (isShowingBackupNearest 
    ? baseFilteredRoutes
    : viewportRoutesRaw
  ).sort((a, b) => getRouteDistance(a) - getRouteDistance(b));

  const handleSelectSearchedRoute = (routeId: string) => {
    setActiveRouteId(routeId);
    onSelectRoute(routeId);
    setShowSearchResults(false);
    setMobileViewMode('split');
    setHasManuallyCentered(false);
  };

  // Get current active route detail
  const activeRoute = routes.find(r => r.id === activeRouteId);

  // Find discoverable users on the currently selected route (exclude blocked ones)
  const discoverableUsersOnRoute = users.filter(u => 
    u.id !== currentUser.id && 
    (activeRoute?.discoverableUsers.includes(u.id) || u.currentRouteId === activeRoute?.id) &&
    !connections.some(c => 
      c.status === 'blocked' && 
      ((c.userIds[0] === currentUser.id && c.userIds[1] === u.id) ||
       (c.userIds[1] === currentUser.id && c.userIds[0] === u.id))
    )
  );

  const isUserDiscoverableOnActiveRoute = activeRoute?.discoverableUsers.includes(currentUser.id) || currentUser.currentRouteId === activeRoute?.id;

  const handleRoutePinClick = (id: string) => {
    setActiveRouteId(id);
    onSelectRoute(id);
    setHasManuallyCentered(false);
  };

  // Download Route waypoints as standard GPX file
  const handleDownloadGPX = () => {
    if (!activeRoute) return;

    const waypointsXml = activeRoute.waypoints.map((wp, index) => {
      const eleXml = wp.ele !== undefined ? `<ele>${wp.ele}</ele>` : '';
      const timeXml = wp.time ? `<time>${wp.time}</time>` : '';
      const nameXml = wp.label ? `<name>${wp.label}</name>` : `<name>Waypoint ${index + 1}</name>`;
      return `      <trkpt lat="${wp.lat}" lon="${wp.lng}">
${eleXml ? `        ${eleXml}\n` : ''}${timeXml ? `        ${timeXml}\n` : ''}${nameXml ? `        ${nameXml}\n` : ''}      </trkpt>`;
    }).join('\n');

    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TrailMates" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${activeRoute.name}</name>
    <desc>Exported trail route map for outdoor navigation</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${activeRoute.name}</name>
    <type>${activeRoute.activityType}</type>
    <trkseg>
${waypointsXml}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeRoute.name.toLowerCase().replace(/\s+/g, '_')}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle adding local route photos via FileReader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeRoute || !e.target.files?.[0]) return;
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onAddPhotoToRoute(activeRoute.id, {
          url: reader.result,
          waypointIndex: selectedWaypointIndex
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Map route's lat/lng to [10, 90] box for SVG viewBox="0 0 100 100" fallback representation
  const getSvgPoints = (waypoints: Waypoint[]) => {
    if (!waypoints || waypoints.length === 0) return [];
    const lats = waypoints.map(w => w.lat);
    const lngs = waypoints.map(w => w.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;

    return waypoints.map((wp, index) => {
      const x = 15 + ((wp.lng - minLng) / lngRange) * 70;
      const y = 85 - ((wp.lat - minLat) / latRange) * 70; // Invert Y
      return { x, y, wp, index };
    });
  };

  // Map any route's waypoints to the global bounding box of all routes combined so they align geographically
  const getGlobalSvgPoints = (waypoints: Waypoint[]) => {
    if (!waypoints || waypoints.length === 0) return [];
    let allWaypoints = searchedRoutes.flatMap(r => (r.gpxPath && r.gpxPath.length > 0) ? r.gpxPath : r.waypoints);
    if (allWaypoints.length === 0) {
      allWaypoints = routes.flatMap(r => (r.gpxPath && r.gpxPath.length > 0) ? r.gpxPath : r.waypoints);
    }
    if (allWaypoints.length === 0) return [];

    const lats = allWaypoints.map(w => w.lat);
    const lngs = allWaypoints.map(w => w.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;

    return waypoints.map((wp, index) => {
      // Map x to [12, 88] range to keep safe inset from SVG boundaries
      const x = 12 + ((wp.lng - minLng) / lngRange) * 76;
      const y = 88 - ((wp.lat - minLat) / latRange) * 76; // Invert Y
      return { x, y, wp, index };
    });
  };

  const getGlobalUserSvgPoint = () => {
    let allWaypoints = searchedRoutes.flatMap(r => (r.gpxPath && r.gpxPath.length > 0) ? r.gpxPath : r.waypoints);
    if (allWaypoints.length === 0) {
      allWaypoints = routes.flatMap(r => (r.gpxPath && r.gpxPath.length > 0) ? r.gpxPath : r.waypoints);
    }
    if (allWaypoints.length === 0) return { x: 50, y: 50 };

    const lats = allWaypoints.map(w => w.lat);
    const lngs = allWaypoints.map(w => w.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;

    const x = 12 + ((userLocation.lng - minLng) / lngRange) * 76;
    const y = 88 - ((userLocation.lat - minLat) / latRange) * 76;
    return { x, y };
  };

  const handleSvgMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    let allWaypoints = searchedRoutes.flatMap(r => (r.gpxPath && r.gpxPath.length > 0) ? r.gpxPath : r.waypoints);
    if (allWaypoints.length === 0) {
      allWaypoints = routes.flatMap(r => (r.gpxPath && r.gpxPath.length > 0) ? r.gpxPath : r.waypoints);
    }
    if (allWaypoints.length > 0) {
      const lats = allWaypoints.map(w => w.lat);
      const lngs = allWaypoints.map(w => w.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const latRange = maxLat - minLat || 0.001;
      const lngRange = maxLng - minLng || 0.001;

      const pctX = (clickX - 12) / 76;
      const pctY = (88 - clickY) / 76;

      const clickLng = minLng + pctX * lngRange;
      const clickLat = minLat + pctY * latRange;

      setUserLocation({ lat: clickLat, lng: clickLng });
    }
  };

  const convertLatLngToSvg = (lat: number, lng: number, waypoints: Waypoint[]) => {
    if (!waypoints || waypoints.length === 0) return { x: 50, y: 50 };
    const lats = waypoints.map(w => w.lat);
    const lngs = waypoints.map(w => w.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;

    const x = 15 + ((lng - minLng) / lngRange) * 70;
    const y = 85 - ((lat - minLat) / latRange) * 70;
    return { x, y };
  };

  // Determine if Google Maps should be loaded
  const shouldRenderGoogleMaps = isProbablyValidKey(API_KEY) && !googleMapsAuthFailed;

  const activeRoutePath = ((activeRoute?.gpxPath && activeRoute.gpxPath.length > 0) ? activeRoute.gpxPath : (activeRoute?.waypoints || [])).map(wp => ({ lat: wp.lat, lng: wp.lng }));
  const fallbackPoints = activeRoute ? getSvgPoints((activeRoute.gpxPath && activeRoute.gpxPath.length > 0) ? activeRoute.gpxPath : activeRoute.waypoints) : [];

  return (
    <div className="flex flex-col h-full bg-base text-zinc-50 overflow-hidden" id="map-view-container">
      {/* Header with Activity Filters */}
      <div className="p-4 bg-zinc-950 border-b border-zinc-850 shadow-md shrink-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-display font-black text-white text-base leading-none flex items-center gap-2">
              <Compass className="w-5 h-5 text-brand-green" /> Discover Routes
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono mt-1.5 uppercase tracking-wider">Outdoor trails tracked on interactive map layouts</p>
          </div>
          <span className="bg-brand-green/10 text-brand-green text-[10px] font-bold px-2 py-1 rounded-full border border-brand-green/20 flex items-center gap-1 font-mono uppercase tracking-wider">
            <Users className="w-3 h-3" /> {users.filter(u => u.isDiscoverable).length} Active Now
          </span>
        </div>

        {/* Search & Find route on map option */}
        <div className="relative mb-3.5">
          <Search className="w-4 h-4 text-zinc-550 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Type name, trailhead, or location to find route on map..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-9 pr-9 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs font-semibold text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-md"
            id="input-find-route-on-map"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              className="absolute right-3.5 top-3 p-0.5 hover:bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-colors cursor-pointer text-[10px] font-bold border-0 bg-transparent"
            >
              ✕
            </button>
          )}

          {/* Quick autocomplete dropdown overlay */}
          {showSearchResults && searchQuery && (
            <div className="absolute left-0 right-0 mt-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-zinc-900">
              {searchedRoutes.length > 0 ? (
                searchedRoutes.map(route => (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => handleSelectSearchedRoute(route.id)}
                    className="w-full px-4 py-3 hover:bg-zinc-900 bg-transparent flex items-center justify-between text-left transition-colors cursor-pointer border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">
                        {route.activityType === 'running' && '🏃'}
                        {route.activityType === 'hiking' && '🥾'}
                        {route.activityType === 'biking' && '🚴'}
                        {route.activityType === 'mountain_biking' && '🚵'}
                        {route.activityType === 'skateboard' && '🛹'}
                        {route.activityType === 'water_sports' && '🛶'}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none">{route.name}</h4>
                        <p className="text-[10px] text-zinc-500 mt-1.5 leading-none">
                          📍 {route.startPointName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded font-bold">
                        {route.distance} km
                      </span>
                      <span className="text-[10px] text-brand-green font-extrabold flex items-center gap-0.5">
                        Locate <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-zinc-500">
                  No matching trails found. Try other terms!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Proximity-Based GPS Controls (No Region Picking) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 mb-3.5 space-y-2 text-[11px] font-medium text-zinc-300" id="proximity-gps-controls">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <MapPin className="w-4 h-4 text-brand-pop fill-brand-pop/10" />
              GPS: Near ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
            </span>
            <button
              type="button"
              onClick={() => {
                if (routes.length > 0 && routes[0].waypoints.length > 0) {
                  setUserLocation({
                    lat: routes[0].waypoints[0].lat,
                    lng: routes[0].waypoints[0].lng
                  });
                }
              }}
              className="text-[10px] font-extrabold text-brand-pop hover:opacity-85 cursor-pointer bg-transparent border-0"
              title="Reset simulated position to nearest trailhead"
            >
              Reset to Trailhead
            </button>
          </div>
          
          <div className="flex items-center justify-between gap-4 border-t border-zinc-800 pt-2 shrink-0">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterByViewport}
                onChange={(e) => setFilterByViewport(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-brand-pop focus:ring-brand-pop border-zinc-800 bg-zinc-900"
              />
              <span className="font-bold text-zinc-400">Limit to map area</span>
            </label>
            
            {mapBounds && (
              <span className="bg-brand-pop/10 text-brand-pop font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider animate-pulse">
                {isShowingBackupNearest ? "No matches in view • Showing closest" : "Sensing camera area"}
              </span>
            )}
          </div>
        </div>

        {/* Filter Badges Carousel */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin" id="activity-filters-carousel">
          <button
            onClick={() => {
              setSelectedActivity('all');
              setActiveRouteId(null);
              onSelectRoute('');
              setMobileViewMode('split');
              setHasManuallyCentered(false);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1 cursor-pointer ${
              selectedActivity === 'all'
                ? 'bg-brand-green border-brand-green text-zinc-950 font-black shadow-lg'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
            }`}
            id="filter-all-routes"
          >
            <Filter className="w-3.5 h-3.5" /> All Trails
          </button>
          
          {(Object.keys(ACTIVITY_DETAILS) as ActivityType[]).map((type) => {
            const act = ACTIVITY_DETAILS[type];
            const isSelected = selectedActivity === type;
            return (
              <button
                key={type}
                onClick={() => {
                  setSelectedActivity(type);
                  setActiveRouteId(null);
                  onSelectRoute('');
                  setMobileViewMode('split');
                  setHasManuallyCentered(false);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-green border-brand-green text-zinc-950 font-black shadow-lg'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                }`}
                id={`filter-${type}-routes`}
              >
                <span>
                  {type === 'running' && '🏃'}
                  {type === 'hiking' && '🥾'}
                  {type === 'biking' && '🚴'}
                  {type === 'mountain_biking' && '🚵'}
                  {type === 'skateboard' && '🛹'}
                  {type === 'water_sports' && '🛶'}
                </span>
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Segmented View Toggle Switcher */}
        <div className="flex mt-3 p-1 bg-zinc-950 rounded-xl border border-zinc-800" id="mobile-view-switcher">
          <button
            type="button"
            onClick={() => setMobileViewMode('map')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 border-0 ${
              mobileViewMode === 'map'
                ? 'bg-zinc-900 text-white shadow border border-zinc-800'
                : 'text-zinc-400 hover:text-white bg-transparent'
            }`}
            id="btn-view-map-only"
          >
            🗺️ Map Only
          </button>
          <button
            type="button"
            onClick={() => setMobileViewMode('split')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 border-0 ${
              mobileViewMode === 'split'
                ? 'bg-zinc-900 text-white shadow border border-zinc-800'
                : 'text-zinc-400 hover:text-white bg-transparent'
            }`}
            id="btn-view-split"
          >
            🔲 Split View
          </button>
          <button
            type="button"
            onClick={() => setMobileViewMode('list')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 border-0 ${
              mobileViewMode === 'list'
                ? 'bg-zinc-900 text-white shadow border border-zinc-800'
                : 'text-zinc-400 hover:text-white bg-transparent'
            }`}
            id="btn-view-list-only"
          >
            📋 Trails List
          </button>
        </div>
      </div>

      {/* WORKSPACE CONTENT BODY */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* MAP CANVAS PANEL */}
        <div className={`bg-base relative overflow-hidden transition-all duration-300 ${
          mobileViewMode === 'list' ? 'hidden' : 'block'
        } ${
          mobileViewMode === 'map' ? 'flex-1 h-full' : 'h-[280px] shrink-0 border-b border-zinc-800'
        }`}>
          {shouldRenderGoogleMaps ? (
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={{ lat: 37.8267, lng: -122.4828 }}
                defaultZoom={12}
                mapId="DEMO_MAP_ID"
                gestureHandling="greedy"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                id="google-maps-explorer"
                onCameraChanged={(ev) => {
                  const bounds = ev.map.getBounds();
                  if (bounds) {
                    setMapBounds({
                      north: bounds.getNorthEast().lat(),
                      south: bounds.getSouthWest().lat(),
                      east: bounds.getNorthEast().lng(),
                      west: bounds.getSouthWest().lng()
                    });
                  }
                }}
                onClick={(ev) => {
                  if (ev.detail && ev.detail.latLng) {
                    setUserLocation({
                      lat: ev.detail.latLng.lat,
                      lng: ev.detail.latLng.lng
                    });
                  }
                }}
              >
                {/* User's Current GPS Location Indicator */}
                <AdvancedMarker position={userLocation} title="Your GPS Location">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-8 h-8 bg-brand-pop rounded-full opacity-40 animate-ping" />
                    <div className="w-5 h-5 bg-brand-pop rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-[9px] font-black font-sans">
                      ME
                    </div>
                  </div>
                </AdvancedMarker>

                {/* Fit map bounds to active track waypoints or all routes combined */}
                {!hasManuallyCentered && (
                  activeRoutePath.length > 0 ? (
                    <MapAutoFitter waypoints={activeRoutePath} />
                  ) : (
                    <AllRoutesAutoFitter routes={baseFilteredRoutes} />
                  )
                )}

                {/* Draw all other background trail route polylines in semi-transparent styling */}
                {searchedRoutes.map(route => {
                  if (route.id === activeRouteId) return null;
                  const path = ((route.gpxPath && route.gpxPath.length > 0) ? route.gpxPath : route.waypoints).map(wp => ({ lat: wp.lat, lng: wp.lng }));
                  return (
                    <RoutePolyline
                      key={`bg-path-${route.id}`}
                      path={path}
                      strokeColor={ACTIVITY_DETAILS[route.activityType]?.darkColor || '#64748b'}
                      strokeWeight={3}
                      strokeOpacity={0.3}
                    />
                  );
                })}

                {/* Draw active trail route polyline */}
                {activeRoute && activeRoutePath.length > 0 && (
                  <RoutePolyline
                    path={activeRoutePath}
                    strokeColor="#2DD4BF"
                    strokeWeight={6}
                    strokeOpacity={0.95}
                  />
                )}

                {/* Map Pins for all available matching trails so users can browse and select them directly */}
                {searchedRoutes.map(route => {
                  if (route.waypoints.length === 0) return null;
                  const startWp = route.waypoints[0];
                  const isActive = route.id === activeRouteId;

                  return (
                    <AdvancedMarker
                      key={`marker-route-start-${route.id}`}
                      position={{ lat: startWp.lat, lng: startWp.lng }}
                      title={`${route.name} (${route.distance} km) - Click to inspect`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectSearchedRoute(route.id)}
                        className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all cursor-pointer shadow-md ${
                          isActive 
                            ? 'bg-zinc-950 border-brand-green text-white scale-110 z-30 ring-4 ring-brand-green/20'
                            : 'bg-zinc-900 border-zinc-850 text-zinc-300 hover:border-zinc-750 z-10 hover:scale-105'
                        }`}
                        id={`marker-btn-${route.id}`}
                      >
                        <span className="text-sm">
                          {route.activityType === 'running' && '🏃'}
                          {route.activityType === 'hiking' && '🥾'}
                          {route.activityType === 'biking' && '🚴'}
                          {route.activityType === 'mountain_biking' && '🚵'}
                          {route.activityType === 'skateboard' && '🛹'}
                          {route.activityType === 'water_sports' && '🛶'}
                        </span>
                        
                        <span className={`text-[9px] font-extrabold ${isActive ? 'block' : 'max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300'}`}>
                          {isActive ? route.name : `${route.name.split(' ')[0]}...`}
                        </span>

                        {(() => {
                          const routeUsers = users.filter(u => u.currentRouteId === route.id || route.discoverableUsers?.includes(u.id));
                          if (routeUsers.length === 0) return null;
                          return (
                            <div className="flex -space-x-1 items-center bg-brand-green/10 px-1 py-0.5 rounded-full border border-brand-green/20 shrink-0">
                              {routeUsers.slice(0, 3).map(ru => (
                                <div key={ru.id} className="w-3.5 h-3.5 rounded-full border border-white bg-zinc-950 overflow-hidden shrink-0 flex items-center justify-center">
                                  <AvatarViewer config={ru.avatarConfig} className="w-3 h-3" />
                                </div>
                              ))}
                              {routeUsers.length > 3 && (
                                <span className="text-[6px] font-black text-brand-green pl-0.5">+{routeUsers.length - 3}</span>
                              )}
                            </div>
                          );
                        })()}

                        <span className="text-[8px] font-mono font-bold bg-zinc-950 group-hover:bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded">
                          {route.distance} km
                        </span>
                      </button>
                    </AdvancedMarker>
                  );
                })}

                {/* Start & End Point Flags for Active Route */}
                {activeRoute && activeRoute.waypoints.length > 0 && (
                  <>
                    {/* End Point Marker */}
                    <AdvancedMarker position={{ lat: activeRoute.waypoints[activeRoute.waypoints.length - 1].lat, lng: activeRoute.waypoints[activeRoute.waypoints.length - 1].lng }} title="End Finish Waypoint">
                      <Pin background="#F472B6" glyphColor="#ffffff" scale={0.9} />
                    </AdvancedMarker>
                  </>
                )}

                {/* Waypoint-tagged Photo camera markers */}
                {activeRoute && activeRoute.photos?.map((photo, index) => {
                  const wp = activeRoute.waypoints[photo.waypointIndex];
                  if (!wp) return null;
                  return (
                    <AdvancedMarker
                      key={`map-photo-marker-${index}`}
                      position={{ lat: wp.lat, lng: wp.lng }}
                    >
                      <div
                        style={{ width: '32px', height: '32px' }}
                        className="bg-zinc-950 text-white rounded-full border-2 border-zinc-800 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform cursor-pointer"
                        title="Geotagged Trail Photo"
                      >
                        <Camera className="w-3.5 h-3.5 text-brand-accent" />
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* Discoverable Mates Floating on Map */}
                {activeRoute && discoverableUsersOnRoute.map((user) => {
                  const pinIndex = Math.min(2, activeRoute.waypoints.length ? activeRoute.waypoints.length - 1 : 0);
                  const wp = activeRoute.waypoints[pinIndex];
                  if (!wp) return null;

                  return (
                    <AdvancedMarker
                      key={`map-mate-${user.id}`}
                      position={{ lat: wp.lat + (user.id === 'user-sierra' ? 0.001 : -0.001), lng: wp.lng }}
                    >
                      <div
                        style={{ width: '42px', height: '42px' }}
                        className="relative flex items-center justify-center cursor-pointer"
                        onClick={() => handleRoutePinClick(activeRoute.id)}
                      >
                        <div className="absolute -inset-1.5 bg-brand-green/20 rounded-full animate-ping" />
                        <AvatarViewer
                          config={user.avatarConfig}
                          className="w-9 h-9 border-2 border-brand-green rounded-full bg-zinc-950 shadow-xl"
                        />
                      </div>
                    </AdvancedMarker>
                  );
                })}

                <LocateMeButton 
                  userLocation={userLocation} 
                  setUserLocation={setUserLocation} 
                  onLocate={() => setHasManuallyCentered(true)} 
                />
              </Map>
            </APIProvider>
          ) : (
            /* HIGH-TECH INTERACTIVE SIMULATED TACTICAL VECTOR MAP FALLBACK */
            <div className="absolute inset-0 bg-zinc-950 flex flex-col" id="tactical-vector-map">
              {/* Alert Warning Bar */}
              <div className="bg-brand-accent/10 border-b border-brand-accent/20 px-3 py-1.5 flex items-center gap-2 text-brand-accent z-10">
                <Info className="w-4 h-4 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-wider">
                  {googleMapsAuthFailed ? "Demo Mode: Google Maps Auth Rejected (Using Simulated Vector Layout)" : "Demo Mode: Simulated Tactical Vector Map (No API Key Detected)"}
                </p>
              </div>

              {/* Tactical Blueprint Grid */}
              <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full max-w-2xl mx-auto select-none p-4 cursor-crosshair"
                  id="tactical-vector-svg"
                  onClick={handleSvgMapClick}
                >
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(45, 212, 191, 0.04)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  
                  {/* Grid overlay */}
                  <rect width="100" height="100" fill="url(#grid)" />

                  {/* ME Indicator (Rose pulsing dot on simulated map) */}
                  {(() => {
                    const pt = getGlobalUserSvgPoint();
                    return (
                      <g transform={`translate(${pt.x}, ${pt.y})`} className="pointer-events-none">
                        <circle r="4" className="fill-brand-pop/30 animate-pulse" />
                        <circle r="2" fill="#F472B6" stroke="#ffffff" strokeWidth="0.5" />
                        <text x="0" y="5" fill="#F472B6" fontSize="2.5" textAnchor="middle" fontWeight="black" className="font-sans">ME</text>
                      </g>
                    );
                  })()}
                  
                  {/* Topo circles mock contour lines */}
                  <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(45, 212, 191, 0.03)" strokeWidth="0.5" strokeDasharray="2,2" />
                  <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(45, 212, 191, 0.03)" strokeWidth="0.5" strokeDasharray="2,2" />
                  <circle cx="75" cy="30" r="15" fill="none" stroke="rgba(45, 212, 191, 0.02)" strokeWidth="0.5" />

                  {searchedRoutes.length > 0 ? (
                    <>
                      {/* 1. Draw ALL matching route polylines in global space */}
                      {searchedRoutes.map(route => {
                        const points = getGlobalSvgPoints(route.waypoints);
                        if (points.length === 0) return null;
                        const isActive = route.id === activeRouteId;
                        const color = ACTIVITY_DETAILS[route.activityType]?.darkColor || '#2dd4bf';

                        return (
                          <g key={`svg-route-group-${route.id}`} className="group">
                            {/* Broad invisible backline for easy cursor selection */}
                            <polyline
                              points={points.map(p => `${p.x},${p.y}`).join(' ')}
                              fill="none"
                              stroke="transparent"
                              strokeWidth="6"
                              className="cursor-pointer"
                              onClick={() => handleSelectSearchedRoute(route.id)}
                            />

                            {/* Trail line */}
                            <polyline
                              points={points.map(p => `${p.x},${p.y}`).join(' ')}
                              fill="none"
                              stroke={color}
                              strokeWidth={isActive ? "2.0" : "0.8"}
                              strokeDasharray={isActive ? "none" : "1.5,1.5"}
                              strokeOpacity={isActive ? "1" : "0.35"}
                              className={`transition-all duration-300 cursor-pointer ${
                                isActive ? 'animate-pulse' : 'hover:stroke-zinc-300'
                              }`}
                              onClick={() => handleSelectSearchedRoute(route.id)}
                            />

                            {/* Start Point Marker for each route */}
                            {points[0] && (
                              <g
                                transform={`translate(${points[0].x}, ${points[0].y})`}
                                className="cursor-pointer"
                                onClick={() => handleSelectSearchedRoute(route.id)}
                              >
                                {isActive && (
                                  <circle r="4" className="fill-brand-green/20 animate-ping" />
                                )}
                                <circle
                                  r={isActive ? "3" : "1.8"}
                                  fill={isActive ? "#ffffff" : color}
                                  stroke={isActive ? color : "none"}
                                  strokeWidth="0.5"
                                />
                                <circle
                                  r={isActive ? "1.2" : "0.8"}
                                  fill={isActive ? color : "#ffffff"}
                                />

                                {(() => {
                                  const routeUsers = users.filter(u => u.currentRouteId === route.id || route.discoverableUsers?.includes(u.id));
                                  if (routeUsers.length === 0) return null;
                                  return (
                                    <g transform="translate(4, -4)">
                                      <circle r="2.2" fill="#2dd4bf" stroke="#ffffff" strokeWidth="0.2" />
                                      <text x="0" y="0.8" fill="#ffffff" fontSize="2.2" textAnchor="middle" fontWeight="black" className="font-sans">
                                        {routeUsers.length}
                                      </text>
                                    </g>
                                  );
                                })()}

                                {/* Tooltip banner on hover */}
                                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                  <rect
                                    x="-20"
                                    y="-10"
                                    width="40"
                                    height="6"
                                    rx="1"
                                    fill="#18181B"
                                    stroke="rgba(255,255,255,0.15)"
                                    strokeWidth="0.2"
                                  />
                                  <text
                                    x="0"
                                    y="-6"
                                    fill="#ffffff"
                                    fontSize="2.2"
                                    textAnchor="middle"
                                    className="font-sans font-bold"
                                  >
                                    {route.name} ({route.distance}km)
                                  </text>
                                </g>
                              </g>
                            )}
                          </g>
                        );
                      })}

                      {/* 2. Overlays specifically for the ACTIVE Route */}
                      {activeRoute && (
                        <>
                          {/* Active Route Waypoint Markers (Intermediate circles) */}
                          {(() => {
                            const points = getGlobalSvgPoints(activeRoute.waypoints);
                            return points.map((p, idx) => {
                              if (idx === 0 || idx === points.length - 1) return null;
                              return (
                                <g key={`wp-node-${idx}`} transform={`translate(${p.x}, ${p.y})`}>
                                  <circle r="1.2" className="fill-zinc-950 stroke-brand-green" strokeWidth="0.3" />
                                </g>
                              );
                            });
                          })()}

                          {/* Active Route End Waypoint (Red glowing finish) */}
                          {(() => {
                            const points = getGlobalSvgPoints(activeRoute.waypoints);
                            const endPt = points[points.length - 1];
                            if (!endPt) return null;
                            return (
                              <g transform={`translate(${endPt.x}, ${endPt.y})`}>
                                <circle r="4" className="fill-brand-pop/20 animate-ping" />
                                <circle r="2.5" className="fill-brand-pop stroke-zinc-200" strokeWidth="0.5" />
                              </g>
                            );
                          })()}

                          {/* Active Route Geotagged Photos */}
                          {activeRoute.photos?.map((photo, index) => {
                            const wp = activeRoute.waypoints[photo.waypointIndex];
                            if (!wp) return null;
                            const pts = getGlobalSvgPoints([wp]);
                            if (pts.length === 0) return null;
                            const pt = pts[0];
                            return (
                              <g key={`fallback-photo-${index}`} transform={`translate(${pt.x}, ${pt.y - 3})`}>
                                <rect x="-2" y="-2" width="4" height="4" rx="0.5" className="fill-brand-accent stroke-white" strokeWidth="0.2" />
                                <polygon points="-1,2 1,2 0,1" className="fill-brand-accent" />
                              </g>
                            );
                          })}

                          {/* Active Route Discoverable Mates */}
                          {discoverableUsersOnRoute.map((user, uIdx) => {
                            const pinIndex = Math.min(2, activeRoute.waypoints.length ? activeRoute.waypoints.length - 1 : 0);
                            const wp = activeRoute.waypoints[pinIndex];
                            if (!wp) return null;
                            const pts = getGlobalSvgPoints([wp]);
                            if (pts.length === 0) return null;
                            const pt = pts[0];
                            const offset = uIdx === 0 ? 3 : -3;

                            return (
                              <g key={`fallback-user-${user.id}`} transform={`translate(${pt.x + offset}, ${pt.y + offset})`}>
                                <circle r="4" className="fill-brand-green/20 animate-ping" />
                                <circle r="2.2" className="fill-brand-green stroke-white" strokeWidth="0.5" />
                              </g>
                            );
                          })}
                        </>
                      )}
                    </>
                  ) : (
                    <text x="50" y="50" fill="rgba(45, 212, 191, 0.4)" fontSize="3" textAnchor="middle" className="font-mono font-bold tracking-widest uppercase">
                      NO TRAILS MATCH FILTER
                    </text>
                  )}
                </svg>

                {/* Locate Me button for simulated vector map */}
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setUserLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                          });
                        },
                        (error) => {
                          console.warn("Locate me failed", error);
                        },
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                      );
                    }
                  }}
                  className="absolute top-4 right-4 z-30 bg-zinc-950/90 hover:bg-zinc-800 text-brand-pop p-3 rounded-full shadow-lg border border-zinc-800/85 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 focus:outline-none focus:ring-1 focus:ring-brand-pop border-0"
                  title="Locate My Current Location"
                  id="btn-locate-me-fallback"
                >
                  <Locate className="w-5 h-5 text-brand-pop animate-pulse" />
                </button>

                {/* HUD Compass rose visual decoration */}
                <div className="absolute bottom-4 right-4 pointer-events-none opacity-20">
                  <Compass className="w-16 h-16 text-brand-green animate-spin" style={{ animationDuration: '60s' }} />
                </div>
              </div>
            </div>
          )}

          {/* Quick Route Selector Overlay (Mobile Drawer Indicator) */}
          {mobileViewMode === 'map' && activeRoute && (
            <button
              type="button"
              onClick={() => setMobileViewMode('split')}
              className="absolute bottom-3 left-3 right-3 bg-zinc-950/90 backdrop-blur-md px-3 py-2.5 rounded-2xl shadow-lg border border-zinc-800 max-w-sm flex items-center justify-between gap-2 text-left cursor-pointer hover:bg-zinc-900 transition-all active:scale-[0.98] border-0"
              id="mobile-map-active-route-toast"
            >
              <div className="truncate">
                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider leading-none">Active Route (Tap for details)</p>
                <h4 className="text-xs font-black text-white truncate mt-1.5">{activeRoute.name}</h4>
              </div>
              <span className="bg-brand-green/10 text-brand-green text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-brand-green/20 shrink-0">
                {activeRoute.distance} km
              </span>
            </button>
          )}
        </div>

        {/* BOTTOM/RIGHT DRAWER SHEET FOR ROUTE DETAIL */}
        <div className={`bg-base border-t border-zinc-800 shadow-xl flex flex-col z-10 overflow-hidden transition-all duration-300 ${
          mobileViewMode === 'map' ? 'hidden' : 'flex-1 min-h-0'
        }`}>
          {activeRoute ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Route Primary Info Header */}
              <div className="p-4 border-b border-zinc-850 bg-zinc-950 relative shrink-0">
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: ACTIVITY_DETAILS[activeRoute.activityType].darkColor }}
                />

                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${ACTIVITY_DETAILS[activeRoute.activityType].bg} ${ACTIVITY_DETAILS[activeRoute.activityType].color}`}>
                    {activeRoute.activityType === 'running' && '🏃'}
                    {activeRoute.activityType === 'hiking' && '🥾'}
                    {activeRoute.activityType === 'biking' && '🚴'}
                    {activeRoute.activityType === 'mountain_biking' && '🚵'}
                    {activeRoute.activityType === 'skateboard' && '🛹'}
                    {activeRoute.activityType === 'water_sports' && '🛶'}
                    {ACTIVITY_DETAILS[activeRoute.activityType].label}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize ${
                      activeRoute.difficulty === 'easy' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' :
                      activeRoute.difficulty === 'moderate' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' :
                      'bg-brand-pop/10 text-brand-pop border-brand-pop/20'
                    }`}>
                      {activeRoute.difficulty} Diff
                    </span>
                    <button
                      onClick={() => {
                        setActiveRouteId(null);
                        onSelectRoute('');
                        setHasManuallyCentered(false);
                      }}
                      className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer border border-transparent bg-transparent"
                      title="Back to Trails List"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <h2 className="text-base font-display font-black text-white mt-2 leading-tight">
                  {activeRoute.name}
                </h2>

                {/* Grid stats */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-800 shadow-md">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Distance</p>
                    <p className="text-xs font-black text-brand-green mt-0.5 font-mono">{activeRoute.distance} <span className="text-[10px] font-normal text-zinc-400">km</span></p>
                  </div>
                  <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-800 shadow-md">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Elevation</p>
                    <p className="text-xs font-black text-brand-green mt-0.5 font-mono">+{activeRoute.elevation} <span className="text-[10px] font-normal text-zinc-400">m</span></p>
                  </div>
                  <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-800 shadow-md">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Checkpoints</p>
                    <p className="text-xs font-black text-brand-green mt-0.5 font-mono">{activeRoute.waypoints.length} <span className="text-[10px] font-normal text-zinc-400">chk</span></p>
                  </div>
                </div>
              </div>

              {/* Waypoint details / Path & Discoverable Users (Scrollable Section) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                
                {/* PROMINENT ACTIVE WORKOUT INITIATOR */}
                <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 rounded-3xl border border-zinc-800 shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded-full">
                      Ready to Start
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold">
                      GPS Track Enabled
                    </span>
                  </div>
                  
                  <button
                    onClick={() => onInitiateSession(activeRoute.id, 'virtual-pacer', 'compete')}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-green to-brand-blue text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer hover:-translate-y-0.5 border-0"
                    id="btn-start-trail-workout"
                  >
                    <Play className="w-4 h-4 text-slate-950 fill-current" /> Start Workout Session
                  </button>
                  
                  <p className="text-[9px] text-center text-zinc-400 font-semibold leading-tight font-mono">
                    This starts active tracking, starts the workout timer, records your GPS positions, and unlocks the AR Proximity View!
                  </p>
                </div>

                {/* GPX Export & Action Hub */}
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadGPX}
                    className="flex-1 py-2 px-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title="Export route track as GPX XML"
                    id="btn-download-gpx"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-green" /> Export Track (GPX)
                  </button>
                </div>

                {/* Discoverability Switcher */}
                <div className="bg-zinc-950/60 rounded-2xl p-3 border border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-brand-green/10 border border-brand-green/20 rounded-xl">
                      <Eye className="w-4 h-4 text-brand-green" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Show me here</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Let nearby mates challenge or join you</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleDiscoverable(activeRoute.id, !isUserDiscoverableOnActiveRoute)}
                    className={`w-12 h-6 rounded-full p-0.5 transition-all outline-none cursor-pointer border-0 ${
                      isUserDiscoverableOnActiveRoute ? 'bg-brand-green' : 'bg-zinc-800'
                    }`}
                    id={`toggle-discoverable-${activeRoute.id}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      isUserDiscoverableOnActiveRoute ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Geotagged Route Photos Section */}
                <div className="bg-zinc-950/40 rounded-2xl p-3.5 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-zinc-500" /> Geotagged Photos
                    </h3>
                    <span className="text-[10px] text-zinc-550 font-bold">{activeRoute.photos?.length || 0} photos</span>
                  </div>

                  {/* Horizontal Photo Slider */}
                  {activeRoute.photos && activeRoute.photos.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                      {activeRoute.photos.map((photo, pIdx) => (
                        <div key={pIdx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-800 shrink-0 shadow-2xs group">
                          <img src={photo.url} alt="Trail photo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 px-1 text-[8px] font-mono text-white text-center truncate">
                            WP {photo.waypointIndex + 1}: {activeRoute.waypoints[photo.waypointIndex]?.label || 'Check'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-400 text-center py-2 italic">No photos attached to this trail yet.</p>
                  )}

                  {/* File Upload Trigger */}
                  <div className="pt-2 border-t border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[10px] font-bold text-zinc-400">Tag to waypoint:</label>
                      <select
                        value={selectedWaypointIndex}
                        onChange={(e) => setSelectedWaypointIndex(parseInt(e.target.value))}
                        className="bg-zinc-900 border border-zinc-800 text-white rounded-lg text-[10px] font-semibold p-1 outline-none"
                      >
                        {activeRoute.waypoints.map((wp, idx) => (
                          <option key={idx} value={idx}>
                            WP {idx + 1}: {wp.label || `Checkpoint ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="w-full py-2 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/20 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Photo to Trail</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="btn-upload-photo-hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Discoverable Mates list */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-400" /> Discoverable Mates ({discoverableUsersOnRoute.length})
                  </h3>
                  
                  {discoverableUsersOnRoute.length > 0 ? (
                    <div className="space-y-2.5">
                      {discoverableUsersOnRoute.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xs hover:border-zinc-700 transition-all"
                          id={`mate-card-${user.id}`}
                        >
                          <div className="flex items-center gap-2.5">
                              <AvatarViewer config={user.avatarConfig} className="w-10 h-10 shrink-0" />
                              <div>
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-bold text-white leading-none">{user.name}</p>
                                  <span className="bg-brand-blue/10 text-brand-blue text-[8px] font-extrabold px-1.5 py-0.5 rounded-full capitalize">
                                    {user.fitnessLevel}
                                  </span>
                                </div>
                                <p className="text-[10px] text-zinc-400 mt-1">
                                  Ready to train @ comfort pace
                                </p>
                              </div>
                            </div>

                          {/* Quick interactions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => onInitiateChat(user.id)}
                              className="p-1.5 text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                              title="Chat with Mate"
                              id={`chat-btn-${user.id}`}
                            >
                              💬
                            </button>
                            <button
                              onClick={() => onInitiateSession(activeRoute.id, user.id, 'together')}
                              className="px-2.5 py-1.5 bg-brand-green hover:opacity-90 text-slate-950 rounded-xl text-[10px] font-bold shadow-xs transition-colors cursor-pointer animate-bounce border-0"
                              title="Join Workout together"
                              id={`join-btn-${user.id}`}
                            >
                              Join
                            </button>
                            <button
                              onClick={() => onInitiateSession(activeRoute.id, user.id, 'compete')}
                              className="px-2.5 py-1.5 bg-brand-pop hover:opacity-90 text-slate-950 rounded-xl text-[10px] font-bold shadow-xs transition-colors flex items-center gap-0.5 cursor-pointer border-0"
                              title="Challenge Competitively"
                              id={`challenge-btn-${user.id}`}
                            >
                              <Zap className="w-2.5 h-2.5" /> Race
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-zinc-950/60 rounded-2xl border border-dashed border-zinc-800">
                      <p className="text-xs text-zinc-400 font-medium">No nearby mates are discoverable here yet.</p>
                      <button
                        onClick={() => onToggleDiscoverable(activeRoute.id, true)}
                        className="mt-2 text-xs text-brand-green font-bold hover:underline cursor-pointer bg-transparent border-0"
                        id="btn-be-first-discoverable"
                      >
                        Be the first to show up!
                      </button>
                    </div>
                  )}
                </div>

                {/* Trail Checkpoints List */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Trail Checkpoint Waypoints
                  </h3>
                  <div className="relative pl-3 space-y-3.5 before:absolute before:left-1 before:top-1.5 before:bottom-1.5 before:w-[1.5px] before:bg-zinc-800">
                    {activeRoute.waypoints.map((wp, idx) => (
                      <div key={idx} className="relative flex items-start gap-2.5 text-xs">
                        <div className="absolute -left-3.5 top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-600 ring-4 ring-zinc-950 border border-zinc-800" />
                        <div>
                          <p className="font-bold text-white">
                            {wp.label || `Waypoint ${idx + 1}`}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            {idx === 0 ? 'Start Checkpoint' : idx === activeRoute.waypoints.length - 1 ? 'End Summit Finisher' : `Checkpoint ${idx + 1}`} {wp.ele ? `| Elevation: ${wp.ele}m` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-zinc-850 bg-zinc-950 shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-green" /> Trails Directory ({searchedRoutes.length})
                </h3>
                <p className="text-[10px] text-zinc-550 mt-1.5 font-mono uppercase tracking-wider">Select a trail route below to plot and focus it on the map</p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {searchedRoutes.length > 0 ? (
                  searchedRoutes.map((route) => (
                    <div
                      key={route.id}
                      onClick={() => handleSelectSearchedRoute(route.id)}
                      className="w-full text-left p-3.5 rounded-2xl border border-zinc-800 hover:border-brand-green bg-zinc-900/60 hover:bg-zinc-950/60 shadow-md transition-all flex flex-col gap-2.5 cursor-pointer"
                      id={`route-card-${route.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {route.activityType === 'running' && '🏃'}
                            {route.activityType === 'hiking' && '🥾'}
                            {route.activityType === 'biking' && '🚴'}
                            {route.activityType === 'mountain_biking' && '🚵'}
                            {route.activityType === 'skateboard' && '🛹'}
                            {route.activityType === 'water_sports' && '🛶'}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-white leading-tight line-clamp-1">{route.name}</h4>
                            <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">📍 {route.startPointName}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border capitalize shrink-0 ${
                          route.difficulty === 'easy' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' :
                          route.difficulty === 'moderate' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' :
                          'bg-brand-pop/10 text-brand-pop border-brand-pop/20'
                        }`}>
                          {route.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 bg-zinc-950/80 p-2 rounded-xl border border-zinc-850">
                        <span>📏 {route.distance} km</span>
                        <span>⛰️ +{route.elevation} m</span>
                        <span className="text-brand-pop font-extrabold">📍 {getRouteDistance(route) < 1 ? `${(getRouteDistance(route) * 1000).toFixed(0)}m` : `${getRouteDistance(route).toFixed(1)}km`}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onInitiateSession(route.id, 'virtual-pacer', 'compete');
                          }}
                          className="py-2 px-3 bg-gradient-to-r from-brand-green to-brand-blue text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer border-0"
                          id={`btn-quick-start-${route.id}`}
                        >
                          <Play className="w-3 h-3 text-slate-950 fill-current" /> Start Workout
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSearchedRoute(route.id);
                          }}
                          className="py-2 px-3 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                          id={`btn-explore-trail-${route.id}`}
                        >
                          <Compass className="w-3.5 h-3.5 text-zinc-550" /> Plot & Find
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 px-4 text-zinc-400">
                    <Compass className="w-8 h-8 text-zinc-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-xs font-semibold">No matching routes found.</p>
                    <p className="text-[10px] text-zinc-550 mt-1">Try resetting the sport filter or typing a different search query!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
