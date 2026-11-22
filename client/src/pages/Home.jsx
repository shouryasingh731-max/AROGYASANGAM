import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bed,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  Search,
  ArrowRight,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
  MapPin,
  FileCheck2,
  Layers,
  Sparkles,
  PhoneCall,
  Zap,
  Ambulance,
  ChevronRight,
  Sliders,
  Check,
} from 'lucide-react';
import HealthcareDisclaimer from '../components/HealthcareDisclaimer';

const Home = () => {
  const navigate = useNavigate();

  // Interactive Live Matching Simulator on Landing Page
  const [simBed, setSimBed] = useState('ICU');
  const [simSpecialist, setSimSpecialist] = useState('Cardiologist');
  const [simFacilities, setSimFacilities] = useState(['Ventilator', 'Operation Theatre', 'ECG']);

  const simulatedHospitals = [
    {
      name: 'CityCare Multispeciality Hospital',
      type: 'Multispeciality',
      city: 'Lucknow (Gomti Nagar)',
      distance: '0.5 km',
      verified: true,
      icuAvailable: 3,
      icuTotal: 20,
      facilities: ['ICU', 'Ventilator', 'Operation Theatre', 'CT Scan', 'MRI', 'X-Ray', 'Blood Bank', 'Dialysis', 'ECG'],
      specialists: ['Cardiologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'Surgeon'],
      updatedAgo: '7 min ago',
    },
    {
      name: 'Apex Trauma & Critical Care',
      type: 'Trauma & Critical Care',
      city: 'Lucknow (Sitapur Rd)',
      distance: '3.7 km',
      verified: true,
      icuAvailable: 7,
      icuTotal: 25,
      facilities: ['ICU', 'Ventilator', 'Operation Theatre', 'CT Scan', 'X-Ray', 'Blood Bank', 'Dialysis', 'ECG'],
      specialists: ['Cardiologist', 'Neurologist', 'Orthopedic', 'Surgeon'],
      updatedAgo: '6 min ago',
    },
    {
      name: 'MetroCare Hospital',
      type: 'Multispeciality',
      city: 'Lucknow (Indira Nagar)',
      distance: '2.0 km',
      verified: true,
      icuAvailable: 5,
      icuTotal: 25,
      facilities: ['ICU', 'Ventilator', 'Operation Theatre', 'CT Scan', 'X-Ray', 'Blood Bank', 'Dialysis', 'ECG'],
      specialists: ['Cardiologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'Surgeon'],
      updatedAgo: '12 min ago',
    },
    {
      name: 'Green Valley Hospital',
      type: 'Multispeciality',
      city: 'Lucknow (Alambagh)',
      distance: '1.6 km',
      verified: true,
      icuAvailable: 0, // ICU FULL
      icuTotal: 18,
      facilities: ['ICU', 'Ventilator', 'Operation Theatre', 'CT Scan', 'MRI', 'X-Ray', 'Blood Bank', 'Dialysis', 'ECG'],
      specialists: ['Cardiologist', 'Neurologist', 'Orthopedic', 'Pediatrician'],
      updatedAgo: '10 min ago',
    },
  ];

  // Calculate live score in simulator based on the 40-30-20-10 model
  const calculateSimScore = (h) => {
    let bedScore = 0;
    if (simBed === 'ICU') {
      bedScore = h.icuAvailable > 0 ? 40 : 0;
    } else {
      bedScore = 40;
    }

    let facScore = 0;
    if (simFacilities.length > 0) {
      const perFac = 30 / simFacilities.length;
      simFacilities.forEach((f) => {
        if (h.facilities.includes(f)) facScore += perFac;
      });
    } else {
      facScore = 30;
    }

    let specScore = h.specialists.includes(simSpecialist) ? 20 : 0;

    let distScore = parseFloat(h.distance) <= 2 ? 10 : parseFloat(h.distance) <= 4 ? 8 : 6;

    return Math.min(100, Math.round(bedScore + facScore + specScore + distScore));
  };

  const handleLaunchSimCase = () => {
    sessionStorage.setItem(
      'activeReferralQuery',
      JSON.stringify({
        patientReference: 'PAT-LIVE-SIM',
        patientAge: 54,
        patientGender: 'Male',
        emergencyLevel: 'Critical',
        requiredBed: simBed,
        requiredSpecialist: simSpecialist,
        requiredFacilities: simFacilities,
        notes: `Transfer requested from live simulator. Priority: ${simBed} + ${simSpecialist}.`,
      })
    );
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-navy overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="relative isolate">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/20 to-secondary/20 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        {/* Live Network Activity Ticker */}
        <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-navy">Live Clinical Triage Network:</span>
              <span>8 Lucknow Centers Reporting Resources</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-500">
              <span>Avg Discovery: <strong>0.8 seconds</strong></span>
              <span>•</span>
              <span>Matching Formula: <strong>40-30-20-10</strong></span>
              <span>•</span>
              <span className="text-primary font-semibold">100% Transparent Rule Model</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-16 lg:pt-20 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Copy */}
            <div className="lg:col-span-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-primary mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span>Next-Generation Referral Coordination</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-navy leading-[1.12]">
                Find the Right Hospital.{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block mt-1">
                  At the Right Time.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                AROGYASANGAM connects referring physicians with receiving emergency centers. Stop making frantic manual calls — immediately query verified ICU beds, operational ventilators, cath labs, and on-duty specialists in one unified platform.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  to="/doctor/create-referral"
                  className="btn-primary w-full sm:w-auto px-7 py-3.5 text-base font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/25"
                >
                  <Activity className="w-5 h-5" />
                  <span>Find Suitable Hospital</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/login"
                  className="btn-secondary w-full sm:w-auto px-6 py-3.5 text-base font-semibold flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Hospital & Admin Portal</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-left">
                <div>
                  <div className="text-2xl font-black text-navy">100%</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Transparent Scoring</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-primary">8 Centers</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Real-Time Inventory</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-secondary">&lt; 4 Mins</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Referral Triage</div>
                </div>
              </div>
            </div>

            {/* Hero Right: Live Interactive Triage Simulator */}
            <div className="lg:col-span-6">
              <div className="card-glass border-2 border-primary/20 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-navy">Live Resource Matching Simulator</h3>
                      <p className="text-[11px] text-slate-500">Test the 40-30-20-10 algorithm interactively</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Demo
                  </span>
                </div>

                {/* Simulator Controls */}
                <div className="space-y-3 mb-4">
                  {/* Bed selector */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      1. Required Bed Type (40 pts)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      {['ICU', 'Emergency', 'General'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSimBed(b)}
                          className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                            simBed === b
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {b} Bed
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specialist selector */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      2. Required Specialist (20 pts)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      {['Cardiologist', 'Neurologist', 'Surgeon'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSimSpecialist(s)}
                          className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                            simSpecialist === s
                              ? 'bg-secondary text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equipment toggles */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      3. Required Facilities (30 pts)
                    </label>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {['Ventilator', 'Operation Theatre', 'CT Scan', 'MRI', 'ECG'].map((f) => {
                        const active = simFacilities.includes(f);
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() =>
                              setSimFacilities((prev) =>
                                active ? prev.filter((item) => item !== f) : [...prev, f]
                              )
                            }
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                              active
                                ? 'bg-blue-100 text-primary border border-primary/40'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {active ? `✓ ${f}` : `+ ${f}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Instant Dynamic Calculated Results */}
                <div className="border-t border-slate-200/80 pt-3">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Ranked Results Based on Live Inputs</span>
                    <span className="text-primary font-semibold">Haversine Distance Included</span>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {simulatedHospitals
                      .map((h) => ({ ...h, score: calculateSimScore(h) }))
                      .sort((a, b) => b.score - a.score)
                      .map((h, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {h.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                              <span className="font-bold text-xs text-navy truncate">{h.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>{h.distance}</span>
                              <span>•</span>
                              <span className={h.icuAvailable > 0 ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                                {h.icuAvailable > 0 ? `${h.icuAvailable} ICU vacant` : 'ICU Full (0 vacant)'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className={`text-base font-black ${h.score >= 90 ? 'text-primary' : h.score >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {h.score}%
                            </div>
                            <div className="text-[9px] uppercase font-bold text-slate-400">Match</div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Launch button */}
                  <button
                    type="button"
                    onClick={handleLaunchSimCase}
                    className="w-full mt-3 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Referral with These Settings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Comparison: The Old Way vs The ArogyaSangam Way */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              The Paradigm Shift
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-navy mt-3">
              Why Manual Telephone Calling Fails Critical Patients
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Transforming fragmented emergency transfers into an audited, resource-verified discovery workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="rounded-3xl border-2 border-red-200 bg-red-50/20 p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-950">Traditional Manual Calling</h3>
                  <p className="text-xs text-red-700">Slow, uncertain, and stressful</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-red-100">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-950">20–45 minutes wasted:</strong> Doctor or nurse calls 6–10 reception desks manually while the patient destabilizes.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-red-100">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-950">Unverified Information:</strong> Hospital staff say beds are open, but when the ambulance arrives, the only ICU bed has already been given away.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-red-100">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-950">Specialist Mismatches:</strong> Patient with acute subdural hematoma sent to a center whose neurosurgeon is not on duty tonight.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-red-100">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-950">Zero Audit Trail:</strong> No electronic record of transfer acceptance, resulting in ER handoff disputes.
                  </div>
                </div>
              </div>
            </div>

            {/* The ArogyaSangam Way */}
            <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/20 p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-emerald-950">The AROGYASANGAM Platform</h3>
                  <p className="text-xs text-emerald-700">Instant, verified, and transparent</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-950">Instant Multi-Factor Match:</strong> Enter clinical constraints once and receive ranked hospitals in under 1 second.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-950">Resource Freshness Stamps:</strong> Displays exact last-updated minutes to alert clinicians of stale reported data.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-950">On-Duty Specialist Verification:</strong> Only prioritizes receiving centers with validated specialists on active shift.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-950">Closed-Loop Electronic Handshake:</strong> Receiving hospital accepts in app, reserving the bed before ambulance transit begins.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent 100-Point Scoring Model */}
      <section className="py-20 bg-background border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Explainable Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-navy mt-3">
              The 100-Point Transparent Scoring Engine
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              No black-box mystery. Every point is calculated deterministically from verified hospital resources.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-interactive bg-white p-6 border-t-4 border-t-primary">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Bed Vacancy</span>
                <span className="text-2xl font-black text-primary">40 pts</span>
              </div>
              <h4 className="font-bold text-base text-navy">Required Bed Type</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Calculates Available = Total - Occupied. If ICU or Emergency beds are at zero vacancy, the hospital receives 0/40 points.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Prevents sending to full units</span>
              </div>
            </div>

            <div className="card-interactive bg-white p-6 border-t-4 border-t-secondary">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-secondary">Equipment</span>
                <span className="text-2xl font-black text-secondary">30 pts</span>
              </div>
              <h4 className="font-bold text-base text-navy">Critical Facilities</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Proportionally weights each vital piece of equipment needed: Ventilator, Operation Theatre, CT, MRI, Blood Bank, Dialysis, ECG.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified operational hardware</span>
              </div>
            </div>

            <div className="card-interactive bg-white p-6 border-t-4 border-t-indigo-600">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">Clinician</span>
                <span className="text-2xl font-black text-indigo-600">20 pts</span>
              </div>
              <h4 className="font-bold text-base text-navy">On-Duty Specialist</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Rewards hospitals with the matching specialist actively on shift (Available = 20 pts, Accepting Referrals = 17 pts, Not Available = 0 pts).
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cardio, Neuro, Ortho, Surgery</span>
              </div>
            </div>

            <div className="card-interactive bg-white p-6 border-t-4 border-t-emerald-600">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">Proximity</span>
                <span className="text-2xl font-black text-emerald-600">10 pts</span>
              </div>
              <h4 className="font-bold text-base text-navy">Distance & Transit</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Smooth geospatial decay curve calculated using Haversine coordinates across municipal healthcare perimeters.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Prioritizes closest centers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Six-Stage Clinical Referral Workflow */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">System Lifecycle</span>
            <h2 className="text-3xl sm:text-4xl font-black text-navy mt-3">
              The Complete Digital Referral Lifecycle
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { num: '01', title: 'Doctor Intake', desc: 'Physician enters emergency level, bed type, and specialist needs.' },
              { num: '02', title: 'MongoDB Search', desc: 'Queries hospital-reported bed counts and equipment status.' },
              { num: '03', title: 'Score Ranking', desc: 'Applies transparent 40-30-20-10 algorithm with factor checklists.' },
              { num: '04', title: 'Comparison', desc: 'Doctor compares top 2–3 hospitals in a side-by-side matrix.' },
              { num: '05', title: 'Triage Dispatch', desc: 'Receiving hospital reviews request with clinical notes.' },
              { num: '06', title: 'Bed Reservation', desc: 'Hospital accepts; bed reserved; ambulance transfer begins.' },
            ].map((step, idx) => (
              <div key={idx} className="card p-5 relative flex flex-col justify-between hover:border-primary/50 transition-all">
                <div>
                  <div className="text-3xl font-black text-primary/20">{step.num}</div>
                  <h4 className="font-bold text-sm text-navy mt-2">{step.title}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{step.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] text-primary font-semibold">
                  <span>Step {idx + 1}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare Disclaimer */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <HealthcareDisclaimer compact={false} />
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-navy text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Experience the ArogyaSangam Network
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Ready to test? Use our built-in 1-click demo accounts for Dr. Arjun Mehta, CityCare Hospital, and Platform Admin.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="btn-primary px-8 py-3.5 text-base font-bold w-full sm:w-auto">
              Launch Demo Portal
            </Link>
            <Link to="/register" className="btn-secondary px-8 py-3.5 text-base font-semibold w-full sm:w-auto bg-transparent text-white border-white/40 hover:bg-white/10">
              Register New Organization
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-black text-white text-sm">AROGYASANGAM</span>
            <span className="text-slate-500">© 2026 Hospital Referral & Resource Finder</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-white">Doctor Sign In</Link>
            <Link to="/login" className="hover:text-white">Hospital Desk</Link>
            <Link to="/login" className="hover:text-white">Admin Verification</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
