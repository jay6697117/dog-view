import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MonthTrend } from '../../types';

interface TrendLineChartProps {
  data: MonthTrend[];
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
        暂无数据
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    month: item.month.slice(5), // "2024-01" -> "01"
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="month" stroke="var(--text-secondary)" />
        <YAxis stroke="var(--text-secondary)" />
        <Tooltip
          formatter={(value) => `¥${Number(value).toFixed(2)}`}
          contentStyle={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          name="收入"
          stroke="var(--income-color)"
          strokeWidth={2}
          dot={{ fill: 'var(--income-color)' }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          name="支出"
          stroke="var(--expense-color)"
          strokeWidth={2}
          dot={{ fill: 'var(--expense-color)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
