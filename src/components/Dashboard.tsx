import React from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Factory
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { store } from '../lib/store';
import { formatNumber, cn } from '../lib/utils';

const data = [
  { name: 'Dush', prod: 450 },
  { name: 'Sesh', prod: 520 },
  { name: 'Chor', prod: 380 },
  { name: 'Pay', prod: 610 },
  { name: 'Jum', prod: 590 },
  { name: 'Shan', prod: 410 },
  { name: 'Yak', prod: 320 },
];

export function Dashboard() {
  const stats = store.getStats();
  const lastProduction = store.getProduction().slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Bugungi Ishlab Chiquv</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-800">{formatNumber(stats.todayProduction)} <span className="text-lg font-normal text-gray-400 italic">birlik</span></h3>
            <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ingredientlar</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-800">{stats.totalIngredients}</h3>
            <span className="text-slate-400 text-xs font-medium">Jami tur</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mahsulotlar</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-800">{stats.totalProducts}</h3>
            <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">Faol</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-amber-400">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Kam qolganlar</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-amber-600">{stats.lowStockCount.toString().padStart(2, '0')}</h3>
            <button className="text-xs text-amber-600 font-bold underline">Ko'rish</button>
          </div>
        </div>
      </div>

      {/* Main Visuals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Ishlab chiqarish dinamikasi</h3>
              <p className="text-sm text-gray-400">Oxirgi 7 kunlik statistika</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-bold bg-gray-100 rounded-lg text-gray-600">Hafta</button>
              <button className="px-3 py-1.5 text-xs font-bold text-white bg-[#16A34A] rounded-lg">Oy</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="prod" 
                  stroke="#16a34a" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorProd)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Analytics Section */}
        <div className="bg-emerald-950 p-6 rounded-3xl shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-emerald-400 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-950" />
            </div>
            <h4 className="text-white font-bold">AI Analitika</h4>
          </div>
          <div className="flex-1 space-y-4">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold text-emerald-400 mb-1 uppercase tracking-wider">Ogohlantirish</p>
              <p className="text-sm text-white">"Shakar" sarfi retsept bo'yicha <span className="text-emerald-400 font-bold">12% ko'p</span> bo'ldi.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold text-emerald-400 mb-1 uppercase tracking-wider">Tavsiya</p>
              <p className="text-sm text-white italic opacity-80 leading-relaxed">"Smena B" dagi xomashyo yo'qotilishini tekshiring.</p>
            </div>
            {stats.alerts.map((alert, i) => (
              <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                 <p className="text-[10px] text-emerald-200 font-medium">{alert.message}</p>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-2.5 bg-[#16A34A] text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all">Batafsil tahlil</button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
          <h4 className="font-bold text-slate-800">So'nggi harakatlar</h4>
          <button className="text-xs font-bold text-[#16A34A] hover:underline">Barchasi</button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-[0.15em]">
              <th className="px-6 py-3 font-bold">Mahsulot / Ingredient</th>
              <th className="px-6 py-3 font-bold">Amal turi</th>
              <th className="px-6 py-3 font-bold">Miqdor</th>
              <th className="px-6 py-3 font-bold text-right">Vaqt</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {lastProduction.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3 font-semibold text-slate-800">
                  {store.getProducts().find(p => p.id === prod.productId)?.name}
                </td>
                <td className="px-6 py-3 text-emerald-600 font-medium">Ishlab chiqarish</td>
                <td className="px-6 py-3 text-slate-600">{prod.amount} birlik</td>
                <td className="px-6 py-3 text-right text-gray-400 font-medium">
                  {new Date(prod.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
            {lastProduction.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Harakatlar mavjud emas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

