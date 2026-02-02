import type { Category } from '../../types';
import styles from './CategoryCard.module.css';

interface CategoryCardProps {
  category: Category;
  selected?: boolean;
  onClick: () => void;
}

export function CategoryCard({ category, selected, onClick }: CategoryCardProps) {
  return (
    <button
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <span className={styles.icon}>{category.icon}</span>
      <span className={styles.name}>{category.name}</span>
    </button>
  );
}
