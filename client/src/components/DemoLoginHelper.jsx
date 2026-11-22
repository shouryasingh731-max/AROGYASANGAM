import React from 'react';
import { Stethoscope, Building2, ShieldAlert, Sparkles, HeartHandshake, Hospital } from 'lucide-react';

const DemoLoginHelper = ({ onSelectAccount }) => {
  const demoAccounts = [
    {
      role: 'Frontline Worker',
      name: 'Asha Devi (ASHA / ANM)',
      email: 'asha.devi@smartcare.demo',
      password: 'Worker@123',
      sub: 'Mohanlalganj Community PHC',
      icon: HeartHandshake,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    },
    {
      role: 'Doctor (PHC)',
      name: 'Dr. Arjun Mehta',
      email: 'arjun@smartcare.demo',
      password: 'Doctor@123',
      sub: 'Medical Officer / PHC',
      icon: Stethoscope,
      badgeColor: 'bg-blue-100 text-primary border-blue-200',
    },
    {
      role: 'Specialized Hospital',
      name: 'Apex Trauma & Critical Care',
      email: 'apex@smartcare.demo',
      password: 'Hospital@123',
      sub: 'Level 1 Trauma Triage',
      icon: Hospital,
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
    },
    {
      role: 'Multispeciality',
      name: 'CityCare Hospital',
      email: 'citycare@smartcare.demo',
      password: 'Hospital@123',
      sub: 'Receiving Triage Desk',
      icon: Building2,
      badgeColor: 'bg-teal-100 text-secondary border-teal-200',
    },
    {
      role: 'District Hospital',
      name: 'Dr. RML District Hospital',
      email: 'district.hospital@smartcare.demo',
      password: 'Hospital@123',
      sub: 'District Referral Desk',
      icon: Building2,
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    },
    {
      role: 'Authority Admin',
      name: 'Health Authority Admin',
      email: 'admin@smartcare.demo',
      password: 'Admin@123',
      sub: 'Network Oversight & Verification',
      icon: ShieldAlert,
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-teal-50/80 border border-slate-200 rounded-2xl p-4 my-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            1-Click Demo Accounts (Public Health Network)
          </span>
        </div>
        <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
          DEMO MODE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {demoAccounts.map((acc, idx) => {
          const Icon = acc.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectAccount(acc.email, acc.password)}
              className="text-left bg-white hover:bg-primary-50/60 p-2.5 rounded-xl border border-slate-200 hover:border-primary/50 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${acc.badgeColor}`}>
                  {acc.role}
                </span>
                <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
              <div className="font-bold text-xs text-navy group-hover:text-primary transition-colors truncate">
                {acc.name}
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{acc.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DemoLoginHelper;
