import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { trackingAPI, referralAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EmergencyBadge } from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { playAdmissionChime } from '../../utils/audio';
import {
  Ambulance,
  Building2,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ArrowLeft,
  Wifi,
  WifiOff,
  Navigation,
  Activity,
  Phone,
  User,
  Gauge,
  CheckCircle2,
  ExternalLink,
  Layers,
} from 'lucide-react';

// Custom Marker DivIcons with HTML and SVG styling
const createReferringIcon = () =>
  L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background: #0F172A; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; white-space: nowrap; margin-bottom: 4px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); border: 1px solid #334155;">
          🏥 Referring Hospital
        </div>
        <div style="width: 40px; height: 40px; border-radius: 14px; background: #2563EB; border: 2px solid #FFFFFF; box-shadow: 0 10px 15px -3px rgba(37,99,235,0.4); display: flex; align-items: center; justify-content: center; font-size: 20px;">
          🏥
        </div>
        <div style="width: 8px; height: 8px; background: #2563EB; transform: rotate(45deg); margin-top: -4px;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const createAmbulanceIcon = (isMoving = true) =>
  L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background: #DC2626; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 2px 10px; border-radius: 9999px; white-space: nowrap; margin-bottom: 4px; box-shadow: 0 4px 6px -1px rgba(220,38,38,0.4); border: 1px solid #FFFFFF; animation: pulse 1.5s infinite;">
          🚑 Ambulance (Live)
        </div>
        <div style="position: relative;">
          ${
            isMoving
              ? '<span style="position: absolute; inset: -6px; border-radius: 9999px; background: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>'
              : ''
          }
          <div style="width: 46px; height: 46px; border-radius: 16px; background: linear-gradient(135deg, #EF4444, #F59E0B); border: 2px solid #FFFFFF; box-shadow: 0 12px 20px -3px rgba(239,68,68,0.5); display: flex; align-items: center; justify-content: center; font-size: 24px; position: relative; z-index: 10;">
            🚑
          </div>
        </div>
        <div style="width: 10px; height: 10px; background: #EF4444; transform: rotate(45deg); margin-top: -5px; position: relative; z-index: 10;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const createReceivingIcon = () =>
  L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background: #047857; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; white-space: nowrap; margin-bottom: 4px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); border: 1px solid #10B981;">
          🏥 Receiving Hospital
        </div>
        <div style="width: 40px; height: 40px; border-radius: 14px; background: #059669; border: 2px solid #FFFFFF; box-shadow: 0 10px 15px -3px rgba(5,150,105,0.4); display: flex; align-items: center; justify-content: center; font-size: 20px;">
          🏥
        </div>
        <div style="width: 8px; height: 8px; background: #059669; transform: rotate(45deg); margin-top: -4px;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

// Map helper component to handle auto-panning and initial bounds fit
function MapController({ ambulancePos, waypoints, lockOnAmbulance }) {
  const map = useMap();
  const initializedRef = useRef(false);

  // Initial bounds fit
  useEffect(() => {
    if (!initializedRef.current && waypoints && waypoints.length > 1) {
      const leafletPoints = waypoints.map((pt) => [pt[1], pt[0]]);
      const bounds = L.latLngBounds(leafletPoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
      initializedRef.current = true;
    }
  }, [waypoints, map]);

  // Lock and follow ambulance marker
  useEffect(() => {
    if (lockOnAmbulance && ambulancePos) {
      map.panTo([ambulancePos[1], ambulancePos[0]], { animate: true, duration: 1 });
    }
  }, [ambulancePos, lockOnAmbulance, map]);

  return null;
}

const LiveTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tracking, setTracking] = useState(null);
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastUpdateAgo, setLastUpdateAgo] = useState(0);
  const [lockOnAmbulance, setLockOnAmbulance] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const socketRef = useRef(null);
  const timerRef = useRef(null);

  // 1. Fetch initial tracking & referral state
  const loadTrackingData = async () => {
    try {
      setLoading(true);
      const res = await trackingAPI.getTracking(id);
      if (res.data.success) {
        setTracking(res.data.data);
        setReferral(res.data.referral);
        setSimulating(res.data.data.isSimulating || false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize tracking stream.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrackingData();
  }, [id]);

  // 2. Setup Socket.IO connection
  useEffect(() => {
    if (!id) return;

    // Connect to Socket.IO backend on port 5000
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join:referral', id);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    // Real-time location update event
    socket.on('ambulance:location:update', (payload) => {
      setTracking((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentLocation: {
            type: 'Point',
            coordinates: [payload.longitude, payload.latitude],
          },
          distanceRemainingKm: payload.distanceRemainingKm,
          estimatedArrivalMinutes: payload.estimatedArrivalMinutes,
          speedKmh: payload.speedKmh,
          headingDegrees: payload.headingDegrees,
          status: payload.status,
          lastUpdated: payload.lastUpdated,
        };
      });
      setLastUpdateAgo(0);

      // Play chime if status transitioned to Arrived
      if (payload.status === 'Arrived') {
        playAdmissionChime();
      }
    });

    // Real-time status update event
    socket.on('ambulance:status:update', (payload) => {
      setTracking((prev) => (prev ? { ...prev, status: payload.status } : prev));
      if (payload.isSimulating !== undefined) {
        setSimulating(payload.isSimulating);
      }
    });

    return () => {
      socket.emit('leave:referral', id);
      socket.disconnect();
    };
  }, [id]);

  // 3. Last GPS update timer ticker (updates every second)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setLastUpdateAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Simulator controls
  const handleStartSim = async () => {
    try {
      setSimulating(true);
      const res = await trackingAPI.startSimulation(id);
      if (res.data.success) {
        setTracking(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start demo simulation');
      setSimulating(false);
    }
  };

  const handlePauseSim = async () => {
    try {
      setSimulating(false);
      const res = await trackingAPI.pauseSimulation(id);
      if (res.data.success) {
        setTracking(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to pause simulation');
    }
  };

  const handleStepSim = async () => {
    try {
      const res = await trackingAPI.stepSimulation(id);
      if (res.data.success) {
        setTracking(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to step simulation');
    }
  };

  const handleResetSim = async () => {
    try {
      setSimulating(false);
      const res = await trackingAPI.resetSimulation(id);
      if (res.data.success) {
        setTracking(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset simulation');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner message="Connecting to telemetry stream and calculating route..." />
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-navy">{error || 'Tracking Not Found'}</h2>
        <p className="text-xs text-slate-500 mt-2">
          Make sure the referral has been accepted and assigned for transfer.
        </p>
        <button onClick={() => navigate(-1)} className="btn-secondary text-xs mt-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Return to Referral Details
        </button>
      </div>
    );
  }

  // Coordinates formatting
  // GeoJSON is [lng, lat] -> Leaflet requires [lat, lng]
  const ambCoords = tracking.currentLocation?.coordinates;
  const ambLeafletPos = ambCoords ? [ambCoords[1], ambCoords[0]] : [26.8467, 80.9462];

  const refHospCoords = tracking.referringHospital?.coordinates;
  const refHospLeafletPos = refHospCoords ? [refHospCoords[1], refHospCoords[0]] : ambLeafletPos;

  const recHospCoords = tracking.receivingHospital?.coordinates;
  const recHospLeafletPos = recHospCoords ? [recHospCoords[1], recHospCoords[0]] : ambLeafletPos;

  // Convert waypoints array to Leaflet [lat, lng] pairs
  const polylineLeafletPoints = (tracking.routeWaypoints || []).map((pt) => [pt[1], pt[0]]);

  // Status Stepper definition
  const STATUS_STEPS = [
    { key: 'Assigned', label: 'Assigned' },
    { key: 'En Route', label: 'En Route' },
    { key: 'Near Destination', label: 'Near Destination' },
    { key: 'Arrived', label: 'Arrived' },
    { key: 'Transfer Completed', label: 'Completed' },
  ];

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === tracking.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/referrals/${referral?._id || id}`)}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-navy hover:bg-slate-50"
            title="Back to Referral Dossier"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-primary">{tracking.referralCode}</span>
              {referral && <EmergencyBadge level={referral.emergencyLevel} />}
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Live GPS Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Connecting <strong className="text-navy">{tracking.referringHospital?.name || 'Origin Clinic'}</strong> ➔ <strong className="text-navy">{tracking.receivingHospital?.name || 'Destination Hospital'}</strong>
            </p>
          </div>
        </div>

        {/* WebSocket Connection Badge & Return Link */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              socketConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
            }`}
          >
            {socketConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{socketConnected ? '🟢 Live Connected (Socket.IO)' : '🟡 Connecting...'}</span>
          </div>

          <Link
            to={`/referrals/${referral?._id || id}`}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
          >
            <span>Dossier</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Connection Warning Banner if disconnected */}
      {!socketConnected && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Connection interrupted. Retrying live telemetry link... Last location received {lastUpdateAgo} seconds ago.
          </span>
        </div>
      )}

      {/* Main Grid: Map (65-70%) + Information Panel (30-35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map Container */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="card p-0 overflow-hidden border border-slate-200 shadow-xl rounded-3xl relative h-[500px] lg:h-[650px]">
            {/* Map Overlay Badge: Mode Disclaimer */}
            <div className="absolute top-4 left-4 z-[1000] bg-navy/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg border border-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>DEMO GPS — Simulated Location</span>
            </div>

            {/* Map Controls: Lock onto Ambulance */}
            <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLockOnAmbulance(!lockOnAmbulance)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md border transition-all flex items-center gap-1.5 ${
                  lockOnAmbulance
                    ? 'bg-primary text-white border-primary-600 shadow-primary/30'
                    : 'bg-white/90 text-navy border-slate-200 hover:bg-white'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{lockOnAmbulance ? 'Lock: Ambulance' : 'Free Pan'}</span>
              </button>
            </div>

            {/* Bottom Map HUD Pill: Speed & Coords */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold text-navy shadow-md border border-slate-200 flex items-center gap-3">
              <span>GPS: {ambCoords ? `${ambCoords[1].toFixed(4)}°N, ${ambCoords[0].toFixed(4)}°E` : 'Locating...'}</span>
              <span>•</span>
              <span className="text-primary font-bold">Speed: {tracking.speedKmh} km/h</span>
            </div>

            {/* React Leaflet Map */}
            <MapContainer
              center={ambLeafletPos}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Auto Controller */}
              <MapController
                ambulancePos={ambCoords}
                waypoints={tracking.routeWaypoints}
                lockOnAmbulance={lockOnAmbulance}
              />

              {/* Route Polyline */}
              {polylineLeafletPoints.length > 0 && (
                <>
                  {/* Outer glow line */}
                  <Polyline
                    positions={polylineLeafletPoints}
                    color="#2563EB"
                    weight={8}
                    opacity={0.3}
                  />
                  {/* Inner road track line */}
                  <Polyline
                    positions={polylineLeafletPoints}
                    color="#2563EB"
                    weight={4}
                    dashArray="6, 8"
                  />
                </>
              )}

              {/* 1. Referring Hospital Marker */}
              <Marker position={refHospLeafletPos} icon={createReferringIcon()}>
                <Popup>
                  <div className="text-xs p-1">
                    <div className="font-bold text-navy">{tracking.referringHospital?.name || 'Origin Clinic'}</div>
                    <div className="text-[10px] text-slate-500">{tracking.referringHospital?.address || ''}</div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-1">Origin Point</div>
                  </div>
                </Popup>
              </Marker>

              {/* 2. Moving Ambulance Marker */}
              <Marker position={ambLeafletPos} icon={createAmbulanceIcon(tracking.speedKmh > 0)}>
                <Popup>
                  <div className="text-xs p-1">
                    <div className="font-bold text-rose-600">Ambulance {tracking.ambulanceId}</div>
                    <div className="text-[10px] text-slate-500">Lead: {tracking.driverName}</div>
                    <div className="text-[10px] text-navy font-bold mt-1">Speed: {tracking.speedKmh} km/h</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">ETA: {tracking.estimatedArrivalMinutes} min</div>
                  </div>
                </Popup>
              </Marker>

              {/* 3. Receiving Hospital Marker */}
              <Marker position={recHospLeafletPos} icon={createReceivingIcon()}>
                <Popup>
                  <div className="text-xs p-1">
                    <div className="font-bold text-navy">{tracking.receivingHospital?.name || 'Receiving Hospital'}</div>
                    <div className="text-[10px] text-slate-500">{tracking.receivingHospital?.address || ''}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-1">Destination Trauma Bay</div>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* Right Column: Information Panel & Demo Simulator Controls */}
        <div className="lg:col-span-4 space-y-4">
          {/* Ambulance Telemetry & Metrics Card */}
          <div className="card p-5 border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/30">
                  <Ambulance className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-navy">{tracking.ambulanceId}</h3>
                  <p className="text-[11px] text-slate-500">Unit: Advanced Cardiac Life Support</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  tracking.status === 'Arrived' || tracking.status === 'Transfer Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                }`}
              >
                {tracking.status}
              </span>
            </div>

            {/* Key Live Metrics (ETA + Distance) */}
            <div className="grid grid-cols-2 gap-3 my-4">
              {/* ETA */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-3.5 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Estimated Arrival</span>
                </div>
                <div className="text-2xl font-black text-navy flex items-baseline gap-1">
                  <span>{tracking.estimatedArrivalMinutes}</span>
                  <span className="text-xs font-bold text-slate-500">min</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Dynamic estimate based on road speed</p>
              </div>

              {/* Distance Remaining */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50/60 p-3.5 rounded-2xl border border-teal-200">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <Navigation className="w-3.5 h-3.5 text-secondary" />
                  <span>Distance Left</span>
                </div>
                <div className="text-2xl font-black text-navy flex items-baseline gap-1">
                  <span>{tracking.distanceRemainingKm}</span>
                  <span className="text-xs font-bold text-slate-500">km</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">To emergency hospital bay</p>
              </div>
            </div>

            {/* Velocity & Last Updated Bar */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-primary" />
                <span>Speed: <strong className="text-navy">{tracking.speedKmh} km/h</strong></span>
              </div>
              <div className="text-[11px] text-slate-400">
                Updated: <strong className="text-navy">{lastUpdateAgo}s ago</strong>
              </div>
            </div>

            {/* Paramedic Lead Contact */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-semibold text-navy">{tracking.driverName}</div>
                  <div className="text-[10px] text-slate-400">Ambulance Paramedic Officer</div>
                </div>
              </div>
              <a
                href={`tel:${tracking.driverPhone}`}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary transition-colors"
                title="Call Paramedic"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Transfer Status Stepper */}
          <div className="card p-5 border border-slate-200 shadow-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Transfer Milestone Stepper
            </h4>

            <div className="space-y-3">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="flex items-center gap-3 text-xs">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-primary text-white ring-4 ring-primary/20 animate-pulse'
                          : 'bg-slate-100 text-slate-400 border border-slate-300'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>

                    <div className="flex-1">
                      <div
                        className={`font-bold ${
                          isCurrent
                            ? 'text-primary'
                            : isPassed
                            ? 'text-navy'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-[9px] font-bold uppercase bg-primary-50 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Demo GPS Simulator Control Deck */}
          <div className="card p-5 border-2 border-dashed border-amber-300 bg-amber-50/40 rounded-3xl shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                  Demo GPS Simulator
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                Waypoints: {tracking.currentWaypointIndex + 1} / {tracking.routeWaypoints?.length || 25}
              </span>
            </div>

            <p className="text-[11px] text-amber-800 mb-4">
              Simulate an ambulance travelling from {tracking.referringHospital?.name || 'origin facility'} to {tracking.receivingHospital?.name || 'destination hospital'}. Socket.IO synchronizes both doctor and receiving hospital dashboards in real time.
            </p>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {!simulating ? (
                <button
                  type="button"
                  onClick={handleStartSim}
                  disabled={tracking.status === 'Arrived' || tracking.status === 'Transfer Completed'}
                  className="btn-primary text-xs py-2 px-3 flex items-center justify-center gap-1.5 col-span-2 font-bold shadow-md shadow-primary/30"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Demo Tracking</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseSim}
                  className="btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1.5 col-span-2 font-bold bg-amber-600 text-white border-amber-600 hover:bg-amber-700"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause Demo Tracking</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleStepSim}
                disabled={simulating || tracking.status === 'Arrived'}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center justify-center gap-1 text-slate-700 border-slate-300 hover:bg-slate-100"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Step Forward</span>
              </button>

              <button
                type="button"
                onClick={handleResetSim}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center justify-center gap-1 text-slate-700 border-slate-300 hover:bg-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Route</span>
              </button>
            </div>

            <div className="mt-3 pt-2 border-t border-amber-200/80 text-[10px] text-amber-700 flex items-center justify-between">
              <span>Simulation mode active</span>
              <span className="font-semibold">Step Interval: 2.5s</span>
            </div>
          </div>

          {/* Privacy & Safety Disclaimer Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-navy">Privacy Protected Stream</strong>: Patient PII (full name, phone, address, and medical records) is redacted from the public map stream to adhere to HIPAA/DISHA healthcare privacy standards.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
