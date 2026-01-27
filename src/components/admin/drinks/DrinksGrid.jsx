import React from 'react';
import { Loader2, Wine, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DrinkCard from './DrinkCard';

export default function DrinksGrid({ 
  drinks, 
  loading, 
  searchTerm, 
  canEdit, 
  onEdit, 
  onDelete, 
  onCreateFirst 
}) {
  if (loading) {
    return (
      <div 
        className="flex items-center justify-center py-20"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" style={{ width: '2rem', height: '2rem', color: '#f59e0b' }} />
      </div>
    );
  }

  if (drinks.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-20 text-center"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', textAlign: 'center' }}
      >
        <Wine className="w-16 h-16 text-zinc-700 mb-4" style={{ width: '4rem', height: '4rem', color: '#3f3f46', marginBottom: '1rem' }} />
        <p className="text-zinc-400 mb-4" style={{ color: '#a1a1aa', marginBottom: '1rem', fontSize: '1rem' }}>
          {searchTerm ? 'Nenhum drink encontrado' : 'Nenhum drink cadastrado'}
        </p>
        {canEdit && !searchTerm && (
          <Button
            onClick={onCreateFirst}
            className="bg-amber-500 hover:bg-amber-600 text-black"
            style={{ backgroundColor: '#f59e0b', color: 'black' }}
          >
            <Plus size={18} className="mr-2" style={{ marginRight: '0.5rem' }} /> Criar primeiro drink
          </Button>
        )}
      </div>
    );
  }

  return (
    <div 
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      style={{ 
        display: 'grid', 
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
      }}
    >
      {drinks.map((drink) => (
        <DrinkCard
          key={drink.id}
          drink={drink}
          canEdit={canEdit}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
