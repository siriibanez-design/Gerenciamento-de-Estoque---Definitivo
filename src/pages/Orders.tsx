import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileText, CheckCircle2, Clock, XCircle, MoreVertical, ChevronDown, Trash2, FileDown, ChevronUp, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useInventory, Order } from '../context/InventoryContext';
import { cn } from '../lib/utils';

export default function Orders({ isSubPage = false }: { isSubPage?: boolean }) {
  const { orders, updateOrderStatus, deleteOrder } = useInventory();
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('TODOS');

  const toggleOrderExpansion = (id: string) => {
    setExpandedOrders(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ENTREGUE':
        return { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'CANCELADA':
        return { color: 'bg-rose-100 text-rose-700', icon: <XCircle className="w-4 h-4" /> };
      default:
        return { color: 'bg-amber-100 text-amber-700', icon: <Clock className="w-4 h-4" /> };
    }
  };

  const totalValue = orders.reduce((acc, o) => {
    const val = parseFloat(o.value.replace('R$', '').replace('.', '').replace(',', '.').trim());
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const pendingCount = orders.filter(o => o.status === 'PENDENTE').length;
  const deliveredCount = orders.filter(o => o.status === 'ENTREGUE').length;

  const handleExportOrderPDF = (order: Order) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Ordem de Compra: ${order.id} - ${order.date}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
    
    const tableData = order.items.map(item => {
      const unitVal = parseFloat(item.value.replace(',', '.'));
      const qty = parseFloat(item.qty);
      const total = unitVal * qty;
      return [
        item.process || '-',
        item.itemNumber || '-',
        item.name,
        item.qty,
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(unitVal),
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)
      ];
    });

    autoTable(doc, {
      head: [['PROCESSO', 'Nº ITEM', 'DESCRIÇÃO DO ITEM', 'QUANTIDADE', 'VALOR UNITÁRIO', 'TOTAL']],
      body: tableData,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [0, 74, 153] },
      styles: { fontSize: 8 },
      columnStyles: {
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      }
    });

    // Add total value of the order at the end
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Valor Total da Ordem: ${order.value}`, 14, finalY + 15);

    doc.save(`ordem_compra_${order.id}.pdf`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Ordens de Compra', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
    
    const tableData = filteredOrders.map(o => [
      o.id,
      o.date,
      o.value,
      o.status,
      o.items.map(i => `${i.name} (${i.qty})`).join(', ')
    ]);

    autoTable(doc, {
      head: [['ID', 'Data Emissão', 'Valor Total', 'Status', 'Itens']],
      body: tableData,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [0, 74, 153] }
    });

    doc.save(`ordens_compra_${new Date().getTime()}.pdf`);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'TODOS' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <p className="text-2xl font-black text-slate-900">{orders.length}</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pendentes</p>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Entregues</p>
          <p className="text-2xl font-black text-emerald-600">{deliveredCount}</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Valor Total</p>
          <p className="text-2xl font-black text-[#359EFF]">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(totalValue)}
          </p>
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
            <input 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004a99] outline-none" 
              placeholder="Buscar por OC ou Item..." 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={cn(
                "flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                isFilterVisible ? "bg-[#004a99] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <Filter className="w-4 h-4" /> {isFilterVisible ? 'Ocultar Filtros' : 'Filtrar'}
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex-1 md:flex-none px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
            >
              <FileDown className="w-4 h-4" /> Exportar PDF
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isFilterVisible && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-slate-50 border-b border-slate-100"
            >
              <div className="p-4 flex gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <div className="flex gap-2">
                    {['TODOS', 'PENDENTE', 'ENTREGUE', 'CANCELADA'].map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                          statusFilter === status ? "bg-[#004a99] text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider w-10"></th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Data Emissão</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((o, i) => {
                const config = getStatusConfig(o.status);
                const isExpanded = expandedOrders.includes(o.id);
                return (
                  <React.Fragment key={o.id}>
                    <tr className={cn("hover:bg-slate-50/50 transition-colors", isExpanded && "bg-slate-50/80")}>
                      <td className="px-6 py-5">
                        <button 
                          onClick={() => toggleOrderExpansion(o.id)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-400 transition-all"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-[#359EFF] font-bold text-sm">{o.id}</td>
                      <td className="px-6 py-5 text-slate-500 text-sm">{o.date}</td>
                      <td className="px-6 py-5 text-slate-900 font-bold text-sm">{o.value}</td>
                      <td className="px-6 py-5">
                        <div className="relative group">
                          <button className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all",
                            config.color
                          )}>
                            {config.icon}
                            {o.status}
                            <ChevronDown className="w-3 h-3 ml-1" />
                          </button>
                          
                          <div className="absolute left-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                            <button 
                              onClick={() => updateOrderStatus(o.id, 'PENDENTE')}
                              className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase text-amber-700 hover:bg-amber-50"
                            >
                              Pendente
                            </button>
                            <button 
                              onClick={() => updateOrderStatus(o.id, 'ENTREGUE')}
                              className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase text-emerald-700 hover:bg-emerald-50"
                            >
                              Entregue
                            </button>
                            <button 
                              onClick={() => updateOrderStatus(o.id, 'CANCELADA')}
                              className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase text-rose-700 hover:bg-rose-50"
                            >
                              Cancelada
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleExportOrderPDF(o)}
                            className="p-2 text-slate-400 hover:text-[#004a99] hover:bg-[#004a99]/10 rounded-lg transition-all"
                            title="Exportar PDF da Ordem"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOrderToDelete(o.id);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir Ordem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="p-0 border-b border-slate-100">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-slate-50/30"
                            >
                              <div className="px-20 py-6">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                  <table className="w-full text-left">
                                    <thead className="bg-slate-50/80">
                                      <tr>
                                        <th className="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Processo</th>
                                        <th className="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Nº Item</th>
                                        <th className="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Descrição do Item</th>
                                        <th className="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">Quantidade</th>
                                        <th className="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Valor Unitário</th>
                                        <th className="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {o.items.map((item, idx) => {
                                        const unitVal = parseFloat(item.value.replace(',', '.'));
                                        const qty = parseFloat(item.qty);
                                        const total = unitVal * qty;
                                        return (
                                          <tr key={idx}>
                                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.process || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.itemNumber || '-'}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{item.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-center font-medium">{item.qty}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-right font-medium">
                                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(unitVal)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">
                                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhuma ordem de compra encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {orderToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Excluir Ordem?</h3>
                  <p className="text-slate-500 text-sm">
                    Deseja realmente excluir esta ordem de compra? Esta ação não poderá ser desfeita e os itens voltarão para a lista de planejamento.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setOrderToDelete(null)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      deleteOrder(orderToDelete);
                      setOrderToDelete(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Confirmar Exclusão
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
