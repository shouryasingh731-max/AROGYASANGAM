import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { EmergencyBadge, ReferralStatusBadge } from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';
import { FileText, Building2, Stethoscope, Search, ArrowRight } from 'lucide-react';

const AllReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [emergencyFilter, setEmergencyFilter] = useState('ALL');

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllReferrals();
      if (res.data.success) {
        setReferrals(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const filtered = referrals.filter((r) => {
    const matchStatus = statusFilter === 'ALL' || r.status?.toUpperCase() === statusFilter;
    const matchEmergency = emergencyFilter === 'ALL' || r.emergencyLevel === emergencyFilter;
    return matchStatus && matchEmergency;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
            Network Operations Log
          </div>
          <h1 className="text-2xl font-black text-navy mt-1">Master Referral Oversight</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit patient transfer dispatches across participating hospital nodes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={emergencyFilter}
            onChange={(e) => setEmergencyFilter(e.target.value)}
            className="select-field text-xs py-1.5"
          >
            <option value="ALL">All Emergency Tiers</option>
            <option value="Critical">Critical Only</option>
            <option value="Urgent">Urgent Only</option>
            <option value="Normal">Normal Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field text-xs py-1.5"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="TRANSFER">Transfer In-Transit</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Auditing referrals stream..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No referrals match filter criteria" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                  <th className="py-3 px-4">Referral ID</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Referring Doctor</th>
                  <th className="py-3 px-4">Receiving Hospital</th>
                  <th className="py-3 px-4">Requested Bed</th>
                  <th className="py-3 px-4">Specialist</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ref) => (
                  <tr key={ref._id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-primary">
                      <Link to={`/referrals/${ref._id}`} className="hover:underline">
                        {ref.referralId}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <EmergencyBadge level={ref.emergencyLevel} />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-navy">
                      Dr. {ref.doctorId?.name || 'Physician'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ref.selectedHospital?.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{ref.requiredBed}</td>
                    <td className="py-3.5 px-4 text-slate-600">{ref.requiredSpecialist}</td>
                    <td className="py-3.5 px-4">
                      <ReferralStatusBadge status={ref.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(ref.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/referrals/${ref._id}`}
                        className="btn-secondary text-[11px] px-3 py-1 inline-flex items-center gap-1"
                      >
                        Inspect
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8">
        <HealthcareDisclaimer compact={true} />
      </div>
    </div>
  );
};

export default AllReferrals;
