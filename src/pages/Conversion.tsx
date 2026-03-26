import React, { useState } from 'react';
import { Search, Edit2, Check, X, Hash, Package, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useInventory } from '../context/InventoryContext';

export default function Conversion() {
  const { items, categories, addItem, updateItem, deleteItem } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    itemId: '',
    code: ''
  });

  const filteredItems = items.filter(item => 
    (item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    item.code // Only show items that have a code assigned
  );

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        itemId: item.id.toString(),
        code: item.code || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        itemId: '',
        code: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItem = items.find(i => i.id.toString() === formData.itemId);
    if (!selectedItem) return;

    if (editingId !== null) {
      updateItem(editingId, {
        code: formData.code
      });
    } else {
      // If adding a new code to an item that already has codes, we can append it
      // But usually the user might just want to edit the existing list of codes
      // For simplicity, let's just update the selected item's code field
      updateItem(selectedItem.id, {
        code: formData.code
      });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (deletingId !== null) {
      // Instead of deleting the item, we just clear its code
      updateItem(deletingId, { code: '' });
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] p-6 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-black text-slate-900 tracking-tight text-4xl">Conversão de Códigos</h2>
          <p className="text-slate-600 mt-1 text-lg">Vincule códigos de arquivos externos aos itens cadastrados no sistema</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-[#004a99] text-white font-bold text-sm rounded-xl hover:bg-[#004a99]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#004a99]/20"
        >
          <Plus className="w-5 h-5" /> Adicionar Item
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004a99]/20 focus:border-[#004a99] transition-all text-sm outline-none" 
            placeholder="Pesquisar por nome do item ou código..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-1/2">Item do Sistema</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-1/3">Código Vinculado</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{item.item}</div>
                      <div className="text-slate-400 text-[11px] font-medium uppercase">{item.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-slate-300" />
                    <span className={`font-mono text-sm ${item.code ? 'text-slate-700 font-bold' : 'text-slate-300 italic'}`}>
                      {item.code || 'Nenhum código'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => handleOpenModal(item)}
                      className="p-2 text-slate-400 hover:text-[#004a99] hover:bg-[#004a99]/10 rounded-lg transition-all"
                      title="Alterar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => confirmDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                  Nenhum item encontrado para "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
          <Hash className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 text-sm">Como funciona a conversão?</h4>
          <p className="text-amber-700 text-xs mt-1 leading-relaxed">
            Ao fazer o upload de um arquivo CSV, o sistema procura pelo código na coluna correspondente. 
            Se encontrar um código cadastrado aqui, o nome do item no arquivo será automaticamente substituído 
            pelo nome do sistema antes de ser enviado para as movimentações. Isso garante que seu estoque 
            fique sempre organizado, independentemente do nome usado no arquivo original.
          </p>
        </div>
      </div>

      {/* Modal Adicionar/Editar */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {editingId !== null ? 'Alterar Conversão' : 'Nova Conversão'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Item</label>
                  <select 
                    required
                    value={formData.itemId}
                    onChange={(e) => setFormData({...formData, itemId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004a99] outline-none transition-all text-sm font-medium bg-white"
                    disabled={editingId !== null}
                  >
                    <option value="">Selecione um item...</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>{item.item} ({item.category})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Código de Conversão</label>
                  <div className="space-y-1">
                    <input 
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="Ex: 18189893 ou 123, 456"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004a99] outline-none transition-all text-sm font-medium font-mono"
                      type="text" 
                    />
                    <p className="text-[10px] text-slate-400">Para múltiplos códigos, separe por vírgula.</p>
                  </div>
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-[#004a99] text-white font-bold text-sm shadow-lg shadow-[#004a99]/20 hover:bg-[#004a99]/90 transition-all">
                  {editingId !== null ? 'Salvar Alterações' : 'Cadastrar Conversão'}
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
                    Tem certeza que deseja excluir este item? Esta ação removerá o item e seu vínculo de código.
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
      </AnimatePresence>
    </div>
  );
}
