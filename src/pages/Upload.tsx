import React, { useState } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle2, AlertCircle, X, ArrowRight, Trash2, History, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import { useInventory } from '../context/InventoryContext';

export default function Upload() {
  const { items, uploadHistory, addUploadHistory, removeUploadHistory } = useInventory();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'preview' | 'success' | 'error'>('idle');
  const [previewItems, setPreviewItems] = useState<{ code: string; item: string; qty: number }[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
      setStatus('idle');
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setStatus('uploading');
    
    Papa.parse(file, {
      complete: (results) => {
        // results.data is an array of arrays (rows)
        // Column B is index 1, Column E is index 4
        const rawItems = results.data
          .slice(1) // Skip header
          .filter((row: any) => row.length >= 5 && row[1] && row[4]) // Basic validation
          .map((row: any) => ({
            code: row[1]?.toString().trim() || '',
            qty: parseFloat(row[4]?.toString().replace(',', '.') || '0')
          }))
          .filter(item => item.code && item.qty > 0);

        // Preview with conversion
        const processedItems = rawItems.map(raw => {
          const systemItem = items.find(i => 
            i.code && i.code.split(',').map(c => c.trim()).includes(raw.code)
          );
          return {
            ...raw,
            item: systemItem ? systemItem.item : 'Não encontrado',
            systemName: systemItem ? systemItem.item : 'Não encontrado',
            isConverted: !!systemItem
          };
        });

        // Group by systemName for converted items to show summed totals
        const groupedItems = processedItems.reduce((acc, curr) => {
          if (!curr.isConverted) {
            acc.push(curr);
            return acc;
          }
          
          const existing = acc.find(i => i.isConverted && i.systemName === curr.systemName);
          if (existing) {
            existing.qty += curr.qty;
            if (!existing.code.includes(curr.code)) {
              existing.code = `${existing.code}, ${curr.code}`;
            }
          } else {
            acc.push({ ...curr });
          }
          return acc;
        }, [] as any[]);

        setPreviewItems(groupedItems);
        setStatus('preview');
      },
      error: (error) => {
        console.error('CSV Parsing Error:', error);
        setStatus('idle');
        alert('Erro ao processar o arquivo CSV. Verifique o formato.');
      },
      header: false,
      skipEmptyLines: true
    });
  };

  const handleConfirmImport = () => {
    if (!file) return;
    // Filter only converted items
    const validItems = previewItems.filter((item: any) => item.isConverted);
    
    if (validItems.length === 0) {
      alert('Nenhum item cadastrado foi encontrado no arquivo.');
      return;
    }

    addUploadHistory(file.name, validItems);
    setStatus('success');
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewItems([]);
    setStatus('idle');
  };

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Upload de Dados</h1>
        <p className="text-slate-500">Atualize seu estoque em massa enviando arquivos CSV ou Excel.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 min-h-[400px] flex flex-col items-center justify-center transition-all
              ${isDragging ? 'border-[#359EFF] bg-[#359EFF]/5' : 'border-slate-200 bg-white'}
              ${file ? 'border-emerald-200 bg-emerald-50/30' : ''}
            `}
          >
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <UploadIcon className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Arraste seu arquivo aqui</h3>
                  <p className="text-sm text-slate-500 mb-6">Ou clique para selecionar do seu computador</p>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept=".csv,.xlsx"
                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                  />
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <FileSpreadsheet className="w-4 h-4" /> CSV
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <FileSpreadsheet className="w-4 h-4" /> XLSX
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="selected"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center w-full h-full"
                >
                  {status !== 'preview' && status !== 'success' && (
                    <div className="flex flex-col items-center">
                      <div className="bg-emerald-100 p-4 rounded-full mb-4 relative">
                        <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
                        <button 
                          onClick={resetUpload}
                          className="absolute -top-1 -right-1 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-rose-500 shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{file.name}</h3>
                      <p className="text-xs text-slate-500 mb-6">{(file.size / 1024).toFixed(1)} KB • Pronto para importar</p>
                    </div>
                  )}
                  
                  {status === 'idle' && (
                    <button 
                      onClick={handleUpload}
                      className="bg-[#359EFF] text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-[#359EFF]/20 hover:bg-[#359EFF]/90 transition-all flex items-center gap-2"
                    >
                      Processar Arquivo <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {status === 'uploading' && (
                    <div className="w-full max-w-xs space-y-2">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1.5 }}
                          className="h-full bg-[#359EFF]"
                        ></motion.div>
                      </div>
                      <p className="text-xs font-bold text-[#359EFF] animate-pulse">LENDO ARQUIVO...</p>
                    </div>
                  )}

                  {status === 'preview' && (
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Itens Identificados</h3>
                        <button onClick={resetUpload} className="text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest">Cancelar</button>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-3 font-bold text-slate-600 uppercase text-[10px]">Código (B)</th>
                                <th className="px-4 py-3 font-bold text-slate-600 uppercase text-[10px]">Item</th>
                                <th className="px-4 py-3 font-bold text-slate-600 uppercase text-[10px]">Quantidade (E)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {previewItems.map((item: any, idx) => (
                                <tr key={idx} className={!item.isConverted ? 'bg-rose-50/30' : ''}>
                                  <td className="px-4 py-3 font-medium text-slate-500 font-mono text-xs">{item.code}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-bold ${item.isConverted ? 'text-[#359EFF]' : 'text-rose-500'}`}>
                                        {item.systemName}
                                      </span>
                                      {item.isConverted ? (
                                        <span className="bg-[#359EFF]/10 text-[#359EFF] text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Convertido</span>
                                      ) : (
                                        <span className="bg-rose-100 text-rose-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Ignorado</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 font-bold text-emerald-600">{item.qty}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <button 
                        onClick={handleConfirmImport}
                        className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                      >
                        Confirmar e Enviar para Movimentações <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {status === 'success' && (
                    <div className="flex flex-col items-center gap-2 text-emerald-600 py-10">
                      <div className="bg-emerald-100 p-6 rounded-full mb-4">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <h3 className="text-xl font-black">Importação Concluída!</h3>
                      <p className="text-sm font-medium text-slate-500">Os itens foram enviados para a aba de Movimentações.</p>
                      <button onClick={resetUpload} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold mt-6 hover:bg-slate-800 transition-all">Fazer novo upload</button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-800 mb-1">Atenção ao formato</h4>
              <p className="text-xs text-amber-700 leading-relaxed mb-3">
                O sistema processa apenas as colunas <span className="font-bold">B (Código)</span> e <span className="font-bold">E (Quantidade)</span> do arquivo.
              </p>
              <Link 
                to="/conversion"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#359EFF] hover:underline"
              >
                <Hash className="w-3 h-3" /> Gerenciar Conversões de Código
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-[#359EFF]" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Histórico</h3>
            </div>
            <div className="space-y-4">
              {uploadHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 italic">Nenhum upload registrado.</p>
              ) : (
                uploadHistory.map((h) => (
                  <div key={h.id} className="group p-3 rounded-lg border border-slate-100 hover:border-[#359EFF]/30 hover:bg-slate-50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[160px]">{h.fileName}</span>
                        <span className="text-[10px] text-slate-400">{h.date}</span>
                      </div>
                      <button 
                        onClick={() => removeUploadHistory(h.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                        title="Remover entradas deste upload"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
