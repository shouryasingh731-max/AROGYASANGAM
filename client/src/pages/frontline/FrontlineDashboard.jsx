import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { referralAPI, hospitalAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  HeartHandshake,
  PlusCircle,
  Search,
  MapPin,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  History,
  Building2,
  Pill,
  Activity,
  Layers,
} from 'lucide-react';
import { EmergencyBadge, ReferralStatusBadge } from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';
import PatientContinuityModal from '../../components/PatientContinuityModal';

const FrontlineDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    const fetchFrontlineData = async () => {
      try {
        setLoading(true);
        const res = await referralAPI.getDoctorReferrals();
        if (res.data.success) {
          setReferrals(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load frontline dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFrontlineData();
  }, []);

  const activeReferrals = referrals.filter((r) =>
    ['Created', 'Pending', 'Accepted', 'Transfer', 'Sent'].includes(r.status)
  );
  const criticalReferrals = referrals.filter((r) => r.emergencyLevel === 'Critical');
  const acceptedReferrals = referrals.filter((r) => r.status === 'Accepted' || r.status === 'Transfer');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Banner: High visibility, simple text */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-primary rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-900/10 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black mb-2 backdrop-blur-sm">
              <HeartHandshake className="w-4 h-4" />
              <span>{t('roleFrontline')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              नमस्ते, {user?.name || 'Asha Devi'}
            </h1>
            <p className="text-white/90 text-sm mt-1 max-w-xl">
              {user?.hospitalName || 'Mohanlalganj Community PHC'} • {user?.facilityType || 'PHC'}
            </p>
            <p className="text-white/80 text-xs mt-1">
              Connect patients to the right available hospital with required beds and specialists.
            </p>
          </div>

          {/* Prominent Quick Action Button */}
          <Link
            to="/doctor/create-referral"
            className="inline-flex items-center justify-center gap-3 bg-white text-emerald-800 hover:bg-emerald-50 px-6 py-4 rounded-2xl font-black text-base shadow-lg shadow-black/10 hover:scale-105 transition-all text-center flex-shrink-0"
          >
            <PlusCircle className="w-6 h-6 text-emerald-600" />
            <span>{t('btnCreateReferral')}</span>
          </Link>
        </div>
      </div>

      {/* 4 Large Touch Action Cards for Non-Technical Users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Action 1: Create Referral */}
        <Link
          to="/doctor/create-referral"
          className="card rounded-3xl p-6 border-2 border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 transition-all shadow-sm group hover:-translate-y-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-navy group-hover:text-emerald-800">
            {t('btnCreateReferral')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Emergency or routine patient referral to higher public-health facilities.
          </p>
        </Link>

        {/* Action 2: Find Nearby / Suitable Facilities */}
        <Link
          to="/doctor/find-hospitals"
          className="card rounded-3xl p-6 border-2 border-blue-300 hover:border-primary bg-blue-50/50 hover:bg-blue-50 transition-all shadow-sm group hover:-translate-y-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mb-4 shadow-md shadow-primary/30 group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-navy group-hover:text-primary">
            {t('navFindFacilities')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Check live ICU beds, specialists, and diagnostics across District Hospitals.
          </p>
        </Link>

        {/* Action 3: Active Referrals */}
        <Link
          to="/doctor/referrals"
          className="card rounded-3xl p-6 border-2 border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 transition-all shadow-sm group hover:-translate-y-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-navy group-hover:text-amber-800">
            Active Referrals ({activeReferrals.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track referral acceptance and ambulance transit updates in real time.
          </p>
        </Link>

        {/* Action 4: Patient Continuity */}
        <button
          type="button"
          onClick={() => setSelectedPatientId('PAT-DEMO-001')}
          className="card rounded-3xl p-6 border-2 border-purple-300 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 transition-all shadow-sm group hover:-translate-y-1 text-left w-full"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-4 shadow-md shadow-purple-600/30 group-hover:scale-110 transition-transform">
            <History className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-navy group-hover:text-purple-800">
            {t('btnCheckContinuity')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            View patient referral continuity and escalation trail between facilities.
          </p>
        </button>
      </div>

      {/* Critical Case Alert Banner if active critical case */}
      {criticalReferrals.length > 0 && (
        <div className="mb-8 p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-red-700">
                Active Critical Referrals ({criticalReferrals.length})
              </div>
              <div className="text-sm font-bold text-navy">
                {criticalReferrals[0]?.patientReference} • {criticalReferrals[0]?.requiredBed} Bed at {criticalReferrals[0]?.selectedHospital?.name || 'Receiving Facility'}
              </div>
            </div>
          </div>

          <Link
            to={`/referrals/${criticalReferrals[0]?._id}`}
            className="btn-danger text-xs px-4 py-2 font-bold flex items-center gap-1.5"
          >
            <span>View Emergency Case</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Recent Referrals List */}
      <div className="card rounded-3xl p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-black text-navy">
              My Referrals Tracking
            </h3>
            <p className="text-xs text-slate-500">
              Latest patient referrals initiated from your primary health post
            </p>
          </div>

          <Link
            to="/doctor/referrals"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Referrals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner message="Loading referrals list..." />
          </div>
        ) : referrals.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title="No Referrals Yet"
              description="You have not created any patient referrals from your health centre yet."
              actionText="Create First Referral"
              actionLink="/doctor/create-referral"
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {referrals.slice(0, 5).map((ref) => (
              <div
                key={ref._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-3 rounded-2xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-navy">
                      {ref.referralId}
                    </span>
                    <EmergencyBadge level={ref.emergencyLevel} />
                    <ReferralStatusBadge status={ref.status} />
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-navy">
                      Patient: {ref.patientReference} ({ref.patientAge}y, {ref.patientGender})
                    </span>
                    <span>•</span>
                    <span className="text-primary font-semibold">
                      To: {ref.selectedHospital?.name || 'Facility'}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">
                      Req: {ref.requiredBed} + {ref.requiredSpecialist}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPatientId(ref.patientReference)}
                    className="btn-secondary text-xs px-3 py-1.5 font-bold flex items-center gap-1"
                    title="View Patient Continuity History"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Continuity</span>
                  </button>

                  <Link
                    to={`/referrals/${ref._id}`}
                    className="btn-primary text-xs px-3.5 py-1.5 font-bold flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <HealthcareDisclaimer />

      {/* Patient Continuity Modal */}
      {selectedPatientId && (
        <PatientContinuityModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
        />
      )}
    </div>
  );
};

export default FrontlineDashboard;
