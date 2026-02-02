import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { CategoryStat } from '../../types';

interface CategoryPieChartProps {
  data: CategoryStat[];
  type: 'income' | 'expense';
}

const COLORS = [
  '#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0',
  '#00bcd4', '#ffeb3b', '#795548', '#607d8b', '#e91e63',
];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
        暂无数据
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="categoryName"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          label={({ name, percent }: { name?: string; percent?: number }) =>
            `${name || ''} ${((percent || 0) * 100).toFixed(1)}%`
          }
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `¥${Number(value).toFixed(2)}`}
          contentStyle={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fill: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}
        >
          ¥{total.toFixed(0)}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}
