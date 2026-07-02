export type UserRole = 'ADMIN' | 'OPERATOR';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  commissionPercent: number;
  isActive: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  categoryId?: string;
  description?: string;
  isActive: boolean;
  createdAt: number;
}

export interface RecipeItem {
  ingredientId: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  productId: string;
  items: RecipeItem[];
  updatedAt: number;
}

export interface ProductionRecord {
  id: string;
  productId: string;
  employeeId: string;
  amount: number;
  date: number;
  note?: string;
  operatorId: string;
  status: 'COMPLETED' | 'CANCELLED';
  ingredientsSnapshot: {
    ingredientId: string;
    amountUsed: number;
  }[];
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: number;
  status: 'PRESENT' | 'ABSENT';
}

export interface InventoryTransaction {
  id: string;
  ingredientId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  amount: number;
  date: number;
  reason: string;
  userId: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  timestamp: number;
  action: string;
  module: 'INGREDIENTS' | 'PRODUCTS' | 'RECIPES' | 'PRODUCTION' | 'INVENTORY' | 'SYSTEM' | 'EMPLOYEES';
  oldValue?: any;
  newValue?: any;
}

export interface DashboardStats {
  totalIngredients: number;
  totalProducts: number;
  todayProduction: number;
  lowStockCount: number;
  alerts: {
    type: 'LOW_STOCK' | 'SYSTEM';
    message: string;
    severity: 'WARNING' | 'CRITICAL';
  }[];
}
