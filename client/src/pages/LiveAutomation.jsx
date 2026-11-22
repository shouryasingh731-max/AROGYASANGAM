import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { simulationAPI, hospitalAPI } from '../services/api';
import AmbulanceTransferTracker from '../components/AmbulanceTransferTracker';
import { EmergencyBadge, ReferralStatusBadge } from '../components/StatusBadge';
import MatchingScore from '../components/MatchingScore';
import { playAdmissionChime, playAlertTone } from '../utils/audio';
import {
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Ambulance,
  Building2,
  Stethoscope,
  Heart,
  Wind,
  Activity,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Radio,
  FileText,
  User,
  Bed,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const CLINICAL_PRESETS = [
  {
    condition: 'Acute STEMI (Severe Heart Attack)',
    patientAge: 58,
    patientGender: 'Male',
    emergencyLevel: 'Critical',
    requiredBed: 'ICU',
    requiredSpecialist: 'Cardiologist',
    requiredFacilities: ['Ventilator', 'Operation Theatre', 'ECG'],
    vitals: { hr: 122, bp: '82/50', spo2: 89, temp: '37.2°C' },
    notes: 'Anterior wall STEMI with impending cardiogenic shock. Immediate primary PCI requested.',
  },
  {
    condition: 'Severe Polytrauma (High-Speed Collision)',
    patientAge: 29,
    patientGender: 'Female',
    emergencyLevel: 'Critical',
    requiredBed: 'Emergency',
    requiredSpecialist: 'Surgeon',
    requiredFacilities: ['Operation Theatre', 'CT Scan', 'Blood Bank', 'X-Ray'],
    vitals: { hr: 135, bp: '78/44', spo2: 92, temp: '36.4°C' },
    notes: 'Unstable pelvic fracture and acute intra-abdominal hemorrhage. Trauma surgery ready.',
  },
  {
    condition: 'Acute Ischemic Stroke (Thrombolytic Window)',
    patientAge: 67,
    patientGender: 'Male',
    emergencyLevel: 'Critical',
    requiredBed: 'ICU',
    requiredSpecialist: 'Neurologist',
    requiredFacilities: ['CT Scan', 'MRI', 'ICU', 'Ventilator'],
    vitals: { hr: 94, bp: '185/105', spo2: 97, temp: '36.9°C' },
    notes: 'Left hemiparesis with aphasia. Last known well 60 mins ago. Emergency neuro-intervention required.',
  },
  {
    condition: 'Acute Respiratory Failure / ARDS',
    patientAge: 61,
    patientGender: 'Female',
    emergencyLevel: 'Urgent',
    requiredBed: 'ICU',
    requiredSpecialist: 'Cardiologist',
    requiredFacilities: ['Ventilator', 'ICU', 'ECG'],
    vitals: { hr: 110, bp: '130/85', spo2: 84, temp: '38.6°C' },
    notes: 'Severe hypoxemia refractory to non-invasive ventilation. Invasive mechanical ventilator needed.',
  },
];

const LiveAutomation = () => {
  const navigate = useNavigate();

  // Workflow Stages: 'IDLE' | 'PATIENT_INFLUX' | 'HOSPITAL_TRIAGE' | 'TRANSFER_PROGRESS' | 'COMPLETED' | 'REJECTED'
  const [stage, setStage] = useState('IDLE');
  const [activeCase, setActiveCase] = useState(null);
  const [activeReferral, setActiveReferral] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(CLINICAL_PRESETS[0]);

  // Simulation Configuration
  const [allottedTime, setAllottedTime] = useState(15); // seconds for transfer
  const [autopilotLoop, setAutopilotLoop] = useState(false);
  const [triageCountdown, setTriageCountdown] = useState(0);

  // Platform Metrics Snapshot
  const [liveMetrics, setLiveMetrics] = useState({
    activeReferrals: [],
    inTransitCount: 0,
    acceptedCount: 0,
    completedCount: 0,
  });

  const autopilotTimerRef = useRef(null);

  // Fetch simulation platform metrics
  const fetchMetrics = async () => {
    try {
      const res = await simulationAPI.getStatus();
      if (res.data.success) {
        setLiveMetrics(res.data.data);
      }
    } catch (err) {
      console.debug('Failed to fetch live simulation metrics', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  // 1. INCOMING PATIENT INFLUX & DOCTOR AUTO-FILL
  const handleStartPatientArrival = async (preset = selectedPreset) => {
    try {
      setLoading(true);
      setStage('PATIENT_INFLUX');
      setAlternatives([]);
      playAlertTone(false);

      const res = await simulationAPI.autoGeneratePatient();
      if (res.data.success) {
        const data = res.data.data;
        setActiveCase(data);
        setActiveReferral(data.referral);

        // Advance to Stage 2 (Hospital Triage) after 2.5 seconds to let user view filled requirements
        setTimeout(() => {
          handleEnterHospitalTriage(data.referral);
        }, 2800);
      }
    } catch (err) {
      alert('Failed to simulate patient influx. Please ensure backend is running.');
      setStage('IDLE');
    } finally {
      setLoading(false);
    }
  };

  // 2. HOSPITAL MATCHING & TRIAGE STAGE
  const handleEnterHospitalTriage = (referral) => {
    setStage('HOSPITAL_TRIAGE');
    setTriageCountdown(4); // 4-second review window
  };

  // Countdown for auto triage decision if autopilot is enabled
  useEffect(() => {
    let timer = null;
    if (stage === 'HOSPITAL_TRIAGE' && triageCountdown > 0) {
      timer = setInterval(() => {
        setTriageCountdown((c) => c - 1);
      }, 1000);
    } else if (stage === 'HOSPITAL_TRIAGE' && triageCountdown === 0 && activeReferral) {
      // Auto-accept by default unless user triggered rejection
      handleHospitalDecision(false);
    }
    return () => clearInterval(timer);
  }, [stage, triageCountdown, activeReferral]);

  // Hospital Decision: Accept or Reject
  const handleHospitalDecision = async (shouldReject = false) => {
    if (!activeReferral) return;
    try {
      setLoading(true);
      if (shouldReject) playAlertTone(true);

      const res = await simulationAPI.advanceStep(activeReferral._id, { reject: shouldReject });
      if (res.data.success) {
        const updated = res.data.data;
        setActiveReferral(updated);
        fetchMetrics();

        if (updated.status === 'Accepted') {
          // Advance to Transfer stage
          setStage('TRANSFER_PROGRESS');
        } else if (updated.status === 'Rejected') {
          setStage('REJECTED');
          setAlternatives(res.data.alternativeMatches || []);
        }
      }
    } catch (err) {
      alert('Hospital triage action failed.');
    } finally {
      setLoading(false);
    }
  };

  // Reroute to alternative hospital if rejected
  const handleReroute = async (hospitalId) => {
    if (!activeReferral) return;
    try {
      setLoading(true);
      const res = await simulationAPI.reroute(activeReferral._id, { newHospitalId: hospitalId });
      if (res.data.success) {
        const updated = res.data.data;
        setActiveReferral(updated);
        setStage('HOSPITAL_TRIAGE');
        setTriageCountdown(3);
        fetchMetrics();
      }
    } catch (err) {
      alert('Failed to reroute to alternative hospital.');
    } finally {
      setLoading(false);
    }
  };

  // 3 & 4. TRANSFER DONE -> COMPLETE ADMISSION
  const handleTransferDone = async () => {
    if (!activeReferral) return;
    try {
      setLoading(true);
      const res = await simulationAPI.advanceStep(activeReferral._id, { targetStatus: 'Completed' });
      if (res.data.success) {
        setActiveReferral(res.data.data);
        setStage('COMPLETED');
        playAdmissionChime();
        fetchMetrics();

        // Autopilot continuous loop trigger
        if (autopilotLoop) {
          autopilotTimerRef.current = setTimeout(() => {
            handleStartPatientArrival();
          }, 6000);
        }
      }
    } catch (err) {
      alert('Failed to complete admission.');
    } finally {
      setLoading(false);
    }
  };

  // Reset simulation back to IDLE
  const handleReset = () => {
    if (autopilotTimerRef.current) clearTimeout(autopilotTimerRef.current);
    setStage('IDLE');
    setActiveCase(null);
    setActiveReferral(null);
    setAlternatives([]);
    setTriageCountdown(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-navy via-slate-900 to-primary p-6 sm:p-8 text-white shadow-2xl overflow-hidden mb-8">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 top-0 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-950/60 px-3 py-0.5 rounded-full border border-emerald-500/30">
                Live Automation Engine
              </span>
              <span className="text-xs text-slate-300 font-semibold">• High-Speed Referral Lifecycle</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Emergency Referral & Transfer Command Center
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Watch the complete automated pipeline: New patient arrives ➔ Doctor requirements auto-fill ➔ Hospital smart-match ➔ Desk accepts/rejects ➔ Ambulance transit tracker with live telemetry ➔ Allotted time completes into bed admission!
            </p>
          </div>

          {/* Configuration Controls Bar */}
          <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 flex flex-wrap items-center gap-4 text-xs">
            {/* Allotted Transit Time Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Allotted Transfer Duration:
              </label>
              <div className="flex items-center gap-1">
                {[8, 15, 30].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setAllottedTime(sec)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      allottedTime === sec
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {sec}s {sec === 8 ? '(Fast)' : sec === 15 ? '(Std)' : '(Real)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Continuous Autopilot Toggle */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Looping Mode:
              </label>
              <button
                type="button"
                onClick={() => setAutopilotLoop(!autopilotLoop)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border transition-all ${
                  autopilotLoop
                    ? 'bg-emerald-600 text-white border-emerald-400 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{autopilotLoop ? 'Autopilot ON' : 'Single Run'}</span>
              </button>
            </div>

            {/* Main Action Triggers */}
            <div className="pt-2 sm:pt-0 flex items-center gap-2">
              <button
                type="button"
                disabled={loading || stage === 'TRANSFER_PROGRESS'}
                onClick={() => handleStartPatientArrival(selectedPreset)}
                className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 font-bold shadow-lg shadow-primary/30"
              >
                <Play className="w-4 h-4" />
                <span>Simulate New Patient</span>
              </button>

              {stage !== 'IDLE' && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary text-xs py-2.5 px-3 border-slate-600 text-slate-300 hover:text-white"
                  title="Reset Simulation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live System Counter Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-navy">{liveMetrics.activeReferrals?.length || 0}</div>
            <div className="text-xs text-slate-500 font-medium">Active Pipelines</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Ambulance className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xl font-black text-navy">{liveMetrics.inTransitCount || 0}</div>
            <div className="text-xs text-slate-500 font-medium">In-Transit Units</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-navy">{liveMetrics.completedCount || 0}</div>
            <div className="text-xs text-slate-500 font-medium">Admitted / Completed</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-navy">8 / 8</div>
            <div className="text-xs text-slate-500 font-medium">Hospitals Connected</div>
          </div>
        </div>
      </div>

      {/* 4-Stage Stepper Progress Indicator */}
      <div className="card p-4 sm:p-6 mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3">
          <span className="uppercase tracking-wider">Automated Referral Progression Bar:</span>
          <span className="text-primary font-bold">
            {stage === 'IDLE' && 'Stage 0: Ready for incoming patient arrival'}
            {stage === 'PATIENT_INFLUX' && 'Stage 1: Patient arrival & Doctor clinical requirements auto-fill'}
            {stage === 'HOSPITAL_TRIAGE' && `Stage 2: Receiving Hospital reviewing bed & specialist... (${triageCountdown}s)`}
            {stage === 'TRANSFER_PROGRESS' && 'Stage 3: Patient on-board ambulance en route with telemetry stream'}
            {stage === 'COMPLETED' && 'Stage 4: Transfer completed — Bed allocated & admitted!'}
            {stage === 'REJECTED' && 'Hospital capacity surge: Rejection failover triggered!'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              ['PATIENT_INFLUX', 'HOSPITAL_TRIAGE', 'TRANSFER_PROGRESS', 'COMPLETED'].includes(stage)
                ? 'bg-primary-50 border-primary text-primary'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span className="font-bold text-xs text-navy">Patient Influx & Intake</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 pl-8">Dr. fills clinical requirements</p>
          </div>

          {/* Step 2 */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              ['HOSPITAL_TRIAGE', 'TRANSFER_PROGRESS', 'COMPLETED'].includes(stage)
                ? 'bg-primary-50 border-primary text-primary'
                : stage === 'REJECTED'
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center ${
                stage === 'REJECTED' ? 'bg-rose-600' : 'bg-primary'
              }`}>
                2
              </span>
              <span className="font-bold text-xs text-navy">Hospital Accept / Reject</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 pl-8">
              {stage === 'REJECTED' ? 'Declined ➔ Rerouting' : 'Bed reservation check'}
            </p>
          </div>

          {/* Step 3 */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              ['TRANSFER_PROGRESS', 'COMPLETED'].includes(stage)
                ? 'bg-primary-50 border-primary text-primary'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span className="font-bold text-xs text-navy">Ambulance Transfer</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 pl-8">Live countdown telemetry</p>
          </div>

          {/* Step 4 */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              stage === 'COMPLETED'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center ${
                stage === 'COMPLETED' ? 'bg-emerald-600' : 'bg-slate-400'
              }`}>
                4
              </span>
              <span className="font-bold text-xs text-navy">Admitted & Done</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 pl-8">Bed occupied & timeline sealed</p>
          </div>
        </div>
      </div>

      {/* Preset Condition Selector Bar (For Doctor Triage Demonstration) */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          <span>Select Clinical Emergency Case to Trigger:</span>
          <span className="text-slate-400">Click to run immediately</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CLINICAL_PRESETS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSelectedPreset(preset);
                handleStartPatientArrival(preset);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all group ${
                selectedPreset.condition === preset.condition
                  ? 'bg-white border-primary shadow-md ring-2 ring-primary/20'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-navy group-hover:text-primary transition-colors">
                  {preset.condition}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  preset.emergencyLevel === 'Critical'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {preset.emergencyLevel}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                Requires: <strong>{preset.requiredBed}</strong> • {preset.requiredSpecialist}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>SpO2: {preset.vitals.spo2}%</span>
                <span>HR: {preset.vitals.hr} bpm</span>
                <span className="text-primary font-bold flex items-center gap-0.5">
                  Simulate <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN DYNAMIC INTERACTIVE DISPLAY AREA */}
      {stage === 'IDLE' ? (
        /* IDLE STATE: CALL TO ACTION */
        <div className="card p-12 text-center border-dashed border-2 border-slate-300">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-primary flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Zap className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-xl font-black text-navy mb-2">
            Automated Emergency Pipeline Is Ready
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto mb-6">
            Click <strong>"Simulate New Patient"</strong> or select one of the emergency cases above. You will see the doctor form fill up with patient requirements, hospital matching, live accept/reject review, and the ambulance transit with real-time countdown!
          </p>
          <button
            type="button"
            onClick={() => handleStartPatientArrival(selectedPreset)}
            className="btn-primary text-sm px-6 py-3 font-bold shadow-xl shadow-primary/25 inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>Launch Simulation Now</span>
          </button>
        </div>
      ) : (
        /* ACTIVE PIPELINE STAGES */
        <div className="space-y-6">
          {/* STAGE 1: PATIENT ARRIVAL & DR. CLINICAL REQUIREMENTS */}
          <div className="card p-6 border-l-4 border-l-primary shadow-lg animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-navy">
                      Emergency Clinical Intake & Doctor Requirements
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {activeReferral?.referralId || 'REF-AUTO-2026'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Patient Reference: <strong>{activeReferral?.patientReference || 'PAT-AUTO-9412'}</strong> • Dr. Arjun Mehta (Referring Triage Specialist)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <EmergencyBadge level={activeReferral?.emergencyLevel || selectedPreset.emergencyLevel} />
                <ReferralStatusBadge status={activeReferral?.status || 'Pending'} />
              </div>
            </div>

            {/* Clinical Requirements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              {/* Patient Profile */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> Patient Demographics
                </div>
                <div className="text-sm font-bold text-navy mb-1">
                  {selectedPreset.condition}
                </div>
                <div className="text-xs text-slate-600">
                  Age: <strong>{activeReferral?.patientAge || selectedPreset.patientAge} yrs</strong> • Gender: <strong>{activeReferral?.patientGender || selectedPreset.patientGender}</strong>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 italic bg-white p-2 rounded-lg border border-slate-200">
                  "{activeReferral?.notes || selectedPreset.notes}"
                </p>
              </div>

              {/* Triage Requirements Filled by Doctor */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-primary" /> Clinical Requirements Needed
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Required Bed:</span>
                    <span className="font-bold text-primary bg-primary-50 px-2 py-0.5 rounded border border-primary/20">
                      {activeReferral?.requiredBed || selectedPreset.requiredBed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Required Specialist:</span>
                    <span className="font-bold text-navy">
                      {activeReferral?.requiredSpecialist || selectedPreset.requiredSpecialist}
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 block mb-1">Essential Facilities:</span>
                    <div className="flex flex-wrap gap-1">
                      {(activeReferral?.requiredFacilities || selectedPreset.requiredFacilities).map((fac, idx) => (
                        <span key={idx} className="text-[10px] bg-white border border-slate-300 font-semibold px-2 py-0.5 rounded-full text-slate-700">
                          ✓ {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Triage Vitals Monitor */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Live Triage Telemetry
                  </span>
                  <span className="font-mono text-[10px]">MONITOR</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">HEART RATE</span>
                    <div className="text-lg font-mono font-black text-rose-400">{selectedPreset.vitals.hr} BPM</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">BLOOD PRESSURE</span>
                    <div className="text-lg font-mono font-black text-white">{selectedPreset.vitals.bp}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">OXYGEN (SPO2)</span>
                    <div className="text-lg font-mono font-black text-cyan-400">{selectedPreset.vitals.spo2}%</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">BODY TEMP</span>
                    <div className="text-lg font-mono font-black text-amber-300">{selectedPreset.vitals.temp}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STAGE 2: HOSPITAL MATCHING & ACCEPT / REJECT DESK */}
          {['HOSPITAL_TRIAGE', 'TRANSFER_PROGRESS', 'COMPLETED', 'REJECTED'].includes(stage) && (
            <div className={`card p-6 border-l-4 shadow-lg transition-all ${
              stage === 'REJECTED'
                ? 'border-l-rose-500 bg-rose-50/40'
                : 'border-l-teal-500 bg-white'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-secondary" />
                    <h3 className="text-base font-bold text-navy">
                      Receiving Hospital Desk Review: <span className="text-primary">{activeReferral?.selectedHospital?.name || activeCase?.topHospital?.name}</span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Match Score: <strong className="text-emerald-600 font-bold">{activeCase?.matchScore || 94}%</strong> based on {activeReferral?.requiredBed} availability, specialist on duty & distance.
                  </p>
                </div>

                {/* Stage 2 Action Decision Controls */}
                <div className="flex items-center gap-2">
                  {stage === 'HOSPITAL_TRIAGE' && (
                    <>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleHospitalDecision(true)}
                        className="btn-danger text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Simulate Reject (Full)</span>
                      </button>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleHospitalDecision(false)}
                        className="btn-success text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm font-bold"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Bed ({triageCountdown}s)</span>
                      </button>
                    </>
                  )}

                  {stage === 'REJECTED' && (
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                      Referral Declined by Receiving Desk
                    </span>
                  )}

                  {['TRANSFER_PROGRESS', 'COMPLETED'].includes(stage) && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Bed Accepted & Reserved
                    </span>
                  )}
                </div>
              </div>

              {/* If Rejected: Show Rejection Banner + Alternative Hospitals Reroute */}
              {stage === 'REJECTED' && (
                <div className="mt-4 p-4 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold">
                        Declined Reason: {activeReferral?.rejectionReason || 'ICU Beds currently at 100% occupancy.'}
                      </h4>
                      <p className="text-xs text-rose-700 mt-0.5">
                        SmartCare automated failover triggered! Instant alternative recommendations found. Select a backup hospital to reroute:
                      </p>
                    </div>
                  </div>

                  {/* Alternative Hospitals Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    {alternatives.length > 0 ? (
                      alternatives.map((alt) => (
                        <div
                          key={alt.hospital._id}
                          className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs text-navy">{alt.hospital.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Match Score: <strong className="text-primary">{alt.matchScore}%</strong>
                            </div>
                            <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                              ✓ {alt.hospital.beds?.[activeReferral.requiredBed?.toLowerCase()]?.available || 2} {activeReferral.requiredBed} beds available
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleReroute(alt.hospital._id)}
                            className="mt-3 btn-primary text-xs py-1.5 w-full flex items-center justify-center gap-1 font-bold"
                          >
                            <span>Reroute to This Hospital</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-xs text-slate-600 text-center py-2">
                        Computing backup hospitals...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STAGE 3: INTERACTIVE AMBULANCE TRANSFER TELEMETRY */}
          {['TRANSFER_PROGRESS', 'COMPLETED'].includes(stage) && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <AmbulanceTransferTracker
                referral={activeReferral}
                allottedSeconds={allottedTime}
                onComplete={handleTransferDone}
                autoComplete={true}
              />
            </div>
          )}

          {/* STAGE 4: ALLOTTED TIME DONE -> COMPLETED SUMMARY */}
          {stage === 'COMPLETED' && (
            <div className="card p-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-emerald-400 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-navy mb-1">
                Patient Successfully Admitted!
              </h3>
              <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6">
                Allotted transit time has finished. Clinical handoff completed at <strong>{activeReferral?.selectedHospital?.name}</strong>. Patient safely checked into <strong>Bed #{Math.floor(1 + Math.random() * 15)} ({activeReferral?.requiredBed} Wing)</strong>.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to={`/referrals/${activeReferral?._id}`}
                  className="btn-primary text-xs px-5 py-2.5 font-bold inline-flex items-center gap-2 shadow-lg shadow-primary/25"
                >
                  <FileText className="w-4 h-4" />
                  <span>Inspect Complete Referral Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleStartPatientArrival(selectedPreset)}
                  className="btn-secondary text-xs px-5 py-2.5 font-bold border-slate-300 text-navy hover:bg-slate-100"
                >
                  Run Next Patient Simulation →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveAutomation;
