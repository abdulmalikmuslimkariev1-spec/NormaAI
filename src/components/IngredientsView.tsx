import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ArrowDownCircle, 
  ArrowUpCircle,
  MoreVertical,
  ChevronRight,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { store } from '../lib/store';
import { Ingredient, Product, Recipe } from '../types';
import { cn, formatNumber } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function IngredientsView() {
  const [ingredients, setIngredients] = useState(store.getIngredients());

  React.useEffect(() => {
    return store.subscribe(() => {
      setIngredients(store.getIngredients());
    });
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Partial<Ingredient> | null>(null);

  const filtered = ingredients.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIngredient?.name && selectedIngredient.unit) {
      store.saveIngredient(selectedIngredient as Ingredient);
      setIngredients(store.getIngredients());
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Ingredientlarni qidirish..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => {
            setSelectedIngredient({ name: '', unit: 'kg', currentStock: 0, minStock: 10 });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#16A34A] text-white rounded-xl hover:bg-[#166534] transition-all shadow-lg shadow-emerald-600/20 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Yangi ingredient
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nomi</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Birligi</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Qoldiq</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Minimal</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Holat</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((ing) => (
              <tr key={ing.id} className="hover:bg-emerald-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-800">{ing.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-500 uppercase">{ing.unit}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "font-bold",
                    ing.currentStock <= ing.minStock ? "text-orange-600" : "text-gray-900"
                  )}>
                    {formatNumber(ing.currentStock)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 font-medium">
                  {formatNumber(ing.minStock)}
                </td>
                <td className="px-6 py-4">
                  {ing.currentStock <= ing.minStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold">
                      <AlertCircle className="w-3 h-3" />
                      Kam qoldi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                      Me'yorda
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setSelectedIngredient(ing);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">Ingredient ma'lumotlari</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nomi</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                    value={selectedIngredient?.name || ''}
                    onChange={(e) => setSelectedIngredient({ ...selectedIngredient!, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Birligi</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                      value={selectedIngredient?.unit || 'kg'}
                      onChange={(e) => setSelectedIngredient({ ...selectedIngredient!, unit: e.target.value })}
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="litr">Litr (l)</option>
                      <option value="dona">Dona (pcs)</option>
                      <option value="gram">Gram (g)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Minimal qoldiq</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                      value={selectedIngredient?.minStock || 0}
                      onChange={(e) => setSelectedIngredient({ ...selectedIngredient!, minStock: Number(e.target.value) })}
                    />
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
                    Saqlash
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

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
