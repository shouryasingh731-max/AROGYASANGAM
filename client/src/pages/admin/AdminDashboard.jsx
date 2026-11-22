import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import {
  Building2,
  ShieldCheck,
  Stethoscope,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  HeartHandshake,
  Layers,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';
import { TierBadge } from '../../components/StatusBadge';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getStats();
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner message="Loading platform analytics and verification queues..." />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Facilities',
      val: stats?.totalFacilities ?? stats?.totalHospitals ?? 0,
      sub: `${stats?.verifiedHospitals ?? 0} Verified Public/Private`,
      icon: Building2,
      color: 'text-primary',
      bg: 'bg-blue-50/40 border-primary/30',
      link: '/admin/verify-hospitals',
    },
    {
      title: 'Pending Verification',
      val: stats?.pendingHospitals ?? 0,
      sub: 'Action required',
      icon: ShieldCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50/40 border-amber-300',
      link: '/admin/verify-hospitals',
    },
    {
      title: 'Registered Doctors',
      val: stats?.totalDoctors ?? 0,
      sub: 'Active prescribers',
      icon: Stethoscope,
      color: 'text-secondary',
      bg: 'bg-teal-50/40 border-teal-300',
      link: '/admin/doctors',
    },
    {
      title: 'Frontline Workers',
      val: stats?.totalFrontlineWorkers ?? 0,
      sub: 'ASHA / ANM / CHO Network',
      icon: HeartHandshake,
      color: 'text-rose-600',
      bg: 'bg-rose-50/40 border-rose-200',
      link: '/admin/doctors',
    },
    {
      title: 'Total Referrals',
      val: stats?.totalReferrals ?? 0,
      sub: `${stats?.activeReferrals ?? 0} In-Transit / Pending`,
      icon: FileText,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/40 border-indigo-200',
      link: '/admin/referrals',
    },
    {
      title: 'Critical Referrals',
      val: stats?.criticalReferrals ?? 0,
      sub: 'Life-threatening tier',
      icon: AlertTriangle,
      color: 'text-danger',
      bg: 'bg-red-50/40 border-red-300',
      link: '/admin/referrals?emergencyLevel=Critical',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
            System Administration & Oversight
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mt-1">
            Platform Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor healthcare network participants, hospital licensing verifications, and referral loads.
          </p>
        </div>

        {stats?.pendingHospitals > 0 && (
          <Link
            to="/admin/verify-hospitals"
            className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2 shadow-md shadow-primary/20"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review Pending Hospitals ({stats.pendingHospitals})</span>
          </Link>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className={`card p-5 border transition-all hover:shadow-card hover:scale-[1.01] ${card.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{card.title}</span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className={`text-3xl font-black mt-2 ${card.color}`}>{card.val}</div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                <span>{card.sub}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Public Health Network Facility Tiers Breakdown */}
      <div className="card p-6 mb-8 bg-white border-slate-200">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Public Health Hierarchy & Facility Network Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live distribution of registered healthcare facilities across escalation tiers
            </p>
          </div>
          <Link to="/admin/verify-hospitals" className="text-xs font-semibold text-primary hover:underline">
            View All Facilities Directory →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { tier: 'Sub-Centre', desc: 'First Contact (ANM/ASHA)' },
            { tier: 'PHC', desc: 'Primary Health Centre' },
            { tier: 'Rural Hospital', desc: 'Community / CHC' },
            { tier: 'District Hospital', desc: 'Secondary Care' },
            { tier: 'Specialized Hospital', desc: 'Tertiary / Super-Care' },
            { tier: 'Multispeciality Hospital', desc: 'Comprehensive' },
            { tier: 'Emergency Hospital', desc: 'Trauma & Critical' },
          ].map(({ tier, desc }) => {
            const count = stats?.facilityTypeBreakdown?.[tier] || 0;
            return (
              <div key={tier} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div>
                  <TierBadge tier={tier} />
                  <div className="text-2xl font-black text-navy mt-2.5">
                    {count}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 line-clamp-1" title={desc}>
                  {desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-navy">Hospital Verification Queue</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Verify legal hospital credentials, operational status, and authorize the public Verified badge.
            </p>
          </div>
          <Link to="/admin/verify-hospitals" className="btn-secondary text-xs px-4 py-2 mt-4 inline-flex items-center justify-center">
            Review Hospitals →
          </Link>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-secondary flex items-center justify-center mb-3">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-navy">Physician Directory</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Inspect registered doctors across clinics, review medical council registration IDs, and activate/deactivate accounts.
            </p>
          </div>
          <Link to="/admin/doctors" className="btn-secondary text-xs px-4 py-2 mt-4 inline-flex items-center justify-center">
            Manage Doctors →
          </Link>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-navy">Master Referral Audit Log</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Audit real-time referral throughput, filter by critical status, and review transit completion rates.
            </p>
          </div>
          <Link to="/admin/referrals" className="btn-secondary text-xs px-4 py-2 mt-4 inline-flex items-center justify-center">
            Inspect All Referrals →
          </Link>
        </div>
      </div>

      <HealthcareDisclaimer compact={true} />
    </div>
  );
};

export default AdminDashboard;
