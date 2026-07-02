import { 
  Ingredient, Product, Recipe, ProductionRecord, 
  InventoryTransaction, AuditLog, User, UserRole,
  DashboardStats, Employee, Attendance
} from '../types';

// Initial Mock Data
const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Un', unit: 'kg', currentStock: 500, minStock: 50, createdAt: Date.now(), updatedAt: Date.now() },
  { id: '2', name: 'Shakar', unit: 'kg', currentStock: 200, minStock: 20, createdAt: Date.now(), updatedAt: Date.now() },
  { id: '3', name: 'Sariyog\'', unit: 'kg', currentStock: 100, minStock: 10, createdAt: Date.now(), updatedAt: Date.now() },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', code: '1', name: 'Buxanka', price: 3000, description: 'Oddiy yopgan non', isActive: true, createdAt: Date.now() },
  { id: '2', code: '2', name: 'Keks', price: 5000, description: 'Shirin keks', isActive: true, createdAt: Date.now() },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'e1', code: '1', name: 'Abdulmalik', commissionPercent: 10, isActive: true },
];

const INITIAL_RECIPES: Recipe[] = [
  { 
    productId: '1', 
    updatedAt: Date.now(),
    items: [
      { ingredientId: '1', amount: 0.6, unit: 'kg' },
    ]
  },
  {
    productId: '2',
    updatedAt: Date.now(),
    items: [
      { ingredientId: '1', amount: 0.3, unit: 'kg' },
      { ingredientId: '2', amount: 0.1, unit: 'kg' },
      { ingredientId: '3', amount: 0.05, unit: 'kg' },
    ]
  }
];

class NormaStore {
  private getData<T>(key: string, initial: T): T {
    try {
      const data = localStorage.getItem(`norma_${key}`);
      if (!data) return initial;
      const parsed = JSON.parse(data);
      // Ensure if initial is an array, we return an array
      if (Array.isArray(initial) && !Array.isArray(parsed)) return initial;
      return parsed || initial;
    } catch (e) {
      console.error(`Error reading ${key}:`, e);
      return initial;
    }
  }

  private setData(key: string, data: any) {
    try {
      localStorage.setItem(`norma_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving ${key}:`, e);
    }
  }

  // Auth (Mock)
  getCurrentUser(): User {
    return this.getData<User>('user', { 
      id: 'admin-1', 
      name: 'Admin User', 
      role: 'ADMIN', 
      email: 'admin@norma.ai' 
    });
  }

  setUser(user: User) {
    this.setData('user', user);
  }

  // Employees
  getEmployees(): Employee[] {
    return this.getData<Employee[]>('employees', INITIAL_EMPLOYEES);
  }

  saveEmployee(employee: Employee): Employee {
    const list = this.getEmployees();
    const index = list.findIndex(e => e.id === employee.id);
    const old = index >= 0 ? list[index] : null;
    let saved = { ...employee };

    if (index >= 0) {
      list[index] = saved;
    } else {
      saved = { ...employee, id: Math.random().toString(36).substr(2, 9) };
      list.push(saved);
    }

    this.setData('employees', list);
    this.log('EMPLOYEES', old ? 'UPDATE' : 'CREATE', old, saved);
    return saved;
  }

  addEmployee(data: Partial<Employee>): Employee {
    return this.saveEmployee({
      id: '',
      name: '',
      code: '',
      commissionPercent: 0,
      isActive: true,
      ...data
    } as Employee);
  }

  getEmployeeByCode(code: string): Employee | undefined {
    return this.getEmployees().find(e => e.code === code && e.isActive);
  }

  // Attendance
  getAttendance(): Attendance[] {
    return this.getData<Attendance[]>('attendance', []);
  }

  markAttendance(employeeId: string, date: number, status: Attendance['status']) {
    const list = this.getAttendance();
    const startOfDay = new Date(date).setHours(0,0,0,0);
    const index = list.findIndex(a => a.employeeId === employeeId && new Date(a.date).setHours(0,0,0,0) === startOfDay);
    
    if (index >= 0) {
      list[index].status = status;
    } else {
      list.push({
        id: Math.random().toString(36).substr(2, 9),
        employeeId,
        date,
        status
      });
    }
    this.setData('attendance', list);
  }

  // Ingredients
  getIngredients(): Ingredient[] {
    return this.getData<Ingredient[]>('ingredients', INITIAL_INGREDIENTS);
  }

  saveIngredient(ingredient: Ingredient): Ingredient {
    const list = this.getIngredients();
    const index = list.findIndex(i => i.id === ingredient.id);
    const old = index >= 0 ? list[index] : null;
    let saved = { ...ingredient };
    
    if (index >= 0) {
      saved = { ...ingredient, updatedAt: Date.now() };
      list[index] = saved;
    } else {
      saved = { ...ingredient, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now(), updatedAt: Date.now() };
      list.push(saved);
    }
    
    this.setData('ingredients', list);
    this.log('INGREDIENTS', old ? 'UPDATE' : 'CREATE', old, saved);
    return saved;
  }

  // Products
  getProducts(): Product[] {
    return this.getData<Product[]>('products', INITIAL_PRODUCTS);
  }

  saveProduct(product: Product): Product {
    const list = this.getProducts();
    const index = list.findIndex(p => p.id === product.id);
    const old = index >= 0 ? list[index] : null;
    let saved = { ...product };

    if (index >= 0) {
      list[index] = saved;
    } else {
      saved = { ...product, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
      list.push(saved);
    }

    this.setData('products', list);
    this.log('PRODUCTS', old ? 'UPDATE' : 'CREATE', old, saved);
    return saved;
  }

  addProduct(data: Partial<Product>): Product {
    return this.saveProduct({
      id: '',
      name: '',
      code: '',
      price: 0,
      isActive: true,
      ...data
    } as Product);
  }

  getProductByCode(code: string): Product | undefined {
    return this.getProducts().find(p => p.code === code && p.isActive);
  }

  // Recipes
  getRecipes(): Recipe[] {
    return this.getData<Recipe[]>('recipes', INITIAL_RECIPES);
  }

  getRecipe(productId: string): Recipe | undefined {
    return this.getRecipes().find(r => r.productId === productId);
  }

  saveRecipe(recipe: Recipe) {
    const list = this.getRecipes();
    const index = list.findIndex(r => r.productId === recipe.productId);
    const old = index >= 0 ? list[index] : null;

    if (index >= 0) list[index] = { ...recipe, updatedAt: Date.now() };
    else list.push({ ...recipe, updatedAt: Date.now() });

    this.setData('recipes', list);
    this.log('RECIPES', 'UPDATE', old, recipe);
  }

  // Production
  getProduction(): ProductionRecord[] {
    return this.getData<ProductionRecord[]>('production', []);
  }

  addProduction(productId: string, employeeId: string, amount: number, note?: string) {
    const recipe = this.getRecipe(productId);
    const ingredients = this.getIngredients();
    const snapshot: { ingredientId: string; amountUsed: number }[] = [];

    // Check stock and calculate ONLY if recipe exists
    if (recipe) {
      recipe.items.forEach(item => {
        const ing = ingredients.find(i => i.id === item.ingredientId);
        if (!ing) return; // Skip if ingredient gone
        
        const needed = item.amount * amount;
        if (ing.currentStock < needed) throw new Error(`${ing.name} yetarli emas (Omborda kam qolgan)`);
        
        ing.currentStock -= needed;
        ing.updatedAt = Date.now();
        snapshot.push({ ingredientId: item.ingredientId, amountUsed: needed });
      });
    }

    const record: ProductionRecord = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      employeeId,
      amount,
      date: Date.now(),
      note,
      operatorId: this.getCurrentUser().id,
      status: 'COMPLETED',
      ingredientsSnapshot: snapshot
    };

    const production = this.getProduction();
    production.push(record);
    
    if (snapshot.length > 0) {
      this.setData('ingredients', ingredients);
    }
    this.setData('production', production);
    
    // Log transactions
    snapshot.forEach(s => {
      this.addTransaction(s.ingredientId, 'OUT', s.amountUsed, `Ishlab chiqarish: ${record.id}`);
    });

    this.log('PRODUCTION', 'CREATE', null, record);
    return record;
  }

  cancelProduction(id: string) {
    const production = this.getProduction();
    const record = production.find(p => p.id === id);
    if (!record || record.status === 'CANCELLED') return;

    if (this.getCurrentUser().role !== 'ADMIN') throw new Error('Faqat Admin bekor qilishi mumkin');

    // Return ingredients to stock
    const ingredients = this.getIngredients();
    record.ingredientsSnapshot.forEach(s => {
      const ing = ingredients.find(i => i.id === s.ingredientId);
      if (ing) {
        ing.currentStock += s.amountUsed;
        this.addTransaction(ing.id, 'IN', s.amountUsed, `Bekor qilindi: ${record.id}`);
      }
    });

    record.status = 'CANCELLED';
    this.setData('ingredients', ingredients);
    this.setData('production', production);
    this.log('PRODUCTION', 'CANCEL', null, record);
  }

  addBatchProduction(
    productId: string, 
    employeeIds: string[], 
    amount: number, 
    usedIngredients: { ingredientId: string; amount: number }[],
    note?: string
  ) {
    const ingredients = this.getIngredients();
    const snapshot: { ingredientId: string; amountUsed: number }[] = [];

    // Deduct manually specified ingredients
    usedIngredients.forEach(used => {
      const ing = ingredients.find(i => i.id === used.ingredientId);
      if (!ing) return;
      
      if (ing.currentStock < used.amount) {
        throw new Error(`${ing.name} yetarli emas (Omborda: ${ing.currentStock} ${ing.unit})`);
      }
      
      ing.currentStock -= used.amount;
      ing.updatedAt = Date.now();
      snapshot.push({ ingredientId: used.ingredientId, amountUsed: used.amount });
    });

    const production = this.getProduction();
    const batchId = Math.random().toString(36).substr(2, 9);
    
    // Create production records for each employee (splitting the total amount)
    const amountPerEmployee = amount / (employeeIds.length || 1);
    
    employeeIds.forEach(empId => {
      const record: ProductionRecord = {
        id: Math.random().toString(36).substr(2, 9),
        productId,
        employeeId: empId,
        amount: amountPerEmployee, 
        date: Date.now(),
        note: note || `Partiya #${batchId}`,
        operatorId: this.getCurrentUser().id,
        status: 'COMPLETED',
        ingredientsSnapshot: snapshot // Each record points to the shared snapshot for reference
      };
      production.push(record);
    });

    // Save
    this.setData('ingredients', ingredients);
    this.setData('production', production);

    // Transactions for history
    snapshot.forEach(s => {
      this.addTransaction(s.ingredientId, 'OUT', s.amountUsed, `Partiya ishlab chiqarish: ${batchId}`);
    });

    this.log('PRODUCTION', 'CREATE', null, { batchId, productId, employeeIds, amount });
  }

  // Inventory
  getTransactions(): InventoryTransaction[] {
    return this.getData<InventoryTransaction[]>('transactions', []);
  }

  addTransaction(ingredientId: string, type: 'IN' | 'OUT' | 'ADJUSTMENT', amount: number, reason: string) {
    const tx: InventoryTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      ingredientId,
      type,
      amount,
      date: Date.now(),
      reason,
      userId: this.getCurrentUser().id
    };
    const list = this.getTransactions();
    list.push(tx);
    this.setData('transactions', list);
    this.log('INVENTORY', type, null, tx);
  }

  // Logs
  getLogs(): AuditLog[] {
    return this.getData<AuditLog[]>('logs', []);
  }

  private log(module: AuditLog['module'], action: string, old: any, newValue: any) {
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: this.getCurrentUser().id,
      timestamp: Date.now(),
      action,
      module,
      oldValue: old,
      newValue
    };
    const logs = this.getLogs();
    logs.push(log);
    this.setData('logs', logs);
  }

  // Dashboard Stats
  getStats(): DashboardStats {
    const ingredients = this.getIngredients();
    const products = this.getProducts();
    const production = this.getProduction();
    
    const today = new Date().setHours(0,0,0,0);
    const todayProd = production
      .filter(p => p.date >= today && p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    const lowStock = ingredients.filter(i => i.currentStock <= i.minStock);

    return {
      totalIngredients: ingredients.length,
      totalProducts: products.length,
      todayProduction: todayProd,
      lowStockCount: lowStock.length,
      alerts: lowStock.map(i => ({
        type: 'LOW_STOCK',
        message: `${i.name} kam qoldi: ${i.currentStock} ${i.unit}`,
        severity: i.currentStock <= i.minStock / 2 ? 'CRITICAL' : 'WARNING'
      }))
    };
  }
}

export const store = new NormaStore();
