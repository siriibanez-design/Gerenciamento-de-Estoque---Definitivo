import React, { useState } from 'react';
import { Plus, Search, Filter, Download, ArrowDown, ArrowUp, Edit2, Trash2, TrendingUp, TrendingDown, BarChart2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useInventory } from '../context/InventoryContext';

export default function Movements() {
  const { items, movements, addMovement, updateMovement, deleteMovement, isCycleClosed } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    item: items[0]?.item || '',
    type: 'ENTRADA',
    qty: '',
    location: ''
  });

  // Update form data when items change
  React.useEffect(() => {
    if (!formData.item && items.length > 0) {
      setFormData(prev => ({ ...prev, item: items[0].item }));
    }
  }, [items]);

  const filteredMovements = movements.filter(m => 
    m.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId !== null) {
      updateMovement(editingId, {
        item: formData.item,
        type: formData.type,
        qty: parseInt(formData.qty),
        location: formData.location
      });
      setEditingId(null);
    } else {
      addMovement({
        item: formData.item,
        type: formData.type,
        qty: parseInt(formData.qty),
        location: formData.location
      });
    }
    
    setIsModalOpen(false);
    setFormData({ item: items[0]?.item || '', type: 'ENTRADA', qty: '', location: '' });
  };

  const handleEdit = (m: any) => {
    setFormData({
      item: m.item,
      type: m.type,
      qty: m.qty.toString(),
      location: m.location
    });
    setEditingId(m.id);
    setIsModalOpen(true);
  };

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (deletingId !== null) {
      deleteMovement(deletingId);
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Movimentações de Estoque', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
    
    const tableData = filteredMovements.map(m => [
      m.date,
      m.item,
      m.location,
      m.type,
      m.qty.toString()
    ]);

    autoTable(doc, {
      head: [['Data', 'Item', 'Local/Pedido', 'Tipo', 'Qtd']],
      body: tableData,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [53, 158, 255] }
    });

    doc.save(`movimentacoes_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-10 space-y-8">
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">Movimentações</h1>
          <p className="text-slate-500 text-sm">Gerencie o fluxo de entrada e saída de materiais do estoque municipal.</p>
        </div>
        {!isCycleClosed && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-11 px-6 bg-[#359EFF] text-white text-sm font-bold shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Movimentação</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {editingId !== null ? 'Alterar Movimentação' : 'Nova Movimentação'}
                </h3>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData({ item: items[0]?.item || '', type: 'ENTRADA', qty: '', location: '' });
                  }}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item / Material</label>
                  <select 
                    required
                    value={formData.item}
                    onChange={(e) => setFormData({...formData, item: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#359EFF] outline-none transition-all text-sm font-medium bg-white"
                  >
                    {items.map((r, idx) => (
                      <option key={idx} value={r.item}>{r.item}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Local / Pedido</label>
                  <input 
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Ex: Almoxarifado Central ou Pedido #123"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#359EFF] outline-none transition-all text-sm font-medium"
                    type="text" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#359EFF] outline-none transition-all text-sm font-medium bg-white"
                    >
                      <option value="ENTRADA">ENTRADA</option>
                      <option value="SAÍDA">SAÍDA</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantidade</label>
                    <input 
                      required
                      value={formData.qty}
                      onChange={(e) => setFormData({...formData, qty: e.target.value})}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#359EFF] outline-none transition-all text-sm font-medium"
                      type="number" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                      setFormData({ item: items[0]?.item || '', type: 'ENTRADA', qty: '', location: '' });
                    }}
                    className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-[#359EFF] text-white font-bold text-sm shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all"
                  >
                    {editingId !== null ? 'Salvar Alterações' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 p-6 text-center"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Confirmar Exclusão</h3>
              <p className="text-slate-500 text-sm mb-6">
                Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100 flex flex-col gap-4 bg-slate-50/50">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button 
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className={`px-4 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all ${isFilterVisible ? 'bg-[#359EFF] border-[#359EFF] text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Filter className="w-3.5 h-3.5" /> Filtrar
              </button>
              <button 
                onClick={handleExportPDF}
                className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-2 hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5" /> Exportar PDF
              </button>
            </div>
            <span className="text-xs text-slate-400 font-medium">Exibindo 1-{filteredMovements.length} de {movements.length} registros</span>
          </div>

          <AnimatePresence>
            {isFilterVisible && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text"
                    placeholder="Filtrar por item, código ou local..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#359EFF] outline-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-left text-slate-500 text-xs font-bold uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-left text-slate-500 text-xs font-bold uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-left text-slate-500 text-xs font-bold uppercase tracking-wider">Local / Pedido</th>
                <th className="px-6 py-4 text-left text-slate-500 text-xs font-bold uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-right text-slate-500 text-xs font-bold uppercase tracking-wider">Quantidade</th>
                {!isCycleClosed && <th className="px-6 py-4 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredMovements.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-slate-600 text-sm">{m.date}</td>
                  <td className="px-6 py-5 text-slate-900 text-sm font-medium">{m.item}</td>
                  <td className="px-6 py-5 text-slate-500 text-sm italic">{m.location}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${m.typeColor} text-[11px] font-bold uppercase`}>
                      {m.type === 'ENTRADA' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
                      {m.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right text-slate-900 text-sm font-bold">{m.qty}</td>
                  {!isCycleClosed && (
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(m)}
                          className="p-1.5 text-slate-400 hover:text-[#359EFF] hover:bg-[#359EFF]/10 rounded-lg transition-all"
                          title="Alterar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(m.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredMovements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">
                    Nenhuma movimentação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#359EFF]/5 border border-[#359EFF]/10 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Entradas (Mês)</p>
            <p className="text-xl font-bold text-slate-900">1.420 itens</p>
          </div>
        </div>
        <div className="bg-[#359EFF]/5 border border-[#359EFF]/10 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Saídas (Mês)</p>
            <p className="text-xl font-bold text-slate-900">895 itens</p>
          </div>
        </div>
        <div className="bg-[#359EFF]/5 border border-[#359EFF]/10 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#359EFF]/10 flex items-center justify-center">
            <BarChart2 className="w-6 h-6 text-[#359EFF]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Saldo Operacional</p>
            <p className="text-xl font-bold text-slate-900">+ 525 itens</p>
          </div>
        </div>
      </div>
    </div>
  );
}
