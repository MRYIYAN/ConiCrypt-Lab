import React from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { ConnectionStatus } from './components/feedback/ConnectionStatus';
import { LogConsole } from './components/feedback/LogConsole';
import { HomePage } from './pages/HomePage';
import { ConicsPage } from './pages/ConicsPage';
import { ECCPage } from './pages/ECCPage';
import { useAppStore } from './state/useAppStore';

export const App: React.FC = () => {
  const { currentPage } = useAppStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'conics':
        return <ConicsPage />;
      case 'ecc':
        return <ECCPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
    }}>
      <Header />
      
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        <Sidebar />
        
        <main style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: 'var(--bg-primary)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: 'var(--spacing-md)',
            right: 'var(--spacing-md)',
            zIndex: 100,
          }}>
            <ConnectionStatus />
          </div>
          
          {renderPage()}
        </main>
      </div>
      
      <Footer />
      <LogConsole />
    </div>
  );
};
