import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Save, 
  Trash2, 
  Search,
  Calculator,
  UserCheck,
  Package,
  Users,
  Settings,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  FolderOpen,
  ChevronRight,
  MoreVertical,
  X
} from 'lucide-react';

interface Workbook {
  id: string;
  name: string;
  prodEntries: any[];
  attEntries: any[];
  selectedProdEmpCodes: string[];
  lastModified: number;
}
import { store } from '../lib/store';
import { Product, Employee, ProductionRecord, Attendance } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type SheetType = 'master' | 'production' | 'attendance' | 'payroll';

export function ExcelView() {
  const [activeSheet, setActiveSheet] = useState<SheetType>('production');
  
  // Folders (Workbooks) Logic
  const [workbooks, setWorkbooks] = useState<Workbook[]>(() => {
    const saved = localStorage.getItem('norma_excel_workbooks');
    if (saved) return JSON.parse(saved);
    return [{
      id: 'default',
      name: 'Asosiy Hujjat',
      prodEntries: Array.from({ length: 50 }, () => ({ prodCode: '', amount: '' })),
      attEntries: Array.from({ length: 30 }, () => ({ empCode: '', status: 'PRESENT' })),
      selectedProdEmpCodes: [],
      lastModified: Date.now()
    }];
  });
  const [activeWorkbookId, setActiveWorkbookId] = useState(() => {
    return localStorage.getItem('norma_excel_active_workbook') || 'default';
  });

  const activeWorkbook = workbooks.find(w => w.id === activeWorkbookId) || workbooks[0];

  // Sync state with active workbook
  const [prodEntries, setProdEntries] = useState(activeWorkbook.prodEntries);
  const [attEntries, setAttEntries] = useState(activeWorkbook.attEntries);
  const [selectedProdEmpCodes, setSelectedProdEmpCodes] = useState(activeWorkbook.selectedProdEmpCodes);

  useEffect(() => {
    localStorage.setItem('norma_excel_workbooks', JSON.stringify(workbooks));
  }, [workbooks]);

  useEffect(() => {
    localStorage.setItem('norma_excel_active_workbook', activeWorkbookId);
  }, [activeWorkbookId]);

  // Update current workbook data when local states change
  useEffect(() => {
    setWorkbooks(prev => prev.map(w => {
      if (w.id === activeWorkbookId) {
        return { ...w, prodEntries, attEntries, selectedProdEmpCodes, lastModified: Date.now() };
      }
      return w;
    }));
  }, [prodEntries, attEntries, selectedProdEmpCodes, activeWorkbookId]);

  // Switch workbook
  const handleSwitchWorkbook = (id: string) => {
    const wb = workbooks.find(w => w.id === id);
    if (wb) {
      setActiveWorkbookId(id);
      setProdEntries(wb.prodEntries);
      setAttEntries(wb.attEntries);
      setSelectedProdEmpCodes(wb.selectedProdEmpCodes);
    }
  };

  const createWorkbook = () => {
    const name = prompt('Yangi papka nomi:', 'Yangi Hujjat');
    if (!name) return;
    const newWb: Workbook = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      prodEntries: Array.from({ length: 50 }, () => ({ prodCode: '', amount: '' })),
      attEntries: Array.from({ length: 30 }, () => ({ empCode: '', status: 'PRESENT' })),
      selectedProdEmpCodes: [],
      lastModified: Date.now()
    };
    setWorkbooks([...workbooks, newWb]);
    handleSwitchWorkbook(newWb.id);
  };

  const renameWorkbook = (id: string) => {
    const wb = workbooks.find(w => w.id === id);
    if (!wb) return;
    const newName = prompt('Papkani yangi nomi:', wb.name);
    if (newName && newName !== wb.name) {
      setWorkbooks(workbooks.map(w => w.id === id ? { ...w, name: newName } : w));
    }
  };

  const deleteWorkbook = (id: string) => {
    if (id === 'default') return alert('Asosiy hujjatni o\'chirib bo\'lmaydi');
    if (confirm('Ushbu papkani o\'chirmoqchimisiz?')) {
      const filtered = workbooks.filter(w => w.id !== id);
      setWorkbooks(filtered);
      if (activeWorkbookId === id) {
        handleSwitchWorkbook('default');
      }
    }
  };

  // Sheet 1: Master Data (Employees & Products)
  const [masterEmployees, setMasterEmployees] = useState(() => store.getEmployees());
  const [masterProducts, setMasterProducts] = useState(() => store.getProducts());

  // Logic to add employee
  const handleAddEmployee = (code: string) => {
    if (!code) return;
    const name = prompt('Xodim ismini kiriting:');
    if (!name) return;
    
    store.addEmployee({
      code,
      name,
      commissionPercent: 0
    });
    setMasterEmployees([...store.getEmployees()]);
  };

  // Logic to add product
  const handleAddProduct = (code: string) => {
    if (!code) return;
    const name = prompt('Mahsulot nomini kiriting:');
    if (!name) return;
    const priceStr = prompt('Narxini kiriting:');
    const price = Number(priceStr) || 0;

    store.addProduct({
      code,
      name,
      price
    });
    setMasterProducts([...store.getProducts()]);
  };

  useEffect(() => {
    if (activeSheet === 'master') {
      setMasterEmployees(store.getEmployees() || []);
      setMasterProducts(store.getProducts() || []);
    }
  }, [activeSheet]);

  // Sheet 2: Production (Daily)
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Grid Navigation Logic
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextId = `cell-${activeSheet}-${row + 1}-${col}`;
      const element = document.getElementById(nextId);
      if (element) {
        (element as HTMLInputElement).focus();
      }
    }
    // Arrows
    if (e.key === 'ArrowDown') {
      const nextId = `cell-${activeSheet}-${row + 1}-${col}`;
      document.getElementById(nextId)?.focus();
    }
    if (e.key === 'ArrowUp' && row > 0) {
      const prevId = `cell-${activeSheet}-${row - 1}-${col}`;
      document.getElementById(prevId)?.focus();
    }
  };

  // Sheet 4: Payroll Report
  const [payrollRange, setPayrollRange] = useState({ start: '', end: '' });
  const [payrollResults, setPayrollResults] = useState<any[]>([]);

  // Helpers
  const updateProdEntry = (index: number, key: string, value: string) => {
    if (!prodEntries[index]) return;
    const newEntries = [...prodEntries];
    const entry = { ...newEntries[index], [key]: value };
    
    if (key === 'prodCode') {
      const prod = store.getProductByCode(value);
      entry.prodName = prod?.name || '';
      entry.price = prod?.price || 0;
    }
    
    newEntries[index] = entry;

    // Infinite rows: If we type in the last row, add 10 more
    if (index === prodEntries.length - 1 && value !== '') {
      setProdEntries([...newEntries, ...Array.from({ length: 10 }, () => ({ prodCode: '', amount: '' }))]);
    } else {
      setProdEntries(newEntries);
    }
  };

  const toggleProdEmployee = (code: string) => {
    setSelectedProdEmpCodes(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const updateAttEntry = (index: number, key: string, value: string) => {
    if (!attEntries[index]) return;
    const newEntries = [...attEntries];
    const entry = { ...newEntries[index], [key]: value };
    
    if (key === 'empCode') {
      const emp = store.getEmployeeByCode(value);
      entry.empName = emp?.name || '';
    }
    
    newEntries[index] = entry;
    setAttEntries(newEntries);

    if (index === attEntries.length - 1 && value !== '') {
      setAttEntries([...newEntries, ...Array.from({ length: 10 }, () => ({ empCode: '', status: 'PRESENT' }))]);
    }
  };

  const saveProduction = () => {
    const valid = prodEntries.filter(e => e.prodCode && e.amount);
    if (valid.length === 0) {
      alert('Ma\'lumotlarni kiriting');
      return;
    }
    if (selectedProdEmpCodes.length === 0) {
      alert('Kamida bitta xodimni tanlang');
      return;
    }

    let count = 0;
    try {
      selectedProdEmpCodes.forEach(empCode => {
        const emp = store.getEmployeeByCode(empCode);
        if (!emp) return;

        valid.forEach(entry => {
          const prod = store.getProductByCode(entry.prodCode);
          if (prod) {
            store.addProduction(prod.id, emp.id, Number(entry.amount));
            count++;
          }
        });
      });
      alert(`${selectedProdEmpCodes.length} ta xodim uchun jami ${count} ta qayd saqlandi! Ma'lumotlar tarixga qo'shildi.`);
    } catch (e: any) {
      alert(`Xatolik: ${e.message}`);
    }
  };

  const clearProductionSheet = () => {
    if (confirm('Jadvalni tozalashni xohlaysizmi? (Saqlanmagan ma\'lumotlar o\'chib ketadi)')) {
      setProdEntries(Array.from({ length: 50 }, () => ({ prodCode: '', amount: '' })));
      setSelectedProdEmpCodes([]);
    }
  };

  const saveAttendance = () => {
    const valid = attEntries.filter(e => e.empCode);
    if (valid.length === 0) return;

    try {
      valid.forEach(entry => {
        const emp = store.getEmployeeByCode(entry.empCode);
        if (emp) {
          store.markAttendance(emp.id, new Date(attendanceDate).getTime(), entry.status);
        }
      });
      alert(`Davomat saqlandi!`);
      setAttEntries(Array.from({ length: 30 }, () => ({ empCode: '', status: 'PRESENT' })));
    } catch (e: any) {
      alert(`Xatolik: ${e.message}`);
    }
  };

  const calculatePayroll = () => {
    if (!payrollRange.start || !payrollRange.end) {
      alert('Davrni tanlang');
      return;
    }
    
    try {
      const start = new Date(payrollRange.start).getTime();
      const end = new Date(payrollRange.end).setHours(23, 59, 59, 999);
      
      const employees = store.getEmployees() || [];
      const products = store.getProducts() || [];
      const production = (store.getProduction() || []).filter(p => p.date >= start && p.date <= end && p.status === 'COMPLETED');

      const results = employees.map(emp => {
        const empProd = production.filter(p => p.employeeId === emp.id);
        let totalValue = 0;
        empProd.forEach(p => {
          const prod = products.find(prod => prod.id === p.productId);
          if (prod) totalValue += ((prod.price || 0) * p.amount);
        });

        const commission = emp.commissionPercent || 0;

        return {
          id: emp.id,
          code: emp.code,
          name: emp.name,
          totalProductionValue: totalValue,
          salary: (totalValue * commission) / 100,
          itemsCount: empProd.reduce((sum, p) => sum + p.amount, 0)
        };
      }).filter(r => r.totalProductionValue > 0);

      setPayrollResults(results);
    } catch (e: any) {
      alert(`Hisoblashda xatolik: ${e.message}`);
    }
  };

  // Export Function
  const exportToCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `NormaAI_${activeSheet}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeSheet === 'master') {
      headers = ['Xodim Kodi', 'Xodim Ismi', 'Ulush %', 'Maxsulot Kodi', 'Maxsulot Nomi', 'Narxi'];
      const maxLen = Math.max(masterEmployees.length, masterProducts.length);
      for (let i = 0; i < maxLen; i++) {
        const emp = masterEmployees[i];
        const prod = masterProducts[i];
        rows.push([
          emp?.code || '', emp?.name || '', emp?.commissionPercent || '',
          prod?.code || '', prod?.name || '', prod?.price || ''
        ]);
      }
    } else if (activeSheet === 'production') {
      headers = ['Xodimlar', 'Maxsulot Kodi', 'Maxsulot Nomi', 'Miqdor', 'Sana'];
      const valid = prodEntries.filter(e => e.prodCode && e.amount);
      const empNames = selectedProdEmpCodes.map(c => store.getEmployeeByCode(c)?.name || c).join('; ');
      rows = valid.map(e => [empNames, e.prodCode, e.prodName, e.amount, productionDate]);
    } else if (activeSheet === 'payroll') {
      headers = ['Kod', 'Xodim', 'Ish miqdori', 'Umumiy Qiymat', 'Oylik (Hisoblangan)'];
      rows = payrollResults.map(r => [r.code, r.name, r.itemsCount, r.totalProductionValue, r.salary]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full gap-2 p-2 sm:gap-4 sm:p-4 bg-gray-50">
      {/* Workbook / Folder Bar */}
      <div className="bg-white border border-gray-200 px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-hide rounded-xl sm:rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 pr-3 sm:pr-4 border-r border-gray-200">
          <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
          <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Papkalar:</span>
        </div>
        {workbooks.map(wb => (
          <div 
            key={wb.id}
            className={cn(
              "group relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap",
              activeWorkbookId === wb.id 
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm" 
                : "text-gray-500 hover:bg-gray-50"
            )}
            onClick={() => handleSwitchWorkbook(wb.id)}
            onDoubleClick={() => renameWorkbook(wb.id)}
          >
            {wb.name}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-1">
              <button 
                onClick={(e) => { e.stopPropagation(); renameWorkbook(wb.id); }}
                className="p-1 hover:text-emerald-600 transition-all"
                title="Nomini o'zgartirish"
              >
                <Settings className="w-3 h-3" />
              </button>
              {wb.id !== 'default' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteWorkbook(wb.id); }}
                  className="p-1 hover:text-red-500 transition-all"
                  title="O'chirish"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
        <button 
          onClick={createWorkbook}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all ml-2 text-xs font-bold whitespace-nowrap shadow-md shadow-emerald-100"
        >
          <Plus className="w-4 h-4" />
          <span>Qo'shish</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 shadow-2xl">
        {/* Excel Toolbar */}
      <div className="bg-white border-b border-gray-200 p-1.5 sm:p-2 flex flex-wrap items-center gap-2 sm:gap-4 shrink-0">
        <button 
          onClick={() => renameWorkbook(activeWorkbook.id)}
          className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1 bg-emerald-50 rounded text-emerald-700 hover:bg-emerald-100 transition-all group"
        >
          <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] sm:text-sm font-bold truncate max-w-[100px] sm:max-w-[200px]">{activeWorkbook.name}</span>
          <Settings className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => setActiveSheet('master')}
            className={cn(
              "px-2 py-1 sm:px-3 sm:py-1 rounded text-[10px] sm:text-xs font-bold transition-all",
              activeSheet === 'master' ? "bg-emerald-600 text-white shadow-sm" : "hover:bg-gray-100 text-gray-500"
            )}
          >
            Baza
          </button>
          <button 
            onClick={() => setActiveSheet('production')}
            className={cn(
              "px-2 py-1 sm:px-3 sm:py-1 rounded text-[10px] sm:text-xs font-bold transition-all",
              activeSheet === 'production' ? "bg-emerald-600 text-white shadow-sm" : "hover:bg-gray-100 text-gray-500"
            )}
          >
            Ish
          </button>
          <button 
            onClick={() => setActiveSheet('attendance')}
            className={cn(
              "px-2 py-1 sm:px-3 sm:py-1 rounded text-[10px] sm:text-xs font-bold transition-all",
              activeSheet === 'attendance' ? "bg-emerald-600 text-white shadow-sm" : "hover:bg-gray-100 text-gray-500"
            )}
          >
            Davomat
          </button>
          <button 
            onClick={() => setActiveSheet('payroll')}
            className={cn(
              "px-2 py-1 sm:px-3 sm:py-1 rounded text-[10px] sm:text-xs font-bold transition-all",
              activeSheet === 'payroll' ? "bg-emerald-600 text-white shadow-sm" : "hover:bg-gray-100 text-gray-500"
            )}
          >
            Oylik
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {activeSheet === 'production' && (
            <div className="flex items-center gap-1 sm:gap-2">
              <input 
                type="date" 
                className="px-1 py-1 sm:px-2 sm:py-1 border border-gray-200 rounded text-[10px] sm:text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold bg-gray-50"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
              />
              <button 
                onClick={saveProduction}
                className="flex items-center gap-1 px-2 py-1 sm:px-4 sm:py-1.5 bg-emerald-600 text-white rounded font-bold text-[10px] sm:text-sm hover:bg-emerald-700 transition-all shadow-sm"
              >
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                OK
              </button>
            </div>
          )}
          {activeSheet === 'attendance' && (
            <div className="flex items-center gap-1 sm:gap-2">
              <input 
                type="date" 
                className="px-1 py-1 sm:px-2 sm:py-1 border border-gray-200 rounded text-[10px] sm:text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold bg-gray-50"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
              <button 
                onClick={saveAttendance}
                className="flex items-center gap-1 px-2 py-1 sm:px-4 sm:py-1.5 bg-emerald-600 text-white rounded font-bold text-[10px] sm:text-sm hover:bg-emerald-700 transition-all shadow-sm"
              >
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                OK
              </button>
            </div>
          )}
          <button 
            onClick={exportToCSV}
            className="p-1 sm:p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-all"
            title="Excelga eksport"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 overflow-auto bg-white">
        {activeSheet === 'master' && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full overflow-auto">
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Xodimlar (Kod va Ism)
                </div>
                <span className="text-[10px] text-gray-400 font-normal">Pastki qatorda yangi xodim qo'shing</span>
              </h3>
              <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-3 py-2 w-16">Kod</th>
                    <th className="border border-gray-200 px-3 py-2 text-left">Xodim ismi</th>
                    <th className="border border-gray-200 px-3 py-2 w-20">Ulush %</th>
                  </tr>
                </thead>
                <tbody>
                  {masterEmployees.map(emp => (
                    <tr key={emp.id}>
                      <td className="border border-gray-200 px-3 py-2 text-center font-bold text-emerald-600 bg-gray-50/30">{emp.code}</td>
                      <td className="border border-gray-200 px-3 py-2 font-medium">{emp.name}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center">{emp.commissionPercent}%</td>
                    </tr>
                  ))}
                  {/* Quick Add Row */}
                  <tr className="bg-emerald-50/20">
                    <td className="border border-gray-200 p-0">
                      <input 
                        placeholder="Yangi..."
                        className="w-full px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-center bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddEmployee(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-400 italic text-xs">Enter bosing...</td>
                    <td className="border border-gray-200 px-3 py-2 bg-gray-50"></td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  Maxsulotlar (Kod va Narx)
                </div>
                <span className="text-[10px] text-gray-400 font-normal">Pastki qatorda yangi mahsulot qo'shing</span>
              </h3>
              <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-3 py-2 w-16">Kod</th>
                    <th className="border border-gray-200 px-3 py-2 text-left">Maxsulot nomi</th>
                    <th className="border border-gray-200 px-3 py-2 text-right">Narxi</th>
                  </tr>
                </thead>
                <tbody>
                  {masterProducts.map(prod => (
                    <tr key={prod.id}>
                      <td className="border border-gray-200 px-3 py-2 text-center font-bold text-emerald-600 bg-gray-50/30">{prod.code}</td>
                      <td className="border border-gray-200 px-3 py-2 font-medium">{prod.name}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-bold">{(prod.price || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {/* Quick Add Row */}
                  <tr className="bg-emerald-50/20">
                    <td className="border border-gray-200 p-0">
                      <input 
                        placeholder="Yangi..."
                        className="w-full px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-center bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddProduct(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-400 italic text-xs">Enter bosing...</td>
                    <td className="border border-gray-200 px-3 py-2 bg-gray-50"></td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        )}

        {activeSheet === 'production' && (
          <div className="flex flex-col h-full">
            {/* Employee Selection Section */}
            <div className="bg-emerald-50/50 p-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-700">Bayonnomaga biriktirilgan xodimlar:</h3>
                <span className="text-xs text-gray-400 font-medium">(Kamida bir kishini tanlang)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {store.getEmployees().map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => toggleProdEmployee(emp.code)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2",
                      selectedProdEmpCodes.includes(emp.code)
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200"
                        : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300"
                    )}
                  >
                    <span className="font-mono opacity-60">#{emp.code}</span>
                    {emp.name}
                    {selectedProdEmpCodes.includes(emp.code) && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Production Grid */}
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse text-sm min-w-[800px]">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 w-12 text-gray-400 font-normal">A</th>
                    <th className="border border-gray-200 px-4 py-2 w-48 text-gray-700 font-bold">Maxsulot Kodi</th>
                    <th className="border border-gray-200 px-4 py-2 text-gray-700 font-bold text-left">Maxsulot Nomi</th>
                    <th className="border border-gray-200 px-4 py-2 w-40 text-gray-700 font-bold text-right">Narxi</th>
                    <th className="border border-gray-200 px-4 py-2 w-40 text-gray-700 font-bold text-right">Miqdor</th>
                  </tr>
                </thead>
                <tbody>
                  {prodEntries.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/30">
                      <td className="border border-gray-200 px-4 py-1 text-center bg-gray-50/50 text-gray-400 font-medium">{idx + 1}</td>
                      <td className="border border-gray-200 p-0">
                        <input 
                          id={`cell-production-${idx}-prodCode`}
                          className="w-full px-4 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 inset-0 bg-transparent font-bold text-emerald-700 text-center"
                          placeholder="Kod..."
                          value={entry.prodCode}
                          onChange={(e) => updateProdEntry(idx, 'prodCode', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'prodCode')}
                        />
                      </td>
                      <td className="border border-gray-200 px-4 py-1.5 text-gray-500 font-medium bg-gray-50/20">{entry.prodName || ''}</td>
                      <td className="border border-gray-200 px-4 py-1.5 text-right font-bold text-gray-400 bg-gray-50/20">
                        {(entry.price || 0).toLocaleString()}
                      </td>
                      <td className="border border-gray-200 p-0">
                        <input 
                          id={`cell-production-${idx}-amount`}
                          type="number"
                          className="w-full px-4 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 inset-0 bg-transparent font-bold text-right"
                          placeholder="0"
                          value={entry.amount}
                          onChange={(e) => updateProdEntry(idx, 'amount', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'amount')}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSheet === 'attendance' && (
          <table className="w-full border-collapse text-sm max-w-4xl mx-auto mt-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-2 w-12 text-gray-400 font-normal">A</th>
                <th className="border border-gray-200 px-4 py-2 w-32 text-gray-700 font-bold">Xodim Kodi</th>
                <th className="border border-gray-200 px-4 py-2 text-gray-700 font-bold text-left">Xodim Ismi</th>
                <th className="border border-gray-200 px-4 py-2 w-40 text-gray-700 font-bold text-center">Holat</th>
              </tr>
            </thead>
            <tbody>
              {attEntries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/30">
                  <td className="border border-gray-200 px-4 py-1 text-center bg-gray-50/50 text-gray-400">{idx + 1}</td>
                  <td className="border border-gray-200 p-0">
                    <input 
                      id={`cell-attendance-${idx}-empCode`}
                      className="w-full px-4 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 bg-transparent font-bold text-emerald-700 text-center"
                      value={entry.empCode}
                      onChange={(e) => updateAttEntry(idx, 'empCode', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx, 'empCode')}
                    />
                  </td>
                  <td className="border border-gray-200 px-4 py-1.5 text-gray-500 font-medium bg-gray-50/20">{entry.empName || ''}</td>
                  <td className="border border-gray-200 p-0 text-center">
                    <select 
                      className="w-full px-4 py-1.5 outline-none bg-transparent font-bold"
                      value={entry.status}
                      onChange={(e) => updateAttEntry(idx, 'status', e.target.value as any)}
                    >
                      <option value="PRESENT">KELDI</option>
                      <option value="ABSENT">KELMADI</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeSheet === 'payroll' && (
          <div className="p-8">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col md:flex-row items-end gap-4 mb-8">
              <div className="flex-1">
                <label className="block text-xs font-bold text-emerald-600 uppercase mb-2">Davr BOSHI</label>
                <input 
                  type="date"
                  className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  value={payrollRange.start}
                  onChange={(e) => setPayrollRange({ ...payrollRange, start: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-emerald-600 uppercase mb-2">Davr OXIRI</label>
                <input 
                  type="date"
                  className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  value={payrollRange.end}
                  onChange={(e) => setPayrollRange({ ...payrollRange, end: e.target.value })}
                />
              </div>
              <button 
                onClick={calculatePayroll}
                className="px-8 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-md transition-all flex items-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Hisobni Chiqarish
              </button>
            </div>

            {payrollResults.length > 0 && (
              <div className="overflow-hidden border border-gray-200 rounded-xl">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left font-bold text-gray-700">Xodim</th>
                      <th className="px-6 py-4 text-center font-bold text-gray-700">Ish miqdori</th>
                      <th className="px-6 py-4 text-right font-bold text-gray-700">Ishlangan Summa</th>
                      <th className="px-6 py-4 text-right font-bold text-emerald-600">Oylik (Hisoblangan)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payrollResults.map(res => (
                      <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">#{res.code}</span>
                            <span className="font-bold text-gray-800">{res.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-medium text-gray-600">{res.itemsCount.toLocaleString()} dona</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-gray-500">{res.totalProductionValue.toLocaleString()} so'm</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xl font-black text-emerald-600">{res.salary.toLocaleString()} so'm</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-emerald-600 text-white font-bold">
                    <tr>
                      <td className="px-6 py-4">UMUMIY HISOB</td>
                      <td className="px-6 py-4 text-center">{payrollResults.reduce((s, r) => s + r.itemsCount, 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">{payrollResults.reduce((s, r) => s + r.totalProductionValue, 0).toLocaleString()} so'm</td>
                      <td className="px-6 py-4 text-right text-2xl">{payrollResults.reduce((s, r) => s + r.salary, 0).toLocaleString()} so'm</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Excel Sheet Tabs (Bottom) */}
      <div className="bg-[#E6E6E6] border-t border-gray-300 p-1 flex items-center shrink-0 overflow-x-auto">
        <button 
          onClick={() => setActiveSheet('master')}
          className={cn(
            "px-4 py-1.5 text-xs font-bold transition-all border-r border-gray-300 flex items-center gap-2",
            activeSheet === 'master' ? "bg-white text-emerald-700 shadow-inner" : "text-gray-600 hover:bg-gray-200"
          )}
        >
          <Settings className="w-3.5 h-3.5" />
          1-LIST (Master Data)
        </button>
        <button 
          onClick={() => setActiveSheet('production')}
          className={cn(
            "px-4 py-1.5 text-xs font-bold transition-all border-r border-gray-300 flex items-center gap-2",
            activeSheet === 'production' ? "bg-white text-emerald-700 shadow-inner" : "text-gray-600 hover:bg-gray-200"
          )}
        >
          <Package className="w-3.5 h-3.5" />
          2-LIST (Ishlab chiqarish)
        </button>
        <button 
          onClick={() => setActiveSheet('attendance')}
          className={cn(
            "px-4 py-1.5 text-xs font-bold transition-all border-r border-gray-300 flex items-center gap-2",
            activeSheet === 'attendance' ? "bg-white text-emerald-700 shadow-inner" : "text-gray-600 hover:bg-gray-200"
          )}
        >
          <UserCheck className="w-3.5 h-3.5" />
          3-LIST (Davomat)
        </button>
        <button 
          onClick={() => setActiveSheet('payroll')}
          className={cn(
            "px-4 py-1.5 text-xs font-bold transition-all border-r border-gray-300 flex items-center gap-2",
            activeSheet === 'payroll' ? "bg-white text-emerald-700 shadow-inner" : "text-gray-600 hover:bg-gray-200"
          )}
        >
          <Calculator className="w-3.5 h-3.5" />
          4-LIST (Oylik Hisob)
        </button>
      </div>
    </div>
  </div>
  );
}
