import React from 'react';
import { X, Check, Minus, ShieldCheck, MapPin, ArrowRight, Activity, Pill, FlaskConical } from 'lucide-react';
import { FreshnessBadge, TierBadge } from './StatusBadge';
import { useLanguage } from '../context/LanguageContext';

const HospitalComparison = ({ hospitals = [], onClose, onSelectHospital }) => {
  const { t } = useLanguage();

  if (!hospitals || hospitals.length === 0) return null;

  const compareParams = [
    { label: 'Match Score', key: 'score' },
    { label: 'Facility Tier', key: 'tier' },
    { label: 'Distance', key: 'distance' },
    { label: 'Verification', key: 'verified' },
    { label: 'ICU Beds (Vacant / Total)', key: 'icu' },
    { label: 'General Beds (Vacant / Total)', key: 'general' },
    { label: 'Emergency Beds (Vacant / Total)', key: 'emergency' },
    { label: 'Ventilator', key: 'ventilator' },
    { label: 'Operation Theatre (OT)', key: 'ot' },
    { label: 'Cardiologist On Duty', key: 'cardio' },
    { label: 'Neurologist', key: 'neuro' },
    { label: 'Surgeon', key: 'surgeon' },
    { label: 'ECG Diagnostic', key: 'ecg' },
    { label: 'CT Scan Diagnostic', key: 'ct' },
    { label: 'MRI Diagnostic', key: 'mri' },
    { label: 'Ultrasound Diagnostic', key: 'ultrasound' },
    { label: 'Blood Pathology / Bank', key: 'blood' },
    { label: 'Essential Medicines Stock', key: 'medicines' },
    { label: '24x7 Emergency Desk', key: 'emergencyDesk' },
    { label: 'Resource Freshness', key: 'freshness' },
  ];

  const renderValue = (item, key) => {
    const h = item.hospital || item;
    const score = item.matchScore || 0;
    const distanceKm = item.distanceKm || 0;
    const fType = h.facilityType || h.hospitalType || 'Multispeciality Hospital';

    switch (key) {
      case 'score':
        return (
          <span className="text-xl font-black text-primary">
            {score}%
          </span>
        );
      case 'tier':
        return <TierBadge tier={fType} />;
      case 'distance':
        return <span className="font-bold text-navy">{distanceKm} km</span>;
      case 'verified':
        return h.verified ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
            <Check className="w-4 h-4 text-emerald-600" /> Verified
          </span>
        ) : (
          <span className="text-amber-700 text-xs font-semibold">Pending</span>
        );
      case 'icu': {
        const icu = h.beds?.icu;
        return icu ? (
          <span className={icu.available > 0 ? 'text-emerald-700 font-extrabold' : 'text-red-600 font-extrabold'}>
            {icu.available} / {icu.total}
          </span>
        ) : 'N/A';
      }
      case 'general': {
        const gen = h.beds?.general;
        return gen ? `${gen.available} / ${gen.total}` : 'N/A';
      }
      case 'emergency': {
        const em = h.beds?.emergency;
        return em ? `${em.available} / ${em.total}` : 'N/A';
      }
      case 'ventilator': {
        const avail = h.facilities?.ventilator?.available;
        return avail ? (
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <Check className="w-4 h-4 text-emerald-600" /> Available ({h.facilities?.ventilator?.quantity || 1})
          </span>
        ) : (
          <span className="text-red-600 font-bold flex items-center gap-1">
            <X className="w-4 h-4" /> Unavailable
          </span>
        );
      }
      case 'ot': {
        const avail = h.facilities?.operationTheatre?.available;
        return avail ? (
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <Check className="w-4 h-4 text-emerald-600" /> Available
          </span>
        ) : (
          <span className="text-red-600 font-bold flex items-center gap-1">
            <X className="w-4 h-4" /> Unavailable
          </span>
        );
      }
      case 'cardio': {
        const status = h.specialists?.cardiologist?.status;
        return status === 'Available' ? (
          <span className="text-emerald-700 font-bold">Available (Active)</span>
        ) : (
          <span className="text-slate-500 font-medium">{status || 'Not Available'}</span>
        );
      }
      case 'neuro': {
        const status = h.specialists?.neurologist?.status;
        return status === 'Available' ? (
          <span className="text-emerald-700 font-bold">Available</span>
        ) : (
          <span className="text-slate-500">{status || 'Not Available'}</span>
        );
      }
      case 'surgeon': {
        const status = h.specialists?.surgeon?.status;
        return status === 'Available' ? (
          <span className="text-emerald-700 font-bold">Available</span>
        ) : (
          <span className="text-slate-500">{status || 'Not Available'}</span>
        );
      }
      case 'ecg': {
        const avail = h.diagnostics?.ecg?.available || h.facilities?.ecg?.available;
        return avail ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-red-600" />;
      }
      case 'ct': {
        const avail = h.diagnostics?.ctScan?.available || h.facilities?.ctScan?.available;
        return avail ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-red-600" />;
      }
      case 'mri': {
        const avail = h.diagnostics?.mri?.available || h.facilities?.mri?.available;
        return avail ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-red-600" />;
      }
      case 'ultrasound': {
        const avail = h.diagnostics?.ultrasound?.available;
        return avail ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-red-600" />;
      }
      case 'blood': {
        const avail = h.diagnostics?.bloodTest?.available || h.facilities?.bloodBank?.available;
        return avail ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-red-600" />;
      }
      case 'medicines': {
        const inStockCount = Array.isArray(h.medicines)
          ? h.medicines.filter((m) => m.status === 'Available').length
          : 0;
        return inStockCount > 0 ? (
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <Pill className="w-3.5 h-3.5 text-primary" /> {inStockCount} In Stock
          </span>
        ) : (
          <span className="text-slate-400">Basic only</span>
        );
      }
      case 'emergencyDesk': {
        const is24x7 = h.emergencyCapability?.operation24x7;
        return is24x7 ? (
          <span className="text-emerald-700 font-bold">24x7 Active</span>
        ) : (
          <span className="text-slate-500">Daytime triage</span>
        );
      }
      case 'freshness':
        return <FreshnessBadge freshness={item.freshness} />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div>
            <h2 className="text-lg font-black text-navy">{t('btnCompare')}</h2>
            <p className="text-xs text-slate-500">
              Side-by-side comparison of public-health tier, capacity, diagnostics, and essential medicines.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-navy hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-3.5 font-bold text-slate-700 w-1/4">Evaluation Criteria</th>
                {hospitals.map((item, idx) => {
                  const h = item.hospital || item;
                  return (
                    <th key={idx} className="p-3.5 text-navy font-bold text-sm min-w-[210px]">
                      <div>
                        <div className="flex items-center gap-1">
                          {h.verified && <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />}
                          <span className="font-extrabold">{h.name}</span>
                        </div>
                        <div className="text-[11px] font-normal text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-primary" />
                          {h.district || h.city}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {compareParams.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="p-3 font-semibold text-slate-700">{row.label}</td>
                  {hospitals.map((item, hIdx) => (
                    <td key={hIdx} className="p-3">
                      {renderValue(item, row.key)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Actions row */}
              {onSelectHospital && (
                <tr className="bg-slate-100/80">
                  <td className="p-3 font-bold text-slate-700">Dispatch Decision</td>
                  {hospitals.map((item, hIdx) => {
                    const h = item.hospital || item;
                    return (
                      <td key={hIdx} className="p-3">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectHospital(h);
                            onClose();
                          }}
                          className="btn-primary text-xs px-3.5 py-2 w-full flex items-center justify-center gap-1.5 font-bold"
                        >
                          <span>Select Facility</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HospitalComparison;
