import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hospitalAPI } from '../../services/api';
import { Bed, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';

const Beds = () => {
  const { user } = useAuth();
  const [beds, setBeds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchBeds = async () => {
    try {
      setLoading(true);
      if (user?.hospitalId) {
        const res = await hospitalAPI.getById(user.hospitalId);
        if (res.data.success) {
          setBeds(res.data.data.beds);
        }
      }
    } catch (err) {
      setError('Failed to fetch current bed data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeds();
  }, [user]);

  const handleBedChange = (key, field, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setBeds((prev) => {
      const current = prev[key];
      const newTotal = field === 'total' ? num : current.total;
      const newOccupied = field === 'occupied' ? num : current.occupied;
      return {
        ...prev,
        [key]: {
          total: newTotal,
          occupied: newOccupied,
          available: Math.max(0, newTotal - newOccupied),
          lastUpdated: new Date(),
        },
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Client-side validation: occupied cannot be > total
    for (const [key, b] of Object.entries(beds)) {
      if (b.occupied > b.total) {
        setError(`Occupied beds (${b.occupied}) cannot exceed total beds (${b.total}) for ${key.toUpperCase()}.`);
        return;
      }
    }

    try {
      setSaving(true);
      const res = await hospitalAPI.updateBeds(user.hospitalId, beds);
      if (res.data.success) {
        setMessage('Hospital bed capacities updated and broadcasted successfully!');
        setBeds(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update beds.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <LoadingSpinner message="Loading bed capacity inventory..." />
      </div>
    );
  }

  const bedCategories = [
    { key: 'icu', title: 'ICU Beds (Intensive Care)', desc: 'Dedicated critical care beds with monitoring' },
    { key: 'emergency', title: 'Emergency Department Beds', desc: 'Acute stabilization and trauma bays' },
    { key: 'general', title: 'General Ward Beds', desc: 'Inpatient recovery and general care' },
    { key: 'nicu', title: 'NICU Beds (Neonatal ICU)', desc: 'Specialized neonatal intensive care units' },
    { key: 'picu', title: 'PICU Beds (Pediatric ICU)', desc: 'Pediatric critical care incubators and beds' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-primary">
          Resource Capacity Management
        </div>
        <h1 className="text-2xl font-black text-navy mt-1">Manage Hospital Beds</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update total and occupied counts. Available beds are calculated automatically (Available = Total - Occupied).
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
        <div className="grid grid-cols-1 gap-4">
          {bedCategories.map(({ key, title, desc }) => {
            const b = beds?.[key] || { total: 0, occupied: 0, available: 0 };
            const isFull = b.available === 0;

            return (
              <div key={key} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                <div className="sm:w-1/3">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-sm text-navy">{title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{desc}</p>
                </div>

                <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Total Beds
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={b.total}
                      onChange={(e) => handleBedChange(key, 'total', e.target.value)}
                      className="input-field w-24 text-center font-bold text-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Occupied
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={b.occupied}
                      onChange={(e) => handleBedChange(key, 'occupied', e.target.value)}
                      className="input-field w-24 text-center font-bold text-navy"
                    />
                  </div>

                  <div className="min-w-[100px] text-center pl-2">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">Available</div>
                    <div
                      className={`text-xl font-black ${
                        isFull ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {b.available}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isFull ? 'At Capacity' : 'Vacant'}
                    </div>
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
            <span>{saving ? 'Updating Capacities...' : 'Save & Update Bed Inventory'}</span>
          </button>
        </div>
      </form>

      <div className="mt-8">
        <HealthcareDisclaimer compact={true} />
      </div>
    </div>
  );
};

export default Beds;
