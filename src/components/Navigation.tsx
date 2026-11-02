'use client';

import React from 'react';
import { LayoutDashboard, ArrowDownLeft, ArrowUpRight, PiggyBank, ShieldCheck } from 'lucide-react';

export type TabType = 'inicio' | 'ingresos' | 'egresos' | 'ahorro' | 'patrimonio';

interface NavigationProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onChangeTab }) => {
  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
    { id: 'ingresos', label: 'Ingresos', icon: ArrowDownLeft },
    { id: 'egresos', label: 'Egresos', icon: ArrowUpRight },
    { id: 'ahorro', label: 'Ahorro', icon: PiggyBank },
    { id: 'patrimonio', label: 'Patrimonio', icon: ShieldCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none pb-[max(12px,env(safe-area-inset-bottom))] px-4 flex justify-center">
      <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-float rounded-full px-2 py-1.5 flex items-center justify-between w-full max-w-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-full transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-[#2563EB] font-semibold'
                  : 'text-[#64748B] hover:text-slate-900'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  isActive ? 'bg-blue-50 text-[#2563EB]' : 'text-[#64748B]'
                }`}
              >
                <Icon strokeWidth={1.75} className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
