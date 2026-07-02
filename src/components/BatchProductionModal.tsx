import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  AlertCircle,
  Package,
  Users,
  FlaskConical,
  CheckCircle2
} from 'lucide-react';
import { store } from '../lib/store';
import { cn, formatNumber } from '../lib/utils';
import { motion } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BatchProductionModal({ isOpen, onClose, onSuccess }: Props) {
  const [productId, setProductId] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [usedIngredients, setUsedIngredients] = useState<{ ingredientId: string; amount: string }[]>([
    { ingredientId: '', amount: '' }
  ]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const products = store.getProducts().filter(p => p.isActive);
  const employees = store.getEmployees().filter(e => e.isActive);
  const ingredients = store.getIngredients();

  const handleAddIngredient = () => {
    setUsedIngredients([...usedIngredients, { ingredientId: '', amount: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setUsedIngredients(usedIngredients.filter((_, i) => i !== index));
  };

  const handleUpdateIngredient = (index: number, key: 'ingredientId' | 'amount', value: string) => {
    const newUsed = [...usedIngredients];
    newUsed[index] = { ...newUsed[index], [key]: value };
    setUsedIngredients(newUsed);
  };

  const toggleEmployee = (id: string) => {
    setSelectedEmpIds(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!productId) throw new Error('Mahsulotni tanlang');
      if (!amount || Number(amount) <= 0) throw new Error('Ishlab chiqarilgan miqdorni kiriting');
      if (selectedEmpIds.length === 0) throw new Error('Kamida bitta xodimni tanlang');
      
      const validIngredients = usedIngredients.filter(i => i.ingredientId && i.amount);
      if (validIngredients.length === 0) throw new Error('Kamida bitta xomashyoni kiriting');

      store.addBatchProduction(
        productId,
        selectedEmpIds,
        Number(amount),
        validIngredients.map(i => ({ ingredientId: i.ingredientId, amount: Number(i.amount) })),
        note
      );

      onSuccess();
      onClose();
      // Reset
      setProductId('');
      setAmount('');
      setSelectedEmpIds([]);
      setUsedIngredients([{ ingredientId: '', amount: '' }]);
      setNote('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 bg-[#16A34A] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-6 h-6" />
            <h3 className="text-xl font-bold">Partiya bo'yicha ishlab chiqarish</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-600 font-bold">{error}</p>
            </div>
          )}

          {/* Step 1: Product & Amount */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
              <Package className="w-5 h-5" />
              <h4>1. Mahsulot va Miqdor</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tayyor bo'lgan mahsulot</label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-gray-800"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  <option value="">Tanlang...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Jami chiqish (dona/kg)</label>
                <input 
                  required
                  type="number" 
                  placeholder="Masalan: 50"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-lg"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Step 2: Employees */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
              <Users className="w-5 h-5" />
              <h4>2. Ishlagan xodimlar</h4>
            </div>
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {employees.map(emp => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => toggleEmployee(emp.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2",
                    selectedEmpIds.includes(emp.id)
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200"
                      : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300"
                  )}
                >
                  {emp.name}
                  {selectedEmpIds.includes(emp.id) && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </section>

          {/* Step 3: Ingredients */}
          <section className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <FlaskConical className="w-5 h-5" />
                <h4>3. Sarflangan xomashyolar</h4>
              </div>
              <button 
                type="button"
                onClick={handleAddIngredient}
                className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
              >
                <Plus className="w-4 h-4" />
                Qo'shish
              </button>
            </div>
            
            <div className="space-y-3">
              {usedIngredients.map((used, idx) => (
                <div key={idx} className="flex gap-3 items-end">
                  <div className="flex-1">
                    {idx === 0 && <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Xomashyo</label>}
                    <select 
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-gray-800"
                      value={used.ingredientId}
                      onChange={(e) => handleUpdateIngredient(idx, 'ingredientId', e.target.value)}
                    >
                      <option value="">Tanlang...</option>
                      {ingredients.map(ing => (
                        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    {idx === 0 && <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Miqdori</label>}
                    <input 
                      required
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-right"
                      value={used.amount}
                      onChange={(e) => handleUpdateIngredient(idx, 'amount', e.target.value)}
                    />
                  </div>
                  {usedIngredients.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-3 text-gray-300 hover:text-red-500 transition-all mb-0.5"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Qo'shimcha izoh</label>
            <textarea 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium min-h-[80px]"
              placeholder="Masalan: Un sifati pastroq edi..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </form>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-4 bg-white text-gray-600 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Bekor qilish
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-[2] px-4 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Partiyani saqlash
          </button>
        </div>
      </motion.div>
    </div>
  );
}
