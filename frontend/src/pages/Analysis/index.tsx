import { useEffect } from 'react';
import { useStore } from '../../stores/useStore';
import { CategoryPieChart, TrendLineChart } from '../../components/Charts';
import styles from './Analysis.module.css';

export function Analysis() {
  const {
    currentYear,
    categoryStats,
    trendStats,
    fetchCategoryStats,
    fetchTrendStats,
  } = useStore();

  useEffect(() => {
    fetchCategoryStats();
    fetchTrendStats();
  }, [currentYear]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{currentYear}年度分析</h1>

      <div className={styles.grid}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>支出分类</h2>
          <div className={styles.chartCard}>
            <CategoryPieChart
              data={categoryStats?.expenseStats || []}
              type="expense"
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>收入分类</h2>
          <div className={styles.chartCard}>
            <CategoryPieChart
              data={categoryStats?.incomeStats || []}
              type="income"
            />
          </div>
        </section>

        <section className={`${styles.section} ${styles.full}`}>
          <h2 className={styles.sectionTitle}>月度趋势</h2>
          <div className={styles.chartCard}>
            <TrendLineChart data={trendStats} />
          </div>
        </section>
      </div>
    </div>
  );
}
