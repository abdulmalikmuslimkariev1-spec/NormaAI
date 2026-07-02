import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Settings2, 
  Trash2, 
  PlusCircle, 
  X, 
  Beaker
} from 'lucide-react';
import { store } from '../lib/store';
import { Product, RecipeItem } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function ProductsView() {
  const [products, setProducts] = useState(store.getProducts());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [tempRecipeItems, setTempRecipeItems] = useState<RecipeItem[]>([]);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      const recipe = store.getRecipe(product.id);
      setTempRecipeItems(recipe?.items || []);
    } else {
      setSelectedProduct({ 
        code: (products.length + 1).toString(),
        name: '', 
        price: 0,
        description: '', 
        isActive: true 
      });
      setTempRecipeItems([]);
    }
    setIsModalOpen(true);
  };

  const addRecipeItem = () => {
    const ingredients = store.getIngredients();
    if (ingredients.length === 0) return;
    
    const newItem: RecipeItem = { 
      ingredientId: ingredients[0].id, 
      amount: 0, 
      unit: ingredients[0].unit 
    };
    setTempRecipeItems([...tempRecipeItems, newItem]);
  };

  const removeRecipeItem = (index: number) => {
    const newItems = [...tempRecipeItems];
    newItems.splice(index, 1);
    setTempRecipeItems(newItems);
  };

  const updateRecipeItem = (index: number, updates: Partial<RecipeItem>) => {
    const newItems = [...tempRecipeItems];
    newItems[index] = { ...newItems[index], ...updates };
    
    if (updates.ingredientId) {
      const ing = store.getIngredients().find(i => i.id === updates.ingredientId);
      if (ing) newItems[index].unit = ing.unit;
    }
    setTempRecipeItems(newItems);
  };

  const handleSave = () => {
    if (selectedProduct?.name) {
      const savedProduct = store.saveProduct(selectedProduct as Product);
      store.saveRecipe({
        productId: savedProduct.id,
        items: tempRecipeItems,
        updatedAt: Date.now()
      });
      setProducts(store.getProducts());
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
            placeholder="Mahsulotlarni qidirish..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#16A34A] text-white rounded-xl hover:bg-[#166534] transition-all shadow-lg shadow-emerald-600/20 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Yangi mahsulot
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-20">Kod</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Mahsulot nomi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Narx</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Tavsif</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ingredientlar</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Holat</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product) => {
                const recipe = store.getRecipe(product.id);
                return (
                  <tr key={product.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">#{product.code || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <Beaker className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-semibold text-gray-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-700">{(product.price || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-500 line-clamp-1">{product.description || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500">
                        {recipe?.items.length || 0} TA TUR
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        product.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
                      )}>
                        {product.isActive ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openModal(product)}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product & Recipe Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold">Mahsulot va Retsept</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Kodi</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-emerald-600"
                      value={selectedProduct?.code || ''}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct!, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Narxi (so'm)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold"
                      value={selectedProduct?.price || 0}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct!, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Nomi</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                      value={selectedProduct?.name || ''}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct!, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Holati</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                      value={selectedProduct?.isActive ? 'true' : 'false'}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct!, isActive: e.target.value === 'true' })}
                    >
                      <option value="true">Faol</option>
                      <option value="false">Nofaol</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Tavsifi</label>
                  <textarea 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium min-h-[60px]"
                    value={selectedProduct?.description || ''}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct!, description: e.target.value })}
                  />
                </div>

                {/* Recipe Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Retsept tarkibi</h4>
                    <button 
                      onClick={addRecipeItem}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Ingredient qo'shish
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {tempRecipeItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <select 
                          className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-gray-800"
                          value={item.ingredientId}
                          onChange={(e) => updateRecipeItem(index, { ingredientId: e.target.value })}
                        >
                          {store.getIngredients().map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                          ))}
                        </select>
                        <div className="flex items-center gap-2 w-32 border-l border-gray-200 pl-3">
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-emerald-600 text-right"
                            value={item.amount}
                            onChange={(e) => updateRecipeItem(index, { amount: Number(e.target.value) })}
                          />
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{item.unit}</span>
                        </div>
                        <button 
                          onClick={() => removeRecipeItem(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {tempRecipeItems.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 italic">
                        Ingredientlar kiritilmagan. Retsept shakllantirish uchun "Ingredient qo'shish" tugmasini bosing.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-50 shrink-0 bg-white">
                <button 
                  onClick={handleSave}
                  className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  Ma'lumotlarni saqlash
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
