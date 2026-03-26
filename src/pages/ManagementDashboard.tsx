import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Star, 
  ShoppingBag, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  ChevronDown,
  ArrowUpRight,
  Package
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export default function ManagementDashboard() {
  const { items, orders, processes } = useInventory();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Helper to find item value from suppliers inside processes
  const getItemValue = (itemName: string) => {
    for (const process of processes) {
      for (const supplier of process.suppliers) {
        const supplierItem = supplier.items.find(si => si.description === itemName);
        if (supplierItem) return supplierItem.value;
      }
    }
    // Fallback to item's own unitPrice if not found in suppliers
    const item = items.find(i => i.item === itemName);
    return item?.unitPrice || 0;
  };

  // 1. Valor Total em Estoque
  const totalInventoryValue = items.reduce((acc, item) => {
    const value = getItemValue(item.item);
    return acc + (item.current * value);
  }, 0);

  // 2. Produtos Curva A (Top 5 by Out)
  const totalOutQty = items.reduce((acc, item) => acc + item.out, 0);
  const curvaAItems = [...items]
    .sort((a, b) => b.out - a.out)
    .slice(0, 5)
    .map(item => ({
      name: item.item,
      qty: item.out,
      valueShare: totalOutQty > 0 ? `${Math.round((item.out / totalOutQty) * 100)}%` : '0%'
    }));

  // 3. Custo de Reposição (Pending Orders)
  const replacementCost = orders
    .filter(o => o.status === 'PENDENTE')
    .reduce((acc, order) => {
      const orderTotal = order.items.reduce((oAcc, oi) => {
        const value = getItemValue(oi.name);
        return oAcc + (parseFloat(oi.qty) * value);
      }, 0);
      return acc + orderTotal;
    }, 0);

  // 4. Itens Críticos (Previsão de Esgotamento)
  const criticalItems = items.filter(item => item.current < item.minStock);

  const [selectedItemName, setSelectedItemName] = useState(items[0]?.item || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedItem = items.find(i => i.item === selectedItemName);

  useEffect(() => {
    if (!selectedItemName && items.length > 0) {
      setSelectedItemName(items[0].item);
    }
  }, [items]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('pt-BR');
  const formattedTime = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8 font-sans">
      {/* 1. Cabeçalho da Página */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Gerencial</h1>
          <p className="text-slate-500 font-medium">Monitoramento Estratégico e Previsões</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-slate-900">{formattedDate} {formattedTime}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest text-right">Status do Sistema: OK</span>
          </div>
        </div>
      </header>

      {/* 2. Linha de Destaques (KPIs Rápidos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cartão 1: Valor Total em Estoque */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="w-24 h-24 text-slate-900" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Valor Total em Estoque</span>
          </div>
          <div className="flex items-end gap-3">
            <h2 className="text-3xl font-black text-slate-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInventoryValue)}
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Valor total atualizado</p>
        </motion.div>

        {/* Cartão 2: Produtos Curva A */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
              <Star className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Produtos Curva A</span>
          </div>
          <div className="space-y-2 flex-1">
            {curvaAItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{item.qty} un</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-black text-slate-600">{item.valueShare}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cartão 3: Custo de Reposição */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShoppingBag className="w-24 h-24 text-slate-900" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#359EFF]/10 p-2 rounded-xl text-[#359EFF]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Custo de Reposição</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(replacementCost)}
          </h2>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Baseado em ordens pendentes</p>
        </motion.div>
      </div>

      {/* 3. Área Central - Previsões e Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Alerta de Itens Críticos</h3>
              <p className="text-sm text-slate-500">Itens com estoque abaixo do mínimo configurado</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estoque Atual</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estoque Mínimo</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {criticalItems.map((item, i) => (
                  <tr key={i} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <span className="text-sm font-bold text-slate-700">{item.item}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-sm font-black text-rose-600">{item.current}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-sm font-bold text-slate-500">{item.minStock}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="px-2 py-1 bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        CRÍTICO
                      </span>
                    </td>
                  </tr>
                ))}
                {criticalItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhum item crítico no momento</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Seção Lateral - Monitoramento Exclusivo */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Monitoramento Exclusivo</h3>
            <p className="text-sm text-slate-500">Análise detalhada de item específico</p>
          </div>

          <div className="relative mb-8">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400" />
                <span>{selectedItemName || 'Selecione um item'}</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isDropdownOpen && "rotate-180")} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 overflow-hidden max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setSelectedItemName(item.item);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#359EFF] transition-colors"
                  >
                    {item.item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-10">
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4",
                selectedItem && selectedItem.current < selectedItem.minStock ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
              )}>
                STATUS: {selectedItem && selectedItem.current < selectedItem.minStock ? 'CRÍTICO' : 'NORMAL'}
              </div>
              <h4 className="text-2xl font-black text-slate-900">{selectedItemName}</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">SKU: {selectedItem?.code || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle 
                      cx="64" cy="64" r="58" 
                      fill="transparent" 
                      stroke="#f1f5f9" 
                      strokeWidth="12" 
                    />
                    <circle 
                      cx="64" cy="64" r="58" 
                      fill="transparent" 
                      stroke={selectedItem && selectedItem.current < selectedItem.minStock ? '#ef4444' : '#359EFF'} 
                      strokeWidth="12" 
                      strokeDasharray={364}
                      strokeDashoffset={364 * (1 - (selectedItem ? Math.min(1, selectedItem.current / (selectedItem.minStock * 2 || 1)) : 0))}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900">{selectedItem?.current || 0}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">UNIDADES</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estoque Atual</span>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle 
                      cx="64" cy="64" r="58" 
                      fill="transparent" 
                      stroke="#f1f5f9" 
                      strokeWidth="12" 
                    />
                    <circle 
                      cx="64" cy="64" r="58" 
                      fill="transparent" 
                      stroke="#94a3b8" 
                      strokeWidth="12" 
                      strokeDasharray={364}
                      strokeDashoffset={364 * (1 - (selectedItem ? Math.min(1, selectedItem.minStock / (selectedItem.minStock * 2 || 1)) : 0))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900">{selectedItem?.minStock || 0}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">UNIDADES</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estoque Mínimo</span>
              </div>
            </div>

            <div className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-sm text-[#359EFF]">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sugestão de Compra</p>
                  <p className="text-lg font-black text-slate-900">+150 unidades</p>
                </div>
              </div>
              <button className="bg-[#359EFF] text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all">
                GERAR ORDEM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
