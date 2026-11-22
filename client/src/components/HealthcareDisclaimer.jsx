import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const HealthcareDisclaimer = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5 shadow-sm">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Healthcare Coordination Notice: </span>
          {t('safetyDisclaimer')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 my-4 shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 bg-blue-100/70 rounded-xl text-primary flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-navy">Public Health & Clinical Safety Notice</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {t('safetyDisclaimer')}
          </p>
          <div className="mt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            Facility capacities are updated by participating public-health staff and confirmed during referral triage.
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthcareDisclaimer;
