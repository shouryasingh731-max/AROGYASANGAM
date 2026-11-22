import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { referralAPI } from '../../services/api';
import { EmergencyBadge, ReferralStatusBadge } from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { FileText, Search, Building2, PlusCircle, ArrowRight } from 'lucide-react';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';

const MyReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await referralAPI.getDoctorReferrals();
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
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'CRITICAL'
        ? r.emergencyLevel === 'Critical'
        : r.status?.toUpperCase() === statusFilter;

    const matchesSearch =
      r.referralId.toLowerCase().includes(search.toLowerCase()) ||
      r.patientReference.toLowerCase().includes(search.toLowerCase()) ||
      r.selectedHospital?.name?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary">
            Referral Records
          </div>
          <h1 className="text-2xl font-black text-navy mt-1">My Patient Referrals</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track referral progress, acceptance updates, and clinical dispatch timelines.
          </p>
        </div>
        <Link to="/doctor/create-referral" className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          <span>New Referral</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card mb-6 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['ALL', 'PENDING', 'ACCEPTED', 'TRANSFER', 'COMPLETED', 'REJECTED', 'CRITICAL'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search referral ID, hospital..."
              className="input-field pl-9 py-1.5 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      {loading ? (
        <LoadingSpinner message="Fetching referral history..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No referrals found"
          description="Try changing your search or status filter."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Referral ID</th>
                  <th className="py-3 px-4">Patient Reference</th>
                  <th className="py-3 px-4">Emergency</th>
                  <th className="py-3 px-4">Receiving Hospital</th>
                  <th className="py-3 px-4">Required Bed</th>
                  <th className="py-3 px-4">Specialist</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Dispatched At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ref) => (
                  <tr key={ref._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary">
                      <Link to={`/referrals/${ref._id}`} className="hover:underline">
                        {ref.referralId}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-navy">
                      {ref.patientReference} ({ref.patientAge}y, {ref.patientGender})
                    </td>
                    <td className="py-3.5 px-4">
                      <EmergencyBadge level={ref.emergencyLevel} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ref.selectedHospital?.name || 'Assigned Hospital'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {ref.requiredBed}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {ref.requiredSpecialist}
                    </td>
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
                        <span>View</span>
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

      <div className="mt-6">
        <HealthcareDisclaimer compact={true} />
      </div>
    </div>
  );
};

export default MyReferrals;
