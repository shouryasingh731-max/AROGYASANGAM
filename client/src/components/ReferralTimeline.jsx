import React from 'react';
import { CheckCircle2, Clock, XCircle, ArrowRight, Ambulance, CheckCheck } from 'lucide-react';

const ReferralTimeline = ({ timeline = [], currentStatus = 'Pending' }) => {
  const isRejected = currentStatus === 'Rejected';

  const stages = isRejected
    ? [
        { id: 'Created', label: 'Created' },
        { id: 'Pending', label: 'Pending Review' },
        { id: 'Rejected', label: 'Declined' },
      ]
    : [
        { id: 'Created', label: 'Created' },
        { id: 'Pending', label: 'Pending Review' },
        { id: 'Accepted', label: 'Accepted' },
        { id: 'Transfer', label: 'Transfer In-Transit' },
        { id: 'Completed', label: 'Completed' },
      ];

  const getStageIndex = (status) => {
    return stages.findIndex((s) => s.id.toLowerCase() === status?.toLowerCase());
  };

  const currentIndex = getStageIndex(currentStatus);

  const getEventForStage = (stageId) => {
    return timeline.find((t) => t.status?.toLowerCase() === stageId?.toLowerCase());
  };

  return (
    <div className="py-3">
      {/* Horizontal milestone bar */}
      <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4">
        {/* Background track line */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
        
        {/* Active progress fill */}
        <div
          className={`absolute left-8 top-1/2 -translate-y-1/2 h-1 transition-all duration-500 z-0 ${
            isRejected ? 'bg-rose-500' : 'bg-primary'
          }`}
          style={{
            width: `${Math.max(0, Math.min(100, (currentIndex / (stages.length - 1)) * 100))}%`,
          }}
        />

        {stages.map((stage, index) => {
          const isPassed = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const event = getEventForStage(stage.id);

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isCurrent && isRejected
                    ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                    : isCurrent
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : isPassed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {stage.id === 'Rejected' ? (
                  <XCircle className="w-4 h-4" />
                ) : stage.id === 'Transfer' ? (
                  <Ambulance className="w-4 h-4" />
                ) : stage.id === 'Completed' ? (
                  <CheckCheck className="w-4 h-4" />
                ) : isPassed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>

              <span
                className={`text-[11px] font-semibold mt-2 whitespace-nowrap ${
                  isCurrent && isRejected
                    ? 'text-rose-600'
                    : isCurrent
                    ? 'text-primary'
                    : isPassed
                    ? 'text-navy'
                    : 'text-slate-400'
                }`}
              >
                {stage.label}
              </span>

              {event?.timestamp && (
                <span className="text-[10px] text-slate-400">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed event log underneath */}
      {timeline.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100 max-w-2xl mx-auto space-y-2">
          <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Referral Activity Log</h5>
          <div className="space-y-2">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-navy">[{item.status}]</span>
                  <span className="text-slate-600">{item.note}</span>
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">
                  {new Date(item.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralTimeline;
