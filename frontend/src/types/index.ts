export interface Category {
  id: number;
  name: string;
  icon: string;
  type: 'income' | 'expense';
  sortOrder: number;
  createdAt: string;
}

export interface Record {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  categoryId: number;
  category?: Category;
  note: string;
  date: string;
  createdAt: string;
}

export interface MonthSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategoryStat {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
}

export interface CategoryStatsResponse {
  incomeStats: CategoryStat[];
  expenseStats: CategoryStat[];
}

export interface MonthTrend {
  month: string;
  income: number;
  expense: number;
}

export type RecordType = 'income' | 'expense';
export type Theme = 'light' | 'dark';
