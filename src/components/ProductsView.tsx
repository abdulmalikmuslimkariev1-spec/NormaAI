import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Settings2, 
  Trash2, 
  PlusCircle, 
  X, 
  Beaker,
  FolderOpen,
  ChevronLeft,
  MoreVertical,
  Layers
} from 'lucide-react';
import { store } from '../lib/store';
import { Product, RecipeItem, Category } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function ProductsView() {
  const [products, setProducts] = useState(store.getProducts());
  const [categories, setCategories] = useState(store.getCategories());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    return store.subscribe(() => {
      setProducts(store.getProducts());
      setCategories(store.getCategories());
    });
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [tempRecipeItems, setTempRecipeItems] = useState<RecipeItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategoryId ? p.categoryId === activeCategoryId : true;
    return matchesSearch && matchesCategory;
  });

  const addCategory = () => {
    const name = prompt('Yangi kategoriya nomi:');
    if (name) {
      store.saveCategory({ name });
      setCategories(store.getCategories());
    }
  };

  const deleteCategory = (id: string) => {
    if (confirm('Ushbu kategoriyani o\'chirmoqchimisiz? Ichidagi mahsulotlar o\'chmaydi.')) {
      store.deleteCategory(id);
      setCategories(store.getCategories());
      if (activeCategoryId === id) setActiveCategoryId(null);
    }
  };

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
        categoryId: activeCategoryId || undefined,
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
      {/* Header & Categories Navigation */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {activeCategoryId && (
              <button 
                onClick={() => setActiveCategoryId(null)}
                className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {activeCategory ? activeCategory.name : 'Mahsulot Kategoriyalari'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={addCategory}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all shadow-sm font-bold text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Kategoriya
            </button>
            <button 
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#16A34A] text-white rounded-xl hover:bg-[#166534] transition-all shadow-lg shadow-emerald-600/20 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Mahsulot
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveCategoryId(null)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border",
              !activeCategoryId 
                ? "bg-emerald-600 text-white border-emerald-600" 
                : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
            )}
          >
            Barchasi
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={cn(
                "group px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border flex items-center gap-2",
                activeCategoryId === cat.id 
                  ? "bg-emerald-600 text-white border-emerald-600" 
                  : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
              )}
            >
              {cat.name}
              <span className="text-[10px] opacity-60">
                {products.filter(p => p.categoryId === cat.id).length}
              </span>
              <X 
                className="w-3 h-3 hover:text-red-400" 
                onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Mahsulotlarni qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-20">Kod</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Mahsulot nomi</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Narx</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Kategoriya</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Retsept</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((product) => {
                    const recipe = store.getRecipe(product.id);
                    const cat = categories.find(c => c.id === product.categoryId);
                    return (
                      <tr key={product.id} className="hover:bg-emerald-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs">#{product.code || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                              <Beaker className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="font-bold text-slate-700">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-slate-800">{(product.price || 0).toLocaleString()} <span className="text-[10px] text-gray-400 uppercase">so'm</span></span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                            {cat?.name || 'Kategoriyasiz'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-emerald-50 rounded-lg text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
                            {recipe?.items.length || 0} MASALLIQ
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
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                        Mahsulotlar topilmadi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Kategoriya</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                      value={selectedProduct?.categoryId || ''}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct!, categoryId: e.target.value })}
                    >
                      <option value="">Kategoriyasiz</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
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
