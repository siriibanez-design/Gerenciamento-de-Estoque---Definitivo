import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Users, FileText, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { cn } from '../lib/utils';

const data = [
  { name: 'JAN', value: 45000 },
  { name: 'FEV', value: 52000 },
  { name: 'MAR', value: 48000 },
  { name: 'ABR', value: 61000 },
  { name: 'MAI', value: 55000 },
  { name: 'JUN', value: 67000 },
];

const categoryData = [
  { name: 'Escritório', value: 12500 },
  { name: 'Saúde', value: 28400 },
  { name: 'Alimentação', value: 15600 },
  { name: 'Limpeza', value: 8900 },
];

export default function PurchasingDashboard({ isSubPage = false }: { isSubPage?: boolean }) {
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
          <p className="text-2xl font-black text-slate-900">R$ 67.420</p>
          <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12.5% vs mês anterior
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pedidos Emitidos</p>
          </div>
          <p className="text-2xl font-black text-slate-900">42</p>
          <p className="text-xs text-slate-400 font-medium mt-1">8 pendentes de aprovação</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nº de Fornecedores</p>
          </div>
          <p className="text-2xl font-black text-slate-900">156</p>
          <p className="text-xs text-emerald-600 font-bold mt-1">12 novos este mês</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nº de Processos</p>
          </div>
          <p className="text-2xl font-black text-slate-900">84</p>
          <p className="text-xs text-purple-600 font-bold mt-1">Em andamento</p>
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
