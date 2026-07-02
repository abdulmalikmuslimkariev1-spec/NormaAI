import React, { useState } from 'react';
import { 
  Factory, 
  History as HistoryIcon, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Calendar,
  ChevronRight,
  User as UserIcon,
  Info,
  FlaskConical
} from 'lucide-react';
import { store } from '../lib/store';
import { ProductionRecord, Product } from '../types';
import { cn, formatNumber } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { BatchProductionModal } from './BatchProductionModal';

export function ProductionView() {
  const [records, setRecords] = useState(store.getProduction());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [newProd, setNewProd] = useState({ productId: '', amount: 1, note: '' });
  const [error, setError] = useState<string | null>(null);

  const products = store.getProducts().filter(p => p.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (!newProd.productId) throw new Error('Mahsulotni tanlang');
      
      const employees = store.getEmployees();
      const defaultEmp = employees[0];
      if (!defaultEmp) throw new Error('Xodimlar bo\'limidan kamida bitta xodim qo\'shishingiz kerak');
      
      store.addProduction(newProd.productId, defaultEmp.id, newProd.amount, newProd.note);
      setRecords(store.getProduction());
      setIsModalOpen(false);
      setNewProd({ productId: '', amount: 1, note: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancel = (id: string) => {
    if (confirm('Ushbu ishlab chiqarishni bekor qilmoqchimisiz? Ingredientlar omborga qaytariladi.')) {
      try {
        store.cancelProduction(id);
        setRecords(store.getProduction());
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSuccess = () => {
    setRecords(store.getProduction());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Ishlab chiqarish tarixi</h2>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsBatchModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all font-bold shadow-sm"
          >
            <FlaskConical className="w-5 h-5" />
            Partiya qo'shish
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 font-bold"
          >
            <Factory className="w-5 h-5" />
            Tezkor ishlab chiqarish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {records.length > 0 ? records.slice().reverse().map((record) => {
          const product = store.getProducts().find(p => p.id === record.productId);
          return (
            <div key={record.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  record.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                  {record.status === 'COMPLETED' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{product?.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                      <Calendar className="w-3 h-3" />
                      {new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-200" />
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                      <UserIcon className="w-3 h-3" />
                      ID: {record.operatorId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Miqdori</p>
                  <p className="text-xl font-bold text-gray-900">{record.amount} <span className="text-sm font-medium text-gray-400">birlik</span></p>
                </div>
                <div className="h-8 w-[1px] bg-gray-100 hidden md:block" />
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    record.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                    {record.status === 'COMPLETED' ? 'Tayyor' : 'Bekor qilingan'}
                  </span>
                  
                  {record.status === 'COMPLETED' && store.getCurrentUser().role === 'ADMIN' && (
                    <button 
                      onClick={() => handleCancel(record.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Factory className="w-16 h-16 text-gray-100 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">Ishlab chiqarish tarixi bo'sh</h3>
            <p className="text-sm text-gray-300">Birinchi mahsulotingizni ishlab chiqarishni boshlang</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">Yangi ishlab chiqarish</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-600 font-semibold">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Mahsulot</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-semibold text-gray-800"
                    value={newProd.productId}
                    onChange={(e) => {
                      setNewProd({ ...newProd, productId: e.target.value });
                      setError(null);
                    }}
                  >
                    <option value="">Tanlang...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Miqdori (birlikda)</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-lg"
                    value={newProd.amount}
                    onChange={(e) => setNewProd({ ...newProd, amount: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Izoh</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium min-h-[80px]"
                    placeholder="Ixtiyoriy izoh kiriting..."
                    value={newProd.note}
                    onChange={(e) => setNewProd({ ...newProd, note: e.target.value })}
                  />
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                      Ishlab chiqarishni tasdiqlaganingizdan so'ng, retsept bo'yicha ingredientlar ombordan avtomatik ravishda ayiriladi.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Bekor qilish
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    Tasdiqlash
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BatchProductionModal 
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
