import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Stethoscope, CheckCircle2, XCircle, Phone, Mail, Building2 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDoctors();
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleToggle = async (id) => {
    try {
      setUpdatingId(id);
      const res = await adminAPI.toggleDoctorStatus(id);
      if (res.data.success) {
        setDoctors((prev) =>
          prev.map((d) => (d._id === id ? { ...d, active: res.data.data.active } : d))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle doctor status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-6 border-b border-slate-200 mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
          User Management
        </div>
        <h1 className="text-2xl font-black text-navy mt-1">Registered Physicians Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review medical credentials, council registration numbers, and manage doctor activation states.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching doctor accounts..." />
      ) : doctors.length === 0 ? (
        <EmptyState title="No doctors registered yet" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                  <th className="py-3 px-4">Doctor Name</th>
                  <th className="py-3 px-4">Medical ID</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Affiliated Clinic/Hospital</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-navy">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold">
                          {doc.name.charAt(0)}
                        </div>
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {doc.professionalId || 'DOC-PENDING'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{doc.specialization}</td>
                    <td className="py-3.5 px-4 text-slate-600">{doc.hospitalName || 'Independent'}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{doc.email}</div>
                      <div className="text-[10px] text-slate-400">{doc.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {doc.active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        disabled={updatingId === doc._id}
                        onClick={() => handleToggle(doc._id)}
                        className={`text-xs px-3 py-1 rounded font-medium border ${
                          doc.active
                            ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                            : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                        }`}
                      >
                        {doc.active ? 'Deactivate' : 'Activate'}
                      </button>
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

export default DoctorsList;
