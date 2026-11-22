import React, { useState, useEffect } from 'react';
import { X, UserRound, History, ArrowRight, ShieldCheck, Clock, FileText, Activity } from 'lucide-react';
import { patientAPI } from '../services/api';
import { EmergencyBadge, ReferralStatusBadge } from './StatusBadge';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

const PatientContinuityModal = ({ patientId, onClose }) => {
  const { t } = useLanguage();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;
      try {
        setLoading(true);
        setError('');
        const res = await patientAPI.getById(patientId);
        if (res.data.success) {
          setPatient(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Patient continuity record not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  if (!patientId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-navy">
                Basic Patient Continuity Record
              </h2>
              <p className="text-xs text-slate-500">
                Lightweight referral escalation history across public-health facilities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-navy hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner message="Retrieving patient continuity history..." />
            </div>
          ) : error ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <p className="text-amber-800 font-semibold mb-1">{error}</p>
              <p>No prior referrals recorded for reference {patientId}.</p>
            </div>
          ) : patient ? (
            <div className="space-y-6">
              {/* Demographics Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Patient ID</span>
                  <span className="font-extrabold text-navy text-sm">{patient.patientId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Name / Demographics</span>
                  <span className="font-bold text-navy">
                    {patient.name} ({patient.age}y, {patient.gender})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Current Facility</span>
                  <span className="font-bold text-primary">
                    {patient.currentFacility?.name || 'In Referral'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {patient.currentFacility?.facilityType}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Initial Entry Point</span>
                  <span className="font-bold text-navy">
                    {patient.initialFacility?.name || 'Sub-Centre / PHC'}
                  </span>
                </div>
              </div>

              {/* Referral Pathway Timeline */}
              <div>
                <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-primary" />
                  Referral Continuity Trail
                </h3>

                {patient.referralHistory && patient.referralHistory.length > 0 ? (
                  <div className="relative border-l-2 border-primary/20 ml-3.5 space-y-6 pl-6">
                    {patient.referralHistory.map((item, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-sm" />
                        
                        <div className="card rounded-2xl p-4 border border-slate-200/90 shadow-sm bg-white">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                            <span className="text-xs font-black text-primary">
                              {item.referralId}
                            </span>
                            <div className="flex items-center gap-2">
                              <EmergencyBadge level={item.emergencyLevel} />
                              <ReferralStatusBadge status={item.status} />
                            </div>
                          </div>

                          {/* Source -> Target */}
                          <div className="flex items-center gap-2 text-xs font-bold text-navy my-2 flex-wrap">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                              {item.sourceFacilityName} ({item.sourceFacilityType})
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="bg-blue-50 text-primary px-2 py-0.5 rounded border border-blue-200">
                              {item.targetFacilityName} ({item.targetFacilityType})
                            </span>
                          </div>

                          {item.reason && (
                            <p className="text-xs text-slate-600 mt-1 italic">
                              "{item.reason}"
                            </p>
                          )}

                          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{new Date(item.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No prior referrals recorded.</p>
                )}
              </div>

              {/* Public health privacy notice */}
              <div className="text-[11px] text-slate-500 bg-slate-100/70 p-3 rounded-xl border border-slate-200">
                🔒 <strong>Patient Privacy Notice:</strong> This continuity record stores only non-clinical referral transfer coordination logs. Clinical patient records remain within institutional hospital EHRs.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PatientContinuityModal;
