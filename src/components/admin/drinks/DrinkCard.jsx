import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DrinkCard({ drink, canEdit, onEdit, onDelete }) {
  return (
    <div
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group"
      style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '0.75rem',
        overflow: 'hidden'
      }}
    >
      <div 
        className="aspect-square bg-zinc-800 relative overflow-hidden"
        style={{
          aspectRatio: '1/1',
          backgroundColor: '#27272a',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <img
          src={drink.imagem_url}
          alt={drink.nome}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = '/placeholder.svg';
          }}
        />
        {drink.destacar_home && (
          <span 
            className="absolute top-2 right-2 px-2 py-1 text-xs bg-amber-500 text-black rounded-full font-medium"
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              backgroundColor: '#f59e0b',
              color: 'black',
              borderRadius: '9999px',
              fontWeight: 500
            }}
          >
            Destaque
          </span>
        )}
      </div>
      <div 
        className="p-4"
        style={{ padding: '1rem' }}
      >
        <h3 
          className="font-semibold text-white truncate"
          style={{ fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, fontSize: '1rem' }}
        >
          {drink.nome}
        </h3>
        <p 
          className="text-sm text-zinc-500 capitalize"
          style={{ fontSize: '0.875rem', color: '#71717a', textTransform: 'capitalize', margin: 0 }}
        >
          {drink.categoria.replace(/-/g, ' ')}
        </p>
        {canEdit && (
          <div 
            className="flex gap-2 mt-3"
            style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(drink)}
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              style={{ flex: 1 }}
            >
              <Pencil size={14} className="mr-1" style={{ marginRight: '0.25rem' }} /> Editar
            </Button>
            <Button
              variant="outline"
              onClick={() => onDelete(drink)}
              size="icon"
              className="h-9 w-9 border-zinc-700 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
