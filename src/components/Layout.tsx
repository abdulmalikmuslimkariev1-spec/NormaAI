import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  CookingPot, 
  Factory, 
  Warehouse, 
  History, 
  Settings,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Bell,
  Users,
  Calculator,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { store } from '../lib/store';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ingredients', label: 'Ingredientlar', icon: Package },
  { id: 'excel', label: 'Excel (Hisob-kitob)', icon: FileSpreadsheet },
  { id: 'inventory', label: 'Ombor', icon: Warehouse },
  { id: 'employees', label: 'Xodimlar', icon: Users },
  { id: 'products', label: 'Mahsulotlar', icon: CookingPot },
  { id: 'production', label: 'Ishlab chiqarish', icon: Factory },
  { id: 'history', label: 'Tarix', icon: History },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const user = store.getCurrentUser();

  const handleLogout = () => {
    if (confirm('Tizimdan chiqmoqchimisiz?')) {
      store.logout();
      window.location.reload();
    }
  };

  const handleChangePassword = () => {
    const newPass = prompt('Yangi parolni kiriting (kamida 4 ta belgi):');
    if (newPass && newPass.length >= 4) {
      store.changePassword(newPass);
      alert('Parol muvaffaqiyatli o\'zgartirildi!');
    } else if (newPass) {
      alert('Parol juda qisqa!');
    }
  };

  return (
    <div className="hidden lg:flex h-full flex-col bg-[#166534] text-white w-64 shadow-xl shrink-0">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#DCFCE7] rounded-lg flex items-center justify-center shadow-sm relative">
          <Factory className="text-[#16A34A] w-5 h-5" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight">NormaAI</h1>
          <p className="text-[8px] font-bold text-emerald-300 uppercase tracking-widest">Cloud Sync Active</p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-[#16A34A] text-white shadow-sm" 
                : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              activeTab === item.id ? "text-white" : "text-emerald-100/70 group-hover:text-emerald-100"
            )} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 space-y-2">
        <button 
          onClick={handleChangePassword}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800/40 hover:bg-emerald-800/60 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <Settings className="w-3 h-3" />
          Parolni o'zgartirish
        </button>
        <div className="bg-emerald-800/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">AI Status</span>
          </div>
          <p className="text-[10px] text-white leading-relaxed opacity-90">Monitoring faol. Tizim normadan og'ishlarni tahlil qilmoqda.</p>
        </div>
      </div>

      <div className="p-4 border-t border-[#16A34A]/20 bg-[#14532D]/50">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 font-bold">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-tighter opacity-70">
              {user.role}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-emerald-300 hover:text-white transition-colors p-2 hover:bg-emerald-800 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Header({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-black text-emerald-900 tracking-tighter truncate max-w-[150px] sm:max-w-none">{title}</h2>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-full">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest hidden sm:inline">Live</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <button className="p-1.5 sm:p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        <div className="hidden sm:block h-8 w-[1px] bg-gray-200 mx-2"></div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-slate-800">{store.getCurrentUser().name}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{store.getCurrentUser().role}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 text-xs sm:text-sm font-bold">
            {store.getCurrentUser().name.split(' ').map(n => n[0]).join('')}
          </div>
          <button 
            onClick={() => { if(confirm('Chiqish?')) { store.logout(); window.location.reload(); } }}
            className="lg:hidden p-2 text-gray-400 hover:text-red-500"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ activeTab, setActiveTab }: SidebarProps) {
  const importantItems = navItems.filter(item => 
    ['dashboard', 'excel', 'ingredients', 'products', 'inventory', 'production'].includes(item.id)
  );

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-1 flex items-center justify-between z-50 h-16 safe-area-bottom shadow-[0_-4px_10px_rgba(0,0,0,0.05)] overflow-x-auto scrollbar-hide">
      {importantItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 p-1 transition-all rounded-lg min-w-[60px] flex-1",
            activeTab === item.id ? "text-emerald-600 bg-emerald-50" : "text-gray-400"
          )}
        >
          <item.icon className={cn("w-5 h-5", activeTab === item.id ? "scale-110" : "")} />
          <span className="text-[9px] font-black tracking-tighter whitespace-nowrap uppercase">{item.label.split(' ')[0]}</span>
        </button>
      ))}
    </nav>
  );
}
