import React, { useState } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Search, 
  Filter, 
  Plus, 
  X,
  History as HistoryIcon,
  Calendar,
  Package,
  TrendingUp,
  Activity
} from 'lucide-react';
import { store } from '../lib/store';
import { InventoryTransaction, Ingredient } from '../types';
import { cn, formatNumber } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function InventoryView() {
  const [transactions, setTransactions] = useState(store.getTransactions());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({ ingredientId: '', type: 'IN', amount: 0, reason: '' });
  const [ingredients] = useState(store.getIngredients());

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTx.ingredientId && newTx.amount > 0) {
      // Update stock
      const ing = ingredients.find(i => i.id === newTx.ingredientId);
      if (ing) {
        if (newTx.type === 'IN') ing.currentStock += newTx.amount;
        else if (newTx.type === 'OUT') ing.currentStock -= newTx.amount;
        
        store.saveIngredient(ing);
        store.addTransaction(newTx.ingredientId, newTx.type as any, newTx.amount, newTx.reason);
        setTransactions(store.getTransactions());
        setIsModalOpen(false);
        setNewTx({ ingredientId: '', type: 'IN', amount: 0, reason: '' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="grid grid-cols-2 gap-4 flex-1 max-w-lg">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Kirim (Oxirgi 30 kun)</p>
              <p className="text-lg font-bold text-gray-800">1,240 <span className="text-xs font-normal">kg</span></p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Chiqim (Oxirgi 30 kun)</p>
              <p className="text-lg font-bold text-gray-800">890 <span className="text-xs font-normal">kg</span></p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#16A34A] text-white rounded-xl hover:bg-[#166534] transition-all shadow-lg shadow-emerald-600/20 font-bold"
        >
          <Plus className="w-5 h-5" />
          Kirim/Chiqim kiritish
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-emerald-600" />
            Ombor harakatlari
          </h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all">Filtr</button>
            <button className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all">Eksport</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Sana</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ingredient</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tur</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Miqdor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Izoh</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Mas'ul</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.slice().reverse().map((tx) => {
                const ing = ingredients.find(i => i.id === tx.ingredientId);
                return (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">{new Date(tx.date).toLocaleDateString()}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-700">{ing?.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        tx.type === 'IN' ? "bg-blue-50 text-blue-600" : 
                        tx.type === 'OUT' ? "bg-orange-50 text-orange-600" : "bg-purple-50 text-purple-600"
                      )}>
                        {tx.type === 'IN' ? 'Kirim' : tx.type === 'OUT' ? 'Chiqim' : 'Tahrir'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "font-bold",
                        tx.type === 'IN' ? "text-blue-600" : "text-orange-600"
                      )}>
                        {tx.type === 'IN' ? '+' : '-'}{formatNumber(tx.amount)} {ing?.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {tx.reason}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                      ID: {tx.userId}
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Activity className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">Harakatlar tarixi bo'sh</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">Ombor harakati</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddTx} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Ingredient</label>
                  <select 
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                    value={newTx.ingredientId}
                    onChange={(e) => setNewTx({ ...newTx, ingredientId: e.target.value })}
                  >
                    <option value="">Tanlang...</option>
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.name} ({ing.currentStock} {ing.unit})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Harakat turi</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setNewTx({ ...newTx, type: 'IN' })}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl font-bold transition-all",
                        newTx.type === 'IN' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      Kirim
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewTx({ ...newTx, type: 'OUT' })}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl font-bold transition-all",
                        newTx.type === 'OUT' ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      Chiqim
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Miqdori</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-lg"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Sabab / Izoh</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                    placeholder="Masalan: Yangi xarid, Yaroqsiz holat..."
                    value={newTx.reason}
                    onChange={(e) => setNewTx({ ...newTx, reason: e.target.value })}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit"
                    className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    Harakatni saqlash
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

export function HistoryView() {
  const [logs] = useState(store.getLogs());

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          Tizim auditi (Audit Log)
        </h3>
        <p className="text-xs text-gray-400 mt-1">Barcha tizim amallarining to'liq tarixi</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vaqt</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Foydalanuvchi</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Modul</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amal</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ma'lumot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.slice().reverse().map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">{new Date(log.timestamp).toLocaleDateString()}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{log.userId}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{log.module}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-700">{log.action}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-400 font-medium max-w-xs truncate">
                    {JSON.stringify(log.newValue)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
