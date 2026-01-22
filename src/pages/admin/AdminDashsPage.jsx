import React from 'react';
import { Construction, BarChart3 } from 'lucide-react';

export default function AdminDashsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
        <Construction className="w-12 h-12 text-amber-500" />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-3">
        Esta seção está em construção
      </h1>
      
      <p className="text-zinc-400 max-w-md mb-8">
        Em breve você terá acesso aos dashboards e relatórios do sistema, 
        com métricas detalhadas sobre vendas, drinks mais populares e muito mais.
      </p>

      <div className="flex items-center gap-2 text-zinc-500 text-sm">
        <BarChart3 className="w-4 h-4" />
        <span>Dashboards • Relatórios • Analytics</span>
      </div>
    </div>
  );
}