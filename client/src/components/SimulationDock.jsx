import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { simulationAPI } from '../services/api';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Ambulance,
  Building2,
  Stethoscope,
  ChevronUp,
  ChevronDown,
  Clock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react';

const SimulationDock = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [autopilotActive, setAutopilotActive] = useState(false);
  const [currentStep, setCurrentStep] = useState('IDLE'); // 'IDLE', 'DOCTOR_INTAKE', 'HOSPITAL_TRIAGE', 'IN_TRANSIT', 'COMPLETED', 'REJECTED'
  const [activeCase, setActiveCase] = useState(null);
  const [transitTimer, setTransitTimer] = useState(0);
  const [eventLogs, setEventLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const autopilotRef = useRef(null);

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEventLogs((prev) => [{ text: msg, time, type, id: Math.random() }, ...prev.slice(0, 15)]);
  };

  // 1. Simulate new incoming patient arrival
  const handleSimulateNewPatient = async (shouldReject = false) => {
    try {
      setLoading(true);
      setCurrentStep('DOCTOR_INTAKE');
      addLog('New emergency patient arrived at clinic triage desk...', 'info');

      const res = await simulationAPI.autoGeneratePatient();
      if (res.data.success) {
        const data = res.data.data;
        setActiveCase(data);
        addLog(
          `Dr. Auto-Filled Requirements: ${data.caseTemplate.condition} (${data.caseTemplate.emergencyLevel}). Matched: ${data.topHospital.name} (${data.matchScore}%)`,
          'success'
        );

        // Advance to Hospital Triage stage
        setTimeout(() => {
          handleHospitalTriage(data.referral._id, shouldReject);
        }, 3500);
      }
    } catch (err) {
      addLog('Failed to generate automated patient case.', 'error');
      setCurrentStep('IDLE');
    } finally {
      setLoading(false);
    }
  };

  // 2. Simulate Hospital Decision (Accept or Reject)
  const handleHospitalTriage = async (referralId, shouldReject = false) => {
    setCurrentStep('HOSPITAL_TRIAGE');
    addLog(`Receiving hospital reviewing bed hold and specialist roster...`, 'info');

    try {
      const res = await simulationAPI.advanceStep(referralId, { reject: shouldReject });
      if (res.data.success) {
        const ref = res.data.data;
        if (ref.status === 'Accepted') {
          addLog(`${ref.selectedHospital?.name} ACCEPTED referral! Bed reserved in ${ref.requiredBed} unit.`, 'success');
          // Start Transit phase
          setTimeout(() => {
            handleTransitDispatch(referralId);
          }, 3000);
        } else if (ref.status === 'Rejected') {
          setCurrentStep('REJECTED');
          addLog(`${ref.selectedHospital?.name} DECLINED referral: ${ref.rejectionReason}`, 'error');
          addLog(`Alternative matches computed automatically for doctor!`, 'info');
        }
      }
    } catch (err) {
      addLog('Hospital triage update failed.', 'error');
      setCurrentStep('IDLE');
    }
  };

  // 3. Simulate Ambulance In-Transit countdown
  const handleTransitDispatch = async (referralId) => {
    try {
      const res = await simulationAPI.advanceStep(referralId, { targetStatus: 'Transfer' });
      if (res.data.success) {
        setCurrentStep('IN_TRANSIT');
        setTransitTimer(6); // 6 second live timer
        addLog(`Ambulance en-route with patient. Vital telemetry connected. Transit in progress...`, 'info');
      }
    } catch (err) {
      addLog('Ambulance dispatch step failed.', 'error');
      setCurrentStep('IDLE');
    }
  };

  // Handle countdown timer for transit
  useEffect(() => {
    let interval = null;
    if (currentStep === 'IN_TRANSIT' && transitTimer > 0) {
      interval = setInterval(() => {
        setTransitTimer((prev) => prev - 1);
      }, 1000);
    } else if (currentStep === 'IN_TRANSIT' && transitTimer === 0 && activeCase) {
      // Transit timer finished -> Mark Completed!
      handleCompleteAdmission(activeCase.referral._id);
    }
    return () => clearInterval(interval);
  }, [currentStep, transitTimer, activeCase]);

  // 4. Complete Admission
  const handleCompleteAdmission = async (referralId) => {
    try {
      const res = await simulationAPI.advanceStep(referralId, { targetStatus: 'Completed' });
      if (res.data.success) {
        setCurrentStep('COMPLETED');
        addLog(`Ambulance arrived! Patient safely admitted to Bed #${Math.floor(1 + Math.random() * 20)}. Referral Completed!`, 'success');

        // If autopilot is active, trigger next cycle after delay
        if (autopilotActive) {
          autopilotRef.current = setTimeout(() => {
            handleSimulateNewPatient();
          }, 6000);
        }
      }
    } catch (err) {
      addLog('Admission completion failed.', 'error');
      setCurrentStep('IDLE');
    }
  };

  // Autopilot loop trigger
  const toggleAutopilot = () => {
    const next = !autopilotActive;
    setAutopilotActive(next);
    if (next) {
      addLog('Continuous Autopilot Mode Activated. Simulating live emergency inflow...', 'info');
      handleSimulateNewPatient();
    } else {
      if (autopilotRef.current) clearTimeout(autopilotRef.current);
      addLog('Autopilot Mode Paused.', 'info');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 sm:left-6 z-50">
      {/* Collapsed Pill Button */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-navy hover:bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-2xl border border-slate-700 flex items-center gap-2.5 transition-all hover:scale-105 group animate-in slide-in-from-bottom-4"
        >
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white relative">
            <Zap className="w-3.5 h-3.5" />
            {currentStep !== 'IDLE' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
          </div>
          <div className="text-left text-xs">
            <div className="font-bold flex items-center gap-1.5">
              <span>Live Patient Simulation</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                  currentStep !== 'IDLE'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {currentStep !== 'IDLE' ? currentStep.replace('_', ' ') : 'Ready'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Click to open triage autopilot</div>
          </div>
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white" />
        </button>
      ) : (
        /* Expanded HUD Modal / Dock */
        <div className="bg-navy/95 backdrop-blur-xl text-white rounded-3xl p-5 shadow-2xl border border-slate-700 w-[92vw] sm:w-[500px] animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  <span>Emergency Referral Autopilot</span>
                  <span className="text-[10px] bg-primary/20 text-primary-light px-2 py-0.5 rounded-full border border-primary/40 font-bold">
                    v2.0 Automation
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Simulate incoming patients, doctor intake, hospital acceptance & timed transit.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  navigate('/live-automation');
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-primary-light hover:text-white hover:bg-slate-800 flex items-center gap-1 text-[11px] font-bold"
                title="Open Full Screen Command Center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Command Center</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current Step Progression Bar */}
          <div className="my-4 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
              <span>Referral Automation Stage:</span>
              <span className="text-primary-light font-semibold">
                {currentStep === 'IDLE' && 'Waiting for trigger...'}
                {currentStep === 'DOCTOR_INTAKE' && '1. Doctor Requirements Auto-Filled'}
                {currentStep === 'HOSPITAL_TRIAGE' && '2. Hospital Triage Decision Pending'}
                {currentStep === 'IN_TRANSIT' && `3. Ambulance In-Transit (${transitTimer}s left)`}
                {currentStep === 'COMPLETED' && '4. Admitted & Completed!'}
                {currentStep === 'REJECTED' && 'Declined (Alternatives Displayed)'}
              </span>
            </div>

            {/* Stepper Dots */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div
                className={`py-1.5 rounded-lg border font-bold ${
                  ['DOCTOR_INTAKE', 'HOSPITAL_TRIAGE', 'IN_TRANSIT', 'COMPLETED'].includes(currentStep)
                    ? 'bg-primary/20 border-primary text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-500'
                }`}
              >
                1. Intake
              </div>
              <div
                className={`py-1.5 rounded-lg border font-bold ${
                  ['HOSPITAL_TRIAGE', 'IN_TRANSIT', 'COMPLETED'].includes(currentStep)
                    ? 'bg-primary/20 border-primary text-white'
                    : currentStep === 'REJECTED'
                    ? 'bg-rose-900/30 border-rose-500 text-rose-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-500'
                }`}
              >
                2. Triage
              </div>
              <div
                className={`py-1.5 rounded-lg border font-bold relative overflow-hidden ${
                  ['IN_TRANSIT', 'COMPLETED'].includes(currentStep)
                    ? 'bg-blue-600/30 border-blue-400 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-500'
                }`}
              >
                {currentStep === 'IN_TRANSIT' && (
                  <span className="absolute inset-0 bg-blue-500/20 animate-pulse" />
                )}
                <span>3. Transit {currentStep === 'IN_TRANSIT' ? `(${transitTimer}s)` : ''}</span>
              </div>
              <div
                className={`py-1.5 rounded-lg border font-bold ${
                  currentStep === 'COMPLETED'
                    ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-500'
                }`}
              >
                4. Done
              </div>
            </div>

            {/* In-Transit Progress Bar */}
            {currentStep === 'IN_TRANSIT' && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Ambulance className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
                    Ambulance Transit In Progress
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    00:0{transitTimer}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((6 - transitTimer) / 6) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active Case Info Banner */}
          {activeCase && (
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 mb-3 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>{activeCase.referral.referralId}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                    {activeCase.caseTemplate.condition}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  To: <strong className="text-white">{activeCase.topHospital.name}</strong> ({activeCase.matchScore}% Match)
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigate(`/referrals/${activeCase.referral._id}`);
                  setIsOpen(false);
                }}
                className="btn-secondary text-[11px] px-2.5 py-1 text-white border-slate-600 bg-slate-800 hover:bg-slate-700"
              >
                Inspect Case
              </button>
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-3">
            <button
              type="button"
              disabled={loading || currentStep === 'IN_TRANSIT'}
              onClick={() => handleSimulateNewPatient(false)}
              className="btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Patient</span>
            </button>

            <button
              type="button"
              disabled={loading || currentStep === 'IN_TRANSIT'}
              onClick={() => handleSimulateNewPatient(true)}
              className="btn-danger text-xs py-2 flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Simulate Rejection</span>
            </button>

            <button
              type="button"
              onClick={toggleAutopilot}
              className={`text-xs py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1 ${
                autopilotActive
                  ? 'bg-emerald-600 text-white border-emerald-400 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{autopilotActive ? 'Autopilot ON' : 'Continuous Loop'}</span>
            </button>
          </div>

          {/* Activity Log Feed */}
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Live Simulation Activity Feed</span>
              <span className="text-[9px] text-slate-500">Auto-Refreshed</span>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] font-mono pr-1">
              {eventLogs.length === 0 ? (
                <div className="text-slate-500 text-[10px] italic">Click "Simulate Patient" to begin automated referral flow...</div>
              ) : (
                eventLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-1.5 rounded text-[10px] flex items-start gap-1.5 ${
                      log.type === 'success'
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                        : log.type === 'error'
                        ? 'bg-red-950/40 text-red-300 border border-red-800/50'
                        : 'bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500 flex-shrink-0">{log.time}</span>
                    <span>{log.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationDock;
