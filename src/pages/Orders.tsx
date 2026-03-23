import React from 'react';
import { Search, Filter, Plus, FileText, CheckCircle2, Clock, XCircle, MoreVertical } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '../lib/utils';

const orders = [
  { id: 'OC-2023-085', supplier: 'Papelaria Central Ltda', date: '12/10/2023', value: 'R$ 1.250,00', status: 'ENTREGUE', statusColor: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-4 h-4" /> },
  { id: 'OC-2023-086', supplier: 'Distribuidora Alvorada', date: '13/10/2023', value: 'R$ 4.890,00', status: 'PENDENTE', statusColor: 'bg-amber-100 text-amber-700', icon: <Clock className="w-4 h-4" /> },
  { id: 'OC-2023-087', supplier: 'Informática & Cia', date: '14/10/2023', value: 'R$ 850,00', status: 'CANCELADA', statusColor: 'bg-rose-100 text-rose-700', icon: <XCircle className="w-4 h-4" /> },
  { id: 'OC-2023-088', supplier: 'Limpeza Total S.A.', date: '15/10/2023', value: 'R$ 2.100,00', status: 'PENDENTE', statusColor: 'bg-amber-100 text-amber-700', icon: <Clock className="w-4 h-4" /> },
];

export default function Orders({ isSubPage = false }: { isSubPage?: boolean }) {
  return (
    <div className={cn("mx-auto max-w-7xl space-y-8", !isSubPage && "p-4 md:p-10")}>
      {!isSubPage && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Ordens de Compra</h1>
            <p className="text-slate-500">Acompanhe o status das solicitações de compra e entregas.</p>
          </div>
          <button className="bg-[#359EFF] text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all">
            <Plus className="w-5 h-5" /> Nova Ordem
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total de Ordens</p>
          <p className="text-2xl font-black text-slate-900">124</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pendentes</p>
          <p className="text-2xl font-black text-amber-600">18</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Entregues</p>
          <p className="text-2xl font-black text-emerald-600">98</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Valor Total</p>
          <p className="text-2xl font-black text-[#359EFF]">R$ 142k</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#359EFF] outline-none" placeholder="Buscar por fornecedor ou OC..." type="text" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50">
              <Filter className="w-4 h-4" /> Filtrar
            </button>
            <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50">
              <FileText className="w-4 h-4" /> Relatório
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Data Emissão</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 text-[#359EFF] font-bold text-sm">{o.id}</td>
                  <td className="px-6 py-5 text-slate-900 font-medium text-sm">{o.supplier}</td>
                  <td className="px-6 py-5 text-slate-500 text-sm">{o.date}</td>
                  <td className="px-6 py-5 text-slate-900 font-bold text-sm">{o.value}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${o.statusColor} text-[10px] font-bold uppercase`}>
                      {o.icon}
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button className="text-slate-400 hover:text-[#359EFF]">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
