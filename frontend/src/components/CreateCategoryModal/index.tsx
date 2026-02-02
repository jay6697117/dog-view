import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { CreateCategory } from '../../../wailsjs/go/main/App';
import type { RecordType } from '../../types';
import styles from './CreateCategoryModal.module.css';

// 常用 emoji 列表
const EMOJI_LIST = [
  '🍜', '🍔', '🍕', '🥗', '☕', '🍦', '🎂', '🍿',
  '🚗', '🚇', '🚌', '🚕', '✈️', '🚲', '⛽', '🚁',
  '🛒', '👕', '👟', '💄', '💍', '🎁', '📱', '💻',
  '🎮', '🎬', '🎵', '📚', '🎨', '🏃', '⚽', '🎳',
  '🏠', '🔧', '💡', '🛋️', '🧹', '🌱', '🐕', '🐱',
  '💊', '🏥', '💉', '🩺', '🧘', '💪', '🧠', '❤️',
  '💰', '💵', '💳', '📈', '🏦', '💹', '🎯', '🏆',
  '📦', '✏️', '📝', '🔒', '⭐', '🌟', '💎', '🎪',
];

interface CreateCategoryModalProps {
  type: RecordType;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCategoryModal({ type, onClose, onSuccess }: CreateCategoryModalProps) {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📦');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('请输入分类名称');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await CreateCategory(name.trim(), selectedEmoji, type);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
          <h2>新建{type === 'expense' ? '支出' : '收入'}分类</h2>
          <div style={{ width: 36 }} />
        </header>

        <div className={styles.content}>
          {/* 预览 */}
          <div className={styles.preview}>
            <span className={styles.previewIcon}>{selectedEmoji}</span>
            <span className={styles.previewName}>{name || '分类名称'}</span>
          </div>

          {/* 名称输入 */}
          <div className={styles.formGroup}>
            <label>分类名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：餐饮、交通..."
              className={styles.input}
              maxLength={10}
              autoFocus
            />
          </div>

          {/* Emoji 选择 */}
          <div className={styles.formGroup}>
            <label>选择图标</label>
            <div className={styles.emojiGrid}>
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  className={`${styles.emojiBtn} ${selectedEmoji === emoji ? styles.selected : ''}`}
                  onClick={() => setSelectedEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
          >
            {loading ? '创建中...' : '确认创建'}
          </button>
        </div>
      </div>
    </div>
  );
}
