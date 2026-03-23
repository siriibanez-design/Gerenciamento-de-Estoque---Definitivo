import React from 'react';
import { Filter, ShoppingCart, AlertTriangle, Hourglass, ShoppingBag, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { cn } from '../lib/utils';

const items = [
  { name: 'Papel A4 Chambril 75g', dept: 'Secretaria de Educação', current: '450 resmas', min: '1.000 resmas', suggest: 'Pedir 715 un', status: 'critical' },
  { name: 'Cesta Básica Tipo 01', dept: 'Assistência Social', current: '120 kits', min: '500 kits', suggest: 'Pedir 494 kits', status: 'warning' },
  { name: 'Lâmpada LED 20W E27', dept: 'Infraestrutura', current: '85 unidades', min: '200 unidades', suggest: 'Pedir 150 un', status: 'normal' },
  { name: 'Arroz Agulhinha T1 (5kg)', dept: 'Merenda Escolar', current: '30 fardos', min: '100 fardos', suggest: 'Pedir 91 fardos', status: 'normal' },
  { name: 'Insulina NPH 100UI/ml', dept: 'Secretaria de Saúde', current: '1.500 ml', min: '5.000 ml', suggest: 'Pedir 4.550 ml', status: 'critical' },
  { name: 'Cloro Granulado 65% (10kg)', dept: 'Secretaria de Esportes', current: '10 kg', min: '50 kg', suggest: 'Pedir 52 kg', status: 'normal' },
  { name: 'Sabonete Líquido 5L', dept: 'Administrativo', current: '15 galões', min: '40 galões', suggest: 'Pedir 33 galões', status: 'normal' },
];

export default function PlanningList({ isSubPage = false }: { isSubPage?: boolean }) {
  const navigate = useNavigate();

  return (
    <div className={cn("mx-auto max-w-7xl space-y-8", !isSubPage && "p-4 md:p-10")}>
      {!isSubPage && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => navigate('/planning')}
              className="flex items-center gap-2 text-slate-500 hover:text-[#359EFF] text-sm font-bold mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para Compras
            </button>
            <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">Lista de Reposição</h1>
            <p className="text-slate-500 text-base">Análise de reposição baseada no estoque mínimo de segurança + 30% de margem operacional.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg h-10 px-4 bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 hover:bg-slate-200 transition-colors">
              <Filter className="w-4 h-4" /> Filtrar Secretarias
            </button>
            <button className="flex items-center gap-2 rounded-lg h-10 px-4 bg-[#359EFF] text-white font-bold text-sm shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all">
              <ShoppingCart className="w-4 h-4" /> Gerar Ordens de Compra
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-4">
          <div className="bg-red-100 p-2 rounded-lg text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-red-800 text-sm font-bold">Itens Críticos</p>
            <p className="text-red-600 text-xl font-black">12 itens</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-4">
          <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
            <Hourglass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-amber-800 text-sm font-bold">Em Reposição</p>
            <p className="text-amber-600 text-xl font-black">08 itens</p>
          </div>
        </div>
        <div className="bg-[#359EFF]/5 border border-[#359EFF]/20 p-4 rounded-xl flex items-center gap-4">
          <div className="bg-[#359EFF]/10 p-2 rounded-lg text-[#359EFF]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[#359EFF] text-sm font-bold">Total Estimado</p>
            <p className="text-[#359EFF] text-xl font-black">R$ 45.280,00</p>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200 w-1/3">Item / Categoria</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">Estoque Atual</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">Estoque Mínimo</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200 text-right">Sugestão de Compra</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200 text-right">Valor Definitivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-xs text-slate-500 font-medium">{item.dept}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      item.status === 'critical' ? 'bg-red-100 text-red-700' : 
                      item.status === 'warning' ? 'bg-amber-100 text-amber-700' : 
                      'text-slate-600'
                    }`}>
                      {item.current}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-600 font-medium">{item.min}</td>
                  <td className="px-6 py-5 text-right">
                    <button className="bg-[#359EFF]/10 text-[#359EFF] hover:bg-[#359EFF] hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border border-[#359EFF]/20">
                      {item.suggest}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <input className="w-24 h-9 rounded-lg border-slate-200 bg-white text-sm text-right focus:ring-[#359EFF] focus:border-[#359EFF]" placeholder="Qtd." type="text"/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium italic">* Valores calculados: (Mínimo - Atual) + 30% da diferença</p>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-slate-200 text-slate-400">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700">Página 1 de 4</span>
            <button className="p-1 rounded hover:bg-slate-200 text-slate-400">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#359EFF]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-1">Revisão Completa Necessária</h3>
          <p className="text-slate-400 text-sm max-w-md">Existem 5 itens com estoque zerado que não estão nesta lista por falta de fornecedor cadastrado.</p>
        </div>
        <button className="relative z-10 whitespace-nowrap bg-white text-slate-900 px-8 py-3 rounded-lg font-black hover:bg-[#359EFF] hover:text-white transition-all">
          Exportar Relatório em PDF
        </button>
      </div>
    </div>
  );
}
