import React, { useState } from 'react';
import { Sidebar, Header, BottomNav } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { IngredientsView } from './components/IngredientsView';
import { ProductsView } from './components/ProductsView';
import { ProductionView } from './components/ProductionView';
import { InventoryView, HistoryView } from './components/InventoryView';
import { EmployeesView } from './components/EmployeesView';
import { ExcelView } from './components/ExcelView';
import { LoginView } from './components/LoginView';
import { store } from './lib/store';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(() => store.isAuthenticated());

  React.useEffect(() => {
    if (isAuthenticated) {
      store.sync();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'ingredients': return <IngredientsView />;
      case 'products': return <ProductsView />;
      case 'production': return <ProductionView />;
      case 'inventory': return <InventoryView />;
      case 'history': return <HistoryView />;
      case 'employees': return <EmployeesView />;
      case 'excel': return <ExcelView />;
      default: return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Boshqaruv paneli';
      case 'ingredients': return 'Ingredientlar bazasi';
      case 'products': return 'Mahsulotlar va Retseptlar';
      case 'production': return 'Ishlab chiqarish jarayoni';
      case 'inventory': return 'Ombor hisoboti';
      case 'history': return 'Tizim tarixi';
      case 'employees': return 'Xodimlar boshqaruvi';
      case 'excel': return 'Excel Hisob-kitob (Hamma listlar)';
      default: return 'NormaAI';
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-gray-900 overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 lg:pb-0">
        <Header title={getTitle()} />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Bottom Nav - visible only on mobile */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Toast Container Placeholder */}
      <div id="toast-root"></div>
    </div>
  );
}
