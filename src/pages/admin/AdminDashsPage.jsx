import React from 'react';
import { Construction, BarChart3 } from 'lucide-react';

export default function AdminDashsPage() {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '0 1rem'
      }}
    >
      <div 
        className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6"
        style={{
          width: '6rem',
          height: '6rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}
      >
        <Construction className="w-12 h-12 text-amber-500" style={{ width: '3rem', height: '3rem', color: '#f59e0b' }} />
      </div>
      
      <h1 
        className="text-2xl font-bold text-white mb-3"
        style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem', margin: '0 0 0.75rem 0' }}
      >
        Esta seção está em construção
      </h1>
      
      <p 
        className="text-zinc-400 max-w-md mb-8"
        style={{ color: '#a1a1aa', maxWidth: '28rem', marginBottom: '2rem', fontSize: '1rem', margin: '0 0 2rem 0' }}
      >
        Em breve você terá acesso aos dashboards e relatórios do sistema, 
        com métricas detalhadas sobre vendas, drinks mais populares e muito mais.
      </p>

      <div 
        className="flex items-center gap-2 text-zinc-500 text-sm"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#71717a', fontSize: '0.875rem' }}
      >
        <BarChart3 className="w-4 h-4" style={{ width: '1rem', height: '1rem' }} />
        <span>Dashboards • Relatórios • Analytics</span>
      </div>
    </div>
  );
}
