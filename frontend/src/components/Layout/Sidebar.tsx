import { NavLink } from 'react-router-dom';
import { Home, List, BarChart3, Settings, Moon, Sun } from 'lucide-react';
import { useStore } from '../../stores/useStore';
import styles from './Layout.module.css';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/records', icon: List, label: '记录' },
  { path: '/analysis', icon: BarChart3, label: '分析' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export function Sidebar() {
  const { theme, toggleTheme } = useStore();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span>Dog View</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.themeToggle}>
        <button onClick={toggleTheme} className={styles.themeBtn}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span>{theme === 'light' ? '深色模式' : '浅色模式'}</span>
        </button>
      </div>
    </aside>
  );
}
