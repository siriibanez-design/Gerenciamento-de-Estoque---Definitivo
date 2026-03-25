/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Movements from './pages/Movements';
import Reports from './pages/Reports';
import Planning from './pages/Planning';
import PlanningList from './pages/PlanningList';
import PurchasingDashboard from './pages/PurchasingDashboard';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import ManagementDashboard from './pages/ManagementDashboard';
import Upload from './pages/Upload';
import Conversion from './pages/Conversion';
import { InventoryProvider } from './context/InventoryContext';

export default function App() {
  return (
    <Router>
      <InventoryProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/management-dashboard" element={<ManagementDashboard />} />
            <Route path="/movements" element={<Movements />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/planning/list" element={<PlanningList />} />
            <Route path="/planning/dashboard" element={<PurchasingDashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/conversion" element={<Conversion />} />
            <Route path="/settings" element={<Upload />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </InventoryProvider>
    </Router>
  );
}

