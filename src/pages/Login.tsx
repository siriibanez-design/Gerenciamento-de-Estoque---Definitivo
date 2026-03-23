import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
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
            Selecione o período de referência para prosseguir com o gerenciamento.
          </p>
        </div>

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
                defaultValue=""
              >
                <option value="" disabled>Selecione o mês</option>
                <option value="jan-2024">Janeiro 2024</option>
                <option value="fev-2024">Fevereiro 2024</option>
                <option value="mar-2024">Março 2024</option>
                <option value="abr-2024">Abril 2024</option>
                <option value="mai-2024">Maio 2024</option>
                <option value="jun-2024">Junho 2024</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-[#339cff] hover:text-[#339cff]/80 text-sm font-semibold flex items-center gap-1 transition-colors group">
              <Plus className="w-4 h-4" />
              <span>Criar Novo Período</span>
            </button>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#339cff] hover:bg-[#339cff]/90 text-white font-semibold py-4 rounded-lg shadow-lg shadow-[#339cff]/20 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Iniciar Acesso</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

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
    </div>
  );
}
