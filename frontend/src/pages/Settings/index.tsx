import { Download, Upload } from 'lucide-react';
import { useStore } from '../../stores/useStore';
import { ExportToCSV, ExportToJSON, ImportFromCSV, ImportFromJSON } from '../../../wailsjs/go/main/App';
import styles from './Settings.module.css';

export function Settings() {
  const { theme, toggleTheme } = useStore();

  const handleExportCSV = async () => {
    try {
      const filePath = await ExportToCSV();
      if (filePath) {
        alert(`导出成功: ${filePath}`);
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败');
    }
  };

  const handleExportJSON = async () => {
    try {
      const filePath = await ExportToJSON();
      if (filePath) {
        alert(`导出成功: ${filePath}`);
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败');
    }
  };

  const handleImportCSV = async () => {
    try {
      const count = await ImportFromCSV();
      alert(`成功导入 ${count} 条记录`);
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败');
    }
  };

  const handleImportJSON = async () => {
    try {
      const count = await ImportFromJSON();
      alert(`成功导入 ${count} 条记录`);
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败');
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>设置</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>外观</h2>
        <div className={styles.card}>
          <div className={styles.settingRow}>
            <div>
              <span className={styles.settingLabel}>主题模式</span>
              <span className={styles.settingDesc}>切换浅色/深色主题</span>
            </div>
            <button className={styles.toggleBtn} onClick={toggleTheme}>
              {theme === 'light' ? '浅色' : '深色'}
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>数据管理</h2>
        <div className={styles.card}>
          <div className={styles.settingRow}>
            <div>
              <span className={styles.settingLabel}>导出数据</span>
              <span className={styles.settingDesc}>将所有记录导出为文件</span>
            </div>
            <div className={styles.btnGroup}>
              <button className={styles.actionBtn} onClick={handleExportCSV}>
                <Download size={16} />
                CSV
              </button>
              <button className={styles.actionBtn} onClick={handleExportJSON}>
                <Download size={16} />
                JSON
              </button>
            </div>
          </div>

          <div className={styles.settingRow}>
            <div>
              <span className={styles.settingLabel}>导入数据</span>
              <span className={styles.settingDesc}>从文件导入记录</span>
            </div>
            <div className={styles.btnGroup}>
              <button className={styles.actionBtn} onClick={handleImportCSV}>
                <Upload size={16} />
                CSV
              </button>
              <button className={styles.actionBtn} onClick={handleImportJSON}>
                <Upload size={16} />
                JSON
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>关于</h2>
        <div className={styles.card}>
          <div className={styles.about}>
            <p><strong>Dog View</strong></p>
            <p>个人收支记账工具</p>
            <p className={styles.version}>版本 1.0.0</p>
          </div>
        </div>
      </section>
    </div>
  );
}
