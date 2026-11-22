import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Stethoscope,
  Bed,
  HeartPulse,
  Activity,
  AlertTriangle,
  Search,
  FileText,
  ShieldAlert,
  ArrowRight,
  Zap,
  Sparkles,
  FlaskConical,
  Pill,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';

const CreateReferral = () => {
  const navigate = useNavigate();
  const { user, isFrontlineWorker } = useAuth();
  const { t } = useLanguage();

  // Form state with realistic demo scenario pre-fill
  const [formData, setFormData] = useState({
    patientReference: `PAT-DEMO-001`,
    patientAge: 58,
    patientGender: 'Male',
    emergencyLevel: 'Critical', // default Critical for primary judge demo
    requiredBed: 'ICU',
    requiredSpecialist: 'Cardiologist',
    requiredFacilities: ['Ventilator', 'Operation Theatre', 'ECG'],
    requiredDiagnostics: ['ECG', 'CT Scan'],
    requiredMedicines: ['Atropine Inj', 'Medical Oxygen Cylinder'],
    notes: 'Acute ST-elevation myocardial infarction with unstable hemodynamics. Immediate ICU bed, cardiac catheterization, and ventilator standby required.',
  });

  const [loading, setLoading] = useState(false);

  const availableFacilities = [
    'Ventilator',
    'Operation Theatre',
    'Dialysis',
    'Blood Bank',
  ];

  const availableDiagnostics = [
    'ECG',
    'CT Scan',
    'MRI',
    'Ultrasound',
    'Blood Test',
    'X-Ray',
  ];

  const availableMedicines = [
    'Atropine Inj',
    'Medical Oxygen Cylinder',
    'Epinephrine Inj (Adrenaline)',
    'Insulin Regular',
    'Amoxicillin 250mg',
  ];

  const handleFacilityToggle = (facility) => {
    setFormData((prev) => {
      const exists = prev.requiredFacilities.includes(facility);
      return {
        ...prev,
        requiredFacilities: exists
          ? prev.requiredFacilities.filter((f) => f !== facility)
          : [...prev.requiredFacilities, facility],
      };
    });
  };

  const handleDiagnosticToggle = (diag) => {
    setFormData((prev) => {
      const exists = prev.requiredDiagnostics.includes(diag);
      return {
        ...prev,
        requiredDiagnostics: exists
          ? prev.requiredDiagnostics.filter((d) => d !== diag)
          : [...prev.requiredDiagnostics, diag],
      };
    });
  };

  const handleMedicineToggle = (med) => {
    setFormData((prev) => {
      const exists = prev.requiredMedicines.includes(med);
      return {
        ...prev,
        requiredMedicines: exists
          ? prev.requiredMedicines.filter((m) => m !== med)
          : [...prev.requiredMedicines, med],
      };
    });
  };

  const handleApplyPreset = (presetType) => {
    if (presetType === 'cardiac') {
      setFormData({
        patientReference: 'PAT-DEMO-001',
        patientAge: 58,
        patientGender: 'Male',
        emergencyLevel: 'Critical',
        requiredBed: 'ICU',
        requiredSpecialist: 'Cardiologist',
        requiredFacilities: ['Ventilator', 'Operation Theatre', 'ECG'],
        requiredDiagnostics: ['ECG', 'CT Scan'],
        requiredMedicines: ['Atropine Inj', 'Medical Oxygen Cylinder'],
        notes: 'Acute ST-elevation myocardial infarction with unstable hemodynamics. Immediate catheterization and ICU bed requested.',
      });
    } else if (presetType === 'maternal') {
      setFormData({
        patientReference: 'PAT-DEMO-002',
        patientAge: 27,
        patientGender: 'Female',
        emergencyLevel: 'Urgent',
        requiredBed: 'General',
        requiredSpecialist: 'Pediatrician',
        requiredFacilities: ['Blood Bank'],
        requiredDiagnostics: ['Ultrasound', 'Blood Test'],
        requiredMedicines: ['Amoxicillin 250mg'],
        notes: 'Post-partum distress with high fever and acute pelvic pain. Diagnostic ultrasound and blood culture needed.',
      });
    } else if (presetType === 'trauma') {
      setFormData({
        patientReference: 'PAT-DEMO-003',
        patientAge: 34,
        patientGender: 'Male',
        emergencyLevel: 'Critical',
        requiredBed: 'Emergency',
        requiredSpecialist: 'Surgeon',
        requiredFacilities: ['Operation Theatre', 'Blood Bank', 'Ventilator'],
        requiredDiagnostics: ['CT Scan', 'X-Ray', 'Blood Test'],
        requiredMedicines: ['Medical Oxygen Cylinder', 'Epinephrine Inj (Adrenaline)'],
        notes: 'Motorcycle collision on highway with blunt abdominal trauma and suspected splenic laceration. Immediate OT exploratory laparotomy.',
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Save referral query parameters to sessionStorage
    sessionStorage.setItem('activeReferralQuery', JSON.stringify(formData));

    setTimeout(() => {
      navigate('/doctor/find-hospitals', { state: { query: formData } });
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-6 pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            {isFrontlineWorker ? (
              <>
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Frontline Referral Coordination Form</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4 text-primary" />
                <span>Clinical Referral Coordination Form</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mt-1">
            Initiate Patient Transfer Request
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify clinical requirements, diagnostic needs, and emergency priority to rank capable facilities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/live-automation')}
          className="bg-gradient-to-r from-blue-600 via-primary to-teal-500 hover:opacity-95 text-white text-xs px-4 py-2.5 rounded-2xl font-black shadow-lg shadow-primary/25 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>⚡ Live Scenario Demo</span>
        </button>
      </div>

      {/* Preset Scenarios Helper Bar */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-teal-50/70 to-slate-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <div>
            <div className="text-xs font-extrabold text-navy">Quick SIH Demo Presets</div>
            <div className="text-[11px] text-slate-500">Auto-fill clinical requirements for fast demonstration</div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleApplyPreset('cardiac')}
            className="text-[11px] font-extrabold px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl border border-red-300 transition-all"
          >
            🚨 Critical Cardiac (ICU/Cath)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('maternal')}
            className="text-[11px] font-bold px-3 py-1.5 bg-teal-100 hover:bg-teal-200 text-teal-800 rounded-xl border border-teal-300 transition-all"
          >
            Maternal / Ultrasound
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('trauma')}
            className="text-[11px] font-bold px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl border border-blue-300 transition-all"
          >
            Highway Trauma (OT/Blood)
          </button>
        </div>
      </div>

      {/* Main Referral Form */}
      <form onSubmit={handleSubmit} className="card rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 shadow-md bg-white">
        {/* Section 1: Patient Identity & Priority */}
        <div>
          <h3 className="text-sm font-extrabold text-navy pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
              1
            </span>
            <span>Patient Information & Emergency Priority</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Reference ID (Dummy)
              </label>
              <input
                type="text"
                required
                value={formData.patientReference}
                onChange={(e) => setFormData({ ...formData, patientReference: e.target.value })}
                className="input-field text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Age
              </label>
              <input
                type="number"
                min="0"
                max="120"
                required
                value={formData.patientAge}
                onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                className="input-field text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={formData.patientGender}
                onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                className="select-field text-xs font-semibold"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Emergency Priority Level
              </label>
              <select
                value={formData.emergencyLevel}
                onChange={(e) => setFormData({ ...formData, emergencyLevel: e.target.value })}
                className={`select-field text-xs font-black ${
                  formData.emergencyLevel === 'Critical'
                    ? 'border-red-400 text-red-700 bg-red-50/50'
                    : formData.emergencyLevel === 'Urgent'
                    ? 'border-amber-400 text-amber-800'
                    : 'text-navy'
                }`}
              >
                <option value="Critical">🚨 Critical (Emergency Bed/OT)</option>
                <option value="Urgent">Urgent (Within hours)</option>
                <option value="Normal">Normal (Routine transfer)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Requirements */}
        <div>
          <h3 className="text-sm font-extrabold text-navy pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
              2
            </span>
            <span>Required Resource Capacities</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required Bed Type (40 Points)
              </label>
              <select
                value={formData.requiredBed}
                onChange={(e) => setFormData({ ...formData, requiredBed: e.target.value })}
                className="select-field text-xs font-bold"
              >
                <option value="ICU">ICU (Intensive Care Unit)</option>
                <option value="General">General Medical Ward</option>
                <option value="Emergency">Emergency Resuscitation</option>
                <option value="NICU">NICU (Neonatal ICU)</option>
                <option value="PICU">PICU (Pediatric ICU)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required Specialist On-Duty (20 Points)
              </label>
              <select
                value={formData.requiredSpecialist}
                onChange={(e) => setFormData({ ...formData, requiredSpecialist: e.target.value })}
                className="select-field text-xs font-bold"
              >
                <option value="Cardiologist">Cardiologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Orthopedic">Orthopedic Surgeon</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Surgeon">General / Trauma Surgeon</option>
                <option value="Other">General Physician / Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Diagnostic Tests Required */}
        <div>
          <h3 className="text-sm font-extrabold text-navy pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-black">
              3
            </span>
            <span>Diagnostic Capabilities Needed</span>
          </h3>

          <div className="mt-4">
            <span className="text-xs text-slate-500 block mb-2">
              Select diagnostics required for immediate patient evaluation at receiving facility:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableDiagnostics.map((diag) => {
                const checked = formData.requiredDiagnostics.includes(diag);
                return (
                  <button
                    key={diag}
                    type="button"
                    onClick={() => handleDiagnosticToggle(diag)}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between ${
                      checked
                        ? 'bg-teal-50 border-secondary text-secondary shadow-sm'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{diag}</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${checked ? 'bg-secondary text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {checked ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Equipment & Medicines */}
        <div>
          <h3 className="text-sm font-extrabold text-navy pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
              4
            </span>
            <span>Equipment & Critical Medicines</span>
          </h3>

          <div className="mt-4 space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Specialized Equipment (30 Points Combined):
              </span>
              <div className="flex flex-wrap gap-2">
                {availableFacilities.map((fac) => {
                  const checked = formData.requiredFacilities.includes(fac);
                  return (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => handleFacilityToggle(fac)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        checked
                          ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {checked ? `✓ ${fac}` : `+ ${fac}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-emerald-600" />
                Required Emergency Medicines at Receiving Center:
              </span>
              <div className="flex flex-wrap gap-2">
                {availableMedicines.map((med) => {
                  const checked = formData.requiredMedicines.includes(med);
                  return (
                    <button
                      key={med}
                      type="button"
                      onClick={() => handleMedicineToggle(med)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        checked
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {checked ? `✓ ${med}` : `+ ${med}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Clinical Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Clinical Triage Notes & Transfer Justification
          </label>
          <textarea
            rows="3"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Document vitals, initial emergency stabilization provided, and reason for transfer..."
            className="input-field text-xs leading-relaxed"
          />
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-slate-500">
            Current Facility: <span className="font-bold text-navy">{user?.hospitalName || 'Mohanlalganj Community PHC'}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-3.5 text-sm font-black flex items-center gap-2.5 shadow-lg shadow-primary/25 hover:scale-105"
          >
            <Search className="w-4 h-4 text-white" />
            <span>Search & Match Suitable Facilities</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>

      {/* Safety Notice */}
      <HealthcareDisclaimer />
    </div>
  );
};

export default CreateReferral;
