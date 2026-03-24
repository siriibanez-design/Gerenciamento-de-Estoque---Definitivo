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
  unitPrice: number;
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

export interface Order {
  id: string;
  date: string;
  value: string;
  status: 'PENDENTE' | 'ENTREGUE' | 'CANCELADA';
  statusColor: string;
  items: { 
    name: string; 
    qty: string; 
    value: string;
    process?: string;
    itemNumber?: string;
  }[];
}

export interface SupplierItem {
  id: string;
  number: string;
  description: string;
  value: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  items: SupplierItem[];
}

export interface Process {
  id: string;
  number: string;
  description: string;
  suppliers: Supplier[];
}

interface InventoryContextType {
  items: InventoryItem[];
  categories: string[];
  movements: Movement[];
  uploadHistory: UploadHistory[];
  orders: Order[];
  processes: Process[];
  addItem: (item: Omit<InventoryItem, 'id' | 'in' | 'out' | 'deadline' | 'current' | 'totalOut'> & { current: number; unitPrice: number }) => void;
  updateItem: (id: number, item: Partial<InventoryItem>) => void;
  deleteItem: (id: number) => void;
  addCategory: (category: string) => void;
  updateCategory: (oldName: string, newName: string) => void;
  deleteCategory: (category: string) => void;
  addMovement: (movement: Omit<Movement, 'id' | 'date' | 'typeColor'>) => void;
  updateMovement: (id: number, movement: Partial<Movement>) => void;
  deleteMovement: (id: number) => void;
  addUploadHistory: (fileName: string, items: { code: string; item: string; qty: number }[]) => void;
  removeUploadHistory: (id: number) => void;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'statusColor'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  updateProcesses: (processes: Process[]) => void;
}

const initialItems: InventoryItem[] = [
  { id: 1, code: '1010', item: 'Papel A4 Chambril 75g', category: 'Secretaria de Educação', initialStock: 450, minStock: 1000, target: 1300, in: '0', out: '0', totalOut: 0, current: 450, deadline: '-', unitPrice: 24.50 },
  { id: 2, code: '2020', item: 'Cesta Básica Tipo 01', category: 'Assistência Social', initialStock: 120, minStock: 500, target: 650, in: '0', out: '0', totalOut: 0, current: 120, deadline: '-', unitPrice: 185.00 },
];
const initialCategories: string[] = ['Secretaria de Educação', 'Assistência Social', 'Infraestrutura', 'Saúde', 'Administrativo'];
const initialMovements: Movement[] = [];
const initialUploadHistory: UploadHistory[] = [];
const initialOrders: Order[] = [
  { id: '01-03', date: '12/03/2026', value: 'R$ 1.250,00', status: 'ENTREGUE', statusColor: 'bg-emerald-100 text-emerald-700', items: [] },
  { id: '02-03', date: '13/03/2026', value: 'R$ 4.890,00', status: 'PENDENTE', statusColor: 'bg-amber-100 text-amber-700', items: [] },
  { id: '03-03', date: '14/03/2026', value: 'R$ 850,00', status: 'CANCELADA', statusColor: 'bg-rose-100 text-rose-700', items: [] },
];

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

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('inventory_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [processes, setProcesses] = useState<Process[]>(() => {
    const saved = localStorage.getItem('inventory_processes');
    return saved ? JSON.parse(saved) : [];
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

  useEffect(() => {
    localStorage.setItem('inventory_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('inventory_processes', JSON.stringify(processes));
  }, [processes]);

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

  const addItem = (newItem: Omit<InventoryItem, 'id' | 'in' | 'out' | 'deadline' | 'current' | 'totalOut'> & { current: number; unitPrice: number }) => {
    const item: InventoryItem = {
      ...newItem,
      id: Date.now(),
      initialStock: newItem.current,
      in: '0',
      out: '0',
      totalOut: 0,
      current: newItem.current,
      deadline: '-',
      unitPrice: newItem.unitPrice || 0
    };
    setBaseItems(prev => [...prev, item]);
  };

  const updateItem = (id: number, updatedFields: Partial<InventoryItem>) => {
    setBaseItems(prev => {
      const itemToUpdate = prev.find(i => i.id === id);
      if (!itemToUpdate) return prev;

      const oldName = itemToUpdate.item;
      const newName = updatedFields.item || oldName;

      // If name changed, update all movements associated with this item
      if (newName !== oldName) {
        setMovements(prevMovements => prevMovements.map(m => 
          m.item === oldName ? { ...m, item: newName } : m
        ));
      }

      return prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updatedFields };
          // If current was updated manually in the form, adjust initialStock
          // so that (initialStock + totalIn - totalOut) equals the new current
          if (updatedFields.current !== undefined) {
            const itemMovements = movements.filter(m => m.item === oldName);
            const totalIn = itemMovements
              .filter(m => m.type === 'ENTRADA')
              .reduce((acc, m) => acc + m.qty, 0);
            const totalOut = itemMovements
              .filter(m => m.type === 'SAÍDA')
              .reduce((acc, m) => acc + m.qty, 0);
              
            updated.initialStock = updatedFields.current - totalIn + totalOut;
          }
          return updated;
        }
        return item;
      });
    });
  };

  const deleteItem = (id: number) => {
    setBaseItems(prev => prev.filter(item => item.id !== id));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const updateCategory = (oldName: string, newName: string) => {
    setCategories(prev => prev.map(c => c === oldName ? newName : c));
    // Update all items in this category
    setBaseItems(prev => prev.map(item => 
      item.category === oldName ? { ...item, category: newName } : item
    ));
  };

  const deleteCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
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
    setBaseItems(prev => prev.map(item => {
      const m = movements.find(mov => mov.id === id);
      if (m && m.item === item.item) {
        // If we delete a movement, we don't need to manually update initialStock 
        // because 'items' is a memoized calculation based on baseItems and movements
      }
      return item;
    }));
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

  const addOrder = (newOrder: Omit<Order, 'id' | 'date' | 'status' | 'statusColor'>) => {
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const orderCount = orders.filter(o => o.id.endsWith(`-${month}`)).length + 1;
    const id = `${orderCount.toString().padStart(2, '0')}-${month}`;
    
    const order: Order = {
      ...newOrder,
      id,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'PENDENTE',
      statusColor: 'bg-amber-100 text-amber-700'
    };
    setOrders(prev => [order, ...prev]);
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        let statusColor = 'bg-amber-100 text-amber-700';
        if (status === 'ENTREGUE') statusColor = 'bg-emerald-100 text-emerald-700';
        if (status === 'CANCELADA') statusColor = 'bg-rose-100 text-rose-700';
        return { ...o, status, statusColor };
      }
      return o;
    }));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const updateProcesses = (newProcesses: Process[]) => {
    setProcesses(newProcesses);
  };

  return (
    <InventoryContext.Provider value={{ 
      items, 
      categories, 
      movements, 
      uploadHistory,
      orders,
      processes,
      addItem, 
      updateItem, 
      deleteItem, 
      addCategory,
      updateCategory,
      deleteCategory,
      addMovement,
      updateMovement,
      deleteMovement,
      addUploadHistory,
      removeUploadHistory,
      addOrder,
      updateOrderStatus,
      deleteOrder,
      updateProcesses
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
