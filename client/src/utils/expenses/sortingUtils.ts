import { Expense, User, Category } from '../../types';
import { SortField, SortOrder } from '../../components/expenses/ExpenseSorting';

export const sortExpenses = (
  expenses: Expense[],
  sortBy: SortField,
  sortOrder: SortOrder,
  users: User[],
  categories: Category[]
): Expense[] => {
  return [...expenses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        // Ensure proper date comparison using local dates
        const dateA = a.date.includes('T') ? a.date.split('T')[0] : a.date;
        const dateB = b.date.includes('T') ? b.date.split('T')[0] : b.date;
        const localDateA = new Date(dateA + 'T00:00:00');
        const localDateB = new Date(dateB + 'T00:00:00');
        comparison = localDateA.getTime() - localDateB.getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'description':
        comparison = a.description.localeCompare(b.description);
        break;
      case 'user': {
        const userA = users.find(u => u.id === a.userId)?.name || '';
        const userB = users.find(u => u.id === b.userId)?.name || '';
        comparison = userA.localeCompare(userB);
        break;
      }
      case 'category': {
        const categoryA = categories.find(c => c.id === a.categoryId)?.name || '';
        const categoryB = categories.find(c => c.id === b.categoryId)?.name || '';
        comparison = categoryA.localeCompare(categoryB);
        break;
      }
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};