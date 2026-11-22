import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  Activity,
  Layers,
  FileEdit,
  Send,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const EmergencyBadge = ({ level }) => {
  const { t } = useLanguage();
  const lvl = level?.toLowerCase();

  switch (lvl) {
    case 'critical':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300 shadow-sm animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
          <span>{t('emergencyCritical')}</span>
        </span>
      );
    case 'urgent':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          <span>{t('emergencyUrgent')}</span>
        </span>
      );
    case 'normal':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
          <span>{t('emergencyNormal')}</span>
        </span>
      );
  }
};

export const ReferralStatusBadge = ({ status }) => {
  const { t } = useLanguage();
  const st = status?.toLowerCase();

  switch (st) {
    case 'accepted':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('statusAccepted')}</span>
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          <span>{t('statusRejected')}</span>
        </span>
      );
    case 'transfer':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">
          <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          <span>{t('statusTransfer')}</span>
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
          <span>{t('statusCompleted')}</span>
        </span>
      );
    case 'draft':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <FileEdit className="w-3.5 h-3.5 text-slate-400" />
          <span>{t('statusDraft')}</span>
        </span>
      );
    case 'sent':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Send className="w-3.5 h-3.5 text-blue-500" />
          <span>{t('statusSent')}</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
          <XCircle className="w-3.5 h-3.5 text-gray-400" />
          <span>{t('statusCancelled')}</span>
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>{t('statusPending')}</span>
        </span>
      );
  }
};

export const FreshnessBadge = ({ freshness }) => {
  const { t } = useLanguage();
  if (!freshness) return null;

  const st = freshness.status?.toLowerCase();

  if (st === 'fresh') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-lg border border-emerald-300"
        title="Resource data freshly confirmed within 15 mins"
      >
        <Clock className="w-3 h-3 text-emerald-600" />
        <span>{t('freshFresh')} • {freshness.text}</span>
      </span>
    );
  } else if (st === 'recently_updated' || st === 'warning') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200"
        title="Resource data reported within 2 hours"
      >
        <Clock className="w-3 h-3 text-blue-600" />
        <span>{t('freshRecent')} • {freshness.text}</span>
      </span>
    );
  } else if (st === 'needs_verification') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"
        title="Confirm availability with receiving facility"
      >
        <Clock className="w-3 h-3 text-amber-600" />
        <span>{t('freshVerify')} • {freshness.text}</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-300"
      title="Availability data is older than 24 hours"
    >
      <Clock className="w-3 h-3 text-slate-400" />
      <span>{t('freshOld')} • {freshness.text}</span>
    </span>
  );
};

export const TierBadge = ({ tier }) => {
  switch (tier) {
    case 'Sub-Centre':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-md">
          <Layers className="w-3 h-3" />
          <span>Tier 1: Sub-Centre</span>
        </span>
      );
    case 'PHC':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-300 px-2.5 py-0.5 rounded-md">
          <Activity className="w-3 h-3" />
          <span>Tier 2: PHC</span>
        </span>
      );
    case 'Rural Hospital':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-300 px-2.5 py-0.5 rounded-md">
          <Building className="w-3 h-3" />
          <span>Tier 3: Rural Hospital (CHC)</span>
        </span>
      );
    case 'District Hospital':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-300 px-2.5 py-0.5 rounded-md">
          <Building className="w-3 h-3" />
          <span>Tier 4: District Hospital</span>
        </span>
      );
    case 'Specialized Hospital':
    case 'Multispeciality Hospital':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-300 px-2.5 py-0.5 rounded-md">
          <ShieldCheck className="w-3 h-3" />
          <span>Tier 5: Specialized Care</span>
        </span>
      );
  }
};
