import React, { useState, useEffect } from 'react';
import { Search, ClipboardList, Plus, AlertTriangle, Info, X, Filter, ChevronRight, ChevronUp, ChevronDown, Package, Target, AlertCircle, Edit2, Trash2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useInventory } from '../context/InventoryContext';

export default function Reports() {
  const { items, categories, addItem, updateItem, deleteItem, addCategory, updateCategory, deleteCategory, isCycleClosed } = useInventory();
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [adjustment, setAdjustment] = useState('');
  
  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState({
    item: '',
    category: '',
    code: '',
    current: '',
    minStock: '',
    target: ''
  });

  useEffect(() => {
    if (!newItem.category && categories.length > 0) {
      const firstRealCategory = categories.find(c => c !== 'TODOS') || categories[0];
      setNewItem(prev => ({ ...prev, category: firstRealCategory }));
    }
  }, [categories]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory) {
      if (editingCategory) {
        updateCategory(editingCategory, newCategory);
        if (selectedCategory === editingCategory) {
          setSelectedCategory(newCategory);
        }
        setEditingCategory(null);
      } else {
        addCategory(newCategory);
      }
      setNewCategory('');
      setIsCategoryModalOpen(false);
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemCategory = newItem.category || (categories.find(c => c !== 'TODOS') || categories[0]);
    
    if (editingId !== null) {
      updateItem(editingId, {
        item: newItem.item,
        category: itemCategory,
        code: newItem.code,
        current: parseInt(newItem.current),
        minStock: parseInt(newItem.minStock),
        target: parseInt(newItem.target)
      });
      setEditingId(null);
    } else {
      addItem({
        item: newItem.item,
        category: itemCategory,
        code: newItem.code,
        current: parseInt(newItem.current),
        minStock: parseInt(newItem.minStock),
        target: parseInt(newItem.target),
        unitPrice: 0
      });
    }
    
    setIsItemModalOpen(false);
    setNewItem({ item: '', category: categories.find(c => c !== 'TODOS') || categories[0], code: '', current: '', minStock: '', target: '' });
  };

  const handleEdit = (item: any) => {
    setNewItem({
      item: item.item,
      category: item.category,
      code: item.code || '',
      current: item.current.toString(),
      minStock: item.minStock.toString(),
      target: item.target.toString()
    });
    setAdjustment('');
    setEditingId(item.id);
    setIsItemModalOpen(true);
  };

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (deletingId !== null) {
      deleteItem(deletingId);
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete);
      if (selectedCategory === categoryToDelete) {
        setSelectedCategory('TODOS');
      }
      setIsDeleteCategoryModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    doc.setFontSize(18);
    doc.text('Relatório de Estoque', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
    
    const tableData = filteredItems.map(r => {
      const tetoUsagePercentage = r.target > 0 ? Math.min(100, (r.totalOut / r.target) * 100) : 0;
      const remainingTeto = r.target - r.totalOut;
      const ratio = r.minStock > 0 ? (r.current / r.minStock).toFixed(2) : '0.00';

      return [
        r.code || '-',
        r.item,
        r.category,
        r.current.toString(),
        r.minStock.toString(),
        r.in || '0',
        r.out || '0',
        r.target.toString(),
        `${remainingTeto} (${Math.round(tetoUsagePercentage)}%)`,
        ratio
      ];
    });

    autoTable(doc, {
      head: [['CÓDIGO', 'ITEM', 'CATEGORIA', 'ESTOQ. ATUAL', 'ESTOQ. MÍN.', 'ENTRADAS', 'SAÍDAS', 'TETO', 'FALTA TETO', 'ATUAL/MÍN']],
      body: tableData,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [0, 74, 153], fontSize: 8 },
      styles: { fontSize: 8 },
      columnStyles: {
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { halign: 'center' },
        9: { halign: 'right' }
      }
    });

    doc.save(`relatorio_estoque_${new Date().getTime()}.pdf`);
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'TODOS' || item.category === selectedCategory;
    const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatus = (item: any) => {
    const percentage = (item.current / item.target) * 100;
    if (item.current < item.minStock) return { label: 'Crítico', color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' };
    if (percentage < 60) return { label: 'Atenção', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' };
    return { label: 'Ideal', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' };
  };

  return (
    <div className="mx-auto max-w-[1600px] p-6 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-black text-slate-900 tracking-tight text-4xl">Relatórios</h2>
          <p className="text-slate-600 mt-1 text-lg">Gerenciamento e monitoramento de fluxo de itens do estoque em tempo real</p>
        </div>
        {!isCycleClosed && (
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Criar Categoria
            </button>
            <button 
              onClick={() => {
                setEditingId(null);
                setNewItem({ item: '', category: categories[0], code: '', current: '', minStock: '', target: '' });
                setIsItemModalOpen(true);
              }}
              className="px-4 py-2 bg-[#004a99] text-white font-bold text-xs rounded-lg hover:bg-[#004a99]/90 transition-colors flex items-center gap-2 shadow-sm shadow-[#004a99]/20"
            >
              <Plus className="w-4 h-4" /> Novo Item
            </button>
          </div>
        )}
      </div>

      {/* Filter and Export Bar (Matching Movements style) */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-2">
          <button 
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all ${isFilterVisible ? 'bg-[#004a99] border-[#004a99] text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter className="w-3.5 h-3.5" /> Filtrar
          </button>
          <button 
            onClick={handleExportPDF}
            className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-2 hover:bg-slate-50"
          >
            <FileText className="w-3.5 h-3.5" /> Exportar PDF
          </button>
        </div>
        <span className="text-xs text-slate-400 font-medium">Exibindo {filteredItems.length} de {items.length} registros</span>
      </div>

      {/* Filter Section */}
      <AnimatePresence>
        {isFilterVisible && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004a99]/20 focus:border-[#004a99] transition-all text-sm outline-none" 
                  placeholder="Pesquisar itens por nome..." 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button 
          onClick={() => setSelectedCategory('TODOS')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === 'TODOS' ? 'bg-[#004a99] text-white shadow-md shadow-[#004a99]/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          TODOS
        </button>
        {categories.map(cat => (
          <div key={cat} className="relative group flex-shrink-0">
            <button 
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap pr-14 ${selectedCategory === cat ? 'bg-[#004a99] text-white shadow-md shadow-[#004a99]/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {cat.toUpperCase()}
            </button>
            <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 transition-all opacity-0 group-hover:opacity-100`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCategory(cat);
                  setNewCategory(cat);
                  setIsCategoryModalOpen(true);
                }}
                className={`p-0.5 rounded-full transition-all ${selectedCategory === cat ? 'text-white/70 hover:text-white hover:bg-white/20' : 'text-slate-400 hover:text-[#004a99] hover:bg-slate-100'}`}
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCategoryToDelete(cat);
                  setIsDeleteCategoryModalOpen(true);
                }}
                className={`p-0.5 rounded-full transition-all ${selectedCategory === cat ? 'text-white/70 hover:text-white hover:bg-white/20' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Código</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Item</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Estoque Atual</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Estoque Mínimo</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Entradas</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Saídas</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Teto</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-center text-xs">Falta do Teto</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-right text-xs">Estoq. Atual / Mínimo</th>
                {!isCycleClosed && <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-center text-xs">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((r) => {
                const status = getStatus(r);
                const tetoUsagePercentage = r.target > 0 ? Math.min(100, (r.totalOut / r.target) * 100) : 0;
                const remainingTeto = r.target - r.totalOut;
                
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-400 font-mono">{r.code || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{r.item}</span>
                        <span className="text-slate-400 text-[11px] font-medium uppercase tracking-tight">{r.category}</span>
                      </div>
                    </td>
                    <td className={`px-6 font-bold py-4 text-sm ${r.current < r.minStock ? 'text-rose-600' : 'text-slate-900'}`}>{r.current}</td>
                    <td className="px-6 font-semibold py-4 text-sm text-slate-500">{r.minStock}</td>
                    <td className="px-6 text-emerald-600 font-bold py-4 text-sm">{r.in}</td>
                    <td className="px-6 text-rose-600 font-bold py-4 text-sm">{r.out}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{r.target}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-slate-700 text-[11px]">
                          {remainingTeto} - {Math.round(tetoUsagePercentage)}%
                        </span>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${tetoUsagePercentage > 80 ? 'bg-rose-500' : tetoUsagePercentage > 50 ? 'bg-amber-500' : 'bg-[#004a99]'}`} 
                            style={{ width: `${tetoUsagePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-[11px] ${status.color}`}>
                      {r.minStock > 0 ? (r.current / r.minStock).toFixed(2) : '0.00'}
                    </td>
                    {!isCycleClosed && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(r)}
                            className="p-1.5 text-slate-400 hover:text-[#004a99] hover:bg-[#004a99]/10 rounded-lg transition-all"
                            title="Alterar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => confirmDelete(r.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{editingCategory ? 'Editar Categoria' : 'Criar Categoria'}</h3>
                <button onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                  setNewCategory('');
                }} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Categoria</label>
                  <input 
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Ex: Limpeza, Informática..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004a99] outline-none transition-all text-sm font-medium"
                    type="text" 
                  />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-[#004a99] text-white font-bold text-sm shadow-lg shadow-[#004a99]/20 hover:bg-[#004a99]/90 transition-all">
                  {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isItemModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {editingId !== null ? 'Editar Item' : 'Novo Item'}
                </h3>
                <button onClick={() => setIsItemModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveItem} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Código</label>
                    <input 
                      value={newItem.code}
                      onChange={(e) => setNewItem({...newItem, code: e.target.value})}
                      placeholder="Ex: 18189893"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004a99] outline-none transition-all text-sm font-medium"
                      type="text" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
                    <select 
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004a99] outline-none transition-all text-sm font-medium bg-white"
                    >
                      {categories.filter(c => c !== 'TODOS').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Item</label>
                    <input 
                      required
                      value={newItem.item}
                      onChange={(e) => setNewItem({...newItem, item: e.target.value})}
                      placeholder="Ex: Papel A4"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004a99] outline-none transition-all text-sm font-medium"
                      type="text" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estoque Atual</label>
                    <input 
                      required
                      value={newItem.current}
                      onChange={(e) => setNewItem({...newItem, current: e.target.value})}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004a99] outline-none transition-all text-sm font-medium"
                      type="number" 
                    />
                  </div>

                  {editingId !== null && (
                    <div className="space-y-2 col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ajuste Rápido</label>
                      <div className="flex items-center gap-3">
                        <input 
                          value={adjustment}
                          onChange={(e) => setAdjustment(e.target.value)}
                          placeholder="Qtd."
                          className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#004a99] outline-none transition-all text-sm font-medium"
                          type="number" 
                        />
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => {
                              const adj = parseInt(adjustment) || 0;
                              setNewItem(prev => ({ ...prev, current: (Math.max(0, parseInt(prev.current || '0') - adj)).toString() }));
                            }}
                            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm flex items-center gap-1"
                          >
                            <ChevronDown className="w-4 h-4" />
                            <span className="text-xs font-bold">Subtrair</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              const adj = parseInt(adjustment) || 0;
                              setNewItem(prev => ({ ...prev, current: (parseInt(prev.current || '0') + adj).toString() }));
                            }}
                            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm flex items-center gap-1"
                          >
                            <ChevronUp className="w-4 h-4" />
                            <span className="text-xs font-bold">Adicionar</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 italic mt-2">Digite um valor e use os botões para ajustar o estoque atual.</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estoque Mínimo</label>
                    <input 
                      required
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({...newItem, minStock: e.target.value})}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004a99] outline-none transition-all text-sm font-medium"
                      type="number" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teto (Capacidade)</label>
                    <input 
                      required
                      value={newItem.target}
                      onChange={(e) => setNewItem({...newItem, target: e.target.value})}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004a99] outline-none transition-all text-sm font-medium"
                      type="number" 
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-[#004a99] text-white font-bold text-sm shadow-lg shadow-[#004a99]/20 hover:bg-[#004a99]/90 transition-all">
                  {editingId !== null ? 'Salvar Alterações' : 'Cadastrar Item'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Confirmar Exclusão</h3>
                  <p className="text-slate-500 text-sm">
                    Tem certeza que deseja excluir este item? Esta ação não poderá ser desfeita.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isDeleteCategoryModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Excluir Categoria?</h3>
                  <p className="text-slate-500 text-sm">
                    Tem certeza que deseja excluir a categoria <strong>{categoryToDelete}</strong>? 
                    Os itens desta categoria não serão excluídos, mas ficarão sem categoria associada.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsDeleteCategoryModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleDeleteCategory}
                    className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-8 items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600 font-bold text-[11px] uppercase tracking-wider">Estoque Ideal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span className="text-slate-600 font-bold text-[11px] uppercase tracking-wider">Atenção Necessária</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500"></span>
          <span className="text-slate-600 font-bold text-[11px] uppercase tracking-wider">Abaixo do Mínimo Crítico</span>
        </div>
        <div className="ml-auto text-slate-400 italic text-xs">
          Última sincronização: hoje às 14:45
        </div>
      </div>
    </div>
  );
}
