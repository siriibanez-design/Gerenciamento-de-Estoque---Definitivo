import React, { useState } from 'react';
import { LayoutDashboard, Truck, ClipboardList, FileText, Clock } from 'lucide-react';
import PurchasingDashboard from './PurchasingDashboard';
import Suppliers from './Suppliers';
import PlanningList from './PlanningList';
import Orders from './Orders';
import Monitoring from './Monitoring';
import { cn } from '../lib/utils';

type Tab = 'suppliers' | 'list' | 'orders' | 'monitoring';

export default function Planning() {
  const [activeTab, setActiveTab] = useState<Tab>('monitoring');

  const tabs = [
    { id: 'monitoring', label: 'MONITORAMENTO', icon: Clock, color: 'bg-rose-50', textColor: 'text-rose-600', borderColor: 'border-rose-100' },
    { id: 'suppliers', label: 'FORNECEDORES', icon: Truck, color: 'bg-amber-50', textColor: 'text-amber-600', borderColor: 'border-amber-100' },
    { id: 'list', label: 'LISTA', icon: ClipboardList, color: 'bg-emerald-50', textColor: 'text-emerald-600', borderColor: 'border-emerald-100' },
    { id: 'orders', label: 'ORDENS DE COMPRAS', icon: FileText, color: 'bg-purple-50', textColor: 'text-purple-600', borderColor: 'border-purple-100' },
  ];

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-10 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">Gestão de Compras</h1>
        <p className="text-slate-500 text-base">Acompanhamento de processos, fornecedores e reposição de estoque.</p>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "p-4 rounded-xl text-[11px] font-black tracking-wider transition-all border flex flex-col items-center justify-center gap-2 shadow-sm group",
              activeTab === tab.id
                ? "bg-[#004A99] text-white border-[#004A99] shadow-lg shadow-[#004A99]/20"
                : cn(tab.color, tab.textColor, tab.borderColor, "hover:shadow-md hover:brightness-95")
            )}
          >
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              activeTab === tab.id ? "bg-white/10" : "bg-white/50 group-hover:bg-white/80"
            )}>
              <tab.icon className="w-5 h-5" />
            </div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === 'suppliers' && <Suppliers isSubPage />}
        {activeTab === 'list' && <PlanningList isSubPage />}
        {activeTab === 'orders' && <Orders isSubPage />}
        {activeTab === 'monitoring' && <Monitoring isSubPage />}
      </div>
    </div>
  );
}
