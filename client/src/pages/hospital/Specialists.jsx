import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hospitalAPI } from '../../services/api';
import { UserRound, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';

const Specialists = () => {
  const { user } = useAuth();
  const [specialists, setSpecialists] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchSpecialists = async () => {
    try {
      setLoading(true);
      if (user?.hospitalId) {
        const res = await hospitalAPI.getById(user.hospitalId);
        if (res.data.success) {
          setSpecialists(res.data.data.specialists);
        }
      }
    } catch (err) {
      setError('Failed to fetch specialist roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialists();
  }, [user]);

  const handleStatusChange = (key, status) => {
    setSpecialists((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        status,
        lastUpdated: new Date(),
      },
    }));
  };

  const handleCountChange = (key, count) => {
    const num = Math.max(0, parseInt(count, 10) || 0);
    setSpecialists((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        doctorCount: num,
        lastUpdated: new Date(),
      },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      setSaving(true);
      const res = await hospitalAPI.updateSpecialists(user.hospitalId, specialists);
      if (res.data.success) {
        setMessage('Specialist on-duty roster updated successfully!');
        setSpecialists(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update specialists.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <LoadingSpinner message="Loading specialist roster..." />
      </div>
    );
  }

  const specialistList = [
    { key: 'cardiologist', label: 'Cardiologist (Interventional / Clinical)' },
    { key: 'neurologist', label: 'Neurologist / Neurosurgeon' },
    { key: 'orthopedic', label: 'Orthopedic Surgeon' },
    { key: 'pediatrician', label: 'Pediatrician / Neonatologist' },
    { key: 'surgeon', label: 'General / Trauma Surgeon' },
    { key: 'other', label: 'Other On-Duty Specialists' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-4 border-b border-slate-200 mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-primary">
          Clinical Staff Management
        </div>
        <h1 className="text-2xl font-black text-navy mt-1">Specialists On Duty</h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain accurate specialist availability statuses to guide incoming trauma triage.
        </p>
      </div>

      {message && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specialistList.map(({ key, label }) => {
            const item = specialists?.[key] || { status: 'Available', doctorCount: 1 };

            return (
              <div key={key} className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserRound className="w-4 h-4 text-primary" />
                    <h4 className="font-bold text-xs text-navy">{label}</h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Availability Status
                    </label>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(key, e.target.value)}
                      className="select-field text-xs py-1.5 font-medium"
                    >
                      <option value="Available">Available On Duty</option>
                      <option value="Accepting Referrals">Accepting Referrals</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Physicians On Duty
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={item.doctorCount}
                      onChange={(e) => handleCountChange(key, e.target.value)}
                      className="input-field text-xs py-1.5 text-center font-bold"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2 shadow-md shadow-primary/20"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Specialist Roster'}</span>
          </button>
        </div>
      </form>

      <div className="mt-8">
        <HealthcareDisclaimer compact={true} />
      </div>
    </div>
  );
};

export default Specialists;
