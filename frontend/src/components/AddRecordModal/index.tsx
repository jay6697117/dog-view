import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import dayjs from 'dayjs';
import { useStore } from '../../stores/useStore';
import { CategoryCard } from '../CategoryCard';
import { AmountInput } from '../AmountInput';
import { CreateCategoryModal } from '../CreateCategoryModal';
import { CreateRecord } from '../../../wailsjs/go/main/App';
import type { RecordType, Category } from '../../types';
import styles from './AddRecordModal.module.css';

interface AddRecordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'type' | 'category' | 'amount';

export function AddRecordModal({ onClose, onSuccess }: AddRecordModalProps) {
  const { categories, fetchCategories } = useStore();

  const [step, setStep] = useState<Step>('type');
  const [recordType, setRecordType] = useState<RecordType>('expense');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCategories(recordType);
  }, [recordType]);

  const handleSelectType = (type: RecordType) => {
    setRecordType(type);
    setSelectedCategory(null);
    setStep('category');
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setStep('amount');
  };

  const handleConfirm = async () => {
    if (!selectedCategory || !amount) return;

    setLoading(true);
    try {
      await CreateRecord(
        parseFloat(amount),
        recordType,
        selectedCategory.id,
        note,
        date
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error('创建记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'amount') {
      setStep('category');
    } else if (step === 'category') {
      setStep('type');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
          <h2>
            {step === 'type' && '选择类型'}
            {step === 'category' && '选择分类'}
            {step === 'amount' && '输入金额'}
          </h2>
          {step !== 'type' && (
            <button className={styles.backBtn} onClick={handleBack}>
              返回
            </button>
          )}
        </header>

        <div className={styles.content}>
          {step === 'type' && (
            <div className={styles.typeSelector}>
              <button
                className={`${styles.typeBtn} ${styles.expense}`}
                onClick={() => handleSelectType('expense')}
              >
                支出
              </button>
              <button
                className={`${styles.typeBtn} ${styles.income}`}
                onClick={() => handleSelectType('income')}
              >
                收入
              </button>
            </div>
          )}

          {step === 'category' && (
            <div className={styles.categoryGrid}>
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  selected={selectedCategory?.id === category.id}
                  onClick={() => handleSelectCategory(category)}
                />
              ))}
              {/* 新建分类按钮 */}
              <button
                className={styles.addCategoryBtn}
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={24} />
                <span>新建</span>
              </button>
            </div>
          )}

          {/* 新建分类弹窗 */}
          {showCreateModal && (
            <CreateCategoryModal
              type={recordType}
              onClose={() => setShowCreateModal(false)}
              onSuccess={() => {
                fetchCategories(recordType);
                setShowCreateModal(false);
              }}
            />
          )}

          {step === 'amount' && (
            <div className={styles.amountStep}>
              <div className={styles.selectedCategory}>
                <span className={styles.categoryIcon}>{selectedCategory?.icon}</span>
                <span className={styles.categoryName}>{selectedCategory?.name}</span>
              </div>

              <AmountInput
                value={amount}
                onChange={setAmount}
                onConfirm={handleConfirm}
                type={recordType}
              />

              <div className={styles.formGroup}>
                <label>备注（可选）</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="添加备注..."
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={styles.input}
                />
              </div>

              <button
                className={styles.confirmBtn}
                onClick={handleConfirm}
                disabled={!amount || loading}
              >
                {loading ? '保存中...' : '确认记账'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
