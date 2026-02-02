import { create } from 'zustand';
import type { Category, Record, MonthSummary, CategoryStatsResponse, MonthTrend, Theme, RecordType } from '../types';
import { GetCategories, GetRecordsByMonth, GetMonthSummary, GetCategoryStats, GetTrendStats, GetRecentRecords } from '../../wailsjs/go/main/App';

interface AppState {
  // 主题
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // 当前选中的日期
  currentYear: number;
  currentMonth: number;
  setCurrentDate: (year: number, month: number) => void;

  // 分类
  categories: Category[];
  fetchCategories: (type?: RecordType) => Promise<void>;

  // 记录
  records: Record[];
  recentRecords: Record[];
  fetchRecords: () => Promise<void>;
  fetchRecentRecords: () => Promise<void>;

  // 统计
  monthSummary: MonthSummary | null;
  categoryStats: CategoryStatsResponse | null;
  trendStats: MonthTrend[];
  fetchMonthSummary: () => Promise<void>;
  fetchCategoryStats: () => Promise<void>;
  fetchTrendStats: () => Promise<void>;

  // 加载状态
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const now = new Date();

export const useStore = create<AppState>((set, get) => ({
  // 主题
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  // 当前日期
  currentYear: now.getFullYear(),
  currentMonth: now.getMonth() + 1,
  setCurrentDate: (year, month) => {
    set({ currentYear: year, currentMonth: month });
  },

  // 分类
  categories: [],
  fetchCategories: async (type) => {
    try {
      const categories = await GetCategories(type || '');
      set({ categories: (categories || []) as unknown as Category[] });
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  },

  // 记录
  records: [],
  recentRecords: [],
  fetchRecords: async () => {
    const { currentYear, currentMonth } = get();
    try {
      const records = await GetRecordsByMonth(currentYear, currentMonth);
      set({ records: (records || []) as unknown as Record[] });
    } catch (error) {
      console.error('获取记录失败:', error);
    }
  },
  fetchRecentRecords: async () => {
    try {
      const records = await GetRecentRecords(5);
      set({ recentRecords: (records || []) as unknown as Record[] });
    } catch (error) {
      console.error('获取最近记录失败:', error);
    }
  },

  // 统计
  monthSummary: null,
  categoryStats: null,
  trendStats: [],
  fetchMonthSummary: async () => {
    const { currentYear, currentMonth } = get();
    try {
      const summary = await GetMonthSummary(currentYear, currentMonth);
      set({ monthSummary: summary as unknown as MonthSummary });
    } catch (error) {
      console.error('获取月度汇总失败:', error);
    }
  },
  fetchCategoryStats: async () => {
    const { currentYear, currentMonth } = get();
    try {
      const stats = await GetCategoryStats(currentYear, currentMonth);
      set({ categoryStats: stats as unknown as CategoryStatsResponse });
    } catch (error) {
      console.error('获取分类统计失败:', error);
    }
  },
  fetchTrendStats: async () => {
    const { currentYear } = get();
    try {
      const trends = await GetTrendStats(currentYear);
      set({ trendStats: (trends || []) as unknown as MonthTrend[] });
    } catch (error) {
      console.error('获取趋势统计失败:', error);
    }
  },

  // 加载状态
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
