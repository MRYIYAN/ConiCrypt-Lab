import { useState, useEffect } from 'react';
import { ConicsPage } from './pages/ConicsPage';
import { ECCPage } from './pages/ECCPage';
import { socketClient } from './lib/socket';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'conics' | 'ecc'>('conics');
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Connect to WebSocket server on mount
    socketClient.connect()
      .then(() => {
        setConnected(true);
        setConnectionError(null);
      })
      .catch((error) => {
        setConnectionError('Failed to connect to WebSocket server. Make sure the backend is running.');
        console.error('Connection error:', error);
      });

    return () => {
      socketClient.disconnect();
    };
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ 
        backgroundColor: '#333', 
        padding: '15px', 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>ConiCrypt Lab</h1>
        <button 
          onClick={() => setCurrentPage('conics')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentPage === 'conics' ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Conics
        </button>
        <button 
          onClick={() => setCurrentPage('ecc')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentPage === 'ecc' ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          ECC
        </button>
        <div style={{ 
          marginLeft: 'auto',
          padding: '8px 15px',
          backgroundColor: connected ? '#4CAF50' : '#f44336',
          color: 'white',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {connected ? '● Connected' : '○ Disconnected'}
        </div>
      </nav>

      {connectionError && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '15px',
          margin: '20px',
          borderRadius: '4px',
          border: '1px solid #ef9a9a'
        }}>
          {connectionError}
        </div>
      )}

      <main>
        {currentPage === 'conics' ? <ConicsPage /> : <ECCPage />}
      </main>
    </div>
  );
}

export default App;

