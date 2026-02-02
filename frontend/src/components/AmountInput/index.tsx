import { useRef, useEffect } from 'react';
import styles from './AmountInput.module.css';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  type: 'income' | 'expense';
}

export function AmountInput({ value, onChange, onConfirm, type }: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // 只允许数字和一个小数点，最多两位小数
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      onChange(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value) {
      onConfirm();
    }
  };

  return (
    <div className={styles.container}>
      <span className={`${styles.symbol} ${type === 'income' ? styles.income : styles.expense}`}>
        {type === 'income' ? '+' : '-'} ¥
      </span>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        className={styles.input}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="0.00"
      />
    </div>
  );
}
