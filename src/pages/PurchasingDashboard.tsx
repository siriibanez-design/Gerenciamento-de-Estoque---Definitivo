import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Users, FileText, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';

import { cn } from '../lib/utils';

export default function PurchasingDashboard({ isSubPage = false }: { isSubPage?: boolean }) {
  const navigate = useNavigate();
  const { orders, processes } = useInventory();

  // 1. Gasto Total (Mês) - Sum of all orders (excluding CANCELADA)
  const totalSpent = orders
    .filter(o => o.status !== 'CANCELADA')
    .reduce((acc, o) => {
      const val = parseFloat(o.value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

  // 2. Pedidos Emitidos
  const ordersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDENTE').length;

  // 3. Nº de Fornecedores (Unique suppliers across all processes)
  const uniqueSuppliers = new Set();
  processes.forEach(p => {
    p.suppliers.forEach(s => uniqueSuppliers.add(s.id));
  });
  const suppliersCount = uniqueSuppliers.size;

  // 4. Nº de Processos
  const processesCount = processes.length;
  const activeProcessesCount = processes.length; // For now same as total

  // Charts Data (Mocked for now as we don't have historical data structure yet, but keeping it empty as requested before)
  const data: any[] = [];
  const categoryData: any[] = [];

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
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard de Compras</h1>
            <p className="text-slate-500">Análise de gastos, volume de pedidos e performance de fornecedores.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gasto Total (Mês)</p>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
            Baseado em ordens emitidas
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pedidos Emitidos</p>
          </div>
          <p className="text-2xl font-black text-slate-900">{ordersCount}</p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {pendingOrdersCount} pendentes de aprovação
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nº de Fornecedores</p>
          </div>
          <p className="text-2xl font-black text-slate-900">{suppliersCount}</p>
          <p className="text-xs text-slate-400 font-medium mt-1">Cadastrados nos processos</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nº de Processos</p>
          </div>
          <p className="text-2xl font-black text-slate-900">{processesCount}</p>
          <p className="text-xs text-slate-400 font-medium mt-1">Processos em andamento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Evolução de Gastos</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#359EFF" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#359EFF', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Gastos por Categoria</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="#359EFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
