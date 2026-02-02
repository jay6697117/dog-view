import { useEffect, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../stores/useStore';
import { RecordList } from '../../components/RecordList';
import { AddRecordModal } from '../../components/AddRecordModal';
import { DeleteRecord } from '../../../wailsjs/go/main/App';
import styles from './Records.module.css';

export function Records() {
  const {
    currentYear,
    currentMonth,
    setCurrentDate,
    records,
    fetchRecords,
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentDate(currentYear - 1, 12);
    } else {
      setCurrentDate(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentDate(currentYear + 1, 1);
    } else {
      setCurrentDate(currentYear, currentMonth + 1);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      await DeleteRecord(id);
      fetchRecords();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.monthSelector}>
          <button className={styles.navBtn} onClick={handlePrevMonth}>
            <ChevronLeft size={20} />
          </button>
          <span className={styles.currentMonth}>
            {currentYear}年{currentMonth}月
          </span>
          <button className={styles.navBtn} onClick={handleNextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          记一笔
        </button>
      </header>

      <div className={styles.content}>
        <RecordList
          records={records}
          onDelete={handleDelete}
        />
      </div>

      {showAddModal && (
        <AddRecordModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchRecords}
        />
      )}
    </div>
  );
}
