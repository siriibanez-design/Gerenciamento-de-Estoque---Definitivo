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

export interface Cycle {
  id: string;
  isClosed: boolean;
  baseItems: InventoryItem[];
  movements: Movement[];
  uploadHistory: UploadHistory[];
}

interface InventoryContextType {
  items: InventoryItem[];
  categories: string[];
  movements: Movement[];
  uploadHistory: UploadHistory[];
  orders: Order[];
  processes: Process[];
  activeCycleId: string | null;
  cycles: Cycle[];
  isCycleClosed: boolean;
  setActiveCycle: (id: string) => void;
  updateCycle: (oldId: string, newId: string) => void;
  deleteCycle: (id: string) => void;
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
  turnCycle: () => void;
}

const initialItems: InventoryItem[] = [];
const initialCategories: string[] = [];
const initialOrders: Order[] = [];

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [activeCycleId, setActiveCycleId] = useState<string | null>(() => {
    return localStorage.getItem('inventory_active_cycle_v4');
  });

  const [cycles, setCycles] = useState<Cycle[]>(() => {
    const saved = localStorage.getItem('inventory_cycles_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('inventory_categories_v4');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('inventory_orders_v4');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [processes, setProcesses] = useState<Process[]>(() => {
    const saved = localStorage.getItem('inventory_processes_v4');
    return saved ? JSON.parse(saved) : [];
  });

  // Helper to get current cycle data
  const currentCycle = cycles.find(c => c.id === activeCycleId);
  const isCycleClosed = currentCycle?.isClosed || false;

  useEffect(() => {
    localStorage.setItem('inventory_cycles_v4', JSON.stringify(cycles));
  }, [cycles]);

  useEffect(() => {
    localStorage.setItem('inventory_active_cycle_v4', activeCycleId || '');
  }, [activeCycleId]);

  useEffect(() => {
    localStorage.setItem('inventory_categories_v4', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('inventory_orders_v4', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('inventory_processes_v4', JSON.stringify(processes));
  }, [processes]);

  const setActiveCycle = (id: string) => {
    setActiveCycleId(id);
    setCycles(prev => {
      if (prev.find(c => c.id === id)) return prev;
      
      // If cycle doesn't exist, create it
      // Find the last cycle to carry over items
      const lastCycle = prev.length > 0 ? prev[prev.length - 1] : null;
      
      let newBaseItems: InventoryItem[] = [];
      if (lastCycle) {
        // Calculate current stock of last cycle to use as initial stock
        newBaseItems = lastCycle.baseItems.map(item => {
          const itemMovements = lastCycle.movements.filter(m => m.item === item.item);
          const totalIn = itemMovements.filter(m => m.type === 'ENTRADA').reduce((acc, m) => acc + m.qty, 0);
          const totalOut = itemMovements.filter(m => m.type === 'SAÍDA').reduce((acc, m) => acc + m.qty, 0);
          const current = item.initialStock + totalIn - totalOut;
          return {
            ...item,
            initialStock: current,
            in: '0',
            out: '0',
            totalOut: 0,
            current: current
          };
        });
      } else {
        newBaseItems = initialItems;
      }

      const newCycle: Cycle = {
        id,
        isClosed: false,
        baseItems: newBaseItems,
        movements: [],
        uploadHistory: []
      };
      return [...prev, newCycle];
    });
  };

  const updateCycle = (oldId: string, newId: string) => {
    setCycles(prev => prev.map(c => c.id === oldId ? { ...c, id: newId } : c));
    if (activeCycleId === oldId) {
      setActiveCycleId(newId);
    }
  };

  const deleteCycle = (id: string) => {
    setCycles(prev => prev.filter(c => c.id !== id));
    if (activeCycleId === id) {
      setActiveCycleId(null);
    }
  };

  const updateCurrentCycle = (updater: (cycle: Cycle) => Cycle) => {
    if (!activeCycleId || isCycleClosed) return;
    setCycles(prev => prev.map(c => c.id === activeCycleId ? updater(c) : c));
  };

  // Derived data for the active cycle
  const baseItems = currentCycle?.baseItems || [];
  const movements = currentCycle?.movements || [];
  const uploadHistory = currentCycle?.uploadHistory || [];

  const items = React.useMemo(() => {
    return baseItems.map(item => {
      const itemMovements = movements.filter(m => m.item === item.item);
      const totalIn = itemMovements.filter(m => m.type === 'ENTRADA').reduce((acc, m) => acc + m.qty, 0);
      const totalOut = itemMovements.filter(m => m.type === 'SAÍDA').reduce((acc, m) => acc + m.qty, 0);
      
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
    updateCurrentCycle(c => ({
      ...c,
      baseItems: [...c.baseItems, {
        ...newItem,
        id: Date.now(),
        initialStock: newItem.current,
        in: '0',
        out: '0',
        totalOut: 0,
        current: newItem.current,
        deadline: '-',
        unitPrice: newItem.unitPrice || 0
      }]
    }));
  };

  const updateItem = (id: number, updatedFields: Partial<InventoryItem>) => {
    updateCurrentCycle(c => {
      const itemToUpdate = c.baseItems.find(i => i.id === id);
      if (!itemToUpdate) return c;

      const oldName = itemToUpdate.item;
      const newName = updatedFields.item || oldName;

      let newMovements = c.movements;
      if (newName !== oldName) {
        newMovements = c.movements.map(m => m.item === oldName ? { ...m, item: newName } : m);
      }

      const newBaseItems = c.baseItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updatedFields };
          if (updatedFields.current !== undefined) {
            const itemMovements = newMovements.filter(m => m.item === oldName);
            const totalIn = itemMovements.filter(m => m.type === 'ENTRADA').reduce((acc, m) => acc + m.qty, 0);
            const totalOut = itemMovements.filter(m => m.type === 'SAÍDA').reduce((acc, m) => acc + m.qty, 0);
            updated.initialStock = updatedFields.current - totalIn + totalOut;
          }
          return updated;
        }
        return item;
      });

      return { ...c, baseItems: newBaseItems, movements: newMovements };
    });
  };

  const deleteItem = (id: number) => {
    updateCurrentCycle(c => ({
      ...c,
      baseItems: c.baseItems.filter(item => item.id !== id)
    }));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const updateCategory = (oldName: string, newName: string) => {
    setCategories(prev => prev.map(c => c === oldName ? newName : c));
    updateCurrentCycle(c => ({
      ...c,
      baseItems: c.baseItems.map(item => item.category === oldName ? { ...item, category: newName } : item)
    }));
  };

  const deleteCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  const addMovement = (newMovement: Omit<Movement, 'id' | 'date' | 'typeColor'>) => {
    updateCurrentCycle(c => ({
      ...c,
      movements: [{
        ...newMovement,
        id: Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        typeColor: newMovement.type === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
      }, ...c.movements]
    }));
  };

  const updateMovement = (id: number, updatedFields: Partial<Movement>) => {
    updateCurrentCycle(c => ({
      ...c,
      movements: c.movements.map(m => {
        if (m.id === id) {
          const updated = { ...m, ...updatedFields };
          if (updatedFields.type) {
            updated.typeColor = updated.type === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';
          }
          return updated;
        }
        return m;
      })
    }));
  };

  const deleteMovement = (id: number) => {
    updateCurrentCycle(c => ({
      ...c,
      movements: c.movements.filter(m => m.id !== id)
    }));
  };

  const addUploadHistory = (fileName: string, uploadedItems: { code: string; item: string; qty: number }[]) => {
    updateCurrentCycle(c => {
      const uploadId = Date.now();
      const newHistory: UploadHistory = {
        id: uploadId,
        date: new Date().toLocaleString('pt-BR'),
        fileName
      };

      const groupedItems = uploadedItems.reduce((acc, current) => {
        const itemName = current.item;
        if (!acc[itemName]) acc[itemName] = { item: itemName, qty: 0 };
        acc[itemName].qty += current.qty;
        return acc;
      }, {} as Record<string, { item: string; qty: number }>);

      const newMovements: Movement[] = Object.values(groupedItems).map(group => ({
        id: Math.random() * 1000000 + Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        item: group.item,
        type: 'SAÍDA',
        qty: group.qty,
        typeColor: 'bg-rose-100 text-rose-700',
        location: 'IMPORTAÇÃO',
        uploadId
      }));

      return {
        ...c,
        uploadHistory: [newHistory, ...c.uploadHistory],
        movements: [...newMovements, ...c.movements]
      };
    });
  };

  const removeUploadHistory = (id: number) => {
    updateCurrentCycle(c => ({
      ...c,
      uploadHistory: c.uploadHistory.filter(h => h.id !== id),
      movements: c.movements.filter(m => m.uploadId !== id)
    }));
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

  const turnCycle = () => {
    if (!activeCycleId) return;
    setCycles(prev => prev.map(c => c.id === activeCycleId ? { ...c, isClosed: true } : c));
  };

  return (
    <InventoryContext.Provider value={{ 
      items, 
      categories, 
      movements, 
      uploadHistory,
      orders,
      processes,
      activeCycleId,
      cycles,
      isCycleClosed,
      setActiveCycle,
      updateCycle,
      deleteCycle,
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
      updateProcesses,
      turnCycle
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
