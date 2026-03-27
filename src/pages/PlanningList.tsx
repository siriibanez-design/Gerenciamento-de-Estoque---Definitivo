import React, { useState, useEffect } from 'react';
import { Filter, ShoppingCart, AlertTriangle, Hourglass, ShoppingBag, ChevronLeft, ChevronRight, ArrowLeft, Check, X, Truck, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';

import { cn } from '../lib/utils';

export default function PlanningList({ isSubPage = false }: { isSubPage?: boolean }) {
  const navigate = useNavigate();
  const { addOrder, items: inventoryItems, processes, orders } = useInventory();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemValues, setItemValues] = useState<Record<string, string>>({});
  const [selectedOffers, setSelectedOffers] = useState<Record<string, number>>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualItemIds, setManualItemIds] = useState<string[]>([]);
  const [currentOfferItem, setCurrentOfferItem] = useState<any>(null);
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
    
    // Find ALL matching offers in processes/suppliers
    const offers: { unitPrice: number; process: string; itemNumber: string; supplierName: string }[] = [];

    for (const process of processes) {
      for (const supplier of process.suppliers) {
        const matchingItem = supplier.items.find(si => si.description === item.item);
        if (matchingItem) {
          offers.push({
            unitPrice: matchingItem.value,
            process: process.number,
            itemNumber: matchingItem.number,
            supplierName: supplier.name
          });
        }
      }
    }

    // Sort offers by price (lowest first)
    offers.sort((a, b) => a.unitPrice - b.unitPrice);

    // Default to the best offer (cheapest)
    const bestOffer = offers[0] || { unitPrice: item.unitPrice, process: '', itemNumber: '', supplierName: 'Preço Base' };
    
    return {
      id: String(item.id),
      name: item.item,
      dept: item.category,
      current: `${item.current} unidades`,
      min: `${item.minStock} unidades`,
      suggest: String(suggest),
      status,
      offers,
      defaultOffer: bestOffer,
      isManual: manualItemIds.includes(String(item.id))
    };
  }).filter(item => parseInt(item.suggest) > 0 || item.isManual);

  const getSelectedItemOffer = (itemId: string) => {
    const item = planningItems.find(i => i.id === itemId);
    if (!item) return null;
    const offerIndex = selectedOffers[itemId] ?? 0;
    return item.offers[offerIndex] || item.defaultOffer;
  };

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
        const offer = getSelectedItemOffer(item.id);
        return {
          name: item.name,
          qty: String(qty),
          value: String(offer?.unitPrice || 0),
          process: offer?.process || '',
          itemNumber: offer?.itemNumber || ''
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
  const manualCount = planningItems.filter(i => i.isManual).length;
  const estimatedTotal = planningItems.reduce((acc, item) => {
    if (!selectedItems.includes(item.id)) return acc;
    const qty = parseFloat((itemValues[item.id] || '0').replace(',', '.'));
    const offer = getSelectedItemOffer(item.id);
    const unitPrice = offer?.unitPrice || 0;
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
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 rounded-lg h-10 px-4 bg-white text-slate-700 font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Incluir Item
          </button>
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
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[#359EFF] text-[9px] font-bold uppercase tracking-wider">Inclusão Manual</p>
            <p className="text-[#359EFF] text-base font-black leading-none">{manualCount} itens</p>
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
                      <span className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-bold border",
                        item.isManual 
                          ? "bg-slate-100 text-slate-500 border-slate-200" 
                          : "bg-[#359EFF]/10 text-[#359EFF] border-[#359EFF]/20"
                      )}>
                        {item.isManual ? 'MANUAL' : item.suggest}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <button 
                          onClick={() => {
                            if (item.offers.length > 1) {
                              setCurrentOfferItem(item);
                              setIsOfferModalOpen(true);
                            }
                          }}
                          className={cn(
                            "font-bold transition-colors",
                            item.offers.length > 1 ? "text-[#359EFF] hover:text-[#359EFF]/80 underline decoration-dotted underline-offset-4" : "text-slate-700"
                          )}
                        >
                          {getSelectedItemOffer(item.id)?.unitPrice ? (
                            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getSelectedItemOffer(item.id)!.unitPrice)
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </button>
                        {item.offers.length > 1 && (
                          <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                            {item.offers.length} Ofertas
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                          {getSelectedItemOffer(item.id)?.supplierName}
                        </span>
                      </div>
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
        {isManualModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Incluir Item Manualmente</h3>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Selecione itens que não estão na lista de reposição</p>
                </div>
                <button onClick={() => setIsManualModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2">
                {inventoryItems
                  .filter(item => !planningItems.some(pi => pi.id === String(item.id)))
                  .map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setManualItemIds(prev => [...prev, String(item.id)]);
                        setIsManualModalOpen(false);
                        setNotification({ type: 'success', message: `${item.item} incluído na lista!` });
                      }}
                      className="w-full p-4 rounded-xl border border-slate-200 text-left hover:border-[#359EFF] hover:bg-[#359EFF]/5 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{item.item}</p>
                        <p className="text-xs text-slate-500">{item.category} | Estoque: {item.current}</p>
                      </div>
                      <Plus className="w-5 h-5 text-slate-300 group-hover:text-[#359EFF]" />
                    </button>
                  ))}
                {inventoryItems.filter(item => !planningItems.some(pi => pi.id === String(item.id))).length === 0 && (
                  <p className="text-center py-8 text-slate-400 italic text-sm">Todos os itens do estoque já estão na lista.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {isOfferModalOpen && currentOfferItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Escolher Fornecedor</h3>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{currentOfferItem.name}</p>
                </div>
                <button onClick={() => setIsOfferModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  {currentOfferItem.offers.map((offer: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedOffers(prev => ({ ...prev, [currentOfferItem.id]: idx }));
                        setIsOfferModalOpen(false);
                      }}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group",
                        (selectedOffers[currentOfferItem.id] ?? 0) === idx
                          ? "bg-[#359EFF]/5 border-[#359EFF] shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          (selectedOffers[currentOfferItem.id] ?? 0) === idx
                            ? "bg-[#359EFF] text-white"
                            : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                        )}>
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{offer.supplierName}</p>
                          <p className="text-xs text-slate-500">Processo: {offer.process} | Item: {offer.itemNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(offer.unitPrice)}
                        </p>
                        {idx === 0 && (
                          <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                            Melhor Preço
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

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
