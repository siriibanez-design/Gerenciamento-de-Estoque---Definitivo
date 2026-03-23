import React, { createContext, useContext, useState, useEffect } from 'react';

export interface InventoryItem {
  id: number;
  code: string;
  item: string;
  category: string;
  initialStock: number;
  minStock: number;
  target: number;
  in: string;
  out: string;
  totalOut: number;
  current: number;
  deadline: string;
}

export interface Movement {
  id: number;
  date: string;
  item: string;
  type: string;
  qty: number;
  typeColor: string;
  location: string;
  uploadId?: number;
}

export interface UploadHistory {
  id: number;
  date: string;
  fileName: string;
}

interface InventoryContextType {
  items: InventoryItem[];
  categories: string[];
  movements: Movement[];
  uploadHistory: UploadHistory[];
  addItem: (item: Omit<InventoryItem, 'id' | 'in' | 'out' | 'deadline' | 'current' | 'totalOut'> & { current: number }) => void;
  updateItem: (id: number, item: Partial<InventoryItem>) => void;
  deleteItem: (id: number) => void;
  addCategory: (category: string) => void;
  addMovement: (movement: Omit<Movement, 'id' | 'date' | 'typeColor'>) => void;
  updateMovement: (id: number, movement: Partial<Movement>) => void;
  deleteMovement: (id: number) => void;
  addUploadHistory: (fileName: string, items: { code: string; item: string; qty: number }[]) => void;
  removeUploadHistory: (id: number) => void;
}

const initialItems: InventoryItem[] = [];
const initialCategories: string[] = [];
const initialMovements: Movement[] = [];
const initialUploadHistory: UploadHistory[] = [];

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [baseItems, setBaseItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventory_items');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: ensure initialStock and code exist
      return parsed.map((item: any) => ({
        ...item,
        code: item.code || '',
        initialStock: item.initialStock !== undefined ? item.initialStock : (item.current || 0)
      }));
    }
    return initialItems;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('inventory_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [movements, setMovements] = useState<Movement[]>(() => {
    const saved = localStorage.getItem('inventory_movements');
    return saved ? JSON.parse(saved) : initialMovements;
  });

  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>(() => {
    const saved = localStorage.getItem('inventory_upload_history');
    return saved ? JSON.parse(saved) : initialUploadHistory;
  });

  useEffect(() => {
    localStorage.setItem('inventory_items', JSON.stringify(baseItems));
  }, [baseItems]);

  useEffect(() => {
    localStorage.setItem('inventory_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('inventory_movements', JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem('inventory_upload_history', JSON.stringify(uploadHistory));
  }, [uploadHistory]);

  // Calculate items with totals
  const items = React.useMemo(() => {
    return baseItems.map(item => {
      const itemMovements = movements.filter(m => m.item === item.item);
      const totalIn = itemMovements
        .filter(m => m.type === 'ENTRADA')
        .reduce((acc, m) => acc + m.qty, 0);
      const totalOut = itemMovements
        .filter(m => m.type === 'SAÍDA')
        .reduce((acc, m) => acc + m.qty, 0);
      
      return {
        ...item,
        in: `+${totalIn}`,
        out: `-${totalOut}`,
        totalOut,
        current: item.initialStock + totalIn - totalOut
      };
    });
  }, [baseItems, movements]);

  const addItem = (newItem: Omit<InventoryItem, 'id' | 'in' | 'out' | 'deadline' | 'current' | 'totalOut'> & { current: number }) => {
    const item: InventoryItem = {
      ...newItem,
      id: Date.now(),
      initialStock: newItem.current,
      in: '0',
      out: '0',
      totalOut: 0,
      current: newItem.current,
      deadline: '-'
    };
    setBaseItems(prev => [...prev, item]);
  };

  const updateItem = (id: number, updatedFields: Partial<InventoryItem>) => {
    setBaseItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updatedFields };
        // If current was updated manually in the form, treat it as initialStock
        if (updatedFields.current !== undefined) {
          updated.initialStock = updatedFields.current;
        }
        return updated;
      }
      return item;
    }));
  };

  const deleteItem = (id: number) => {
    setBaseItems(prev => prev.filter(item => item.id !== id));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const addMovement = (newMovement: Omit<Movement, 'id' | 'date' | 'typeColor'>) => {
    const movement: Movement = {
      ...newMovement,
      id: Date.now(),
      date: new Date().toLocaleDateString('pt-BR'),
      typeColor: newMovement.type === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
    };
    setMovements(prev => [movement, ...prev]);
  };

  const updateMovement = (id: number, updatedFields: Partial<Movement>) => {
    setMovements(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...updatedFields };
        if (updatedFields.type) {
          updated.typeColor = updated.type === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';
        }
        return updated;
      }
      return m;
    }));
  };

  const deleteMovement = (id: number) => {
    setMovements(prev => prev.filter(m => m.id !== id));
  };

  const addUploadHistory = (fileName: string, uploadedItems: { code: string; item: string; qty: number }[]) => {
    const uploadId = Date.now();
    const newHistory: UploadHistory = {
      id: uploadId,
      date: new Date().toLocaleString('pt-BR'),
      fileName
    };

    setUploadHistory(prev => [newHistory, ...prev]);

    // Group and sum items by their system name (already converted in Upload.tsx)
    const groupedItems = uploadedItems.reduce((acc, current) => {
      const itemName = current.item;
      
      if (!acc[itemName]) {
        acc[itemName] = { item: itemName, qty: 0 };
      }
      acc[itemName].qty += current.qty;
      return acc;
    }, {} as Record<string, { item: string; qty: number }>);

    // Add movements for each grouped item
    const newMovements: Movement[] = Object.values(groupedItems).map(group => {
      return {
        id: Math.random() * 1000000 + Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        item: group.item,
        type: 'SAÍDA',
        qty: group.qty,
        typeColor: 'bg-rose-100 text-rose-700',
        location: 'IMPORTAÇÃO',
        uploadId
      };
    });

    setMovements(prev => [...newMovements, ...prev]);
  };

  const removeUploadHistory = (id: number) => {
    setUploadHistory(prev => prev.filter(h => h.id !== id));
    setMovements(prev => prev.filter(m => m.uploadId !== id));
  };

  return (
    <InventoryContext.Provider value={{ 
      items, 
      categories, 
      movements, 
      uploadHistory,
      addItem, 
      updateItem, 
      deleteItem, 
      addCategory,
      addMovement,
      updateMovement,
      deleteMovement,
      addUploadHistory,
      removeUploadHistory
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
