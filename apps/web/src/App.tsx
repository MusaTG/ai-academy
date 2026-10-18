import { useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { ToastHost } from './components/common';
import { Layout } from './components/Layout';
import { loadContent, type Content } from './lib/content';
import { requestPersistence } from './lib/db';
import { usePrefs, useApplyPrefs } from './lib/prefs';
import { loadStore } from './lib/store';
import { startSync } from './lib/sync';
import { Careers } from './pages/Careers';
import { CodeHub } from './pages/CodeHub';
import { Coverage } from './pages/Coverage';
import { Dashboard } from './pages/Dashboard';
import { DataProtection } from './pages/DataProtection';
import { GraphPage } from './pages/GraphPage';
import { Industry } from './pages/Industry';
import { ItemPage } from './pages/ItemPage';
import { MetricsLab } from './pages/MetricsLab';
import { NotesPage } from './pages/Notes';
import { OfflineCenter } from './pages/OfflineCenter';
import { Paths } from './pages/Paths';
import { Research } from './pages/Research';
import { SearchPage } from './pages/Search';
import { Settings } from './pages/Settings';

function Themed({ children }: { children: React.ReactNode }) {
  useApplyPrefs(usePrefs());
  return <>{children}</>;
}

export function App() {
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let started = false;
    (async () => {
      try {
        await loadStore();
        setContent(await loadContent());
        if (!started) { started = true; startSync(); void requestPersistence(); }
      } catch (e: any) {
        setError(e.message || String(e));
      }
    })();
  }, []);

  if (error) return <div className="content"><h1>Açılamadı</h1><p>{error}</p><button className="btn" onClick={() => location.reload()}>Tekrar dene</button></div>;
  if (!content) return <div className="content muted" aria-busy="true">Yükleniyor…</div>;

  return (
    <HashRouter>
      <Themed>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/industry" element={<Industry />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/item/:id" element={<ItemPage />} />
            <Route path="/paths" element={<Paths />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/notes/:id" element={<NotesPage />} />
            <Route path="/code" element={<CodeHub />} />
            <Route path="/metrics" element={<MetricsLab />} />
            <Route path="/research" element={<Research />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/offline" element={<OfflineCenter />} />
            <Route path="/data" element={<DataProtection />} />
            <Route path="/coverage" element={<Coverage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<div><h1>Sayfa bulunamadı</h1></div>} />
          </Routes>
        </Layout>
        <ToastHost />
      </Themed>
    </HashRouter>
  );
}
