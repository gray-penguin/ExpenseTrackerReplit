import { Expense } from '../types';
import { expenseTemplates } from './expenseTemplates';

export interface MockExpenseOptions {
  startDate?: Date;
  numberOfExpenses?: number;
  userIds?: string[];
}

export class MockExpenseGenerator {
  static generate(options: MockExpenseOptions = {}): Omit<Expense, 'id'>[] {
    const {
      startDate = new Date(new Date().getFullYear() - 1, 0, 1),
      numberOfExpenses = 500,
      userIds = ['1', '2', '3', '4']
    } = options;

    const mockExpenses: Omit<Expense, 'id'>[] = [];
    let expenseId = 1;
    
    // Generate expenses over 12 months
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(startDate.getMonth() + month);
      
      // Generate 40-45 expenses per month (roughly 500 total)
      const expensesThisMonth = Math.floor(Math.random() * 6) + 40; // 40-45 expenses
      
      for (let i = 0; i < expensesThisMonth && expenseId <= numberOfExpenses; i++) {
        const expense = this.generateSingleExpense(monthDate, userIds);
        mockExpenses.push(expense);
        expenseId++;
      }
    }
    
    // Add recent expenses to reach target number
    while (mockExpenses.length < numberOfExpenses) {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - Math.floor(Math.random() * 30));
      const expense = this.generateSingleExpense(recentDate, userIds);
      mockExpenses.push(expense);
      expenseId++;
    }

    console.log(`Generated ${mockExpenses.length} Jones family expenses over 12 months`);
    return mockExpenses;
  }

  private static generateSingleExpense(baseDate: Date, userIds: string[]): Omit<Expense, 'id'> {
    // Random day in the month
    const day = Math.floor(Math.random() * 28) + 1; // 1-28 to avoid month-end issues
    const expenseDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
    const dateString = expenseDate.toISOString().split('T')[0];
    
    // Random family member (weighted towards parents for most expenses)
    let userId: string;
    const random = Math.random();
    if (random < 0.4) userId = userIds[0]; // First user - 40%
    else if (random < 0.7) userId = userIds[1]; // Second user - 30%
    else if (random < 0.85) userId = userIds[2] || userIds[0]; // Third user - 15%
    else userId = userIds[3] || userIds[0]; // Fourth user - 15%
    
    // Random expense template
    const templateIndex = Math.floor(Math.random() * expenseTemplates.length);
    const template = expenseTemplates[templateIndex];
    const itemIndex = Math.floor(Math.random() * template.descriptions.length);
    
    // Add some variation to amounts (±20%)
    const baseAmount = template.amounts[itemIndex];
    const variation = (Math.random() - 0.5) * 0.4; // -20% to +20%
    const finalAmount = Math.round((baseAmount * (1 + variation)) * 100) / 100;
    
    // Add occasional notes for variety
    let notes = undefined;
    if (Math.random() > 0.8) {
      const noteOptions = [
        'Family expense',
        'Needed for household',
        'Monthly recurring',
        'Shared family cost',
        'Essential purchase'
      ];
      notes = noteOptions[Math.floor(Math.random() * noteOptions.length)];
    }
    
    return {
      userId,
      categoryId: template.categoryId,
      subcategoryId: template.subcategoryId,
      amount: finalAmount,
      description: template.descriptions[itemIndex],
      notes,
      storeName: template.stores[itemIndex],
      storeLocation: template.locations[itemIndex],
      date: dateString,
      createdAt: expenseDate.toISOString()
    };
  }
}