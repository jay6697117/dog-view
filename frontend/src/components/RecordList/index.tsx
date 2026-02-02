import { Trash2 } from 'lucide-react';
import type { Record } from '../../types';
import styles from './RecordList.module.css';

interface RecordListProps {
  records: Record[];
  onEdit?: (record: Record) => void;
  onDelete?: (id: number) => void;
  showDate?: boolean;
}

// 按日期分组
function groupByDate(records: Record[]): Map<string, Record[]> {
  const groups = new Map<string, Record[]>();
  for (const record of records) {
    const list = groups.get(record.date) || [];
    list.push(record);
    groups.set(record.date, list);
  }
  return groups;
}

export function RecordList({ records, onEdit, onDelete, showDate = true }: RecordListProps) {
  if (!records || records.length === 0) {
    return (
      <div className={styles.empty}>
        <p>暂无记录</p>
      </div>
    );
  }

  const groups = groupByDate(records);

  return (
    <div className={styles.list}>
      {Array.from(groups.entries()).map(([date, items]) => (
        <div key={date} className={styles.group}>
          {showDate && <div className={styles.dateHeader}>{date}</div>}
          {items.map((record) => (
            <div
              key={record.id}
              className={styles.item}
              onClick={() => onEdit?.(record)}
            >
              <div className={styles.left}>
                <span className={styles.icon}>{record.category?.icon}</span>
                <div className={styles.info}>
                  <span className={styles.category}>{record.category?.name}</span>
                  {record.note && <span className={styles.note}>{record.note}</span>}
                </div>
              </div>
              <div className={styles.right}>
                <span
                  className={`${styles.amount} ${
                    record.type === 'income' ? styles.income : styles.expense
                  }`}
                >
                  {record.type === 'income' ? '+' : '-'}¥{record.amount.toFixed(2)}
                </span>
                {onDelete && (
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(record.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
