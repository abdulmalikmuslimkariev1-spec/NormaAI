import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  UserPlus, 
  Users,
  Settings2,
  X
} from 'lucide-react';
import { store } from '../lib/store';
import { Employee } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function EmployeesView() {
  const [employees, setEmployees] = useState(store.getEmployees());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Partial<Employee> | null>(null);

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.code.includes(searchTerm)
  );

  const openModal = (employee?: Employee) => {
    if (employee) {
      setSelectedEmployee(employee);
    } else {
      setSelectedEmployee({ 
        code: (employees.length + 1).toString(),
        name: '', 
        commissionPercent: 10, 
        isActive: true 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (selectedEmployee?.name && selectedEmployee?.code) {
      store.saveEmployee(selectedEmployee as Employee);
      setEmployees(store.getEmployees());
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
            placeholder="Xodimlarni qidirish..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#16A34A] text-white rounded-xl hover:bg-[#166534] transition-all shadow-lg shadow-emerald-600/20 font-semibold"
        >
          <UserPlus className="w-5 h-5" />
          Yangi xodim
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kod</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">F.I.SH</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Ulush (%)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Holat</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-emerald-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">#{emp.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="font-semibold text-gray-800">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-gray-600">{emp.commissionPercent}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      emp.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
                    )}>
                      {emp.isActive ? 'Ishlamoqda' : 'Bo\'shatilgan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openModal(emp)}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Modal */}
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
                <h3 className="text-xl font-bold">Xodim ma'lumotlari</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Kodi</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-emerald-600"
                      value={selectedEmployee?.code || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee!, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Ulushi (%)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold"
                      value={selectedEmployee?.commissionPercent || 0}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee!, commissionPercent: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">To'liq ism (F.I.SH)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                    value={selectedEmployee?.name || ''}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee!, name: e.target.value })}
                    placeholder="Masalan: Abdulmalik"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Holati</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                    value={selectedEmployee?.isActive ? 'true' : 'false'}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee!, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">Faol</option>
                    <option value="false">Nofaol (Bo'shatilgan)</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSave}
                    className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    Saqlash
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
