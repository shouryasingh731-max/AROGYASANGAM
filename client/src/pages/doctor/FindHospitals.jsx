import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { matchingAPI, referralAPI } from '../../services/api';
import HospitalCard from '../../components/HospitalCard';
import HospitalComparison from '../../components/HospitalComparison';
import FacilityMapView from '../../components/FacilityMapView';
import { EmergencyBadge } from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';
import { useLanguage } from '../../context/LanguageContext';
import { useLowData } from '../../context/LowDataContext';
import {
  Search,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  Send,
  Building2,
  Map,
  List,
  Sparkles,
  FlaskConical,
  Pill,
  Activity,
  AlertTriangle,
} from 'lucide-react';

const FindHospitals = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { cacheFacilities, getCachedFacilities, isOnline } = useLowData();

  // Retrieve initial query or default demo criteria
  const initialQuery = location.state?.query || (() => {
    const saved = sessionStorage.getItem('activeReferralQuery');
    return saved
      ? JSON.parse(saved)
      : {
          patientReference: 'PAT-DEMO-001',
          patientAge: 58,
          patientGender: 'Male',
          emergencyLevel: 'Critical',
          requiredBed: 'ICU',
          requiredSpecialist: 'Cardiologist',
          requiredFacilities: ['Ventilator', 'Operation Theatre', 'ECG'],
          requiredDiagnostics: ['ECG', 'CT Scan'],
          requiredMedicines: ['Atropine Inj', 'Medical Oxygen Cylinder'],
          facilityTypeFilter: 'All',
          notes: 'Acute ST-elevation myocardial infarction with unstable hemodynamics. Immediate ICU transfer requested.',
        };
  })();

  const [query, setQuery] = useState(initialQuery);
  const [rankedResults, setRankedResults] = useState([]);
  const [escalationAdvice, setEscalationAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // Comparison State
  const [comparedHospitals, setComparedHospitals] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Referral Dispatch Modal State
  const [selectedHospitalForReferral, setSelectedHospitalForReferral] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState('');

  // Diagnostic checklist options
  const diagnosticOptions = ['ECG', 'CT Scan', 'MRI', 'Ultrasound', 'Blood Test', 'X-Ray'];
  const equipmentOptions = ['Ventilator', 'Operation Theatre', 'Dialysis', 'Blood Bank'];
  const medicineOptions = [
    'Atropine Inj',
    'Medical Oxygen Cylinder',
    'Epinephrine Inj (Adrenaline)',
    'Insulin Regular',
    'Amoxicillin 250mg',
  ];

  // Search execution
  const executeMatch = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await matchingAPI.matchFacilities({
        requiredBed: query.requiredBed,
        requiredFacilities: query.requiredFacilities,
        requiredDiagnostics: query.requiredDiagnostics || [],
        requiredMedicines: query.requiredMedicines || [],
        requiredSpecialist: query.requiredSpecialist,
        emergencyLevel: query.emergencyLevel,
        facilityTypeFilter: query.facilityTypeFilter,
        userLocation: [80.9462, 26.8467], // Center of Lucknow
      });

      if (res.data.success) {
        setRankedResults(res.data.data);
        setEscalationAdvice(res.data.escalationRecommendation);
        cacheFacilities(res.data.data);
      }
    } catch (err) {
      // If offline/low-data error, attempt fallback to local cache
      const cached = getCachedFacilities();
      if (cached && cached.facilities) {
        setRankedResults(cached.facilities);
        setError('Operating on cached network facilities data (offline / low bandwidth).');
      } else {
        setError(err.response?.data?.message || 'Failed to search healthcare facilities. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeMatch();
  }, [
    query.requiredBed,
    query.requiredSpecialist,
    query.requiredFacilities,
    query.requiredDiagnostics,
    query.requiredMedicines,
    query.facilityTypeFilter,
    query.emergencyLevel,
  ]);

  const toggleDiagnostic = (diag) => {
    const current = query.requiredDiagnostics || [];
    const updated = current.includes(diag)
      ? current.filter((d) => d !== diag)
      : [...current, diag];
    setQuery({ ...query, requiredDiagnostics: updated });
  };

  const toggleEquipment = (equip) => {
    const current = query.requiredFacilities || [];
    const updated = current.includes(equip)
      ? current.filter((e) => e !== equip)
      : [...current, equip];
    setQuery({ ...query, requiredFacilities: updated });
  };

  const toggleMedicine = (med) => {
    const current = query.requiredMedicines || [];
    const updated = current.includes(med)
      ? current.filter((m) => m !== med)
      : [...current, med];
    setQuery({ ...query, requiredMedicines: updated });
  };

  const toggleCompare = (hospitalItem) => {
    const hId = hospitalItem._id || hospitalItem.hospital?._id;
    const exists = comparedHospitals.some((item) => (item.hospital?._id || item._id) === hId);

    if (exists) {
      setComparedHospitals(comparedHospitals.filter((item) => (item.hospital?._id || item._id) !== hId));
    } else {
      if (comparedHospitals.length >= 3) {
        alert('You can compare a maximum of 3 facilities side-by-side.');
        return;
      }
      setComparedHospitals([...comparedHospitals, hospitalItem]);
    }
  };

  const handleSendReferralSubmit = async () => {
    if (!selectedHospitalForReferral) return;
    setDispatching(true);
    setDispatchError('');

    try {
      const payload = {
        patientReference: query.patientReference || `PAT-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
        patientAge: Number(query.patientAge) || 58,
        patientGender: query.patientGender || 'Male',
        emergencyLevel: query.emergencyLevel || 'Critical',
        requiredBed: query.requiredBed || 'ICU',
        requiredFacilities: query.requiredFacilities || [],
        requiredDiagnostics: query.requiredDiagnostics || [],
        requiredMedicines: query.requiredMedicines || [],
        requiredSpecialist: query.requiredSpecialist || 'Cardiologist',
        notes: query.notes || 'Emergency healthcare referral dispatched via ArogyaSangam smart coordinator.',
        selectedHospitalId: selectedHospitalForReferral._id,
      };

      const res = await referralAPI.create(payload);
      if (res.data.success) {
        setSelectedHospitalForReferral(null);
        navigate(`/referrals/${res.data.data._id}`);
      }
    } catch (err) {
      setDispatchError(err.response?.data?.message || 'Failed to dispatch referral. Please check connection.');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              <span>Smart Healthcare Access & Referral Coordination</span>
            </span>
            <EmergencyBadge level={query.emergencyLevel} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
            Where is the required care available right now?
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluating bed capacities, on-duty specialists, diagnostic machines, and travel proximity.
          </p>
        </div>

        {/* View mode toggle and comparison trigger */}
        <div className="flex items-center gap-2">
          {comparedHospitals.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCompareModal(true)}
              className="btn-teal text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-md font-bold"
            >
              <Layers className="w-4 h-4" />
              <span>Compare Selected ({comparedHospitals.length})</span>
            </button>
          )}

          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-white text-navy shadow-sm' : 'text-slate-600 hover:text-navy'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'map' ? 'bg-white text-navy shadow-sm' : 'text-slate-600 hover:text-navy'
              }`}
              title="Map View"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Escalation Recommendation Banner if High Acuity Needs */}
      {escalationAdvice && (
        <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-blue-50 to-teal-50 border-2 border-purple-200 flex items-start gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white mt-0.5 flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                Tier Escalation Pathway
              </span>
              <span className="text-xs font-bold text-navy">
                Recommended Tier: {escalationAdvice.levelNeeded}
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              {escalationAdvice.reason} ArogyaSangam has automatically prioritized higher-tier District and Specialized facilities equipped for critical resuscitation.
            </p>
          </div>
        </div>
      )}

      {/* Structured Search Filters Bar */}
      <div className="card rounded-3xl p-5 my-6 border border-slate-200/90 shadow-sm bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Facility Tier Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Healthcare Tier
            </label>
            <select
              value={query.facilityTypeFilter || 'All'}
              onChange={(e) => setQuery({ ...query, facilityTypeFilter: e.target.value })}
              className="select-field text-xs font-semibold"
            >
              <option value="All">All Public Health Tiers</option>
              <option value="Sub-Centre">Tier 1: Sub-Centre</option>
              <option value="PHC">Tier 2: Primary Health Centre (PHC)</option>
              <option value="Rural Hospital">Tier 3: Rural Hospital (CHC)</option>
              <option value="District Hospital">Tier 4: District Hospital</option>
              <option value="Specialized Hospital">Tier 5: Specialized / Apex Hospital</option>
              <option value="Multispeciality Hospital">Multispeciality Hospital</option>
              <option value="Emergency Hospital">Emergency Hospital</option>
            </select>
          </div>

          {/* Emergency Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Emergency Priority
            </label>
            <select
              value={query.emergencyLevel}
              onChange={(e) => setQuery({ ...query, emergencyLevel: e.target.value })}
              className="select-field text-xs font-bold text-navy"
            >
              <option value="Critical">Critical Emergency</option>
              <option value="Urgent">Urgent Priority</option>
              <option value="Normal">Normal Referral</option>
            </select>
          </div>

          {/* Bed Requirement */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Required Bed Type (40 pts)
            </label>
            <select
              value={query.requiredBed}
              onChange={(e) => setQuery({ ...query, requiredBed: e.target.value })}
              className="select-field text-xs font-bold"
            >
              <option value="ICU">ICU Bed</option>
              <option value="General">General Ward</option>
              <option value="Emergency">Emergency Triage</option>
              <option value="NICU">NICU (Neonatal)</option>
              <option value="PICU">PICU (Pediatric)</option>
            </select>
          </div>

          {/* Specialist Requirement */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Required Specialist (20 pts)
            </label>
            <select
              value={query.requiredSpecialist}
              onChange={(e) => setQuery({ ...query, requiredSpecialist: e.target.value })}
              className="select-field text-xs font-bold"
            >
              <option value="Cardiologist">Cardiologist</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Orthopedic">Orthopedic Surgeon</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Surgeon">General Surgeon</option>
              <option value="Other">General Physician / Other</option>
            </select>
          </div>
        </div>

        {/* Diagnostics & Equipment Pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          {/* Diagnostics checklist */}
          <div>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-secondary" />
              Requested Diagnostics (Evaluated in Capability Score):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {diagnosticOptions.map((diag) => {
                const isSelected = (query.requiredDiagnostics || []).includes(diag);
                return (
                  <button
                    key={diag}
                    type="button"
                    onClick={() => toggleDiagnostic(diag)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-secondary text-white border-secondary shadow-sm shadow-secondary/25'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? `✓ ${diag}` : `+ ${diag}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Equipment checklist */}
          <div>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Required Equipment:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {equipmentOptions.map((equip) => {
                const isSelected = (query.requiredFacilities || []).includes(equip);
                return (
                  <button
                    key={equip}
                    type="button"
                    onClick={() => toggleEquipment(equip)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? `✓ ${equip}` : `+ ${equip}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Essential Medicines checklist */}
          <div>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-emerald-600" />
              Check Essential Medicine Availability at Facility:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {medicineOptions.map((med) => {
                const isSelected = (query.requiredMedicines || []).includes(med);
                return (
                  <button
                    key={med}
                    type="button"
                    onClick={() => toggleMedicine(med)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? `✓ ${med}` : `+ ${med}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Section */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner message="Evaluating healthcare facilities across public health network..." />
        </div>
      ) : error ? (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : viewMode === 'map' ? (
        <div className="my-6">
          <FacilityMapView
            facilities={rankedResults}
            onSelectFacility={(h) => setSelectedHospitalForReferral(h)}
          />
        </div>
      ) : (
        <div className="space-y-4 my-6">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold text-navy">
              Found {rankedResults.length} facilities matching requirements
            </span>
            <span>Ranked by multi-factor score (Bed 40, Equip/Diag 30, Specialist 20, Distance 10)</span>
          </div>

          {rankedResults.map((result, idx) => (
            <HospitalCard
              key={idx}
              data={result}
              isSelected={selectedHospitalForReferral?._id === (result.hospital?._id || result._id)}
              isCompared={comparedHospitals.some((item) => (item.hospital?._id || item._id) === (result.hospital?._id || result._id))}
              onCompare={() => toggleCompare(result)}
              onViewDetails={(h) => navigate(`/doctor/hospitals/${h._id}`)}
              onSelect={(h) => setSelectedHospitalForReferral(h)}
            />
          ))}
        </div>
      )}

      {/* Mandatory Disclaimer */}
      <HealthcareDisclaimer />

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && (
        <HospitalComparison
          hospitals={comparedHospitals}
          onClose={() => setShowCompareModal(false)}
          onSelectHospital={(h) => {
            setSelectedHospitalForReferral(h);
            setShowCompareModal(false);
          }}
        />
      )}

      {/* Direct Referral Confirmation Modal */}
      {selectedHospitalForReferral && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h3 className="text-base font-extrabold text-navy">
                  Confirm Digital Referral Dispatch
                </h3>
              </div>
              <button
                onClick={() => setSelectedHospitalForReferral(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {dispatchError && (
              <div className="my-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{dispatchError}</span>
              </div>
            )}

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-primary block">
                  Target Healthcare Facility
                </span>
                <span className="text-sm font-black text-navy block mt-0.5">
                  {selectedHospitalForReferral.name}
                </span>
                <span className="text-slate-600 block mt-0.5">
                  {selectedHospitalForReferral.address}, {selectedHospitalForReferral.district || selectedHospitalForReferral.city}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Patient Reference</span>
                  <span className="font-bold text-navy">{query.patientReference}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Priority Level</span>
                  <EmergencyBadge level={query.emergencyLevel} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Requested Resources</span>
                <span className="font-bold text-navy">
                  {query.requiredBed} Bed • {query.requiredSpecialist}
                  {(query.requiredDiagnostics?.length > 0) && ` • Diag: ${query.requiredDiagnostics.join(', ')}`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedHospitalForReferral(null)}
                className="btn-secondary text-xs px-4 py-2"
                disabled={dispatching}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendReferralSubmit}
                disabled={dispatching}
                className="btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5 font-bold shadow-md shadow-primary/25"
              >
                {dispatching ? (
                  <span>Dispatching Referral...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Dispatch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindHospitals;
