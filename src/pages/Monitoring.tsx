import React, { useMemo, useState } from 'react';
import { useInventory, Expiration } from '../context/InventoryContext';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Package, 
  Clock, 
  AlertCircle, 
  TrendingDown, 
  Search, 
  ChevronLeft, 
  BarChart3, 
  Calendar, 
  Eye, 
  Plus, 
  X, 
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  FileDown
} from 'lucide-react';
import { cn } from '../lib/utils';

type MonitoringView = 'hub' | 'productivity' | 'abc' | 'validity' | 'exclusive';

export default function Monitoring({ isSubPage = false }: { isSubPage?: boolean }) {
  const { items, movements, expirations, orders, addExpiration, updateExpiration, deleteExpiration } = useInventory();
  const [view, setView] = useState<MonitoringView>('hub');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Validity
  const [isAddExpModalOpen, setIsAddExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [expDate, setExpDate] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('');

  // State for Exclusive Monitoring
  const [exclusiveItemId, setExclusiveItemId] = useState<number | null>(null);

  const now = new Date();

  const parseDate = (dateStr: string | undefined) => {
    if (!dateStr || typeof dateStr !== 'string') return new Date(0);
    const parts = dateStr.split('/');
    if (parts.length !== 3) {
      const fallback = new Date(dateStr);
      return isNaN(fallback.getTime()) ? new Date(0) : fallback;
    }
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  };

  // 1. Baixa Produtividade Logic
  const productivityData = useMemo(() => {
    return items.map(item => {
      const itemExits = movements
        .filter(m => m.item === item.item && m.type === 'SAÍDA')
        .sort((a, b) => {
          const dateA = parseDate(a.date).getTime();
          const dateB = parseDate(b.date).getTime();
          return dateB - dateA;
        });

      const lastExit = itemExits[0];
      let daysInactive = 0;
      let lastExitDate = '-';

      if (lastExit) {
        const exitDate = parseDate(lastExit.date);
        const diffTime = Math.abs(now.getTime() - exitDate.getTime());
        daysInactive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        lastExitDate = lastExit.date;
      } else {
        daysInactive = 999;
      }

      return { ...item, daysInactive, lastExitDate, exitCount: itemExits.length };
    })
    .filter(item => 
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.daysInactive - a.daysInactive);
  }, [items, movements, searchTerm]);

  // 2. Curva ABC Logic
  const abcData = useMemo(() => {
    // Sort items by quantity of exits (totalOut)
    const data = [...items].sort((a, b) => (b.totalOut || 0) - (a.totalOut || 0));

    const totalExits = data.reduce((acc, curr) => acc + (curr.totalOut || 0), 0);
    let runningTotal = 0;

    return data.map(item => {
      runningTotal += (item.totalOut || 0);
      const percentage = totalExits > 0 ? (runningTotal / totalExits) * 100 : 0;
      
      let category: 'A' | 'B' | 'C' = 'C';
      if (percentage <= 80) category = 'A';
      else if (percentage <= 95) category = 'B';
      else category = 'C';

      return { 
        ...item, 
        abcCategory: category, 
        percentage,
        // Keep totalValue for display if needed, but logic is now based on totalOut
        totalValue: orders
          .filter(o => o.status === 'ENTREGUE')
          .reduce((acc, order) => {
            const orderItem = order.items.find(oi => oi.name === item.item);
            if (orderItem) {
              const val = parseFloat(orderItem.value.replace(/[^\d,.-]/g, '').replace(',', '.'));
              return acc + (isNaN(val) ? 0 : val);
            }
            return acc;
          }, 0)
      };
    }).filter(item => 
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, orders, searchTerm]);

  // 3. Validade Logic
  const validityData = useMemo(() => {
    return (expirations || []).map(exp => {
      const expirationDate = new Date(exp.date);
      const diffTime = expirationDate.getTime() - now.getTime();
      const daysToExpire = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let status: 'vencido' | 'alerta' | 'ok' = 'ok';
      if (daysToExpire < 0) status = 'vencido';
      else if (daysToExpire <= 30) status = 'alerta';

      return { ...exp, daysToExpire, status };
    }).sort((a, b) => a.daysToExpire - b.daysToExpire);
  }, [expirations]);

  // 4. Monitoramento Exclusivo Logic
  const exclusiveItem = items.find(i => i.id === exclusiveItemId);

  const handleAddExpiration = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemId && expDate) {
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        if (editingExpId) {
          updateExpiration(editingExpId, {
            itemId: selectedItemId,
            itemName: item.item,
            date: expDate,
            manufacturingDate: manufacturingDate || undefined
          });
        } else {
          addExpiration({
            itemId: selectedItemId,
            itemName: item.item,
            date: expDate,
            manufacturingDate: manufacturingDate || undefined
          });
        }
        setIsAddExpModalOpen(false);
        setEditingExpId(null);
        setSelectedItemId(null);
        setExpDate('');
        setManufacturingDate('');
      }
    }
  };

  const handleEditExpiration = (exp: Expiration) => {
    setEditingExpId(exp.id);
    setSelectedItemId(exp.itemId);
    setExpDate(exp.date);
    setManufacturingDate(exp.manufacturingDate || '');
    setIsAddExpModalOpen(true);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Validade de Itens', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

    const tableData = validityData.map(exp => [
      exp.itemName,
      exp.manufacturingDate ? new Date(exp.manufacturingDate).toLocaleDateString('pt-BR') : '-',
      new Date(exp.date).toLocaleDateString('pt-BR'),
      exp.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Item', 'Fabricação', 'Validade', 'Status']],
      body: tableData,
      headStyles: { fillColor: [53, 158, 255] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save('relatorio-validade.pdf');
  };

  const exportProductivityToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Relatório de Baixa Produtividade', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

    const tableData = productivityData.map(item => [
      item.item,
      item.category,
      `${item.current} un`,
      item.lastExitDate,
      item.daysInactive === 999 ? 'Inativo' : `${item.daysInactive} dias`
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Item', 'Categoria', 'Estoque', 'Última Saída', 'Inatividade']],
      body: tableData,
      headStyles: { fillColor: [245, 158, 11] }, // Amber color for productivity
      alternateRowStyles: { fillColor: [255, 251, 235] },
    });

    doc.save('baixa-produtividade.pdf');
  };

  const exportABCToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Relatório Curva ABC', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

    const tableData = abcData.map(item => [
      item.item,
      item.totalOut.toString(),
      `${Math.round(item.percentage)}%`,
      item.abcCategory
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Item', 'Saídas', 'Acumulado', 'Classe']],
      body: tableData,
      headStyles: { fillColor: [53, 158, 255] }, // Blue color for ABC
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save('curva-abc.pdf');
  };

  const renderHub = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <button 
        onClick={() => setView('productivity')}
        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#359EFF] transition-all group flex flex-col items-center text-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
          <TrendingDown className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">Baixa Produtividade</h3>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Itens parados há muito tempo</p>
        </div>
      </button>

      <button 
        onClick={() => setView('abc')}
        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#359EFF] transition-all group flex flex-col items-center text-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">Curva ABC</h3>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Classificação por valor e giro</p>
        </div>
      </button>

      <button 
        onClick={() => setView('validity')}
        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#359EFF] transition-all group flex flex-col items-center text-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
          <Calendar className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">Validade</h3>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Controle de vencimentos</p>
        </div>
      </button>

      <button 
        onClick={() => setView('exclusive')}
        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#359EFF] transition-all group flex flex-col items-center text-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
          <Eye className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">Monitoramento Exclusivo</h3>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Acompanhamento de item específico</p>
        </div>
      </button>
    </div>
  );

  const renderProductivity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('hub')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Itens com Baixa Produtividade</h2>
        </div>
        <button 
          onClick={exportProductivityToPDF}
          className="bg-white text-slate-600 border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-black shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100">Item / Categoria</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100">Estoque Atual</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100">Última Saída</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100">Tempo de Inatividade</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {productivityData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.item}</p>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">{item.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700">{item.current} unidades</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {item.lastExitDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "text-sm font-black",
                        item.daysInactive === 999 ? "text-slate-400" :
                        item.daysInactive > 90 ? "text-rose-600" :
                        item.daysInactive > 30 ? "text-amber-600" :
                        "text-emerald-600"
                      )}>
                        {item.daysInactive === 999 ? 'Sem registros' : `${item.daysInactive} dias`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      item.daysInactive === 999 ? "bg-slate-100 text-slate-500" :
                      item.daysInactive > 90 ? "bg-rose-100 text-rose-700" :
                      item.daysInactive > 30 ? "bg-amber-100 text-amber-700" :
                      "bg-emerald-100 text-emerald-700"
                    )}>
                      {item.daysInactive === 999 ? 'Inativo' :
                       item.daysInactive > 90 ? 'Crítico' :
                       item.daysInactive > 30 ? 'Alerta' : 'Ativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderABC = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('hub')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Curva ABC</h2>
        </div>
        <button 
          onClick={exportABCToPDF}
          className="bg-white text-slate-600 border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-black shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <h4 className="text-emerald-700 text-xs font-black uppercase tracking-widest mb-1">Classe A</h4>
          <p className="text-2xl font-black text-emerald-900">80% das Saídas</p>
          <p className="text-emerald-600/60 text-[10px] font-bold mt-2 uppercase">Itens com maior giro de estoque</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
          <h4 className="text-amber-700 text-xs font-black uppercase tracking-widest mb-1">Classe B</h4>
          <p className="text-2xl font-black text-amber-900">15% das Saídas</p>
          <p className="text-amber-600/60 text-[10px] font-bold mt-2 uppercase">Itens com giro intermediário</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h4 className="text-slate-700 text-xs font-black uppercase tracking-widest mb-1">Classe C</h4>
          <p className="text-2xl font-black text-slate-900">5% das Saídas</p>
          <p className="text-emerald-600/60 text-[10px] font-bold mt-2 uppercase">Itens com menor giro de estoque</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100">Item</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100">Saídas (Qtd)</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100">Acumulado (%)</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100 text-center">Classe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {abcData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{item.item}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.totalOut}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#359EFF] rounded-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 w-8">{Math.round(item.percentage)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-xs font-black",
                      item.abcCategory === 'A' ? "bg-emerald-100 text-emerald-700" :
                      item.abcCategory === 'B' ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-500"
                    )}>
                      {item.abcCategory}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderValidity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('hub')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Controle de Validade</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToPDF}
            className="bg-white text-slate-600 border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-black shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" /> Exportar PDF
          </button>
          <button 
            onClick={() => {
              setEditingExpId(null);
              setSelectedItemId(null);
              setExpDate('');
              setManufacturingDate('');
              setIsAddExpModalOpen(true);
            }}
            className="bg-[#359EFF] text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Incluir Validade
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100">Nome do Item</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100">Data de Fabricação</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100">Data de Validade</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100 text-center">Alerta</th>
                <th className="px-6 py-4 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-100 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {validityData.map((exp) => (
                <tr key={exp.id} className={cn(
                  "hover:bg-slate-50/50 transition-colors",
                  exp.status === 'vencido' ? "bg-rose-50/30" :
                  exp.status === 'alerta' ? "bg-amber-50/30" : ""
                )}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{exp.itemName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {exp.manufacturingDate ? new Date(exp.manufacturingDate).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-sm font-bold",
                      exp.status === 'vencido' ? "text-rose-600" :
                      exp.status === 'alerta' ? "text-amber-600" : "text-slate-700"
                    )}>
                      {new Date(exp.date).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      {exp.status === 'vencido' ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-600">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-tighter">Vencido</span>
                        </div>
                      ) : exp.status === 'alerta' ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-600">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-tighter">{exp.daysToExpire} dias</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-tighter">OK</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEditExpiration(exp)}
                        className="p-2 text-slate-300 hover:text-[#359EFF] hover:bg-blue-50 rounded-lg transition-all"
                        title="Alterar Entrada"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteExpiration(exp.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {validityData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhum item com validade cadastrada</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderExclusive = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setView('hub')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Monitoramento Exclusivo</h2>
      </div>

      <div className="max-w-xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Selecione um item para monitorar</label>
          <select 
            value={exclusiveItemId || ''} 
            onChange={(e) => setExclusiveItemId(Number(e.target.value))}
            className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-6 font-bold text-slate-700 focus:ring-2 focus:ring-[#359EFF] outline-none transition-all"
          >
            <option value="">Escolher item...</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>{item.item}</option>
            ))}
          </select>
        </div>

        <AnimatePresence mode="wait">
          {exclusiveItem ? (
            <motion.div 
              key={exclusiveItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5">
                <Package className="w-48 h-48 text-slate-900" />
              </div>

              <div className="relative space-y-10">
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{exclusiveItem.item}</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">SKU: {exclusiveItem.code}</p>
                </div>

                <div className="grid grid-cols-2 gap-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center bg-slate-50/50">
                      <span className="text-3xl font-black text-slate-900">{exclusiveItem.current}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">UNIDADES</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estoque Atual</span>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center bg-slate-50/50">
                      <span className="text-3xl font-black text-slate-900">{exclusiveItem.minStock}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">UNIDADES</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estoque Mínimo</span>
                  </div>
                </div>

                {exclusiveItem.current < exclusiveItem.minStock && (
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-center gap-4 text-rose-600"
                  >
                    <div className="bg-rose-600 text-white p-3 rounded-2xl shadow-lg shadow-rose-600/20 animate-pulse">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-wider">Atenção: Estoque Crítico</p>
                      <p className="text-xs font-bold opacity-80">O estoque atual está abaixo do mínimo de segurança.</p>
                    </div>
                  </motion.div>
                )}

                {exclusiveItem.current >= exclusiveItem.minStock && (
                  <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4 text-emerald-600">
                    <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-600/20">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-wider">Estoque Normal</p>
                      <p className="text-xs font-bold opacity-80">Níveis de estoque estão dentro da normalidade.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <Eye className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm px-10">Selecione um item acima para ver os detalhes em tempo real</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className={cn("mx-auto max-w-7xl space-y-8", !isSubPage && "p-4 md:p-10")}>
      {!isSubPage && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">Monitoramento Estratégico</h1>
            <p className="text-slate-500 text-base">Ferramentas avançadas para análise e controle de estoque.</p>
          </div>
          
          {view !== 'hub' && (
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#359EFF] outline-none transition-all text-sm"
              />
            </div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'hub' && renderHub()}
          {view === 'productivity' && renderProductivity()}
          {view === 'abc' && renderABC()}
          {view === 'validity' && renderValidity()}
          {view === 'exclusive' && renderExclusive()}
        </motion.div>
      </AnimatePresence>

      {/* Add Expiration Modal */}
      <AnimatePresence>
        {isAddExpModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {editingExpId ? 'Alterar Entrada' : 'Incluir Validade'}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                    {editingExpId ? 'Atualize os dados do item' : 'Monitore o vencimento de um item'}
                  </p>
                </div>
                <button onClick={() => setIsAddExpModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddExpiration} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Item</label>
                  <select 
                    required
                    value={selectedItemId || ''} 
                    onChange={(e) => setSelectedItemId(Number(e.target.value))}
                    className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-[#359EFF] outline-none transition-all"
                  >
                    <option value="">Selecione o item...</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>{item.item}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data de Fabricação</label>
                  <input 
                    type="date" 
                    value={manufacturingDate}
                    onChange={(e) => setManufacturingDate(e.target.value)}
                    className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-[#359EFF] outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data de Vencimento</label>
                  <input 
                    type="date" 
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-[#359EFF] outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddExpModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-colors"
                  >
                    CANCELAR
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl bg-[#359EFF] text-white font-black text-sm shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all"
                  >
                    SALVAR
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
