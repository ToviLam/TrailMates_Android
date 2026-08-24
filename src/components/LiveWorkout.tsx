import React, { useState, useEffect, useRef } from 'react';
import { User, Route, Waypoint } from '../types';
import { AvatarViewer } from './AvatarViewer';
import { ACTIVITY_DETAILS } from '../mockData';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { 
  Flame, 
  Clock, 
  Award, 
  Compass, 
  Sparkles, 
  Navigation, 
  CameraOff, 
  Camera, 
  Zap, 
  MapPin, 
  Info, 
  Eye, 
  Shield, 
  RotateCw, 
  TrendingUp, 
  Radio, 
  AlertCircle 
} from 'lucide-react';

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

interface LiveWorkoutProps {
  route: Route;
  partner: User;
  currentUser: User;
  users: User[]; // Full user database for proximity radar tracking
  connections: any[]; // User connections to inspect tiers
  mode: 'compete' | 'together';
  onFinish: (sessionStats: {
    duration: number; // in secs
    distance: number; // in km
    calories: number;
    winnerId?: string;
  }) => void;
}

// Helper to compute geodesic distance between two lat/lng coordinates (Haversine formula)
const getHaversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
};

// Interpolates lat/lng coordinate along the path based on precise cumulative distance covered
const getLatLngAtDistance = (waypoints: Waypoint[], distanceCovered: number, totalDistance: number) => {
  if (!waypoints || waypoints.length === 0) return { lat: 37.8267, lng: -122.4828 };
  if (waypoints.length === 1) return { lat: waypoints[0].lat, lng: waypoints[0].lng };

  // Calculate precise cumulative distances along the track
  const cumulativeDistances: number[] = [0];
  let currentSum = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = getHaversineDistance(
      waypoints[i].lat,
      waypoints[i].lng,
      waypoints[i + 1].lat,
      waypoints[i + 1].lng
    );
    currentSum += d;
    cumulativeDistances.push(currentSum);
  }

  const pathTotalDistance = cumulativeDistances[cumulativeDistances.length - 1] || 0.001;

  // Scale the input distanceCovered relative to the actual path cumulative distance
  const ratio = Math.min(1, Math.max(0, distanceCovered / (totalDistance || 1)));
  const targetDistance = ratio * pathTotalDistance;

  // Find the segment where the targetDistance falls
  let segmentIndex = 0;
  for (let i = 0; i < cumulativeDistances.length - 1; i++) {
    if (targetDistance >= cumulativeDistances[i] && targetDistance <= cumulativeDistances[i + 1]) {
      segmentIndex = i;
      break;
    }
    if (i === cumulativeDistances.length - 2) {
      segmentIndex = i;
    }
  }

  const d1 = cumulativeDistances[segmentIndex];
  const d2 = cumulativeDistances[segmentIndex + 1];
  const segmentLength = d2 - d1;

  let stepRatio = 0;
  if (segmentLength > 0) {
    stepRatio = Math.min(1, Math.max(0, (targetDistance - d1) / segmentLength));
  }

  const wp1 = waypoints[segmentIndex];
  const wp2 = waypoints[segmentIndex + 1];

  const lat = wp1.lat + (wp2.lat - wp1.lat) * stepRatio;
  const lng = wp1.lng + (wp2.lng - wp1.lng) * stepRatio;

  return { lat, lng };
};

// Custom Polyline Component to draw the track
const RoutePolyline: React.FC<{
  path: google.maps.LatLngLiteral[];
  strokeColor: string;
}> = ({ path, strokeColor }) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || path.length === 0) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor,
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });

    polyline.setMap(map);
    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, [map, path, strokeColor]);

  return null;
};

// Map center autofit to contain the active progress
const MapAutoFitter: React.FC<{ progressPoints: { lat: number; lng: number }[] }> = ({ progressPoints }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || progressPoints.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    progressPoints.forEach(p => bounds.extend(p));
    map.fitBounds(bounds, { top: 30, bottom: 30, left: 30, right: 30 });
  }, [map, progressPoints]);

  return null;
};

export const LiveWorkout: React.FC<LiveWorkoutProps> = ({
  route,
  partner,
  currentUser,
  users,
  connections,
  mode,
  onFinish
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [myDistance, setMyDistance] = useState(0);
  const [partnerDistance, setPartnerDistance] = useState(0);
  const [boostActive, setBoostActive] = useState(false);
  const [whoIsAhead, setWhoIsAhead] = useState<'me' | 'partner'>('partner');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [googleMapsAuthFailed, setGoogleMapsAuthFailed] = useState(false);

  // Real-time precise GPS notification state
  const [gpsSyncMessage, setGpsSyncMessage] = useState<{ lat: number; lng: number; accuracy: number; time: string } | null>(null);

  const triggerGpsSync = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsSyncMessage({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy || 1.2,
            time: new Date().toLocaleTimeString()
          });
          // Auto clear after 4 seconds
          setTimeout(() => {
            setGpsSyncMessage(null);
          }, 4000);
        },
        (error) => {
          console.warn("Minimap GPS sync failed, simulating high-precision sync.", error);
          // Fallback to high precision simulated sync
          setGpsSyncMessage({
            lat: 37.8267,
            lng: -122.4828,
            accuracy: 1.5,
            time: new Date().toLocaleTimeString()
          });
          setTimeout(() => {
            setGpsSyncMessage(null);
          }, 4000);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  // AR & Radar Custom Proximity State
  const [arViewMode, setArViewMode] = useState<'camera' | 'radar'>('camera');
  const [compassHeading, setCompassHeading] = useState(0); // swivelling camera from -180 to 180 degrees
  const [radarSweepAngle, setRadarSweepAngle] = useState(0);
  const [selectedNearbyUser, setSelectedNearbyUser] = useState<User | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<any>(null);

  // Helper: Find connection status details for any user
  const getConnectionDetails = (targetUserId: string) => {
    const conn = connections.find(c => 
      (c.userIds[0] === currentUser.id && c.userIds[1] === targetUserId) ||
      (c.userIds[1] === currentUser.id && c.userIds[0] === targetUserId)
    );
    return conn ? { status: conn.status, tier: conn.tier || 'friend' } : null;
  };

  // Dynamic check for maps auth failure
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps Auth Failure detected in LiveWorkout. Degrading to vector HUD overlay.");
      setGoogleMapsAuthFailed(true);
    };
  }, []);

  // 1. Request camera access for AR HUD mode
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
        setCameraStream(stream);
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera permission denied or unavailable, falling back to simulated HUD backdrop.", err);
        setCameraError(true);
        // Automatically default to radar view if camera denied
        setArViewMode('radar');
      }
    }
    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. Ticking workout session timer + rotating radar sweeping angle
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      setRadarSweepAngle(prev => (prev + 18) % 360);

      // Increment distance realistically along the trail length
      const speedMultiplier = boostActive ? 0.045 : 0.022; // sprint boost adds speed
      setMyDistance(prev => {
        const nextDist = prev + speedMultiplier;
        return nextDist >= route.distance ? route.distance : parseFloat(nextDist.toFixed(3));
      });

      // Partner progress fluctuates around a similar speed
      const partnerSpeed = 0.021 + (Math.random() * 0.003);
      setPartnerDistance(prev => {
        const nextDist = prev + partnerSpeed;
        return nextDist >= route.distance ? route.distance : parseFloat(nextDist.toFixed(3));
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [boostActive, route.distance]);

  // Determine who is currently in the lead
  useEffect(() => {
    if (myDistance > partnerDistance) {
      setWhoIsAhead('me');
    } else {
      setWhoIsAhead('partner');
    }
  }, [myDistance, partnerDistance]);

  const handleSprintBoost = () => {
    setBoostActive(true);
    setTimeout(() => {
      setBoostActive(false);
    }, 3000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleFinish = () => {
    const winnerId = mode === 'compete' 
      ? (myDistance > partnerDistance ? currentUser.id : partner.id)
      : undefined;

    const finalCalories = Math.round(myDistance * 68);

    onFinish({
      duration: elapsedTime,
      distance: parseFloat(myDistance.toFixed(2)),
      calories: finalCalories,
      winnerId
    });
  };

  // Compute live real-time position coordinate for Me and Partner
  const trackPath = (route.gpxPath && route.gpxPath.length > 0) ? route.gpxPath : route.waypoints;
  const myLatLng = getLatLngAtDistance(trackPath, myDistance, route.distance);
  const partnerLatLng = getLatLngAtDistance(trackPath, partnerDistance, route.distance);

  // Full polyline coordinates list
  const fullPolylinePath = trackPath.map(wp => ({ lat: wp.lat, lng: wp.lng }));

  // Convert lat/lng coordinates to SVG relative viewBox="0 0 100 100" coordinate space
  const convertLatLngToSvg = (lat: number, lng: number) => {
    if (!trackPath || trackPath.length === 0) return { x: 50, y: 50 };
    const lats = trackPath.map(w => w.lat);
    const lngs = trackPath.map(w => w.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;

    const x = 15 + ((lng - minLng) / lngRange) * 70;
    const y = 85 - ((lat - minLat) / latRange) * 70; // Inverted Y
    return { x, y };
  };

  const fallbackPoints = trackPath.map((wp) => convertLatLngToSvg(wp.lat, wp.lng));
  const myFallbackPos = convertLatLngToSvg(myLatLng.lat, myLatLng.lng);
  const partnerFallbackPos = convertLatLngToSvg(partnerLatLng.lat, partnerLatLng.lng);

  const shouldRenderGoogleMaps = isProbablyValidKey(API_KEY) && !googleMapsAuthFailed;

  // ---------------------------------------------------------
  // DYNAMIC COMPASS-ORIENTED PERSPECTIVE PROXIMITY ENGINE
  // ---------------------------------------------------------
  // Let's filter other active nearby users within 100 meters
  // Distances and bearings are deterministic based on user index
  const nearbyUsers = users
    .filter(u => {
      if (u.id === currentUser.id) return false;
      const details = getConnectionDetails(u.id);
      return details?.status !== 'blocked';
    })
    .map((user, i) => {
      // Establish initial bearing angle & initial distance
      const baseBearing = (i * 90 - 70) % 360; // relative angle from North (0° to 360°)
      const initialDistance = 35 + (i * 35); // in meters

      // Distances decrease realistically as the current user runs and accumulates distance
      const distanceCoveredMeters = myDistance * 1000;
      const progressCycle = distanceCoveredMeters % (initialDistance + 40);
      const simulatedDistance = Math.max(9, Math.round(initialDistance - progressCycle));

      return {
        user,
        bearing: baseBearing,
        distance: simulatedDistance
      };
    })
    // Only keep active users simulated within 100 meters!
    .filter(item => item.distance <= 100);

  return (
    <div className="relative w-full h-full bg-base overflow-hidden flex flex-col text-white" id="live-session-container">
      
      {/* 1. CAMERA BACKDROP / TOPOLOGY LANDSCAPE SIMULATOR */}
      <div className="absolute inset-0 z-0">
        {arViewMode === 'camera' && !cameraError && cameraStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover opacity-65"
            id="ar-camera-feed"
          />
        ) : (
          <div className="relative w-full h-full bg-base/90 flex items-center justify-center overflow-hidden">
            {/* High-tech vector grid backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(45,212,191,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,0.06)_1px,transparent_1px)] [background-size:25px_25px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.12),transparent_70%)]" />
          </div>
        )}
      </div>

      {/* 1.1 PRECISION GPS SYNC BANNER */}
      {gpsSyncMessage && (
        <div className="absolute top-20 inset-x-4 mx-auto max-w-[260px] z-50 bg-zinc-950/90 backdrop-blur-md border border-brand-green/30 px-3 py-2 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-brand-green animate-ping shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="text-[9px] font-bold text-brand-green uppercase tracking-wider">GPS Position Locked</h4>
            <p className="text-[8px] text-zinc-300 font-mono mt-0.5">
              Lat: {gpsSyncMessage.lat.toFixed(6)}
            </p>
            <p className="text-[8px] text-zinc-300 font-mono">
              Lng: {gpsSyncMessage.lng.toFixed(6)}
            </p>
            <div className="flex items-center justify-between text-[7px] text-zinc-400 mt-0.5">
              <span>Accuracy: {gpsSyncMessage.accuracy.toFixed(1)}m</span>
              <span>{gpsSyncMessage.time}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC MAP OVERLAY MINI CARD */}
      <div className="absolute top-16 right-4 z-30 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-zinc-800/80 shadow-2xl bg-zinc-950 relative">
        {shouldRenderGoogleMaps ? (
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={myLatLng}
              defaultZoom={13}
              mapId="DEMO_MAP_ID"
              disableDefaultUI={true}
              gestureHandling="none"
              style={{ width: '100%', height: '100%' }}
              id="live-workout-minimap"
            >
              {/* Autofit map bounds to user + partner positions */}
              <MapAutoFitter progressPoints={[myLatLng, partnerLatLng]} />

              {/* Draw active trail route polyline */}
              {fullPolylinePath.length > 0 && (
                <RoutePolyline
                  path={fullPolylinePath}
                  strokeColor="#2DD4BF"
                />
              )}

              {/* User Live Marker */}
              <AdvancedMarker position={myLatLng} title="My Progress">
                <div style={{ width: '22px', height: '22px' }} className="bg-brand-green text-slate-950 rounded-full border border-white flex items-center justify-center shadow-md animate-pulse text-xs font-bold">
                  🏃
                </div>
              </AdvancedMarker>

              {/* Partner Live Marker */}
              <AdvancedMarker position={partnerLatLng} title="Partner Progress">
                <div style={{ width: '22px', height: '22px' }} className="bg-brand-pop text-white rounded-full border border-white flex items-center justify-center shadow-md text-xs font-bold">
                  ⚡
                </div>
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          /* fallback mini map visualization */
          <div className="w-full h-full relative bg-zinc-950 p-1.5 flex flex-col justify-between border border-zinc-800 rounded-2xl" id="fallback-minimap-overlay">
            <svg viewBox="0 0 100 100" className="w-full h-full max-w-[85%] mx-auto mt-1">
              {/* Polyline Path */}
              {fallbackPoints.length > 0 && (
                <polyline
                  points={fallbackPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {/* My Progress point */}
              <circle cx={myFallbackPos.x} cy={myFallbackPos.y} r="5" className="fill-brand-green stroke-white" strokeWidth="1" />
              {/* Partner Progress point */}
              <circle cx={partnerFallbackPos.x} cy={partnerFallbackPos.y} r="5" className="fill-brand-pop stroke-white" strokeWidth="1" />
            </svg>
          </div>
        )}

        {/* Floating Mini Map Locate button */}
        <button
          type="button"
          onClick={triggerGpsSync}
          className="absolute bottom-1.5 right-1.5 z-40 bg-zinc-950/85 hover:bg-zinc-900 border border-zinc-800 text-brand-pop hover:text-brand-pop/80 p-1.5 rounded-full shadow-lg transition-all active:scale-95 focus:outline-none focus:ring-1 focus:ring-brand-pop cursor-pointer border-0"
          title="Locate Current Position"
          id="btn-minimap-locate-me"
        >
          <Compass className="w-3.5 h-3.5 animate-pulse" />
        </button>
      </div>

      {/* 3. DYNAMIC AR AVATARS LAYER */}
      {arViewMode === 'camera' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-hidden">
          {nearbyUsers.map(({ user, bearing, distance }) => {
            // Calculate relative angle from the user's facing compass direction
            // Compass heading goes from -180 to +180
            let relativeAngle = bearing - compassHeading;
            // Normalize relative angle to -180 to +180
            while (relativeAngle > 180) relativeAngle -= 360;
            while (relativeAngle < -180) relativeAngle += 360;

            // Camera FOV is 90 degrees total (-45° to +45°)
            const isVisibleInFOV = Math.abs(relativeAngle) <= 45;
            if (!isVisibleInFOV) return null;

            // Horizontal position mapping (-45° maps to 10% screen, +45° maps to 90% screen)
            const horizontalPct = 50 + (relativeAngle / 45) * 40;

            // Perspective scaling: farther users are scaled down, closer users are larger
            // Distance is 10m to 100m
            const distanceRatio = (distance - 10) / 90; // 0 (at 10m) to 1 (at 100m)
            const scale = Math.max(0.35, Math.min(1.2, 1.2 - distanceRatio * 0.85));

            // Perspective placement: farther users are near the horizon (e.g., 35% height), closer are lower (65% height)
            const verticalPct = 35 + distanceRatio * 25;

            // Get user friendship tier details
            const connDetails = getConnectionDetails(user.id);
            const isFriend = connDetails?.status === 'connected' && connDetails?.tier === 'friend';
            const isChallenger = connDetails?.status === 'connected' && connDetails?.tier === 'challenger';

            const isDirectPartner = user.id === partner.id;

            return (
              <div
                key={user.id}
                className="absolute flex flex-col items-center transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${horizontalPct}%`,
                  top: `${verticalPct}%`,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  zIndex: Math.round(100 - distance), // closer users are in front
                }}
                id={`ar-avatar-${user.id}`}
              >
                {/* Speech Bubble / Motivation Tag */}
                <div className="bg-zinc-950/95 text-white border border-zinc-750 rounded-2xl px-2.5 py-1 text-[9px] font-black mb-2 shadow-xl flex items-center gap-1">
                  {isDirectPartner ? (
                    <span className="text-brand-pop font-extrabold font-mono">PARTNER</span>
                  ) : isFriend ? (
                    <span className="text-brand-green font-extrabold font-mono">FRIEND</span>
                  ) : isChallenger ? (
                    <span className="text-brand-accent font-extrabold font-mono">CHALLENGE</span>
                  ) : (
                    <span className="text-zinc-400 font-extrabold font-mono">MATE</span>
                  )}
                  <span className="text-zinc-300">"{distance}m away"</span>
                </div>

                {/* Avatar model representation */}
                <div className="relative">
                  <div className={`p-1 rounded-full bg-zinc-900/80 border-2 ${
                    isDirectPartner ? 'border-brand-pop' : isFriend ? 'border-brand-green' : 'border-brand-accent'
                  } shadow-md`}>
                    <AvatarViewer
                      config={user.avatarConfig}
                      className="w-20 h-20"
                      animate={true}
                    />
                  </div>
                  {/* Small real-time activity bubble on avatar */}
                  <span className="absolute -bottom-1 -right-1 bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white flex items-center gap-0.5">
                    ⚡ {Math.round(20 + distance / 3)} km/h
                  </span>
                </div>

                <span className="mt-1 bg-zinc-950/90 text-white font-black text-[9px] px-2 py-0.5 rounded-full border border-zinc-800">
                  {user.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. FALLBACK STYLIZED CIRCULAR SONAR RADAR HUD VIEW */}
      {arViewMode === 'radar' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none" id="radar-hud-screen">
          <div className="relative w-72 h-72 rounded-full border-2 border-brand-green/20 bg-brand-green/5 backdrop-blur-xs flex items-center justify-center">
            
            {/* RADAR SWEEP LINE EFFECT */}
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-green/20 via-transparent to-transparent origin-center pointer-events-none"
              style={{
                transform: `rotate(${radarSweepAngle}deg)`,
                transition: 'transform 1s linear'
              }}
            />

            {/* Radar Concentric Rings */}
            <div className="absolute w-52 h-52 rounded-full border border-brand-green/10 flex items-center justify-center">
              <span className="absolute -top-3 text-[7px] font-mono font-bold text-brand-green/50">50m Range</span>
              <div className="w-32 h-32 rounded-full border border-brand-green/10 flex items-center justify-center">
                <span className="absolute -top-3 text-[7px] font-mono font-bold text-brand-green/50">25m Range</span>
                <div className="w-12 h-12 rounded-full border border-brand-green/20 bg-brand-green/5 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-brand-green">YOU</span>
                </div>
              </div>
            </div>
            <span className="absolute -top-4 text-[8px] font-mono font-bold text-brand-green/70">PROXIMITY LIMIT 100m</span>

            {/* Radar Swivel Indicator lines */}
            <div className="absolute w-full h-[0.5px] bg-brand-green/10" />
            <div className="absolute h-full w-[0.5px] bg-brand-green/10" />

            {/* Plotting Nearby Active Users on Radar Grid */}
            {nearbyUsers.map(({ user, bearing, distance }) => {
              // Convert polar coordinates to Cartesian (bearing, distance)
              const bearingRad = (bearing * Math.PI) / 180;
              const radiusPct = (distance / 100) * 110; // max radius inside the circular area
              
              const x = radiusPct * Math.sin(bearingRad);
              const y = -radiusPct * Math.cos(bearingRad); // inverted Cartesian Y

              const connDetails = getConnectionDetails(user.id);
              const isFriend = connDetails?.status === 'connected' && connDetails?.tier === 'friend';
              const isChallenger = connDetails?.status === 'connected' && connDetails?.tier === 'challenger';
              const isDirectPartner = user.id === partner.id;

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedNearbyUser(user)}
                  className="absolute p-0.5 rounded-full pointer-events-auto cursor-pointer hover:scale-125 transition-transform border-0 bg-transparent"
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    zIndex: 40
                  }}
                  id={`radar-dot-${user.id}`}
                >
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full overflow-hidden bg-zinc-900 border-2 ${
                      isDirectPartner ? 'border-brand-pop animate-pulse' : isFriend ? 'border-brand-green' : 'border-brand-accent'
                    }`}>
                      <AvatarViewer config={user.avatarConfig} className="w-9 h-9" />
                    </div>
                    {/* Tiny green radar dot on avatar */}
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-brand-green border border-white animate-ping" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. AR CAMERA VIEW CONTROLLERS (DRAG-TO-SWIVEL COMPASS & TOGGLES) */}
      <div className="absolute top-16 left-4 z-30 flex flex-col gap-2 pointer-events-auto">
        
        {/* Toggle between Camera View and Radar view */}
        <div className="bg-zinc-950/95 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-lg flex gap-1 text-[10px] font-black">
          <button
            onClick={() => setArViewMode('camera')}
            className={`py-1.5 px-2.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer border-0 ${
              arViewMode === 'camera' 
                ? 'bg-brand-green text-slate-950 shadow-sm font-black' 
                : 'text-zinc-400 hover:text-white bg-transparent'
            }`}
            id="toggle-view-camera"
          >
            <Camera className="w-3.5 h-3.5" /> Camera AR
          </button>

          <button
            onClick={() => setArViewMode('radar')}
            className={`py-1.5 px-2.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer border-0 ${
              arViewMode === 'radar' 
                ? 'bg-brand-green text-slate-950 shadow-sm font-black' 
                : 'text-zinc-400 hover:text-white bg-transparent'
            }`}
            id="toggle-view-radar"
          >
            <Radio className="w-3.5 h-3.5" /> Radar HUD
          </button>
        </div>

        {/* COMPASS SWIVEL CONTROLLER (Visible only in Camera AR View) */}
        {arViewMode === 'camera' && (
          <div className="bg-zinc-950/95 backdrop-blur-md p-3 rounded-2xl border border-zinc-800 shadow-lg space-y-2 w-48 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-300 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-brand-green animate-spin" style={{ animationDuration: '30s' }} />
                Swivel Camera
              </span>
              <span className="font-mono font-bold text-brand-green bg-brand-green/10 px-1 rounded">
                {compassHeading}°
              </span>
            </div>
            
            {/* Interactive Swivel Slider to adjust compass heading */}
            <input 
              type="range"
              min="-180"
              max="180"
              value={compassHeading}
              onChange={(e) => setCompassHeading(parseInt(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-green"
              id="slider-compass-swivel"
            />
            <p className="text-[8px] text-zinc-500 italic text-center">
              * Swipe slider to search around you for 100m proximity mates
            </p>
          </div>
        )}
      </div>

      {/* SELECTED USER POPUP DIALOG TOOLTIP FOR RADAR */}
      {selectedNearbyUser && (
        <div className="absolute top-48 left-1/2 transform -translate-x-1/2 z-40 bg-zinc-950/95 border border-zinc-800 p-3 rounded-2xl shadow-xl max-w-xs w-64 pointer-events-auto">
          <div className="flex items-center gap-2">
            <AvatarViewer config={selectedNearbyUser.avatarConfig} className="w-9 h-9" />
            <div className="flex-1 truncate">
              <h4 className="text-xs font-bold truncate leading-tight text-white">{selectedNearbyUser.name}</h4>
              <p className="text-[9px] text-zinc-400 font-mono mt-0.5">@{selectedNearbyUser.avatarConfig.displayName}</p>
            </div>
            <button
              onClick={() => setSelectedNearbyUser(null)}
              className="text-zinc-400 hover:text-white text-xs border-0 bg-transparent cursor-pointer font-black"
            >
              ✕
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-zinc-900 grid grid-cols-2 gap-2 text-[9px]">
            <div className="bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-850">
              <span className="text-zinc-500 block">Distance</span>
              <span className="font-bold text-brand-green">
                {nearbyUsers.find(n => n.user.id === selectedNearbyUser.id)?.distance || 42} meters
              </span>
            </div>
            <div className="bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-850">
              <span className="text-zinc-500 block">Connection</span>
              <span className="font-bold text-brand-pop capitalize">
                {getConnectionDetails(selectedNearbyUser.id)?.tier || 'Lobby Mate'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. CORE UPPER FRONT HUD INFOBAR */}
      <div className="relative z-20 flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-black/85 via-transparent to-black/90 pointer-events-none">
        
        {/* Upper HUD indicators */}
        <div className="flex items-center justify-between gap-4 mt-1.5">
          <div className="bg-zinc-950/90 backdrop-blur-md p-3 rounded-2xl border border-zinc-800 shadow-lg flex items-center gap-2 max-w-[50%]">
            <div className="w-8 h-8 rounded-full bg-brand-green/20 border border-brand-green/40 flex items-center justify-center text-brand-green shrink-0">
              <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '40s' }} />
            </div>
            <div className="truncate">
              <p className="text-[9px] text-brand-green font-black uppercase tracking-wider leading-none">Proximity AR Session</p>
              <h3 className="text-xs font-bold truncate mt-1">{route.name}</h3>
            </div>
          </div>

          {/* Facing Swivel Direction compass indicator */}
          <div className="hidden sm:flex bg-zinc-950/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-zinc-800 items-center gap-1.5 text-[10px] font-bold font-mono">
            <Navigation className="w-3.5 h-3.5 text-brand-blue transform" style={{ transform: `rotate(${compassHeading}deg)` }} />
            <span>HEADING: {compassHeading}°</span>
          </div>

          <div className="bg-zinc-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-zinc-800 shadow-lg flex items-center gap-2 font-mono shrink-0">
            <Clock className="w-4 h-4 text-brand-green animate-pulse" />
            <span className="text-sm font-black text-white">{formatTime(elapsedTime)}</span>
          </div>
        </div>

        {/* Lower HUD stats console */}
        <div className="space-y-4 pointer-events-auto">
          {/* Active Near User Count Notification */}
          <div className="flex items-center justify-between bg-zinc-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-zinc-800 shadow-lg max-w-sm mx-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
              <Radio className="w-4 h-4 text-brand-green animate-pulse" />
              Users Active Nearby (under 100m):
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-green text-slate-950 font-mono">
              {nearbyUsers.length} MEMBERS
            </span>
          </div>

          {/* Grid Stats HUD */}
          <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
            <div className="bg-zinc-950/90 backdrop-blur-md p-3 rounded-2xl border border-zinc-800 text-center shadow-lg">
              <p className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">My Progress</p>
              <p className="text-base font-black text-brand-green font-mono mt-1 leading-none">{myDistance.toFixed(2)} <span className="text-[10px] font-normal text-zinc-300">km</span></p>
              <p className="text-[8px] text-zinc-500 font-mono mt-1">Goal: {route.distance}km</p>
            </div>

            <div className="bg-zinc-950/90 backdrop-blur-md p-3 rounded-2xl border border-zinc-800 text-center shadow-lg">
              <p className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">Pace Ratio</p>
              <p className="text-base font-black text-brand-blue font-mono mt-1 leading-none">{boostActive ? '3:50' : '4:48'} <span className="text-[10px] font-normal text-zinc-300">/km</span></p>
              <p className="text-[8px] text-zinc-500 font-mono mt-1">GPS Ticked</p>
            </div>

            <div className="bg-zinc-950/90 backdrop-blur-md p-3 rounded-2xl border border-zinc-800 text-center shadow-lg">
              <p className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">Energy Burn</p>
              <p className="text-base font-black text-brand-accent font-mono mt-1 leading-none">{Math.round(myDistance * 68)} <span className="text-[10px] font-normal text-zinc-300">kcal</span></p>
              <p className="text-[8px] text-zinc-500 font-mono mt-1">Synced Live</p>
            </div>
          </div>

          {/* Boost sprinting push & session finisher controls */}
          <div className="flex gap-3 justify-center max-w-sm mx-auto">
            <button
              onClick={handleSprintBoost}
              disabled={boostActive}
              className={`flex-1 py-3 px-4 rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-all outline-none transform active:scale-95 cursor-pointer border-0 ${
                boostActive 
                  ? 'bg-brand-pop text-slate-950 font-black animate-pulse' 
                  : 'bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-90 text-slate-950 font-black'
              }`}
              id="btn-live-boost"
            >
              <Zap className={`w-3.5 h-3.5 fill-current ${boostActive ? 'animate-bounce' : ''}`} />
              {boostActive ? 'Boosting ⚡' : 'Sprint Push!'}
            </button>

            <button
              onClick={handleFinish}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-display font-black rounded-2xl text-xs tracking-wide shadow-lg transition-colors outline-none cursor-pointer border-0"
              id="btn-live-finish"
            >
              Finish Run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
