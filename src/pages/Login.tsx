import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useInventory } from '../context/InventoryContext';

export default function Login() {
  const navigate = useNavigate();
  const { setActiveCycle, cycles, updateCycle, deleteCycle } = useInventory();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newMonthName, setNewMonthName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMonth) {
      setActiveCycle(selectedMonth);
      navigate('/management-dashboard');
    }
  };

  const handleCreateMonth = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMonthName) {
      setActiveCycle(newMonthName);
      navigate('/management-dashboard');
    }
  };

  const handleStartEdit = (cycleId: string) => {
    setEditingId(cycleId);
    setEditName(cycleId);
  };

  const handleSaveEdit = (oldId: string) => {
    if (editName && editName !== oldId) {
      updateCycle(oldId, editName);
      if (selectedMonth === oldId) setSelectedMonth(editName);
    }
    setEditingId(null);
  };

  const handleDeleteCycle = (id: string) => {
    setIsDeleting(id);
  };

  const confirmDelete = () => {
    if (isDeleting) {
      deleteCycle(isDeleting);
      if (selectedMonth === isDeleting) setSelectedMonth('');
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#f5f7f8]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-white p-8 rounded-xl shadow-sm border border-slate-200"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#339cff]/10 p-4 rounded-full mb-4">
            <Package className="w-12 h-12 text-[#339cff]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">ESTOQUE</h1>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-xl font-semibold leading-snug text-slate-800">
            Bem-vindo ao Sistema de Gestão de Estoque Municipal
          </h2>
          <p className="mt-2 text-slate-500 text-sm">
            {isCreating 
              ? 'Digite o nome do novo período (ex: Abril 2024)' 
              : 'Selecione o período de referência para prosseguir com o gerenciamento.'}
          </p>
        </div>

        {!isCreating ? (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 ml-1" htmlFor="mes-vigencia">
                  Mês de Vigência
                </label>
                <div className="relative">
                  <select 
                    className="w-full h-14 rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:border-[#339cff] focus:ring-2 focus:ring-[#339cff]/20 appearance-none px-4 transition-all" 
                    id="mes-vigencia"
                    required
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="" disabled>Selecione o mês</option>
                    {cycles.map(cycle => (
                      <option key={cycle.id} value={cycle.id}>
                        {cycle.id} {cycle.isClosed ? '(FECHADO)' : ''}
                      </option>
                    ))}
                    {cycles.length === 0 && (
                      <>
                        <option value="Janeiro 2024">Janeiro 2024</option>
                        <option value="Fevereiro 2024">Fevereiro 2024</option>
                        <option value="Março 2024">Março 2024</option>
                      </>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsCreating(true)}
                  className="text-[#339cff] hover:text-[#339cff]/80 text-sm font-semibold flex items-center gap-1 transition-colors group"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Novo Período</span>
                </button>
              </div>

              <button 
                type="submit"
                disabled={!selectedMonth}
                className="w-full bg-[#339cff] hover:bg-[#339cff]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg shadow-lg shadow-[#339cff]/20 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Iniciar Acesso</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            {cycles.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Gerenciar Períodos</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {cycles.map((cycle) => (
                    <div key={cycle.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                      {editingId === cycle.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input 
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 bg-white border border-[#339cff] rounded-lg px-2 py-1 text-sm outline-none"
                            autoFocus
                          />
                          <button onClick={() => handleSaveEdit(cycle.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-md">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-bold text-slate-700">{cycle.id}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleStartEdit(cycle.id)}
                              className="p-1.5 text-slate-400 hover:text-[#339cff] hover:bg-[#339cff]/10 rounded-lg transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCycle(cycle.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleCreateMonth} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 ml-1" htmlFor="novo-mes">
                Nome do Período
              </label>
              <input 
                type="text"
                id="novo-mes"
                placeholder="Ex: Abril 2024"
                className="w-full h-14 rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:border-[#339cff] focus:ring-2 focus:ring-[#339cff]/20 px-4 transition-all"
                required
                value={newMonthName}
                onChange={(e) => setNewMonthName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex justify-between items-center">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-[#339cff] hover:bg-[#339cff]/90 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                <span>Criar e Iniciar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 flex justify-center">
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-[#339cff] h-full w-1/3"></div>
          </div>
        </div>
        <p className="text-center mt-4 text-xs text-slate-400">
          Acesso restrito a servidores autorizados
        </p>
      </motion.div>

      <div className="fixed bottom-0 w-full border-t border-slate-200 bg-white/80 backdrop-blur-md px-4 pb-4 pt-3 flex items-center justify-center gap-8 md:gap-16">
        <div className="flex flex-col items-center gap-1 text-slate-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span className="text-[10px] font-medium">Início</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          <span className="text-[10px] font-medium">Produtos</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          <span className="text-[10px] font-medium">Perfil</span>
        </div>
      </div>

      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-200"
            >
              <div className="flex items-center gap-3 text-rose-600 mb-4">
                <div className="p-2 bg-rose-50 rounded-full">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Excluir Período</h3>
              </div>
              <p className="text-slate-600 text-sm mb-6">
                Tem certeza que deseja excluir o período <span className="font-bold text-slate-900">"{isDeleting}"</span>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleting(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
