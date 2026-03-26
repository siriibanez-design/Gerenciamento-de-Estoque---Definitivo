import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Search, Bell, User, Settings, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useInventory } from '../context/InventoryContext';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { turnCycle, activeCycleId, isCycleClosed } = useInventory();
  const [showConfirm, setShowConfirm] = useState(false);

  const navItems = [
    { name: 'Ciclo', isAction: true, hideIfClosed: true, isYellow: true },
    { name: 'Dashboard', path: '/management-dashboard' },
    { name: 'Movimentações', path: '/movements' },
    { name: 'Relatórios', path: '/reports' },
    { name: 'Conversão', path: '/conversion' },
    { name: 'Upload', path: '/settings' },
    { name: 'Compras', path: '/planning' },
  ];

  const handleTurnCycle = () => {
    turnCycle();
    setShowConfirm(false);
    navigate('/');
  };

  if (location.pathname === '/') return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f8]">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white px-4 md:px-10 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 text-[#359EFF]">
              <div className="bg-[#359EFF]/10 p-1.5 rounded-lg">
                <Inventory2 className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900">ESTOQUE</h2>
                {activeCycleId && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{activeCycleId}</span>
                    {isCycleClosed && (
                      <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">APENAS CONSULTA</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
            <nav className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => {
                if (item.hideIfClosed && isCycleClosed) return null;
                return item.isAction ? (
                  <button
                    key={item.name}
                    onClick={() => setShowConfirm(true)}
                    className={cn(
                      "text-sm font-medium transition-colors pb-1 flex items-center gap-1.5",
                      item.isYellow ? "text-amber-500 hover:text-amber-600" : "text-slate-600 hover:text-[#359EFF]"
                    )}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path!}
                    className={cn(
                      "text-sm font-medium transition-colors pb-1",
                      location.pathname === item.path 
                        ? "text-[#359EFF] border-b-2 border-[#359EFF] font-bold" 
                        : "text-slate-600 hover:text-[#359EFF]"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-1 justify-end gap-4 items-center">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                className="w-full rounded-lg border-none bg-slate-100 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#359EFF]"
                placeholder="Buscar..."
                type="text"
              />
            </div>
            <button className="flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="bg-[#359EFF]/10 flex items-center justify-center rounded-full w-10 h-10 border border-[#359EFF]/20">
                <User className="w-5 h-5 text-[#359EFF]" />
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-slate-200"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">Confirmar Fechamento de Ciclo?</h3>
                  <p className="text-sm text-slate-500">
                    Esta ação irá apagar todas as movimentações, zerar as colunas de Entradas e Saídas e fechar o mês atual. 
                    O estoque atual será mantido como estoque inicial para o próximo ciclo.
                  </p>
                </div>
                <div className="flex gap-3 w-full pt-4">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleTurnCycle}
                    className="flex-1 px-4 py-3 rounded-2xl bg-[#359EFF] text-white text-sm font-bold shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all"
                  >
                    Confirmar e Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="px-10 py-6 border-t border-slate-200 text-center bg-white">
        <p className="text-xs text-slate-500">© 2023 Sistema de Gestão de Estoque Municipal - Departamento de Logística e Suprimentos</p>
      </footer>
    </div>
  );
}

// Mocking Material Icons with Lucide
function Inventory2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
      <path d="M10 13h4" />
    </svg>
  );
}
