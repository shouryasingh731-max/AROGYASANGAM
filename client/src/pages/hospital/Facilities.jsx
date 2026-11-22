import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hospitalAPI } from '../../services/api';
import { Activity, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';

const Facilities = () => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      if (user?.hospitalId) {
        const res = await hospitalAPI.getById(user.hospitalId);
        if (res.data.success) {
          setFacilities(res.data.data.facilities);
        }
      }
    } catch (err) {
      setError('Failed to fetch facilities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [user]);

  const toggleFacility = (key) => {
    setFacilities((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        available: !prev[key]?.available,
        lastUpdated: new Date(),
      },
    }));
  };

  const handleQuantityChange = (key, qty) => {
    const num = Math.max(0, parseInt(qty, 10) || 0);
    setFacilities((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        quantity: num,
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
      const res = await hospitalAPI.updateFacilities(user.hospitalId, facilities);
      if (res.data.success) {
        setMessage('Facility and diagnostic availability updated successfully!');
        setFacilities(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update facilities.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <LoadingSpinner message="Loading facilities status..." />
      </div>
    );
  }

  const facilityList = [
    { key: 'icu', label: 'Intensive Care Unit (ICU Setup)' },
    { key: 'ventilator', label: 'Mechanical Ventilators' },
    { key: 'operationTheatre', label: 'Operation Theatres (OT)' },
    { key: 'ctScan', label: 'CT Scanner (128-Slice / Multi-detector)' },
    { key: 'mri', label: 'MRI Unit (1.5T / 3T)' },
    { key: 'xRay', label: 'Digital X-Ray / Fluoroscopy' },
    { key: 'bloodBank', label: 'Licensed Blood Bank' },
    { key: 'dialysis', label: 'Hemodialysis Unit' },
    { key: 'ecg', label: 'ECG / 2D Echocardiography' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-4 border-b border-slate-200 mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-primary">
          Infrastructure Management
        </div>
        <h1 className="text-2xl font-black text-navy mt-1">Medical Equipment & Facilities</h1>
        <p className="text-xs text-slate-500 mt-1">
          Keep equipment operational status current to prevent transfer delays for critical patients.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilityList.map(({ key, label }) => {
            const item = facilities?.[key] || { available: false, quantity: 0 };
            return (
              <div
                key={key}
                className={`card p-4 transition-all ${
                  item.available ? 'border-primary/40 bg-blue-50/20' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h4 className="font-bold text-xs text-navy">{label}</h4>
                  <button
                    type="button"
                    onClick={() => toggleFacility(key)}
                    className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${
                      item.available
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Operational Units:</span>
                  <input
                    type="number"
                    min="0"
                    disabled={!item.available}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(key, e.target.value)}
                    className="input-field w-20 text-center py-1 text-xs"
                  />
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
            <span>{saving ? 'Updating...' : 'Save Facility Statuses'}</span>
          </button>
        </div>
      </form>

      <div className="mt-8">
        <HealthcareDisclaimer compact={true} />
      </div>
    </div>
  );
};

export default Facilities;
