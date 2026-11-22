import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { ShieldCheck, CheckCircle2, XCircle, Building2, MapPin, Phone } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';

const VerifyHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'Pending Verification' or 'Verified'
  const [actioningId, setActioningId] = useState(null);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getHospitals();
      if (res.data.success) {
        setHospitals(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleVerify = async (id, action) => {
    try {
      setActioningId(id);
      const res = await adminAPI.verifyHospital(id, action);
      if (res.data.success) {
        setHospitals((prev) =>
          prev.map((h) => (h._id === id ? res.data.data : h))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update verification status');
    } finally {
      setActioningId(null);
    }
  };

  const filtered = hospitals.filter((h) => {
    if (filter === 'ALL') return true;
    return h.verificationStatus === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
            Administrative Governance
          </div>
          <h1 className="text-2xl font-black text-navy mt-1">Hospital Verification Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review hospital registrations, inspect medical licenses, and grant or revoke platform Verified badges.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {['ALL', 'Pending Verification', 'Verified', 'Rejected'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                filter === tab ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching hospital directory and verification records..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No hospitals found"
          description="There are currently no hospitals matching this filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((h) => (
            <div key={h._id} className="card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {h.verified ? (
                      <span className="badge-verified">
                        <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED HOSPITAL
                      </span>
                    ) : (
                      <span className="badge-pending">
                        Pending Verification
                      </span>
                    )}
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                      {h.hospitalType}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    Registered: {new Date(h.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-navy">{h.name}</h3>

                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{h.address}, {h.city}, {h.state}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>{h.phone} • {h.email}</span>
                  </div>
                </div>

                {/* Capacity brief */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-center">
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-[10px] text-slate-400 block font-semibold">ICU Beds</span>
                    <span className="font-bold text-navy">{h.beds?.icu?.available || 0} Vacant</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-[10px] text-slate-400 block font-semibold">Emergency</span>
                    <span className="font-bold text-navy">{h.beds?.emergency?.available || 0} Vacant</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-[10px] text-slate-400 block font-semibold">General</span>
                    <span className="font-bold text-navy">{h.beds?.general?.available || 0} Vacant</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                {!h.verified && (
                  <button
                    type="button"
                    disabled={actioningId === h._id}
                    onClick={() => handleVerify(h._id, 'approve')}
                    className="btn-success text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                )}

                {h.verificationStatus !== 'Rejected' && (
                  <button
                    type="button"
                    disabled={actioningId === h._id}
                    onClick={() => handleVerify(h._id, 'reject')}
                    className="btn-danger text-xs px-3.5 py-2 flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <HealthcareDisclaimer compact={true} />
      </div>
    </div>
  );
};

export default VerifyHospitals;
