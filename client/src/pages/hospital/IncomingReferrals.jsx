import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { referralAPI } from '../../services/api';
import { EmergencyBadge, ReferralStatusBadge } from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';
import {
  FileText,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  Ambulance,
} from 'lucide-react';

const IncomingReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  // Reject modal state
  const [rejectingRef, setRejectingRef] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await referralAPI.getHospitalReferrals();
      if (res.data.success) {
        setReferrals(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load incoming referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleUpdateStatus = async (id, status, reason = '') => {
    try {
      setUpdatingId(id);
      const res = await referralAPI.updateStatus(id, {
        status,
        rejectionReason: reason,
      });
      if (res.data.success) {
        setReferrals((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status, rejectionReason: reason } : r))
        );
        setRejectingRef(null);
        setRejectReason('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update referral status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = referrals.filter((r) => {
    if (filter === 'ALL') return true;
    if (filter === 'CRITICAL') return r.emergencyLevel === 'Critical';
    return r.status?.toUpperCase() === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary">
            Triage Coordination Desk
          </div>
          <h1 className="text-2xl font-black text-navy mt-1">Incoming Patient Referrals</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review clinical requests, verify bed availability, and accept or decline incoming transfers.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {['ALL', 'PENDING', 'ACCEPTED', 'TRANSFER', 'COMPLETED', 'REJECTED', 'CRITICAL'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filter === tab ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching incoming patient referrals..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No referrals found"
          description="There are currently no referrals matching the selected filter."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((ref) => {
            const isCritical = ref.emergencyLevel === 'Critical';
            const isPending = ref.status === 'Pending';

            return (
              <div
                key={ref._id}
                className={`card p-5 transition-all ${
                  isCritical && isPending
                    ? 'border-red-300 ring-1 ring-red-200 bg-red-50/10'
                    : 'hover:border-primary/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-base font-bold text-primary">{ref.referralId}</span>
                      <EmergencyBadge level={ref.emergencyLevel} />
                      <ReferralStatusBadge status={ref.status} />
                      <span className="text-xs text-slate-400">
                        Received on {new Date(ref.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-navy">
                      Patient Ref: {ref.patientReference} ({ref.patientAge}y, {ref.patientGender})
                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Referring Physician: <span className="font-semibold text-navy">Dr. {ref.doctorId?.name}</span> ({ref.doctorId?.specialization || 'Physician'}, {ref.doctorId?.hospitalName || 'Clinic'})
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/referrals/${ref._id}`}
                      className="btn-secondary text-xs px-3.5 py-1.5"
                    >
                      View Details
                    </Link>

                    {['Accepted', 'Transfer', 'Completed'].includes(ref.status) && (
                      <Link
                        to={`/doctor/referrals/${ref._id}/tracking`}
                        className="bg-blue-50 text-primary hover:bg-blue-100 border border-blue-200 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Ambulance className="w-3.5 h-3.5 animate-pulse" />
                        <span>View Live Tracking</span>
                      </Link>
                    )}

                    {isPending && (
                      <>
                        <button
                          type="button"
                          disabled={updatingId === ref._id}
                          onClick={() => {
                            setRejectingRef(ref);
                            setRejectReason('');
                          }}
                          className="btn-danger text-xs px-3.5 py-1.5 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === ref._id}
                          onClick={() => handleUpdateStatus(ref._id, 'Accepted')}
                          className="btn-success text-xs px-4 py-1.5 flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Referral</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Requirements Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested Bed</span>
                    <span className="font-bold text-navy text-sm">{ref.requiredBed} Bed</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Specialist Needed</span>
                    <span className="font-bold text-navy text-sm">{ref.requiredSpecialist}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Required Facilities</span>
                    <div className="flex flex-wrap gap-1">
                      {ref.requiredFacilities?.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-primary font-medium text-[11px] rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {ref.notes && (
                  <div className="mt-2 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200 italic">
                    <span className="font-bold not-italic text-slate-700 mr-1">Doctor's Note:</span>
                    {ref.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingRef && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center gap-2 mb-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-navy">Decline Referral {rejectingRef.referralId}</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Please specify the clinical or operational reason (e.g. ICU currently full). The referring physician will receive this message and alternative matching hospitals.
            </p>
            <textarea
              rows="3"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. All 18 ICU beds occupied. Zero vacancies at this time."
              className="input-field text-xs mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingRef(null)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingId === rejectingRef._id}
                onClick={() => handleUpdateStatus(rejectingRef._id, 'Rejected', rejectReason)}
                className="btn-danger text-xs px-4 py-2"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <HealthcareDisclaimer compact={true} />
      </div>
    </div>
  );
};

export default IncomingReferrals;
