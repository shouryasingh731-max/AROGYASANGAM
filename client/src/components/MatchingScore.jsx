import React from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const MatchingScore = ({ score, breakdown, explanations = [], missing = [], compact = false }) => {
  const [expanded, setExpanded] = React.useState(false);

  const getLabel = (s) => {
    if (s >= 90) return { text: 'EXCELLENT MATCH', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (s >= 80) return { text: 'HIGH MATCH', color: 'text-primary bg-blue-50 border-blue-200' };
    if (s >= 65) return { text: 'MODERATE MATCH', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { text: 'LIMITED MATCH', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const label = getLabel(score);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-primary">{score}%</span>
          <span className="text-xs text-slate-500 font-medium">match</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${label.color}`}>
          {label.text}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold text-primary">{score}%</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${label.color}`}>
              {label.text}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Multi-factor resource matching calculation</p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
        >
          {expanded ? 'Hide Details' : 'View Scoring Breakdown'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Breakdown progress bars */}
      {breakdown && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200 text-xs">
          <div>
            <div className="flex justify-between text-slate-600 mb-1">
              <span>Bed Avail</span>
              <span className="font-semibold text-navy">{breakdown.bedScore}/40</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${(breakdown.bedScore / 40) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-slate-600 mb-1">
              <span>Facilities</span>
              <span className="font-semibold text-navy">{breakdown.facilityScore}/30</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-300"
                style={{ width: `${(breakdown.facilityScore / 30) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-slate-600 mb-1">
              <span>Specialist</span>
              <span className="font-semibold text-navy">{breakdown.specialistScore}/20</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(breakdown.specialistScore / 20) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-slate-600 mb-1">
              <span>Distance</span>
              <span className="font-semibold text-navy">{breakdown.distanceScore}/10</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(breakdown.distanceScore / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detailed explainable item checklist */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
          <h5 className="text-xs font-semibold text-navy uppercase tracking-wider">Matching Explanation:</h5>
          <div className="space-y-1.5">
            {explanations.map((exp, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/70 px-2.5 py-1 rounded-md border border-emerald-100">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{exp.replace(/^✓\s*/, '')}</span>
              </div>
            ))}
            {missing.map((miss, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50/70 px-2.5 py-1 rounded-md border border-rose-100">
                <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                <span>{miss.replace(/^✗\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingScore;
