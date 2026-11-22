import React from 'react';
import {
  ShieldCheck,
  MapPin,
  Bed,
  UserRound,
  Wind,
  Activity,
  ArrowRight,
  Layers,
  Eye,
  Sparkles,
  FlaskConical,
  Pill,
  Check,
  X,
  Phone,
} from 'lucide-react';
import { FreshnessBadge, TierBadge } from './StatusBadge';
import MatchingScore from './MatchingScore';
import { useLanguage } from '../context/LanguageContext';

const HospitalCard = ({
  data,
  onSelect,
  onCompare,
  onViewDetails,
  isSelected = false,
  isCompared = false,
}) => {
  const { t } = useLanguage();

  const {
    hospital,
    matchScore,
    distanceKm,
    freshness,
    breakdown,
    explanations = [],
    missing = [],
    availableBedsCount,
  } = data;

  const fType = hospital.facilityType || hospital.hospitalType || 'Multispeciality Hospital';
  const icuBedsAvail = hospital.beds?.icu?.available ?? availableBedsCount ?? 0;
  const generalBedsAvail = hospital.beds?.general?.available ?? 0;
  const cardioStatus = hospital.specialists?.cardiologist?.status || 'Available';
  const ventAvail = hospital.facilities?.ventilator?.available;
  const otAvail = hospital.facilities?.operationTheatre?.available;

  // Key diagnostics
  const ecgAvail = hospital.diagnostics?.ecg?.available || hospital.facilities?.ecg?.available;
  const ctAvail = hospital.diagnostics?.ctScan?.available || hospital.facilities?.ctScan?.available;
  const xRayAvail = hospital.diagnostics?.xRay?.available || hospital.facilities?.xRay?.available;
  const bloodAvail = hospital.diagnostics?.bloodTest?.available || hospital.facilities?.bloodBank?.available;

  // Medicine availability summary
  const availableMedsCount = Array.isArray(hospital.medicines)
    ? hospital.medicines.filter((m) => m.status === 'Available').length
    : 0;

  const isExcellent = matchScore >= 90;
  const isHigh = matchScore >= 80 && matchScore < 90;

  return (
    <div
      className={`card rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${
        isSelected
          ? 'ring-2 ring-primary border-primary bg-blue-50/20 shadow-xl'
          : isExcellent
          ? 'border-slate-200/80 hover:border-primary/50 hover:shadow-xl hover:-translate-y-0.5 bg-white'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md bg-white'
      }`}
    >
      {/* Top Accent Gradient Bar for top matches */}
      {isExcellent && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary-600" />
      )}

      {/* Top Header: Tier Badge, Verification & Match % */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <TierBadge tier={fType} />

            {hospital.verified ? (
              <span className="badge-verified">
                <ShieldCheck className="w-3.5 h-3.5" />
                VERIFIED
              </span>
            ) : (
              <span className="badge-pending">
                Pending Verification
              </span>
            )}

            {isExcellent && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                <Sparkles className="w-3 h-3 text-secondary" />
                Top Recommendation
              </span>
            )}
          </div>

          <h3 className="text-xl font-extrabold text-navy tracking-tight leading-snug">
            {hospital.name}
          </h3>

          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              {hospital.address}, {hospital.district || hospital.city}
            </span>
            <span>•</span>
            <span className="font-bold text-navy bg-slate-100 px-2 py-0.5 rounded text-[11px]">
              {distanceKm} km away
            </span>
            <span>•</span>
            <span className="text-slate-400">
              ~{Math.max(5, Math.round(distanceKm * 2.5))} min transit
            </span>
            {hospital.phone && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {hospital.phone}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Score Stamp */}
        <div className="text-right flex-shrink-0 flex flex-col items-end">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black tracking-tight ${isExcellent ? 'text-primary' : isHigh ? 'text-emerald-700' : 'text-navy'}`}>
              {matchScore}%
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Matching Score
          </span>
          <div className="mt-1.5">
            <FreshnessBadge freshness={freshness} />
          </div>
        </div>
      </div>

      {/* Resource Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 text-xs">
        {/* ICU Bed */}
        <div className={`p-3 rounded-xl border transition-all ${icuBedsAvail > 0 ? 'bg-slate-50/70 border-slate-200' : 'bg-red-50/50 border-red-200'}`}>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Bed className="w-4 h-4 text-primary" />
            <span className="font-semibold text-[11px]">{t('resICU')}</span>
          </div>
          <div className="font-extrabold text-sm">
            {icuBedsAvail > 0 ? (
              <span className="text-emerald-700">{icuBedsAvail} Vacant Beds</span>
            ) : (
              <span className="text-red-600 font-bold">0 Vacant</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Gen: {generalBedsAvail} available
          </div>
        </div>

        {/* Cardiologist */}
        <div className="p-3 rounded-xl border bg-slate-50/70 border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <UserRound className="w-4 h-4 text-primary" />
            <span className="font-semibold text-[11px]">{t('resCardio')}</span>
          </div>
          <div className="font-extrabold text-sm text-navy">
            {cardioStatus === 'Available' ? (
              <span className="text-emerald-700">On Active Duty</span>
            ) : (
              <span className="text-slate-600">{cardioStatus}</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Specialist Coverage
          </div>
        </div>

        {/* Ventilator */}
        <div className={`p-3 rounded-xl border transition-all ${ventAvail ? 'bg-slate-50/70 border-slate-200' : 'bg-red-50/50 border-red-200'}`}>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Wind className="w-4 h-4 text-primary" />
            <span className="font-semibold text-[11px]">{t('resVentilator')}</span>
          </div>
          <div className="font-extrabold text-sm">
            {ventAvail ? (
              <span className="text-emerald-700">Operational</span>
            ) : (
              <span className="text-red-600">Unavailable</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            OT: {otAvail ? 'Ready' : 'No'}
          </div>
        </div>

        {/* Diagnostics & Medicines snapshot */}
        <div className="p-3 rounded-xl border bg-slate-50/70 border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <FlaskConical className="w-4 h-4 text-secondary" />
            <span className="font-semibold text-[11px]">Diagnostics & Meds</span>
          </div>
          <div className="font-bold text-xs text-navy flex items-center gap-1">
            <span className="text-emerald-700">ECG {ecgAvail ? '✓' : '✗'}</span>
            <span>•</span>
            <span className={ctAvail ? 'text-emerald-700' : 'text-slate-500'}>CT {ctAvail ? '✓' : '✗'}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
            <Pill className="w-3 h-3 text-primary inline" />
            <span>{availableMedsCount} essential meds in stock</span>
          </div>
        </div>
      </div>

      {/* Explainable Scoring Summary */}
      <div className="my-3">
        <MatchingScore
          score={matchScore}
          breakdown={breakdown}
          explanations={explanations}
          missing={missing}
          compact={false}
        />
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 flex-wrap">
        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(hospital)}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('btnViewProfile')}</span>
            </button>
          )}

          {onCompare && (
            <button
              type="button"
              onClick={() => onCompare(hospital)}
              className={`text-xs px-3.5 py-2 rounded-xl font-bold border transition-all flex items-center gap-1.5 ${
                isCompared
                  ? 'bg-blue-100 text-primary border-primary shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isCompared ? '✓ Added to Compare' : t('btnCompare')}</span>
            </button>
          )}
        </div>

        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(hospital)}
            className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 font-bold shadow-md shadow-primary/20 hover:shadow-lg"
          >
            <span>{t('btnDispatch')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default HospitalCard;
