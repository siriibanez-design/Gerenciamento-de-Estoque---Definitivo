import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Search, Bell, User, Settings } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Movimentações', path: '/movements' },
    { name: 'Relatórios', path: '/reports' },
    { name: 'Conversão', path: '/conversion' },
    { name: 'Upload', path: '/settings' },
    { name: 'Compras', path: '/planning' },
  ];

  if (location.pathname === '/') return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f8]">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white px-4 md:px-10 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3 text-[#359EFF]">
              <div className="bg-[#359EFF]/10 p-1.5 rounded-lg">
                <Inventory2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900">ESTOQUE</h2>
            </Link>
            <nav className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors pb-1",
                    location.pathname === item.path 
                      ? "text-[#359EFF] border-b-2 border-[#359EFF] font-bold" 
                      : "text-slate-600 hover:text-[#359EFF]"
                  )}
                >
                  {item.name}
                </Link>
              ))}
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
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900">João Silva</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Administrador</span>
              </div>
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
