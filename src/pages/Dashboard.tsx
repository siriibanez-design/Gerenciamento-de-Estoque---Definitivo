import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, ChevronDown, Download } from 'lucide-react';
import { motion } from 'motion/react';

const data = [
  { name: 'SEG', value: 400 },
  { name: 'TER', value: 300 },
  { name: 'QUA', value: 600 },
  { name: 'QUI', value: 800 },
  { name: 'SEX', value: 500 },
  { name: 'SÁB', value: 900 },
  { name: 'DOM', value: 700 },
];

const pieData = [
  { name: 'Escritório', value: 45, color: '#359EFF' },
  { name: 'Informática', value: 25, color: '#82ca9d' },
  { name: 'Copa & Cozinha', value: 30, color: '#ffc658' },
];

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl p-4 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Acompanhamento detalhado de fluxo por produto</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-600">
            <span>14/10/2023 10:30</span>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-full h-10 w-10 flex items-center justify-center overflow-hidden">
            <img src="https://picsum.photos/seed/avatar/100/100" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Monitoramento Individual</h3>
              <p className="text-xs text-slate-500">Acompanhamento detalhado de fluxo por produto</p>
            </div>
            <div className="relative">
              <select className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none appearance-none pr-10">
                <option>Selecione um produto para monitorar</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fluxo de Monitoramento</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-slate-900">1.250</span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +5%
              </span>
              <span className="text-xs text-slate-400">nos últimos 30 dias</span>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#359EFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#359EFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#359EFF" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Monitoramento Exclusivo</h3>
            <Activity className="w-5 h-5 text-primary" />
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-4">Item</th>
                  <th className="pb-4">Estoque Atual</th>
                  <th className="pb-4">Mínimo</th>
                  <th className="pb-4 text-right">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: 'Resma Papel A4', current: '450 un', min: '100 un', status: 'NORMAL', statusColor: 'bg-emerald-100 text-emerald-700' },
                  { name: 'Toner CF283A', current: '12 un', min: '15 un', status: 'CRÍTICO', statusColor: 'bg-rose-100 text-rose-700' },
                  { name: 'Café 1kg', current: '85 un', min: '20 un', status: 'CRÍTICO', statusColor: 'bg-rose-100 text-rose-700' },
                  { name: 'Copo 200ml', current: '3,2k un', min: '500 un', status: 'NORMAL', statusColor: 'bg-emerald-100 text-emerald-700' },
                  { name: 'Caneta Azul', current: '210 un', min: '50 un', status: 'ALERTA', statusColor: 'bg-amber-100 text-amber-700' },
                ].map((item, i) => (
                  <tr key={i}>
                    <td className="py-4 font-medium text-slate-700">{item.name}</td>
                    <td className="py-4 font-bold text-primary">{item.current}</td>
                    <td className="py-4 text-slate-400">{item.min}</td>
                    <td className="py-4 text-right">
                      <span className={`${item.statusColor} px-2 py-0.5 rounded text-[10px] font-bold`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="mt-6 w-full bg-primary text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top 5 Consumo</h3>
          <div className="space-y-6">
            {[
              { name: 'Resma Papel A4', value: 450, total: 500, unit: 'un' },
              { name: 'Toner Laserjet CF283A', value: 120, total: 500, unit: 'un' },
              { name: 'Café em Grãos 1kg', value: 85, total: 500, unit: 'un' },
              { name: 'Copo Descartável 200ml', value: 3200, total: 5000, unit: 'un' },
              { name: 'Caneta BIC Azul', value: 210, total: 500, unit: 'un' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="font-bold text-primary">{item.value} {item.unit}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${(item.value / item.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Consumo por Categoria</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-[300px]">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900">100%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">TOTAL</span>
              </div>
            </div>
            <div className="space-y-3">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-slate-600 font-medium">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
