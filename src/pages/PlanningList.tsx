import React, { useState, useEffect } from 'react';
import { Filter, ShoppingCart, AlertTriangle, Hourglass, ShoppingBag, ChevronLeft, ChevronRight, ArrowLeft, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';

import { cn } from '../lib/utils';

export default function PlanningList({ isSubPage = false }: { isSubPage?: boolean }) {
  const navigate = useNavigate();
  const { addOrder, items: inventoryItems, processes, orders } = useInventory();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemValues, setItemValues] = useState<Record<string, string>>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Get names of items already in active orders
  const orderedItemNames = new Set(
    orders
      .filter(order => order.status !== 'CANCELADA')
      .flatMap(order => order.items.map(item => item.name))
  );

  const planningItems = inventoryItems.map(item => {
    const diff = item.minStock - item.current;
    const suggest = diff > 0 ? Math.ceil(diff * 1.3) : 0;
    const status = item.current <= item.minStock * 0.5 ? 'critical' : item.current <= item.minStock ? 'warning' : 'normal';
    
    // Find unit price, process and item number in processes/suppliers
    let supplierPrice = 0;
    let processNumber = '';
    let itemNumber = '';

    for (const process of processes) {
      for (const supplier of process.suppliers) {
        const matchingItem = supplier.items.find(si => si.description === item.item);
        if (matchingItem) {
          supplierPrice = matchingItem.value;
          processNumber = process.number;
          itemNumber = matchingItem.number;
          break;
        }
      }
      if (supplierPrice > 0) break;
    }

    const unitPrice = supplierPrice > 0 ? supplierPrice : item.unitPrice;
    
    return {
      id: String(item.id),
      name: item.item,
      dept: item.category,
      current: `${item.current} unidades`,
      min: `${item.minStock} unidades`,
      suggest: String(suggest),
      unitPrice,
      status,
      process: processNumber,
      itemNumber: itemNumber
    };
  }).filter(item => parseInt(item.suggest) > 0);

  const toggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleValueChange = (id: string, value: string) => {
    setItemValues(prev => ({ ...prev, [id]: value }));
  };

  const handleGenerateOrder = () => {
    const itemsToOrder = planningItems
      .filter(item => selectedItems.includes(item.id) && itemValues[item.id]);

    if (itemsToOrder.length === 0) {
      setNotification({ type: 'error', message: 'Selecione ao menos um item e preencha a Quantidade (Valor Definitivo).' });
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const confirmGenerateOrder = () => {
    const itemsToOrder = planningItems
      .filter(item => selectedItems.includes(item.id) && itemValues[item.id])
      .map(item => {
        const qty = parseFloat(itemValues[item.id].replace(',', '.'));
        const unitPrice = item.unitPrice;
        return {
          name: item.name,
          qty: String(qty),
          value: String(unitPrice),
          process: item.process,
          itemNumber: item.itemNumber
        };
      });

    const totalValue = itemsToOrder.reduce((acc, item) => {
      const val = parseFloat(item.value);
      const qty = parseFloat(item.qty);
      return acc + (isNaN(val) || isNaN(qty) ? 0 : val * qty);
    }, 0);

    addOrder({
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue),
      items: itemsToOrder
    });

    setIsConfirmModalOpen(false);
    setSelectedItems([]);
    setItemValues({});
    setNotification({ type: 'success', message: 'Ordem de Compra gerada com sucesso!' });
  };

  const criticalCount = planningItems.filter(i => i.status === 'critical').length;
  const warningCount = planningItems.filter(i => i.status === 'warning').length;
  const estimatedTotal = planningItems.reduce((acc, item) => {
    if (!selectedItems.includes(item.id)) return acc;
    const qty = parseFloat((itemValues[item.id] || '0').replace(',', '.'));
    const unitPrice = item.unitPrice || 0;
    return acc + (isNaN(qty) ? 0 : qty * unitPrice);
  }, 0);

  return (
    <div className={cn("mx-auto max-w-7xl space-y-8 relative", !isSubPage && "p-4 md:p-10")}>
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-4 right-4 z-[200] px-6 py-3 rounded-xl shadow-xl font-bold text-sm flex items-center gap-3 border",
              notification.type === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
            )}
          >
            {notification.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex flex-col gap-1">
          {!isSubPage ? (
            <>
              <button 
                onClick={() => navigate('/planning')}
                className="flex items-center gap-2 text-slate-500 hover:text-[#359EFF] text-sm font-bold mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para Compras
              </button>
              <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">Lista de Reposição</h1>
              <p className="text-slate-500 text-base">Análise de reposição baseada no estoque mínimo de segurança + 30% de margem operacional.</p>
            </>
          ) : (
            <>
              <h2 className="text-slate-900 text-xl font-black tracking-tight">Lista de Reposição</h2>
              <p className="text-slate-500 text-sm">Selecione os itens e preencha a quantidade definitiva para gerar a ordem.</p>
            </>
          )}
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg h-10 px-4 bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 hover:bg-slate-200 transition-colors">
            <Filter className="w-4 h-4" /> Filtrar Secretarias
          </button>
          <button 
            onClick={handleGenerateOrder}
            className="flex items-center gap-2 rounded-lg h-10 px-4 bg-[#359EFF] text-white font-bold text-sm shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> Gerar Ordem de Compra
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-red-50 border border-red-200 p-2.5 rounded-xl flex items-center gap-2.5">
          <div className="bg-red-100 p-1 rounded-lg text-red-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-red-800 text-[9px] font-bold uppercase tracking-wider">Itens Críticos</p>
            <p className="text-red-600 text-base font-black leading-none">{criticalCount} itens</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2.5">
          <div className="bg-amber-100 p-1 rounded-lg text-amber-600">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <p className="text-amber-800 text-[9px] font-bold uppercase tracking-wider">Em Reposição</p>
            <p className="text-amber-600 text-base font-black leading-none">{warningCount} itens</p>
          </div>
        </div>
        <div className="bg-[#359EFF]/5 border border-[#359EFF]/20 p-2.5 rounded-xl flex items-center gap-2.5">
          <div className="bg-[#359EFF]/10 p-1 rounded-lg text-[#359EFF]">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[#359EFF] text-[9px] font-bold uppercase tracking-wider">Total Estimado</p>
            <p className="text-[#359EFF] text-base font-black leading-none">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimatedTotal)}
            </p>
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
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-[#359EFF] focus:ring-[#359EFF]"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(planningItems.map(i => i.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                    checked={selectedItems.length === planningItems.length && planningItems.length > 0}
                  />
                </th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">Item / Categoria</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">Estoque Atual</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">Estoque Mínimo</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200 text-right">Sugestão</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200 text-right">Valor Unitário</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200 text-right">Valor Definitivo</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {planningItems.map((item, i) => {
                const isOrdered = orderedItemNames.has(item.name);
                const qtyStr = itemValues[item.id] || '0';
                const qty = parseFloat(qtyStr.replace(',', '.'));
                const unitPrice = item.unitPrice || 0;
                const total = isNaN(qty) ? 0 : qty * unitPrice;
                return (
                  <tr 
                    key={item.id} 
                    className={cn(
                      "hover:bg-slate-50/50 transition-colors",
                      isOrdered && "opacity-40 grayscale pointer-events-none bg-slate-50/30"
                    )}
                  >
                    <td className="px-6 py-5">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-[#359EFF] focus:ring-[#359EFF]"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                        disabled={isOrdered}
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{item.name}</span>
                          {isOrdered && (
                            <span className="text-[10px] font-black bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                              Já em Ordem
                            </span>
                          )}
                        </div>
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
                      <span className="bg-[#359EFF]/10 text-[#359EFF] px-3 py-1.5 rounded-lg text-[11px] font-bold border border-[#359EFF]/20">
                        {item.suggest}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-slate-700">
                      {unitPrice > 0 ? (
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(unitPrice)
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <input 
                        className="w-20 h-9 rounded-lg border-slate-200 bg-white text-sm text-right focus:ring-[#359EFF] focus:border-[#359EFF] disabled:bg-slate-50 disabled:text-slate-400" 
                        placeholder="Unid" 
                        type="text"
                        value={itemValues[item.id] || ''}
                        onChange={(e) => handleValueChange(item.id, e.target.value)}
                        disabled={isOrdered}
                      />
                    </td>
                    <td className="px-6 py-5 text-right font-black text-slate-900">
                      {total > 0 ? (
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {planningItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhum item necessitando de reposição no momento.
                  </td>
                </tr>
              )}
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

      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-[#359EFF]/10 text-[#359EFF] rounded-full flex items-center justify-center mx-auto">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Confirmar Ordem?</h3>
                  <p className="text-slate-500 text-sm">
                    Deseja gerar a Ordem de Compra para os itens selecionados? Esta ação enviará o pedido para a seção de Ordens de Compra.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button 
                    onClick={confirmGenerateOrder}
                    className="flex-1 py-3 rounded-xl bg-[#359EFF] text-white font-bold text-sm shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
