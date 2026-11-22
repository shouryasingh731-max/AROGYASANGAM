import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are currently no records to display.',
  actionText,
  onAction,
}) => {
  return (
    <div className="card text-center p-8 sm:p-12">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-navy mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-4">
        {description}
      </p>
      {actionText && onAction && (
        <button type="button" onClick={onAction} className="btn-primary text-xs px-4 py-2">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
