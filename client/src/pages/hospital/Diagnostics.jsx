import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hospitalAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  FlaskConical,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

const Diagnostics = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [diagnostics, setDiagnostics] = useState({
    xRay: { available: true, quantity: 2 },
    ctScan: { available: true, quantity: 1 },
    mri: { available: false, quantity: 0 },
    ultrasound: { available: true, quantity: 2 },
    bloodTest: { available: true, quantity: 100 },
    ecg: { available: true, quantity: 4 },
    pathology: { available: true, quantity: 50 },
    other: { available: true, quantity: 1 },
  });

  const diagnosticLabels = {
    xRay: { label: 'X-Ray Machine', desc: 'Digital Radiography Unit' },
    ctScan: { label: 'CT Scan (Computed Tomography)', desc: 'Multi-slice helical CT unit' },
    mri: { label: 'MRI (Magnetic Resonance Imaging)', desc: '1.5T / 3T Magnetic Resonance' },
    ultrasound: { label: 'Ultrasound / Sonography', desc: 'Abdominal, OB/GYN, Doppler Ultrasound' },
    bloodTest: { label: 'Blood Test Pathology', desc: 'Hematology, CBC, Biochemistry lab' },
    ecg: { label: 'ECG / Electrocardiogram', desc: '12-lead cardiac monitoring units' },
    pathology: { label: 'General Pathology', desc: 'Microbiology & Histopathology testing' },
    other: { label: 'Other Rapid Testing', desc: 'Rapid viral & blood group test kits' },
  };

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        setLoading(true);
        if (user?.hospitalId) {
          const res = await hospitalAPI.getById(user.hospitalId);
          if (res.data.success && res.data.data.diagnostics) {
            setDiagnostics(res.data.data.diagnostics);
          }
        }
      } catch (err) {
        setErrorMsg('Failed to load current diagnostic availability');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, [user]);

  const handleToggle = (key) => {
    setDiagnostics((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        available: !prev[key]?.available,
      },
    }));
  };

  const handleQuantityChange = (key, val) => {
    setDiagnostics((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        quantity: Math.max(0, parseInt(val) || 0),
      },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.hospitalId) return;

    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');

      const res = await hospitalAPI.updateDiagnostics(user.hospitalId, diagnostics);
      if (res.data.success) {
        setSuccessMsg('Diagnostic test readiness updated successfully with new timestamp!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update diagnostic availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb */}
      <div className="mb-4">
        <Link
          to="/hospital"
          className="text-xs font-bold text-slate-500 hover:text-navy inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Facility Dashboard</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4" />
            <span>Facility Resource Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mt-1">
            Update Diagnostic Test Readiness
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain operational status of diagnostics so referring health workers can route patients accurately.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-300 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner message="Retrieving diagnostic readiness data..." />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(diagnosticLabels).map(([key, info]) => {
              const item = diagnostics[key] || { available: false, quantity: 0 };
              return (
                <div
                  key={key}
                  className={`card rounded-2xl p-5 border transition-all ${
                    item.available
                      ? 'border-slate-200 bg-white shadow-sm'
                      : 'border-slate-200 bg-slate-50/50 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-navy">{info.label}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{info.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggle(key)}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                        item.available
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {item.available ? '✓ Operational' : '✗ Unavailable'}
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 font-semibold">Active Units / Tests:</span>
                    <input
                      type="number"
                      min="0"
                      disabled={!item.available}
                      value={item.quantity || 0}
                      onChange={(e) => handleQuantityChange(key, e.target.value)}
                      className="w-24 text-right input-field text-xs py-1 px-2 font-bold disabled:bg-slate-100"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-sm px-6 py-3 font-bold flex items-center gap-2 shadow-lg shadow-primary/25"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Diagnostic Readiness'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Diagnostics;
