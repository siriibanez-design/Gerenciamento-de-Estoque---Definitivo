import React, { useState } from 'react';
import { Search, Plus, Phone, Mail, ChevronDown, ChevronRight, FileText, Users, Package, Trash2, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useInventory } from '../context/InventoryContext';

import { cn } from '../lib/utils';

interface Item {
  id: string;
  number: string;
  description: string;
  value: number;
}

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  items: Item[];
}

interface Process {
  id: string;
  number: string;
  description: string;
  suppliers: Supplier[];
}

const initialProcesses: Process[] = [
  {
    id: '1',
    number: '2024/001',
    description: 'Aquisição de Materiais de Escritório - Semestre 1',
    suppliers: [
      {
        id: 's1',
        name: 'Papelaria Central Ltda',
        email: 'vendas@papelariacentral.com',
        phone: '(11) 4002-8922',
        items: [
          { id: 'i1', number: '01', description: 'Papel A4 75g (Resma)', value: 28.50 },
          { id: 'i2', number: '02', description: 'Caneta Esferográfica Azul (Un)', value: 1.50 },
        ]
      },
      {
        id: 's2',
        name: 'Distribuidora Alvorada',
        email: 'comercial@alvorada.com.br',
        phone: '(11) 3322-1100',
        items: [
          { id: 'i3', number: '01', description: 'Papel A4 75g (Resma)', value: 27.90 },
        ]
      }
    ]
  },
  {
    id: '2',
    number: '2024/015',
    description: 'Manutenção de Equipamentos de TI',
    suppliers: [
      {
        id: 's3',
        name: 'Informática & Cia',
        email: 'suporte@infocia.com',
        phone: '(11) 5544-3322',
        items: [
          { id: 'i4', number: '10', description: 'SSD 480GB SATA III', value: 245.00 },
          { id: 'i5', number: '11', description: 'Memória RAM 8GB DDR4', value: 189.00 },
        ]
      }
    ]
  }
];

export default function Suppliers({ isSubPage = false }: { isSubPage?: boolean }) {
  const { items: inventoryItems } = useInventory();
  const [processes, setProcesses] = useState<Process[]>(initialProcesses);
  const [expandedProcesses, setExpandedProcesses] = useState<string[]>(['1']);
  const [expandedSuppliers, setExpandedSuppliers] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcessId, setEditingProcessId] = useState<string | null>(null);

  // Form State
  const [newProcess, setNewProcess] = useState({
    number: '',
    description: '',
    suppliers: [] as Supplier[]
  });

  const toggleProcess = (id: string) => {
    setExpandedProcesses(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSupplier = (id: string) => {
    setExpandedSuppliers(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleOpenModal = (process?: Process) => {
    if (process) {
      setEditingProcessId(process.id);
      setNewProcess({
        number: process.number,
        description: process.description,
        suppliers: JSON.parse(JSON.stringify(process.suppliers)) // Deep copy
      });
    } else {
      setEditingProcessId(null);
      setNewProcess({ number: '', description: '', suppliers: [] });
    }
    setIsModalOpen(true);
  };

  const handleAddProcess = () => {
    if (!newProcess.number || !newProcess.description) return;
    
    if (editingProcessId) {
      setProcesses(prev => prev.map(p => 
        p.id === editingProcessId 
          ? { ...p, ...newProcess }
          : p
      ));
    } else {
      const process: Process = {
        id: Math.random().toString(36).substr(2, 9),
        ...newProcess
      };
      setProcesses([process, ...processes]);
    }
    
    setIsModalOpen(false);
    setNewProcess({ number: '', description: '', suppliers: [] });
    setEditingProcessId(null);
  };

  const handleDeleteProcess = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Deseja realmente excluir este processo?')) {
      setProcesses(prev => prev.filter(p => p.id !== id));
    }
  };

  const addSupplierToForm = () => {
    setNewProcess(prev => ({
      ...prev,
      suppliers: [
        ...prev.suppliers,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: '',
          email: '',
          phone: '',
          items: []
        }
      ]
    }));
  };

  const removeSupplierFromForm = (supplierId: string) => {
    setNewProcess(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter(s => s.id !== supplierId)
    }));
  };

  const addItemToSupplier = (supplierId: string) => {
    setNewProcess(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => 
        s.id === supplierId 
          ? { ...s, items: [...s.items, { id: Math.random().toString(36).substr(2, 9), number: '', description: '', value: 0 }] }
          : s
      )
    }));
  };

  const removeItemFromSupplier = (supplierId: string, itemId: string) => {
    setNewProcess(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => 
        s.id === supplierId 
          ? { ...s, items: s.items.filter(i => i.id !== itemId) }
          : s
      )
    }));
  };

  return (
    <div className={cn("mx-auto max-w-7xl space-y-8", !isSubPage && "p-4 md:p-10")}>
      {!isSubPage && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Fornecedores por Processo</h1>
            <p className="text-slate-500">Gestão em cascata de processos, fornecedores e itens cotados.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#359EFF] text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all"
          >
            <Plus className="w-5 h-5" /> Novo Processo
          </button>
        </div>
      )}

      {isSubPage && (
        <div className="flex justify-end">
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#359EFF] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Novo Processo
          </button>
        </div>
      )}

      <div className="space-y-4">
        {processes.map((process) => (
          <div key={process.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Process Header */}
            <button 
              onClick={() => toggleProcess(process.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-2.5 rounded-lg text-[#004A99]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Processo {process.number}</h3>
                  <p className="text-xs text-slate-500 font-medium">{process.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                  {process.suppliers.length} Fornecedores
                </span>
                <div className="flex items-center gap-2 mr-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenModal(process); }}
                    className="p-1.5 text-slate-400 hover:text-[#359EFF] hover:bg-blue-50 rounded-md transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteProcess(e, process.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {expandedProcesses.includes(process.id) ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
              </div>
            </button>

            {/* Suppliers Cascade */}
            <AnimatePresence>
              {expandedProcesses.includes(process.id) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-100 bg-slate-50/30"
                >
                  <div className="p-4 space-y-3">
                    {process.suppliers.map((supplier) => (
                      <div key={supplier.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        {/* Supplier Header */}
                        <button 
                          onClick={() => toggleSupplier(supplier.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{supplier.name}</h4>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium"><Mail className="w-3 h-3" /> {supplier.email}</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium"><Phone className="w-3 h-3" /> {supplier.phone}</span>
                              </div>
                            </div>
                          </div>
                            {expandedSuppliers.includes(supplier.id) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>

                        {/* Items Cascade */}
                        <AnimatePresence>
                          {expandedSuppliers.includes(supplier.id) && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-slate-100 bg-slate-50/50"
                            >
                              <div className="p-4">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-slate-200">
                                      <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider w-16">Nº Item</th>
                                      <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Descrição do Item</th>
                                      <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Valor Unitário</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {supplier.items.map((item) => (
                                      <tr key={item.id}>
                                        <td className="py-3 text-xs font-bold text-[#359EFF]">{item.number}</td>
                                        <td className="py-3 text-xs text-slate-700 font-medium">{item.description}</td>
                                        <td className="py-3 text-xs font-black text-slate-900 text-right">
                                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                                        </td>
                                      </tr>
                                    ))}
                                    {supplier.items.length === 0 && (
                                      <tr>
                                        <td colSpan={3} className="py-4 text-center text-xs text-slate-400 italic">Nenhum item cadastrado para este fornecedor.</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    {process.suppliers.length === 0 && (
                      <div className="py-8 text-center text-sm text-slate-400 italic bg-white rounded-lg border border-dashed border-slate-300">
                        Nenhum fornecedor vinculado a este processo.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Add Process Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-[#004A99] p-2 rounded-lg text-white">
                    {editingProcessId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                      {editingProcessId ? 'Alterar Processo de Compra' : 'Novo Processo de Compra'}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {editingProcessId ? 'Atualize os dados do processo, fornecedores e itens.' : 'Cadastre o processo, fornecedores e itens cotados.'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Process Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Nº do Processo</label>
                    <input 
                      type="text" 
                      value={newProcess.number}
                      onChange={(e) => setNewProcess({...newProcess, number: e.target.value})}
                      placeholder="Ex: 2024/001"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#359EFF] outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Descrição do Processo</label>
                    <input 
                      type="text" 
                      value={newProcess.description}
                      onChange={(e) => setNewProcess({...newProcess, description: e.target.value})}
                      placeholder="Ex: Aquisição de Materiais de Limpeza"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#359EFF] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Suppliers Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-500" /> Fornecedores e Itens
                    </h3>
                    <button 
                      onClick={addSupplierToForm}
                      className="text-[#359EFF] text-xs font-bold flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-4 h-4" /> Adicionar Fornecedor
                    </button>
                  </div>

                  <div className="space-y-4">
                    {newProcess.suppliers.map((s, sIdx) => (
                      <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-4 relative">
                        <button 
                          onClick={() => removeSupplierFromForm(s.id)}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-6">
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1 px-1">Nome do Fornecedor</label>
                            <input 
                              placeholder="Nome do Fornecedor"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#359EFF]"
                              value={s.name}
                              onChange={(e) => {
                                const updated = [...newProcess.suppliers];
                                updated[sIdx].name = e.target.value;
                                setNewProcess({...newProcess, suppliers: updated});
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1 px-1">E-mail</label>
                            <input 
                              placeholder="Email"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#359EFF]"
                              value={s.email}
                              onChange={(e) => {
                                const updated = [...newProcess.suppliers];
                                updated[sIdx].email = e.target.value;
                                setNewProcess({...newProcess, suppliers: updated});
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1 px-1">Telefone</label>
                            <input 
                              placeholder="Telefone"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#359EFF]"
                              value={s.phone}
                              onChange={(e) => {
                                const updated = [...newProcess.suppliers];
                                updated[sIdx].phone = e.target.value;
                                setNewProcess({...newProcess, suppliers: updated});
                              }}
                            />
                          </div>
                        </div>

                        {/* Items Sub-section */}
                        <div className="pl-4 border-l-2 border-slate-200 space-y-2">
                          {s.items.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-1">
                              <div className="md:col-span-2">
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider px-1">Nº Item</label>
                              </div>
                              <div className="md:col-span-6">
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider px-1">Descrição do Item</label>
                              </div>
                              <div className="md:col-span-3">
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider px-1">Valor Unitário</label>
                              </div>
                            </div>
                          )}
                          {s.items.map((item, iIdx) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                              <div className="md:col-span-2">
                                <input 
                                  placeholder="Nº Item"
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] outline-none"
                                  value={item.number}
                                  onChange={(e) => {
                                    const updated = [...newProcess.suppliers];
                                    updated[sIdx].items[iIdx].number = e.target.value;
                                    setNewProcess({...newProcess, suppliers: updated});
                                  }}
                                />
                              </div>
                              <div className="md:col-span-6">
                                <select 
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] outline-none"
                                  value={item.description}
                                  onChange={(e) => {
                                    const updated = [...newProcess.suppliers];
                                    const selectedItem = inventoryItems.find(i => i.item === e.target.value);
                                    updated[sIdx].items[iIdx].description = e.target.value;
                                    if (selectedItem && !updated[sIdx].items[iIdx].number) {
                                      updated[sIdx].items[iIdx].number = selectedItem.code || '';
                                    }
                                    setNewProcess({...newProcess, suppliers: updated});
                                  }}
                                >
                                  <option value="">Selecione um item...</option>
                                  {inventoryItems.map(invItem => (
                                    <option key={invItem.id} value={invItem.item}>{invItem.item}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="md:col-span-3">
                                <input 
                                  type="number"
                                  placeholder="Valor R$"
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] outline-none"
                                  value={item.value || ''}
                                  onChange={(e) => {
                                    const updated = [...newProcess.suppliers];
                                    updated[sIdx].items[iIdx].value = parseFloat(e.target.value);
                                    setNewProcess({...newProcess, suppliers: updated});
                                  }}
                                />
                              </div>
                              <div className="md:col-span-1 flex justify-center">
                                <button 
                                  onClick={() => removeItemFromSupplier(s.id, item.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => addItemToSupplier(s.id)}
                            className="text-slate-500 text-[10px] font-bold flex items-center gap-1 hover:text-[#359EFF]"
                          >
                            <Plus className="w-3 h-3" /> Adicionar Item
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddProcess}
                  className="px-8 py-2.5 bg-[#359EFF] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all"
                >
                  Salvar Processo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
