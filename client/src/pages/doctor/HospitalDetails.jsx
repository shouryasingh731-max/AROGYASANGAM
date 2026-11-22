import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hospitalAPI } from '../../services/api';
import {
  Building2,
  ShieldCheck,
  MapPin,
  Phone,
  Clock,
  Bed,
  Activity,
  UserRound,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { FreshnessBadge } from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';

const HospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        setLoading(true);
        const res = await hospitalAPI.getById(id);
        if (res.data.success) {
          setHospital(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load hospital details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospital();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <LoadingSpinner message="Loading hospital profile and verified resources..." />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-navy">Hospital Not Found</h2>
        <button onClick={() => navigate(-1)} className="btn-secondary text-xs mt-4">
          Go Back
        </button>
      </div>
    );
  }

  const bedTypes = [
    { key: 'general', label: 'General Ward' },
    { key: 'icu', label: 'ICU Beds' },
    { key: 'emergency', label: 'Emergency Wing' },
    { key: 'nicu', label: 'NICU' },
    { key: 'picu', label: 'PICU' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-xs text-slate-500 hover:text-navy flex items-center gap-1.5 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Search Results
      </button>

      {/* Hospital Profile Header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {hospital.verified ? (
                <span className="badge-verified">
                  <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED HOSPITAL
                </span>
              ) : (
                <span className="badge-pending">Pending Verification</span>
              )}
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {hospital.hospitalType}
              </span>
            </div>
            <h1 className="text-2xl font-black text-navy">{hospital.name}</h1>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {hospital.address}, {hospital.city}, {hospital.state}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-primary" />
                {hospital.phone}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <FreshnessBadge freshness={hospital.icuFreshness} />
            <button
              type="button"
              onClick={() => navigate('/doctor/find-hospitals')}
              className="btn-primary text-xs px-4 py-2"
            >
              Dispatch Referral Here
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-3 italic">
          Resource counts are reported by the hospital and refreshed on routine clinical cycles. Please confirm critical bed holds during dispatch.
        </p>
      </div>

      {/* Bed Inventory */}
      <div className="card mb-6">
        <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
          <Bed className="w-4 h-4 text-primary" />
          Reported Bed Capacities (Formula: Available = Total - Occupied)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {bedTypes.map(({ key, label }) => {
            const b = hospital.beds?.[key] || { total: 0, occupied: 0, available: 0 };
            return (
              <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-medium text-slate-500">{label}</div>
                <div className="text-xl font-bold text-navy mt-1">
                  <span className={b.available > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                    {b.available}
                  </span>
                  <span className="text-xs text-slate-400 font-normal"> / {b.total}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{b.occupied} occupied</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medical Facilities */}
      <div className="card mb-6">
        <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-secondary" />
          Critical Facilities & Diagnostics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {hospital.facilities &&
            Object.entries(hospital.facilities).map(([key, val]) => (
              <div
                key={key}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  val.available ? 'bg-slate-50 border-slate-200' : 'bg-red-50/40 border-red-200 text-slate-400'
                }`}
              >
                <div>
                  <div className="font-semibold text-navy capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="text-[10px] text-slate-400">{val.available ? `Quantity: ${val.quantity}` : 'Unavailable'}</div>
                </div>
                {val.available ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Specialists On Duty */}
      <div className="card mb-6">
        <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
          <UserRound className="w-4 h-4 text-primary" />
          Specialists On Duty
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {hospital.specialists &&
            Object.entries(hospital.specialists).map(([key, val]) => (
              <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-navy capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      val.status === 'Available'
                        ? 'bg-emerald-500'
                        : val.status === 'Accepting Referrals'
                        ? 'bg-primary'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="font-medium text-slate-700">{val.status}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      <HealthcareDisclaimer compact={true} />
    </div>
  );
};

export default HospitalDetails;
