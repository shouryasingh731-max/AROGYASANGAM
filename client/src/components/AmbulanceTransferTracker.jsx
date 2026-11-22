import React, { useState, useEffect, useRef } from 'react';
import {
  Ambulance,
  Activity,
  Heart,
  Wind,
  Gauge,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Radio,
  Zap,
  FastForward,
  AlertTriangle,
} from 'lucide-react';
import { playAdmissionChime } from '../utils/audio';

const AmbulanceTransferTracker = ({
  referral,
  allottedSeconds = 15,
  onComplete,
  autoComplete = true,
}) => {
  const [timeLeft, setTimeLeft] = useState(allottedSeconds);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [distanceLeft, setDistanceLeft] = useState(12.4);
  const [speedKmh, setSpeedKmh] = useState(68);
  const [heartRate, setHeartRate] = useState(104);
  const [oxygenSat, setOxygenSat] = useState(96);
  const [isCompleted, setIsCompleted] = useState(false);
  const [emtLog, setEmtLog] = useState([
    { time: 'T-00:00', text: 'Ambulance ACLS-04 dispatched from Referral Clinic' },
    { time: 'T-00:02', text: 'Patient boarded. Paramedics secured IV lines and 100% O2.' },
  ]);

  const timerRef = useRef(null);

  // Sync timeLeft when allottedSeconds changes
  useEffect(() => {
    setTimeLeft(allottedSeconds);
    setIsCompleted(false);
  }, [allottedSeconds]);

  // Main countdown timer loop with speedMultiplier
  useEffect(() => {
    if (isCompleted || timeLeft <= 0) return;

    const intervalMs = 1000 / speedMultiplier;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinishTransit();
          return 0;
        }

        // Live jitter/simulation values for realism
        const fractionRemaining = (prev - 1) / allottedSeconds;
        setDistanceLeft(Math.max(0, +(fractionRemaining * 12.4).toFixed(1)));
        setSpeedKmh(Math.floor(62 + Math.random() * 15));
        setHeartRate(Math.floor(98 + Math.random() * 8));
        setOxygenSat(Math.min(100, Math.floor(96 + Math.random() * 3)));

        // Radio logs based on milestone percentages
        if (fractionRemaining < 0.65 && fractionRemaining > 0.6) {
          setEmtLog((l) => [
            ...l,
            { time: 'En-Route', text: 'Approaching Shaheed Path flyover. Green corridor active.' },
          ]);
        }
        if (fractionRemaining < 0.3 && fractionRemaining > 0.25) {
          setEmtLog((l) => [
            ...l,
            { time: 'Approaching', text: '2 km to destination ER Bay. Trauma team notified.' },
          ]);
        }

        return prev - 1;
      });
    }, intervalMs);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, speedMultiplier, isCompleted, allottedSeconds]);

  const handleFinishTransit = () => {
    setIsCompleted(true);
    setDistanceLeft(0);
    setSpeedKmh(0);
    playAdmissionChime();
    setEmtLog((l) => [
      ...l,
      { time: 'Arrived', text: 'Ambulance docked at Emergency Bay. Clinical handover in progress.' },
    ]);

    if (autoComplete && onComplete) {
      setTimeout(() => {
        onComplete();
      }, 900);
    }
  };

  const handleFastForward = () => {
    setTimeLeft(0);
    handleFinishTransit();
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((allottedSeconds - timeLeft) / allottedSeconds) * 100))
  );

  return (
    <div className="bg-gradient-to-br from-slate-900 via-navy to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-700/80 overflow-hidden relative">
      {/* Background glowing radar grid */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white shadow-lg shadow-primary/30 relative">
            <Ambulance className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-wide">
                Live Transfer In-Transit Telemetry
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Code Blue Corridor
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Unit: <strong className="text-slate-200">ACLS-UP-32-404</strong></span>
              <span>•</span>
              <span>Receiving: <strong className="text-primary-light">{referral?.selectedHospital?.name || 'Destination Hospital'}</strong></span>
            </p>
          </div>
        </div>

        {/* Speed Controls & Skip */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
            {[1, 2, 5].map((mult) => (
              <button
                key={mult}
                type="button"
                onClick={() => setSpeedMultiplier(mult)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  speedMultiplier === mult
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mult}x
              </button>
            ))}
          </div>

          {!isCompleted && (
            <button
              type="button"
              onClick={handleFastForward}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all hover:scale-105"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Arrive Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Road / Radar Corridor */}
      <div className="my-6 relative z-10">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Source Triage Clinic</span>
          </span>
          <span className="font-mono text-amber-400 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
            {isCompleted ? 'ARRIVED AT DESTINATION' : `ETA: 00:${String(timeLeft).padStart(2, '0')} (${distanceLeft} km)`}
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{referral?.selectedHospital?.name || 'Emergency Trauma Center'}</span>
          </span>
        </div>

        {/* Animated Transit Highway Track */}
        <div className="relative h-14 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center px-4 overflow-hidden shadow-inner">
          {/* Road center dash marks */}
          <div className="absolute inset-x-0 h-0.5 border-b border-dashed border-slate-700/60" />

          {/* Progress filled road glow */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-900/40 via-primary/30 to-emerald-500/30 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Moving Ambulance Beacon */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-linear flex items-center gap-1"
            style={{ left: `calc(${Math.min(92, Math.max(3, progressPercent))}% - 24px)` }}
          >
            <div className="relative group cursor-pointer">
              <div className="w-12 h-10 rounded-xl bg-gradient-to-r from-primary to-blue-600 border border-blue-300 flex items-center justify-center text-white shadow-xl shadow-primary/60 animate-bounce">
                <Ambulance className="w-5 h-5 text-white" />
              </div>
              {/* Telemetry pulse ring */}
              <span className="absolute -inset-1 rounded-xl bg-primary/40 animate-ping pointer-events-none" />
            </div>
          </div>

          {/* Source node */}
          <div className="absolute left-3 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm flex items-center justify-center" />
          {/* Destination node */}
          <div className={`absolute right-3 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
            isCompleted ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'
          }`} />
        </div>

        {/* Progress % and Status subline */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
          <span>Transfer progress: <strong className="text-white">{progressPercent}%</strong></span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>High-Speed Traffic Corridor Cleared</span>
          </span>
          <span>Speed: <strong className="text-white">{speedKmh} km/h</strong></span>
        </div>
      </div>

      {/* Telemetry Grid (Vitals + Status) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 relative z-10">
        {/* Heart Rate */}
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Pulse
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">BPM</span>
          </div>
          <div className="text-xl font-black text-white flex items-baseline gap-1">
            <span>{isCompleted ? 82 : heartRate}</span>
            <span className="text-[10px] text-slate-400 font-normal">Normal Sinus</span>
          </div>
          {/* Animated SVG ECG Wave */}
          <svg className="w-full h-5 mt-1 text-rose-500 stroke-current fill-none stroke-[1.5]" viewBox="0 0 100 20">
            <path d="M0 10 L25 10 L30 3 L35 18 L40 7 L45 12 L50 10 L100 10" />
          </svg>
        </div>

        {/* SpO2 Oxygen */}
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" /> SpO2
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">% Sat</span>
          </div>
          <div className="text-xl font-black text-white flex items-baseline gap-1">
            <span>{isCompleted ? 99 : oxygenSat}%</span>
            <span className="text-[10px] text-cyan-300 font-normal">High-Flow O2</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${oxygenSat}%` }} />
          </div>
        </div>

        {/* Speedometer */}
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" /> Velocity
            </span>
            <span className="text-[10px] text-amber-400 font-mono">GPS</span>
          </div>
          <div className="text-xl font-black text-white flex items-baseline gap-1">
            <span>{speedKmh}</span>
            <span className="text-[10px] text-slate-400 font-normal">km/h</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 truncate">
            {isCompleted ? 'Docked at Bay' : 'Highway Transit'}
          </div>
        </div>

        {/* Remaining Countdown Timer */}
        <div className={`backdrop-blur rounded-2xl p-3 border transition-all ${
          isCompleted
            ? 'bg-emerald-950/50 border-emerald-500/60'
            : 'bg-primary/20 border-primary/50'
        }`}>
          <div className="flex items-center justify-between text-slate-300 text-[11px] mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary-light" /> Time Left
            </span>
            <span className="text-[10px] font-mono text-primary-light font-bold">COUNTDOWN</span>
          </div>
          <div className="text-xl font-black font-mono tracking-tight flex items-baseline gap-1 text-white">
            <span>00:{String(timeLeft).padStart(2, '0')}</span>
            <span className="text-[10px] font-normal text-slate-400">sec</span>
          </div>
          <div className="text-[10px] text-slate-300 mt-2 font-semibold truncate">
            {isCompleted ? '✓ Admission Initiated' : 'Auto-completes at 00:00'}
          </div>
        </div>
      </div>

      {/* Paramedic EMT Radio Log Stream */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 relative z-10">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-primary-light animate-pulse" />
            <span>Paramedic Telemetry & Dispatch Log</span>
          </span>
          <span className="text-[10px] text-slate-500">Live Web-Socket Feed</span>
        </div>
        <div className="bg-slate-950/60 rounded-xl p-3 max-h-24 overflow-y-auto space-y-1.5 border border-slate-800/70 font-mono text-[11px]">
          {emtLog.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-slate-500 text-[10px] flex-shrink-0 font-bold">{item.time}:</span>
              <span className={idx === emtLog.length - 1 ? 'text-emerald-300 font-semibold' : 'text-slate-300'}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-slate-900 border border-emerald-500/80 flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-300 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-300">
                Allotted Transfer Time Finished — Patient Successfully Admitted!
              </h4>
              <p className="text-xs text-slate-300">
                Bed allocated in {referral?.requiredBed || 'ICU'} Wing. Referral record transitioned to <span className="font-bold text-emerald-400">Completed</span>.
              </p>
            </div>
          </div>
          {onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="btn-success text-xs px-4 py-2 font-bold shadow-lg shadow-emerald-900/40"
            >
              Confirm Admission
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AmbulanceTransferTracker;
