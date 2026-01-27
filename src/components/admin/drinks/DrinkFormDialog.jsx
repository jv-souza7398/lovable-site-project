import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DrinkForm from './DrinkForm';

export default function DrinkFormDialog({ 
  open, 
  onOpenChange, 
  drink, 
  onSave, 
  isLoading 
}) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {drink ? 'Editar Drink' : 'Novo Drink'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Preencha as informações do drink abaixo
          </DialogDescription>
        </DialogHeader>
        <DrinkForm
          drink={drink}
          onSave={onSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
