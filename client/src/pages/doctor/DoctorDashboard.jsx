import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { referralAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Search,
  ArrowRight,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  History,
  Activity,
} from 'lucide-react';
import { EmergencyBadge, ReferralStatusBadge } from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';
import PatientContinuityModal from '../../components/PatientContinuityModal';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await referralAPI.getDoctorReferrals();
        if (res.data.success) {
          setReferrals(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load doctor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute metrics
  const activeCount = referrals.filter((r) => ['Created', 'Pending', 'Accepted', 'Transfer', 'Sent'].includes(r.status)).length;
  const pendingCount = referrals.filter((r) => r.status === 'Pending').length;
  const acceptedCount = referrals.filter((r) => r.status === 'Accepted').length;
  const criticalCount = referrals.filter((r) => r.emergencyLevel === 'Critical').length;

  const handlePatientSearchSubmit = (e) => {
    e.preventDefault();
    if (patientSearchQuery.trim()) {
      setSelectedPatientId(patientSearchQuery.trim().toUpperCase());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            <span>Public Health Coordination Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mt-1">
            Welcome, {user?.name || 'Dr. Arjun Mehta'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.specialization || 'Medical Officer'} • {user?.hospitalName || 'Mohanlalganj Community PHC'} ({user?.facilityType || 'PHC'})
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/doctor/find-hospitals"
            className="btn-primary text-sm px-6 py-3 flex items-center gap-2.5 font-black shadow-lg shadow-primary/25 hover:scale-105 transition-all"
          >
            <Search className="w-5 h-5 text-white" />
            <span>{t('btnFindSuitable')}</span>
          </Link>

          <Link
            to="/doctor/create-referral"
            className="btn-secondary text-sm px-5 py-3 flex items-center gap-2 font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('btnCreateReferral')}</span>
          </Link>
        </div>
      </div>

      {/* Public-Health Escalation Guidance Notice */}
      <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-teal-50/80 to-slate-50 border border-blue-200/90 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary text-white mt-0.5 shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-navy">
              Public Health Hierarchy & Escalation Pathway
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Sub-Centre $\rightarrow$ PHC $\rightarrow$ Rural Hospital (CHC) $\rightarrow$ District Hospital $\rightarrow$ Specialized Hospital.
              If current facility lacks required ICU, Ventilator, or Sub-Specialists, the platform ranks capable higher-tier centers.
            </p>
          </div>
        </div>

        {/* Quick Continuity Lookup input */}
        <form onSubmit={handlePatientSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Enter Patient ID (e.g. PAT-DEMO-001)"
            value={patientSearchQuery}
            onChange={(e) => setPatientSearchQuery(e.target.value)}
            className="input-field text-xs py-2 px-3 w-full sm:w-64"
          />
          <button
            type="submit"
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1 font-bold whitespace-nowrap"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </form>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="card rounded-2xl border-primary/30 bg-blue-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Cases</span>
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-black text-primary mt-2">{activeCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">In coordination pipeline</div>
        </div>

        <div className="card rounded-2xl border-amber-200 bg-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-warning" />
          </div>
          <div className="text-3xl font-black text-amber-700 mt-2">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting receiving facility</div>
        </div>

        <div className="card rounded-2xl border-emerald-200 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accepted Cases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-2">{acceptedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Bed reserved / Ready for transit</div>
        </div>

        <div className="card rounded-2xl border-danger/30 bg-red-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Priority</span>
            <AlertTriangle className="w-4 h-4 text-danger" />
          </div>
          <div className="text-3xl font-black text-danger mt-2">{criticalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Emergency ICU / Ventilator cases</div>
        </div>
      </div>

      {/* Recent Referrals List */}
      <div className="card rounded-3xl my-6 p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h2 className="text-base font-extrabold text-navy">Recent Patient Referrals</h2>
            <p className="text-xs text-slate-500">Latest dispatched referral requests and status updates</p>
          </div>
          <Link to="/doctor/referrals" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            View All ({referrals.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading patient referral records..." />
        ) : referrals.length === 0 ? (
          <EmptyState
            title="No Referrals Yet"
            description="You have not created any patient referrals yet."
            actionText="Create New Referral"
            actionLink="/doctor/create-referral"
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {referrals.slice(0, 6).map((ref) => (
              <div
                key={ref._id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 p-3 rounded-2xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-navy">{ref.referralId}</span>
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
                      Req: {ref.requiredBed} Bed • {ref.requiredSpecialist}
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
                    <span>View Case</span>
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

export default DoctorDashboard;
