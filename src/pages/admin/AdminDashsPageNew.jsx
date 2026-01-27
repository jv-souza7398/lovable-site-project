import React from 'react';
import { Construction } from 'lucide-react';

/**
 * Dashboard em construção - placeholder limpo.
 */
export default function AdminDashsPageNew() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      {/* Icon Container */}
      <div
        style={{
          width: '6rem',
          height: '6rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <Construction size={40} style={{ color: '#f59e0b' }} />
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'white',
          margin: '0 0 0.5rem 0',
        }}
      >
        Dashboard em Construção
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '1rem',
          color: '#a1a1aa',
          margin: 0,
          maxWidth: '28rem',
          lineHeight: 1.5,
        }}
      >
        Em breve você terá acesso a relatórios e estatísticas do sistema.
        Estamos trabalhando para trazer análises detalhadas de vendas, 
        drinks mais populares e muito mais.
      </p>

      {/* Decorative elements */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '2rem',
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '9999px',
              backgroundColor: i === 2 ? '#f59e0b' : '#3f3f46',
            }}
          />
        ))}
      </div>
    </div>
  );
}
