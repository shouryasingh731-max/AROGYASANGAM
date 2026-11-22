import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hospitalAPI } from '../../services/api';
import {
  Pill,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Plus,
  Trash2,
  Building2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

const Medicines = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [medicines, setMedicines] = useState([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedQty, setNewMedQty] = useState('In Stock');

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        setLoading(true);
        if (user?.hospitalId) {
          const res = await hospitalAPI.getById(user.hospitalId);
          if (res.data.success && res.data.data.medicines) {
            setMedicines(res.data.data.medicines);
          }
        }
      } catch (err) {
        setErrorMsg('Failed to load current medicine availability');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, [user]);

  const handleToggleStatus = (index) => {
    setMedicines((prev) => {
      const copy = [...prev];
      copy[index].status = copy[index].status === 'Available' ? 'Unavailable' : 'Available';
      return copy;
    });
  };

  const handleQuantityChange = (index, val) => {
    setMedicines((prev) => {
      const copy = [...prev];
      copy[index].quantity = val;
      return copy;
    });
  };

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    setMedicines([
      ...medicines,
      {
        name: newMedName.trim(),
        status: 'Available',
        quantity: newMedQty || 'In Stock',
        lastUpdated: new Date(),
      },
    ]);

    setNewMedName('');
    setNewMedQty('In Stock');
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.hospitalId) return;

    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');

      const res = await hospitalAPI.updateMedicines(user.hospitalId, { medicines });
      if (res.data.success) {
        setSuccessMsg('Medicine availability inventory updated successfully with current timestamp!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update medicine availability');
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
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-emerald-600" />
            <span>Essential Medicine Module</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mt-1">
            Essential Medicine Availability
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain availability status of emergency drugs and consumables for referring frontline workers.
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
          <LoadingSpinner message="Retrieving medicine availability records..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Add Medicine Form */}
          <form
            onSubmit={handleAddMedicine}
            className="card rounded-2xl p-4 border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center gap-3"
          >
            <input
              type="text"
              placeholder="Medicine Name (e.g., Amoxicillin, Atropine Inj)"
              value={newMedName}
              onChange={(e) => setNewMedName(e.target.value)}
              className="input-field text-xs py-2 w-full sm:flex-1 font-semibold"
            />
            <input
              type="text"
              placeholder="Stock Level (e.g. 50 vials, In Stock)"
              value={newMedQty}
              onChange={(e) => setNewMedQty(e.target.value)}
              className="input-field text-xs py-2 w-full sm:w-44 font-semibold"
            />
            <button
              type="submit"
              className="btn-secondary text-xs px-4 py-2 font-bold flex items-center gap-1.5 whitespace-nowrap w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </form>

          {/* Medicine List Table */}
          <div className="card rounded-3xl overflow-hidden border border-slate-200 shadow-sm p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="p-3.5 font-bold text-slate-700">Medicine Name</th>
                    <th className="p-3.5 font-bold text-slate-700">Availability Status</th>
                    <th className="p-3.5 font-bold text-slate-700">Reported Stock</th>
                    <th className="p-3.5 font-bold text-slate-700 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicines.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-navy text-sm">
                        {m.name}
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(idx)}
                          className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                            m.status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {m.status === 'Available' ? '✓ Available' : '✗ Unavailable'}
                        </button>
                      </td>
                      <td className="p-3.5">
                        <input
                          type="text"
                          value={m.quantity || 'In Stock'}
                          onChange={(e) => handleQuantityChange(idx, e.target.value)}
                          className="input-field text-xs py-1 px-2.5 max-w-[150px] font-semibold"
                        />
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-sm px-6 py-3 font-bold flex items-center gap-2 shadow-lg shadow-primary/25"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Medicine Availability'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;
