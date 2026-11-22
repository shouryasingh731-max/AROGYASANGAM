import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { referralAPI, hospitalAPI } from '../../services/api';
import { EmergencyBadge, ReferralStatusBadge, FreshnessBadge } from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';
import {
  Building2,
  Bed,
  Activity,
  UserRound,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Ambulance,
} from 'lucide-react';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        setLoading(true);
        if (user?.hospitalId) {
          const hospRes = await hospitalAPI.getById(user.hospitalId);
          if (hospRes.data.success) {
            setHospital(hospRes.data.data);
          }
        }
        const refRes = await referralAPI.getHospitalReferrals();
        if (refRes.data.success) {
          setReferrals(refRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load hospital dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, [user]);

  const pendingCount = referrals.filter((r) => r.status === 'Pending').length;
  const criticalCount = referrals.filter((r) => r.emergencyLevel === 'Critical' && r.status === 'Pending').length;
  const acceptedCount = referrals.filter((r) => r.status === 'Accepted' || r.status === 'Transfer').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hospital Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {hospital?.verified ? (
              <span className="badge-verified">
                <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED HOSPITAL
              </span>
            ) : (
              <span className="badge-pending">Pending Admin Verification</span>
            )}
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {hospital?.hospitalType || 'Multispeciality'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy">
            {hospital?.name || user?.hospitalName || 'Hospital Coordination Portal'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {hospital?.address}, {hospital?.city} • Emergency Desk:{' '}
            <span className="font-semibold text-primary">{hospital?.phone || user?.phone}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/hospital/beds" className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-primary" />
            <span>Update Beds</span>
          </Link>
          <Link to="/hospital/facilities" className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Equipment</span>
          </Link>
          <Link to="/hospital/specialists" className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5">
            <UserRound className="w-4 h-4 text-purple-600" />
            <span>Specialists</span>
          </Link>
          <Link to="/hospital/diagnostics" className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Diagnostics</span>
          </Link>
          <Link to="/hospital/medicines" className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Medicines</span>
          </Link>
          <Link to="/hospital/referrals" className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
            <span>Incoming Triage ({pendingCount})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Critical Triage Notice if critical referrals exist */}
      {criticalCount > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-300 text-xs text-red-900 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider text-red-800">
                Action Required: {criticalCount} Critical Referral(s) Awaiting Review
              </span>
              <p className="text-red-700 mt-0.5">Please review incoming clinical requirements immediately.</p>
            </div>
          </div>
          <Link to="/hospital/referrals" className="btn-danger text-xs px-3 py-1.5 whitespace-nowrap">
            Review Now
          </Link>
        </div>
      )}

      {/* Resource Overview & Freshness Indicator */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Diagnostics Summary Card */}
        <div className="card p-4 bg-teal-50/40 border-teal-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" /> Diagnostics Active
              </span>
              <Link to="/hospital/diagnostics" className="text-[11px] font-bold text-teal-700 hover:underline">
                Manage →
              </Link>
            </div>
            <div className="mt-2 text-2xl font-black text-navy">
              {hospital?.diagnostics?.filter(d => d.available).length || 0}
              <span className="text-xs font-normal text-slate-500"> / {hospital?.diagnostics?.length || 0} Available</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {(hospital?.diagnostics || []).slice(0, 5).map((d, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    d.available ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200 line-through'
                  }`}
                >
                  {d.name}
                </span>
              ))}
              {(hospital?.diagnostics?.length || 0) > 5 && (
                <span className="text-[10px] text-slate-400 self-center">+{hospital.diagnostics.length - 5} more</span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-teal-100">
            Updated: {hospital?.lastResourceUpdate ? new Date(hospital.lastResourceUpdate).toLocaleTimeString() : 'Recently'}
          </p>
        </div>

        {/* Medicines Stock Card */}
        <div className="card p-4 bg-amber-50/40 border-amber-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" /> Essential Medicines
              </span>
              <Link to="/hospital/medicines" className="text-[11px] font-bold text-amber-700 hover:underline">
                Manage →
              </Link>
            </div>
            <div className="mt-2 text-2xl font-black text-navy">
              {hospital?.medicines?.filter(m => m.available).length || 0}
              <span className="text-xs font-normal text-slate-500"> / {hospital?.medicines?.length || 0} In Stock</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {(hospital?.medicines || []).slice(0, 5).map((m, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    m.available ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-700 border-rose-200 line-through'
                  }`}
                >
                  {m.name}
                </span>
              ))}
              {(hospital?.medicines?.length || 0) > 5 && (
                <span className="text-[10px] text-slate-400 self-center">+{hospital.medicines.length - 5} more</span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-amber-100">
            Keep emergency antidotes & critical medicines updated.
          </p>
        </div>

        {/* Freshness & Facility Status Card */}
        <div className="card p-4 bg-slate-50 border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Reporting Freshness
              </span>
              <FreshnessBadge
                state={
                  !hospital?.lastResourceUpdate
                    ? 'old'
                    : (Date.now() - new Date(hospital.lastResourceUpdate).getTime()) < 30 * 60 * 1000
                    ? 'fresh'
                    : (Date.now() - new Date(hospital.lastResourceUpdate).getTime()) < 2 * 60 * 60 * 1000
                    ? 'recently_updated'
                    : 'needs_verification'
                }
              />
            </div>
            <div className="mt-2">
              <div className="text-xs text-slate-600 font-medium">
                Facility Tier: <span className="font-bold text-navy">{hospital?.facilityType || hospital?.hospitalType || 'Multispeciality'}</span>
              </div>
              <div className="text-xs text-slate-600 font-medium mt-1">
                Emergency 24x7: <span className="font-bold text-emerald-600">{hospital?.emergencyCapability ? 'Active & Ready' : 'Limited'}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                District: <span className="font-semibold text-slate-700">{hospital?.district || hospital?.city}</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200">
            Last update timestamp logged to public health directory.
          </div>
        </div>
      </div>

      {/* Bed Capacity Quick Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-navy flex items-center gap-2">
            <Bed className="w-4 h-4 text-primary" />
            Current Live Capacity (Hospital-Reported)
          </h3>
          <Link to="/hospital/beds" className="text-xs font-semibold text-primary hover:underline">
            Manage Capacities →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { key: 'icu', label: 'ICU Beds' },
            { key: 'emergency', label: 'Emergency' },
            { key: 'general', label: 'General Ward' },
            { key: 'nicu', label: 'NICU' },
            { key: 'picu', label: 'PICU' },
          ].map(({ key, label }) => {
            const b = hospital?.beds?.[key] || { total: 0, occupied: 0, available: 0 };
            return (
              <div key={key} className="card p-3.5 bg-slate-50 border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">{label}</span>
                <div className="text-2xl font-black text-navy mt-1">
                  <span className={b.available > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                    {b.available}
                  </span>
                  <span className="text-xs font-normal text-slate-400"> / {b.total}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{b.occupied} occupied</span>
                  <span className={b.available > 0 ? 'text-emerald-600' : 'text-rose-500'}>
                    {b.available > 0 ? 'Vacant' : 'Full'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incoming Referrals Queue */}
      <div className="card mb-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-navy">Incoming Referrals Triage Queue</h3>
            <p className="text-xs text-slate-500">Review transfer requests sent by referring doctors</p>
          </div>
          <Link to="/hospital/referrals" className="text-xs font-semibold text-primary hover:underline">
            View All ({referrals.length})
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading incoming triage referrals..." />
        ) : referrals.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No incoming referrals received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                  <th className="py-3 px-3">Referral ID</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Referring Doctor</th>
                  <th className="py-3 px-3">Required Bed</th>
                  <th className="py-3 px-3">Specialist</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.slice(0, 5).map((ref) => (
                  <tr key={ref._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-bold text-primary">
                      <Link to={`/referrals/${ref._id}`} className="hover:underline">
                        {ref.referralId}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <EmergencyBadge level={ref.emergencyLevel} />
                    </td>
                    <td className="py-3 px-3 font-medium text-navy">
                      Dr. {ref.doctorId?.name || 'Physician'}
                      <div className="text-[10px] text-slate-400">{ref.doctorId?.specialization}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700">{ref.requiredBed}</td>
                    <td className="py-3 px-3 text-slate-600">{ref.requiredSpecialist}</td>
                    <td className="py-3 px-3">
                      <ReferralStatusBadge status={ref.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {['Accepted', 'Transfer'].includes(ref.status) && (
                          <Link
                            to={`/doctor/referrals/${ref._id}/tracking`}
                            className="text-primary hover:text-primary-dark font-bold text-[11px] flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                            title="Live GPS Ambulance Tracking"
                          >
                            <Ambulance className="w-3.5 h-3.5 animate-pulse" />
                            <span>Track</span>
                          </Link>
                        )}
                        <Link to={`/referrals/${ref._id}`} className="btn-secondary text-[11px] px-3 py-1">
                          Review
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <HealthcareDisclaimer compact={true} />
    </div>
  );
};

export default HospitalDashboard;
