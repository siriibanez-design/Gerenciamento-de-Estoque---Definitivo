/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ReactNode } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Movements from './pages/Movements';
import Reports from './pages/Reports';
import Planning from './pages/Planning';
import PlanningList from './pages/PlanningList';
import PurchasingDashboard from './pages/PurchasingDashboard';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Upload from './pages/Upload';
import Conversion from './pages/Conversion';
import Monitoring from './pages/Monitoring';
import { InventoryProvider } from './context/InventoryContext';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-10 bg-slate-50">
          <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Ops! Algo deu errado</h1>
            <p className="text-slate-500 mb-6 text-sm">Ocorreu um erro inesperado na aplicação. Tente recarregar a página.</p>
            <div className="bg-slate-50 p-4 rounded-xl text-left mb-6 overflow-auto max-h-40">
              <code className="text-[10px] text-rose-600 font-mono break-all">
                {error?.toString()}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-[#359EFF] text-white rounded-2xl font-black shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all"
            >
              RECARREGAR PÁGINA
            </button>
          </div>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <InventoryProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/movements" element={<Movements />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/planning" element={<Planning />} />
              <Route path="/planning/list" element={<PlanningList />} />
              <Route path="/planning/dashboard" element={<PurchasingDashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/conversion" element={<Conversion />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/settings" element={<Upload />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </InventoryProvider>
      </Router>
    </ErrorBoundary>
  );
}

