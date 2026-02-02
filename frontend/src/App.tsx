import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Records } from './pages/Records';
import { Analysis } from './pages/Analysis';
import { Settings } from './pages/Settings';
import { useStore } from './stores/useStore';

function App() {
  const { theme, setTheme } = useStore();

  useEffect(() => {
    // 初始化主题
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    document.documentElement.setAttribute('data-theme', savedTheme || 'light');
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="records" element={<Records />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
