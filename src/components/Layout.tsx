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

  return (
    <div className="h-full flex flex-col bg-[#166534] text-white w-64 shadow-xl">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#DCFCE7] rounded-lg flex items-center justify-center shadow-sm">
          <Factory className="text-[#16A34A] w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight">NormaAI</h1>
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

      <div className="p-6">
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
          <button className="text-emerald-300 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Header({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="relative w-96">
        <input 
          type="text" 
          placeholder="Qidirish..." 
          className="w-full bg-gray-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
        />
        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">{store.getCurrentUser().name}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{store.getCurrentUser().role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 font-bold">
            {store.getCurrentUser().name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </div>
    </header>
  );
}
