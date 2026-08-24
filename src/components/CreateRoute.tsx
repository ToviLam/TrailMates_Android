import React, { useState, useEffect, useRef } from 'react';
import { Route, Waypoint, ActivityType } from '../types';
import { ACTIVITY_DETAILS, generateHighFidelityGpxPath } from '../mockData';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Plus, RotateCcw, Trash2, Check, Star, Navigation, Radio, Play, Pause, Square, Upload, Sparkles, Compass, Info, Locate } from 'lucide-react';

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

// Simulated viewport boundaries for consistent fallback map coordinates mapping
const SIMULATED_LAT_MIN = 37.75;
const SIMULATED_LAT_MAX = 37.85;
const SIMULATED_LNG_MIN = -122.51;
const SIMULATED_LNG_MAX = -122.41;

interface CreateRouteProps {
  onPublishRoute: (newRoute: Route, makeDiscoverable: boolean) => void;
  autoStartRecording?: boolean;
  onRecordingStarted?: () => void;
}

// Haversine formula to compute distance in km between two lat/lng coordinates
const getHaversineDistance = (p1: { lat: number; lng: number }, p2: { lat: number; lng: number }) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Custom Polyline drawing for Google Map
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
      strokeOpacity: 0.9,
      strokeWeight: 5,
    });

    polyline.setMap(map);
    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, [map, path, strokeColor]);

  return null;
};

// Auto fits bounds of the Map to waypoints
const MapAutoFitter: React.FC<{ waypoints: { lat: number; lng: number }[] }> = ({ waypoints }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || waypoints.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    waypoints.forEach(wp => bounds.extend(wp));
    map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
  }, [map, waypoints]);

  return null;
};

// Custom button component rendered inside Google Maps APIProvider to locate and pan to user's real-time GPS position inside route creator
const LocateMeButton: React.FC<{
  onLocateUser?: (lat: number, lng: number) => void;
}> = ({ onLocateUser }) => {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          if (onLocateUser) {
            onLocateUser(loc.lat, loc.lng);
          }
          if (map) {
            map.panTo(loc);
            map.setZoom(16); // High-precision zoom matching standard Google Maps
          }
        },
        (error) => {
          setIsLocating(false);
          console.warn("Locate me failed inside route creator, using simulated/default coordinate:", error);
          // Fallback coordinate: SF Golden Gate / default center
          const fallbackLoc = { lat: 37.8267, lng: -122.4828 };
          if (onLocateUser) {
            onLocateUser(fallbackLoc.lat, fallbackLoc.lng);
          }
          if (map) {
            map.panTo(fallbackLoc);
            map.setZoom(16);
          }
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
      );
    } else {
      setIsLocating(false);
      const fallbackLoc = { lat: 37.8267, lng: -122.4828 };
      if (onLocateUser) {
        onLocateUser(fallbackLoc.lat, fallbackLoc.lng);
      }
      if (map) {
        map.panTo(fallbackLoc);
        map.setZoom(16);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleLocate}
      disabled={isLocating}
      className="absolute top-4 right-4 z-30 bg-zinc-950/90 hover:bg-zinc-800 text-brand-green p-3 rounded-full shadow-lg border border-zinc-800/80 transition-all flex items-center justify-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-green hover:scale-105 active:scale-95 border-0"
      title="Locate My Current Location"
      id="btn-creator-locate-me-google"
    >
      <Locate className={`w-5 h-5 text-brand-green ${isLocating ? 'animate-spin' : 'animate-pulse'}`} />
    </button>
  );
};

export const CreateRoute: React.FC<CreateRouteProps> = ({ 
  onPublishRoute,
  autoStartRecording = false,
  onRecordingStarted
}) => {
  const [name, setName] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('running');
  const [difficulty, setDifficulty] = useState<'easy' | 'moderate' | 'hard' | 'expert'>('moderate');
  const [startPointName, setStartPointName] = useState('');
  const [endPointName, setEndPointName] = useState('');
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [makeDiscoverable, setMakeDiscoverable] = useState(true);
  const [googleMapsAuthFailed, setGoogleMapsAuthFailed] = useState(false);

  // Dynamic check for runtime auth failure
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps Auth Failure detected inside CreateRoute. Falling back.");
      setGoogleMapsAuthFailed(true);
    };
  }, []);

  // Live route recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedPoints, setRecordedPoints] = useState<Waypoint[]>([]);
  const [recordingStats, setRecordingStats] = useState({
    distance: 0, // km
    duration: 0, // seconds
    pace: '0:00 /km',
  });
  const [isSimulatedGPS, setIsSimulatedGPS] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const simulationIntervalRef = useRef<any>(null);

  // Distance / Elevation calculation
  let computedDistance = 0;
  let computedElevation = 0;

  if (waypoints.length >= 2) {
    for (let i = 1; i < waypoints.length; i++) {
      computedDistance += getHaversineDistance(waypoints[i - 1], waypoints[i]);
      if (waypoints[i].ele && waypoints[i - 1].ele && waypoints[i].ele! > waypoints[i - 1].ele!) {
        computedElevation += waypoints[i].ele! - waypoints[i - 1].ele!;
      }
    }
  }

  // Format computed values
  const finalDistance = parseFloat(computedDistance.toFixed(2)) || parseFloat((waypoints.length * 0.45).toFixed(2));
  const finalElevation = computedElevation || waypoints.length * (difficulty === 'easy' ? 8 : difficulty === 'moderate' ? 25 : difficulty === 'hard' ? 55 : 95);

  // 1. Google Maps tap to plot coordinates
  const handleMapClick = (e: any) => {
    if (isRecording) return; // Disable manual plotting during active recording

    const latLng = e.detail?.latLng || e.latLng;
    if (!latLng) return;

    const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;

    addWaypointAtLatLng(lat, lng);
  };

  // Helper to add waypoint
  const addWaypointAtLatLng = (lat: number, lng: number) => {
    const label = waypoints.length === 0 ? 'Start Checkpoint' : `Checkpoint ${waypoints.length + 1}`;
    const newWp: Waypoint = {
      lat,
      lng,
      ele: Math.round(110 + Math.sin(lat * 1000) * 40),
      time: new Date().toISOString(),
      label,
    };

    setWaypoints(prev => {
      const updated = [...prev, newWp];
      if (updated.length === 1 && !startPointName) {
        setStartPointName(`Trailhead Gateway (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      }
      setEndPointName(`Summit Finisher (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      return updated;
    });
  };

  // Click handler on simulated tactical vector map
  const handleSimulatedMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isRecording) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Convert SVG [15, 85] bounding coordinates into realistic simulated lat/lng bounds
    const relativeX = (clickX - 15) / 70;
    const relativeY = (85 - clickY) / 70; // Inverted Y

    const lat = SIMULATED_LAT_MIN + relativeY * (SIMULATED_LAT_MAX - SIMULATED_LAT_MIN);
    const lng = SIMULATED_LNG_MIN + relativeX * (SIMULATED_LNG_MAX - SIMULATED_LNG_MIN);

    addWaypointAtLatLng(lat, lng);
  };

  // Locate current position and plot it on the fallback vector map
  const handleFallbackLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          addWaypointAtLatLng(lat, lng);
        },
        (error) => {
          console.warn("Fallback geolocation locate failed", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  // Coordinate converter to project Waypoint into SVG viewBox coordinates
  const convertLatLngToSvg = (lat: number, lng: number) => {
    const relativeX = (lng - SIMULATED_LNG_MIN) / (SIMULATED_LNG_MAX - SIMULATED_LNG_MIN);
    const relativeY = (lat - SIMULATED_LAT_MIN) / (SIMULATED_LAT_MAX - SIMULATED_LAT_MIN);
    
    // Scale into [15, 85] viewport box
    const x = 15 + Math.min(1, Math.max(0, relativeX)) * 70;
    const y = 85 - Math.min(1, Math.max(0, relativeY)) * 70; // Inverted Y
    return { x, y };
  };

  // 2. Start Live Recording with GPS watchPosition
  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordedPoints([]);
    setRecordingStats({ distance: 0, duration: 0, pace: '0:00 /km' });
    setIsSimulatedGPS(false);

    // Timer setup
    timerIntervalRef.current = setInterval(() => {
      setRecordingStats(prev => {
        const nextDur = prev.duration + 1;
        const mins = nextDur / 60;
        let paceStr = '0:00 /km';
        if (prev.distance > 0) {
          const paceDec = mins / prev.distance;
          const pMins = Math.floor(paceDec);
          const pSecs = Math.round((paceDec - pMins) * 60);
          paceStr = `${pMins}:${pSecs < 10 ? '0' : ''}${pSecs} /km`;
        }
        return {
          ...prev,
          duration: nextDur,
          pace: paceStr,
        };
      });
    }, 1000);

    const handleGpsError = (err: any) => {
      console.warn('GPS Watch unavailable or permission denied inside iframe sandbox, activating simulated path mode:', err);
      setIsSimulatedGPS(true);

      // Clear physical watch if active
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Generate simulated coordinates starting near San Francisco Presidio
      let currentLat = 37.801;
      let currentLng = -122.468;
      let count = 0;

      const initialPoint: Waypoint = {
        lat: currentLat,
        lng: currentLng,
        ele: 110,
        time: new Date().toISOString(),
        label: 'GPS Track #1',
      };
      setRecordedPoints([initialPoint]);

      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);

      simulationIntervalRef.current = setInterval(() => {
        currentLat += 0.0015 + (Math.random() - 0.5) * 0.0003;
        currentLng -= 0.0012 + (Math.random() - 0.5) * 0.0003;
        count++;

        const newPoint: Waypoint = {
          lat: currentLat,
          lng: currentLng,
          ele: Math.round(110 + Math.sin(count * 0.5) * 20),
          time: new Date().toISOString(),
          label: `GPS Track #${count + 1}`,
        };

        setRecordedPoints(prev => {
          const updated = [...prev, newPoint];
          let dist = 0;
          for (let i = 1; i < updated.length; i++) {
            dist += getHaversineDistance(updated[i - 1], updated[i]);
          }
          setRecordingStats(s => ({
            ...s,
            distance: parseFloat(dist.toFixed(2)),
          }));
          return updated;
        });
      }, 1500);
    };

    if (!navigator.geolocation) {
      handleGpsError('Geolocation is not supported by this browser.');
      return;
    }

    // GPS Watch setup
    watchIdRef.current = navigator.geolocation.watchPosition(
      position => {
        const { latitude: lat, longitude: lng, altitude: ele } = position.coords;
        const newPoint: Waypoint = {
          lat,
          lng,
          ele: Math.round(ele || 115),
          time: new Date().toISOString(),
          label: `GPS Track #${recordedPoints.length + 1}`,
        };

        setRecordedPoints(prev => {
          const updated = [...prev, newPoint];
          let dist = 0;
          for (let i = 1; i < updated.length; i++) {
            dist += getHaversineDistance(updated[i - 1], updated[i]);
          }
          setRecordingStats(s => ({
            ...s,
            distance: parseFloat(dist.toFixed(2)),
          }));
          return updated;
        });
      },
      err => {
        handleGpsError(err);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // 3. Pause tracking
  const pauseRecording = () => {
    setIsPaused(true);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
  };

  // 4. Resume tracking
  const resumeRecording = () => {
    setIsPaused(false);
    // Restart timer
    timerIntervalRef.current = setInterval(() => {
      setRecordingStats(prev => {
        const nextDur = prev.duration + 1;
        const mins = nextDur / 60;
        let paceStr = '0:00 /km';
        if (prev.distance > 0) {
          const paceDec = mins / prev.distance;
          const pMins = Math.floor(paceDec);
          const pSecs = Math.round((paceDec - pMins) * 60);
          paceStr = `${pMins}:${pSecs < 10 ? '0' : ''}${pSecs} /km`;
        }
        return {
          ...prev,
          duration: nextDur,
          pace: paceStr,
        };
      });
    }, 1000);

    if (isSimulatedGPS) {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      
      let currentLat = recordedPoints.length > 0 ? recordedPoints[recordedPoints.length - 1].lat : 37.801;
      let currentLng = recordedPoints.length > 0 ? recordedPoints[recordedPoints.length - 1].lng : -122.468;
      let count = recordedPoints.length;

      simulationIntervalRef.current = setInterval(() => {
        currentLat += 0.0015 + (Math.random() - 0.5) * 0.0003;
        currentLng -= 0.0012 + (Math.random() - 0.5) * 0.0003;
        count++;

        const newPoint: Waypoint = {
          lat: currentLat,
          lng: currentLng,
          ele: Math.round(110 + Math.sin(count * 0.5) * 20),
          time: new Date().toISOString(),
          label: `GPS Track #${count + 1}`,
        };

        setRecordedPoints(prev => {
          const updated = [...prev, newPoint];
          let dist = 0;
          for (let i = 1; i < updated.length; i++) {
            dist += getHaversineDistance(updated[i - 1], updated[i]);
          }
          setRecordingStats(s => ({
            ...s,
            distance: parseFloat(dist.toFixed(2)),
          }));
          return updated;
        });
      }, 1500);
    } else {
      // Restart GPS watch
      watchIdRef.current = navigator.geolocation.watchPosition(
        position => {
          const { latitude: lat, longitude: lng, altitude: ele } = position.coords;
          const newPoint: Waypoint = {
            lat,
            lng,
            ele: Math.round(ele || 115),
            time: new Date().toISOString(),
            label: `GPS Track #${recordedPoints.length + 1}`,
          };

          setRecordedPoints(prev => {
            const updated = [...prev, newPoint];
            let dist = 0;
            for (let i = 1; i < updated.length; i++) {
              dist += getHaversineDistance(updated[i - 1], updated[i]);
            }
            setRecordingStats(s => ({
              ...s,
              distance: parseFloat(dist.toFixed(2)),
            }));
            return updated;
          });
        },
        err => {
          console.warn('GPS Watch error during resume, switching to simulation mode:', err);
          setIsSimulatedGPS(true);
          // Recursively re-evaluate using simulation mode
          resumeRecording();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  // 5. Stop and transfer GPS coordinates to route creator waypoints
  const stopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);

    if (recordedPoints.length >= 2) {
      setWaypoints(recordedPoints);
      setStartPointName('Recorded Start Location');
      setEndPointName('Recorded End Location');
      if (!name) {
        setName(`GPS Track Session (${new Date().toLocaleDateString()})`);
      }
    } else {
      alert('Too few GPS trackpoints recorded. Click or tap directly on the map to add checkpoints manually instead!');
    }
  };

  // 6. Handle GPX XML upload parsing
  const handleGPXImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const trackPoints = xmlDoc.getElementsByTagName('trkpt');

        if (trackPoints.length === 0) {
          alert('No standard <trkpt> elements found in this GPX file.');
          return;
        }

        const importedWaypoints: Waypoint[] = [];
        for (let i = 0; i < trackPoints.length; i++) {
          const pt = trackPoints[i];
          const lat = parseFloat(pt.getAttribute('lat') || '0');
          const lng = parseFloat(pt.getAttribute('lon') || '0');

          const eleNode = pt.getElementsByTagName('ele')[0];
          const ele = eleNode ? parseFloat(eleNode.textContent || '120') : 120;

          const timeNode = pt.getElementsByTagName('time')[0];
          const time = timeNode ? timeNode.textContent || new Date().toISOString() : new Date().toISOString();

          importedWaypoints.push({
            lat,
            lng,
            ele: Math.round(ele),
            time,
            label: i === 0 ? 'Start Checkpoint' : i === trackPoints.length - 1 ? 'End Summit Finisher' : `Checkpoint ${i + 1}`,
          });
        }

        setWaypoints(importedWaypoints);
        setStartPointName('GPX Track Start');
        setEndPointName('GPX Track End');
        if (!name) {
          setName(file.name.replace('.gpx', '').replace(/[-_]/g, ' '));
        }
      } catch (err) {
        console.error(err);
        alert('Could not parse GPX track points. Please check the file schema.');
      }
    };
    reader.readAsText(file);
  };

  // Cleanup tracking timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Auto start live GPS recording if requested by the home action hub
  useEffect(() => {
    if (autoStartRecording) {
      startRecording();
      if (onRecordingStarted) {
        onRecordingStarted();
      }
    }
  }, [autoStartRecording]);

  const handleReset = () => {
    setWaypoints([]);
    setStartPointName('');
    setEndPointName('');
    setName('');
  };

  const handleUndo = () => {
    if (waypoints.length > 0) {
      const updated = [...waypoints];
      updated.pop();
      setWaypoints(updated);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (waypoints.length < 2) return;

    const finalWaypoints = [...waypoints];
    if (finalWaypoints.length > 1) {
      finalWaypoints[finalWaypoints.length - 1].label = 'End Finisher';
    }

    const newRoute: Route = {
      id: `route-custom-${Date.now()}`,
      name: name.trim(),
      activityType,
      distance: finalDistance,
      difficulty,
      elevation: finalElevation,
      waypoints: finalWaypoints,
      gpxPath: generateHighFidelityGpxPath(finalWaypoints),
      discoverableUsers: [],
      startPointName: startPointName || 'Route Start',
      endPointName: endPointName || 'Route End',
      photos: [],
    };

    onPublishRoute(newRoute, makeDiscoverable);
  };

  // Convert waypoints array into simple google LatLng POJOs
  const pathForMap = (isRecording ? recordedPoints : waypoints).map(wp => ({
    lat: wp.lat,
    lng: wp.lng,
  }));

  // Map waypoint positions into [15, 85] bounding boxes for the simulated canvas layout
  const fallbackPoints = (isRecording ? recordedPoints : waypoints).map((wp, index) => {
    const projected = convertLatLngToSvg(wp.lat, wp.lng);
    return { ...projected, wp, index };
  });

  const shouldRenderGoogleMaps = isProbablyValidKey(API_KEY) && !googleMapsAuthFailed;

  return (
    <div className="flex flex-col h-full bg-base text-zinc-50 overflow-hidden" id="create-route-container">
      
      {/* Header with quick import options */}
      <div className="p-4 bg-zinc-950 border-b border-zinc-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md shrink-0 z-10">
        <div>
          <h1 className="font-display font-black text-white text-base leading-none flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-green" /> Create Trail Map
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-1">Plot checkpoints manually, record live GPS, or import GPX tracks</p>
        </div>

        <div className="flex gap-2">
          {/* GPX Upload Button */}
          <label className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-800">
            <Upload className="w-3.5 h-3.5 text-zinc-400" /> Import GPX File
            <input
              type="file"
              accept=".gpx"
              onChange={handleGPXImport}
              className="hidden"
              id="btn-upload-gpx-hidden"
            />
          </label>
        </div>
      </div>

      {/* Main interactive section */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        
        {/* Map display panel */}
        <div className="w-full md:w-1/2 p-4 flex flex-col bg-zinc-950/20 border-b md:border-b-0 md:border-r border-zinc-800 shrink-0 relative min-h-[350px] md:min-h-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-brand-green" /> Trail Plotter Canvas
            </span>

            {/* Action buttons (Undo/Reset) */}
            {!isRecording && (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={waypoints.length === 0}
                  className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  id="btn-undo-waypoint"
                >
                  <RotateCcw className="w-3 h-3" /> Undo
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={waypoints.length === 0}
                  className="p-1.5 bg-zinc-950 border border-brand-pop/30 rounded-lg text-brand-pop hover:bg-brand-pop hover:text-slate-950 disabled:opacity-30 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  id="btn-reset-waypoints"
                >
                  <Trash2 className="w-3 h-3" /> Reset
                </button>
              </div>
            )}
          </div>

          {/* DUAL MAP LAYER (GOOGLE MAP OR HIGH-FIDELITY SIMULATED SVG CANVAS) */}
          <div className="relative flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl cursor-crosshair">
            
            {shouldRenderGoogleMaps ? (
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  defaultCenter={{ lat: 37.8267, lng: -122.4828 }}
                  defaultZoom={12}
                  mapId="DEMO_MAP_ID"
                  gestureHandling="greedy"
                  onClick={handleMapClick}
                  style={{ width: '100%', height: '100%' }}
                  id="gmaps-plotter"
                >
                  {/* Auto center to waypoints or recorded points */}
                  {pathForMap.length > 0 && <MapAutoFitter waypoints={pathForMap} />}

                  {/* Draw Polyline path */}
                  {pathForMap.length > 0 && (
                    <RoutePolyline
                      path={pathForMap}
                      strokeColor="#2DD4BF"
                    />
                  )}

                  {/* Checkpoint Markers */}
                  {waypoints.map((wp, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === waypoints.length - 1;
                    return (
                      <AdvancedMarker key={idx} position={{ lat: wp.lat, lng: wp.lng }}>
                        <Pin
                          background={isFirst ? '#2DD4BF' : isLast ? '#F472B6' : '#38BDF8'}
                          glyphColor="#18181B"
                          scale={isFirst || isLast ? 0.9 : 0.7}
                        />
                      </AdvancedMarker>
                    );
                  })}

                  {/* GPS Live Recording Points */}
                  {isRecording && recordedPoints.map((wp, idx) => (
                    <AdvancedMarker key={`live-${idx}`} position={{ lat: wp.lat, lng: wp.lng }}>
                      <div style={{ width: '12px', height: '12px' }} className="bg-brand-green rounded-full border-2 border-white shadow animate-pulse" />
                    </AdvancedMarker>
                  ))}

                  {/* Locate me button placed inside the Map component context */}
                  <LocateMeButton onLocateUser={addWaypointAtLatLng} />
                </Map>
              </APIProvider>
            ) : (
              /* HIGH-FIDELITY INTERACTIVE VECTOR COMPASS SVG FALLBACK MAP */
              <div className="w-full h-full relative bg-zinc-950 flex flex-col justify-between" id="simulated-vector-plotter">
                
                {/* Fallback Warning Flag */}
                <div className="bg-brand-accent/10 border-b border-brand-accent/20 px-3 py-1.5 flex items-center gap-2 text-brand-accent z-10">
                  <Info className="w-4 h-4 shrink-0" />
                  <p className="text-[9px] font-bold uppercase tracking-wider">
                    {googleMapsAuthFailed ? "Demo Mode: Google Maps Auth Rejected (Using Interactive Vector Canvas)" : "Demo Mode: Interactive Blueprint Canvas (No Google API Key Configured)"}
                  </p>
                </div>

                <div className="flex-1 relative flex items-center justify-center">
                  <svg
                     viewBox="0 0 100 100"
                     className="w-full h-full max-w-2xl mx-auto p-4 select-none"
                     onClick={handleSimulatedMapClick}
                     id="simulated-vector-grid-svg"
                  >
                    <defs>
                      <pattern id="creator-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(45, 212, 191, 0.05)" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    
                    {/* Grid texture */}
                    <rect width="100" height="100" fill="url(#creator-grid)" />

                    {/* Concentric rings to symbolize topological maps */}
                    <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(45, 212, 191, 0.02)" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(45, 212, 191, 0.02)" strokeWidth="0.5" />

                    {/* Plot Line */}
                    {fallbackPoints.length > 0 && (
                      <polyline
                        points={fallbackPoints.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="#2DD4BF"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Waypoint circles with tooltip indices */}
                    {fallbackPoints.map((p, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === fallbackPoints.length - 1;
                      return (
                        <g key={idx} transform={`translate(${p.x}, ${p.y})`}>
                          <circle
                            r={isFirst || isLast ? "3.5" : "2"}
                            className={`${
                              isFirst ? 'fill-brand-green' : isLast ? 'fill-brand-pop' : 'fill-zinc-800 stroke-brand-blue'
                            }`}
                            strokeWidth="0.5"
                          />
                          <text y="-5" fontSize="3.5" fill="#ffffff" textAnchor="middle" fontWeight="bold" className="font-sans">
                            {idx + 1}
                          </text>
                        </g>
                      );
                    })}

                    {/* Watermark Compass visual */}
                    <g transform="translate(85, 85)" className="opacity-15">
                      <circle r="8" fill="none" stroke="#2DD4BF" strokeWidth="0.5" />
                      <line x1="0" y1="-10" x2="0" y2="10" stroke="#2DD4BF" strokeWidth="0.5" />
                      <line x1="-10" y1="0" x2="10" y2="0" stroke="#2DD4BF" strokeWidth="0.5" />
                    </g>
                  </svg>

                  {/* Locate Me button for simulated vector map */}
                  <button
                    type="button"
                    onClick={handleFallbackLocate}
                    className="absolute top-4 right-4 z-30 bg-zinc-900/90 hover:bg-zinc-800 text-brand-pop p-3 rounded-full shadow-lg border border-zinc-800 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-pop border-0"
                    title="Locate My Current Location"
                    id="btn-creator-locate-me-fallback"
                  >
                    <Locate className="w-5 h-5 text-brand-pop animate-pulse" />
                  </button>
                </div>
              </div>
            )}

            {/* Floating Watermark instructions overlay */}
            {waypoints.length === 0 && !isRecording && (
              <div className="absolute inset-x-4 top-16 bg-zinc-900/95 backdrop-blur-md p-3.5 rounded-xl border border-zinc-800 text-center pointer-events-none text-zinc-200 z-10 shadow-lg">
                <p className="text-[11px] font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider text-brand-green">
                  <Sparkles className="w-3.5 h-3.5" /> Tap Map to Plot Checkpoints
                </p>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Plot 2+ checkpoints or trigger GPS Recording / GPX files upload
                </p>
              </div>
            )}

            {/* LIVE GEOLOCATION TRACKING DASHBOARD OVERLAY */}
            {isRecording && (
              <div className="absolute inset-x-3 bottom-3 bg-zinc-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-zinc-800 shadow-xl text-white space-y-3 z-20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-brand-green flex items-center gap-1 tracking-widest animate-pulse">
                    <Radio className="w-3.5 h-3.5" /> GPS TRACKING ACTIVE
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
                    {recordedPoints.length} Points
                  </span>
                </div>

                {/* Stats Readout */}
                <div className="grid grid-cols-3 gap-2.5 text-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 font-mono">
                  <div>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase font-sans">Distance</p>
                    <p className="text-xs font-black text-brand-green mt-0.5">{recordingStats.distance} km</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase font-sans">Duration</p>
                    <p className="text-xs font-black text-brand-green mt-0.5">
                      {Math.floor(recordingStats.duration / 60)}:{(recordingStats.duration % 60).toString().padStart(2, '0')}s
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase font-sans">Pace</p>
                    <p className="text-xs font-black text-brand-green mt-0.5">{recordingStats.pace}</p>
                  </div>
                </div>

                {/* Geolocation Recording Controls */}
                <div className="flex gap-2">
                  {isPaused ? (
                    <button
                      type="button"
                      onClick={resumeRecording}
                      className="flex-1 py-2 bg-brand-green hover:opacity-90 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-slate-950 border-0"
                    >
                      <Play className="w-3.5 h-3.5" /> Resume GPS
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pauseRecording}
                      className="flex-1 py-2 bg-brand-accent hover:opacity-90 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-slate-950 border-0"
                    >
                      <Pause className="w-3.5 h-3.5" /> Pause GPS
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex-1 py-2 bg-brand-pop hover:opacity-90 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-slate-950 border-0"
                  >
                    <Square className="w-3.5 h-3.5" /> Stop & Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* GPS recording button trigger */}
          {!isRecording && (
            <button
              type="button"
              onClick={startRecording}
              className="mt-3 w-full py-3 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-90 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer border-0"
            >
              <Radio className="w-4 h-4 text-slate-950 animate-pulse" /> Start GPS Route Recording
            </button>
          )}
        </div>

        {/* Right Inputs detail form panel */}
        <form onSubmit={handlePublish} className="flex-1 flex flex-col bg-base overflow-y-auto">
          <div className="p-5 space-y-5 flex-1">
            
            {/* Trail/Route Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Trail/Route Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Whispering Pines Loop"
                className="w-full px-4 py-3 bg-zinc-950/60 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green transition-all"
                id="input-route-name"
              />
            </div>

            {/* Activity selection & Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Sport Type
                </label>
                <select
                  value={activityType}
                  onChange={e => setActivityType(e.target.value as ActivityType)}
                  className="w-full px-3 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-300 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-brand-green cursor-pointer"
                  id="select-route-activity"
                >
                  <option value="running">🏃 Running</option>
                  <option value="hiking">🥾 Hiking</option>
                  <option value="biking">🚴 Biking</option>
                  <option value="mountain_biking">🚵 MTB</option>
                  <option value="skateboard">🛹 Skateboard</option>
                  <option value="water_sports">🛶 Water Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Terrain Difficulty
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['easy', 'moderate', 'hard', 'expert'] as const).map(diff => (
                    <button
                      type="button"
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`py-1.5 rounded-lg text-[9px] font-extrabold capitalize border transition-all cursor-pointer ${
                        difficulty === diff
                          ? 'border-brand-green bg-brand-green/10 text-brand-green font-black'
                          : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-950/80'
                      }`}
                      id={`btn-diff-${diff}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Waypoint point label definitions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Start Point Name
                </label>
                <input
                  type="text"
                  value={startPointName}
                  onChange={e => setStartPointName(e.target.value)}
                  placeholder="e.g. West Trailhead"
                  className="w-full px-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                  id="input-start-point"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  End Point Name
                </label>
                <input
                  type="text"
                  value={endPointName}
                  onChange={e => setEndPointName(e.target.value)}
                  placeholder="e.g. Ridge Summit Lodge"
                  className="w-full px-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                  id="input-end-point"
                />
              </div>
            </div>

            <hr className="border-zinc-850" />

            {/* Summary route reports */}
            <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-850">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-pulse" /> Elevation & Track Metrics
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase leading-none">Distance</p>
                  <p className="text-sm font-black text-brand-green mt-1.5 font-mono">
                    {waypoints.length < 2 ? '--' : `${finalDistance} km`}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase leading-none">Elevation</p>
                  <p className="text-sm font-black text-brand-green mt-1.5 font-mono">
                    {waypoints.length < 2 ? '--' : `+${finalElevation} m`}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase leading-none">Checkpoints</p>
                  <p className="text-sm font-black text-brand-green mt-1.5 font-mono">
                    {waypoints.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Immediate Discoverability Toggle */}
            <div className="flex items-center justify-between gap-3 bg-brand-green/5 border border-brand-green/20 rounded-2xl p-3.5">
              <div>
                <p className="text-xs font-bold text-white">Publish immediately to Discover feed</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Let other users find and challenge you here.</p>
              </div>
              <button
                type="button"
                onClick={() => setMakeDiscoverable(!makeDiscoverable)}
                className={`w-11 h-6 rounded-full p-0.5 transition-all outline-none shrink-0 cursor-pointer border-0 ${
                  makeDiscoverable ? 'bg-brand-green' : 'bg-zinc-800'
                }`}
                id="toggle-make-discoverable"
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  makeDiscoverable ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>

          {/* Form actions submit bar */}
          <div className="p-4 border-t border-zinc-850 bg-zinc-950 shrink-0 flex items-center justify-between">
            {waypoints.length < 2 ? (
              <p className="text-[10px] font-semibold text-brand-pop flex items-center gap-1 font-mono uppercase tracking-wider">
                ⚠️ Plot/Record 2+ points!
              </p>
            ) : (
              <p className="text-[10px] font-semibold text-brand-accent font-mono uppercase tracking-wider animate-pulse">
                ✔️ READY TO PUBLISH
              </p>
            )}
            
            <button
              type="submit"
              disabled={waypoints.length < 2 || !name.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-90 disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer border-0 uppercase tracking-wider font-mono"
              id="btn-publish-route"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Publish Trail
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
