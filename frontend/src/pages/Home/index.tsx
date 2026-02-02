import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../../stores/useStore';
import { RecordList } from '../../components/RecordList';
import { CategoryPieChart } from '../../components/Charts';
import { AddRecordModal } from '../../components/AddRecordModal';
import styles from './Home.module.css';

export function Home() {
  const {
    currentYear,
    currentMonth,
    monthSummary,
    categoryStats,
    recentRecords,
    fetchMonthSummary,
    fetchCategoryStats,
    fetchRecentRecords,
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMonthSummary();
    fetchCategoryStats();
    fetchRecentRecords();
  }, [currentYear, currentMonth]);

  const refreshData = () => {
    fetchMonthSummary();
    fetchCategoryStats();
    fetchRecentRecords();
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{currentYear}年{currentMonth}月</h1>
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          记一笔
        </button>
      </header>

      <div className={styles.summaryCards}>
        <div className={`${styles.summaryCard} ${styles.income}`}>
          <span className={styles.label}>收入</span>
          <span className={styles.value}>¥{monthSummary?.totalIncome.toFixed(2) || '0.00'}</span>
        </div>
        <div className={`${styles.summaryCard} ${styles.expense}`}>
          <span className={styles.label}>支出</span>
          <span className={styles.value}>¥{monthSummary?.totalExpense.toFixed(2) || '0.00'}</span>
        </div>
        <div className={`${styles.summaryCard} ${styles.balance}`}>
          <span className={styles.label}>结余</span>
          <span className={styles.value}>¥{monthSummary?.balance.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      <div className={styles.content}>
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
          <h2 className={styles.sectionTitle}>最近记录</h2>
          <RecordList records={recentRecords} showDate={true} />
        </section>
      </div>

      {showAddModal && (
        <AddRecordModal
          onClose={() => setShowAddModal(false)}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}
