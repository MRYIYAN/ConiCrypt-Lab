import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <div style={{
      padding: 'var(--spacing-xl)',
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-lg)',
        color: 'var(--text-primary)',
      }}>
        Welcome to ConiCrypt Lab
      </h1>
      
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--spacing-lg)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: 'var(--spacing-md)',
          color: 'var(--text-primary)',
        }}>
          About
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 'var(--spacing-md)',
        }}>
          ConiCrypt Lab is a desktop application that connects conic sections and quadratic forms 
          with elliptic curve cryptography (ECC). Built with modern technologies including Tauri, 
          React, Three.js, and a high-performance C computation engine.
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--spacing-lg)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: 'var(--spacing-md)',
          color: 'var(--text-primary)',
        }}>
          Features
        </h2>
        <ul style={{
          color: 'var(--text-secondary)',
          lineHeight: 1.8,
          paddingLeft: 'var(--spacing-lg)',
        }}>
          <li>
            <strong>Conic Sections:</strong> Analyze and visualize ellipses, parabolas, hyperbolas, 
            and circles in real-time
          </li>
          <li>
            <strong>ECC Simulation:</strong> Perform elliptic curve point operations over finite fields
          </li>
          <li>
            <strong>Real-time Computation:</strong> C-based engine connected via WebSocket for instant results
          </li>
          <li>
            <strong>3D Visualization:</strong> Interactive Three.js graphics for exploring mathematical structures
          </li>
        </ul>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: 'var(--spacing-md)',
          color: 'var(--text-primary)',
        }}>
          Getting Started
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 'var(--spacing-sm)',
        }}>
          Use the sidebar to navigate between different modules:
        </p>
        <ul style={{
          color: 'var(--text-secondary)',
          lineHeight: 1.8,
          paddingLeft: 'var(--spacing-lg)',
        }}>
          <li><strong>Conic Sections:</strong> Explore the discriminant and classification of conics</li>
          <li><strong>ECC Simulation:</strong> Experiment with elliptic curve point multiplication</li>
        </ul>
      </div>
    </div>
  );
};
