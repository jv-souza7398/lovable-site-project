import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  DrinksGrid, 
  DrinkFormDialog, 
  DeleteDrinkDialog 
} from '@/components/admin/drinks';

const normalizeText = (value) => {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const safeJsonParse = (value) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeIngredients = (value) => {
  const parsed = safeJsonParse(value);
  if (Array.isArray(parsed)) return parsed.filter(Boolean).map((v) => String(v));
  return [];
};

const normalizeCharacteristics = (value) => {
  const parsed = safeJsonParse(value);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(Boolean)
    .map((c) => ({
      nome: String(c?.nome ?? ''),
      nivel: Number.isFinite(Number(c?.nivel)) ? Number(c.nivel) : 3,
    }));
};

export default function AdminDrinksPage() {
  const { canEdit } = useAdminAuth();
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDrinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drinks')
        .select('*')
        .order('nome');

      if (error) {
        toast.error('Erro ao carregar drinks');
        console.error('[AdminDrinksPage] fetch error:', error);
      } else {
        setDrinks(
          (data || []).map((d) => ({
            ...d,
            caracteristicas: normalizeCharacteristics(d.caracteristicas),
            ingredientes: normalizeIngredients(d.ingredientes),
          }))
        );
      }
    } catch (err) {
      console.error('[AdminDrinksPage] fetch exception:', err);
      toast.error('Erro ao carregar drinks');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrinks();
  }, []);

  const handleSave = async (formData) => {
    setSaving(true);

    try {
      const adminSession = JSON.parse(localStorage.getItem('vincci_admin_session') || '{}');
      const adminId = adminSession?.admin?.id;

      if (!adminId) {
        toast.error('Sessão expirada. Faça login novamente.');
        setSaving(false);
        return;
      }

      if (editingDrink) {
        const { data, error } = await supabase.functions.invoke('admin-drinks', {
          body: {
            action: 'update',
            adminId,
            drinkId: editingDrink.id,
            drinkData: formData,
          },
        });

        if (error || !data?.success) {
          toast.error(data?.error || 'Erro ao atualizar drink');
          console.error('Update error:', error || data?.error);
        } else {
          toast.success('Drink atualizado com sucesso!');
          setIsFormOpen(false);
          setEditingDrink(null);
          fetchDrinks();
        }
      } else {
        const { data, error } = await supabase.functions.invoke('admin-drinks', {
          body: {
            action: 'create',
            adminId,
            drinkData: formData,
          },
        });

        if (error || !data?.success) {
          toast.error(data?.error || 'Erro ao criar drink');
          console.error('Create error:', error || data?.error);
        } else {
          toast.success('Drink criado com sucesso!');
          setIsFormOpen(false);
          fetchDrinks();
        }
      }
    } catch (err) {
      console.error('[AdminDrinksPage] Save exception:', err);
      toast.error('Erro ao salvar drink');
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const adminSession = JSON.parse(localStorage.getItem('vincci_admin_session') || '{}');
      const adminId = adminSession?.admin?.id;

      if (!adminId) {
        toast.error('Sessão expirada. Faça login novamente.');
        setDeleteConfirm(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-drinks', {
        body: {
          action: 'delete',
          adminId,
          drinkId: deleteConfirm.id,
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || 'Erro ao excluir drink');
        console.error('Delete error:', error || data?.error);
      } else {
        toast.success('Drink excluído com sucesso!');
        fetchDrinks();
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Erro ao excluir drink');
    }
    
    setDeleteConfirm(null);
  };

  const handleEdit = (drink) => {
    setEditingDrink(drink);
    setIsFormOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingDrink(null);
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingDrink(null);
    }
  };

  const q = normalizeText(searchTerm);
  const filteredDrinks = q
    ? drinks.filter((drink) => {
        const nome = normalizeText(drink?.nome);
        const categoria = normalizeText(String(drink?.categoria ?? '').replace(/-/g, ' '));
        const descricao = normalizeText(drink?.descricao);
        return nome.includes(q) || categoria.includes(q) || descricao.includes(q);
      })
    : drinks;

  return (
    <div 
      className="space-y-6"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* Header */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div>
          <h1 
            className="text-2xl font-bold text-white"
            style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: 0 }}
          >
            Admin Drinks
          </h1>
          <p 
            className="text-zinc-400 text-sm"
            style={{ color: '#a1a1aa', fontSize: '0.875rem', margin: 0 }}
          >
            Gerencie o catálogo de drinks
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={handleOpenCreate}
            className="bg-amber-500 hover:bg-amber-600 text-black"
            style={{ backgroundColor: '#f59e0b', color: 'black' }}
          >
            <Plus size={18} className="mr-2" style={{ marginRight: '0.5rem' }} /> Novo Drink
          </Button>
        )}
      </div>

      {/* Search */}
      <div 
        className="relative max-w-md"
        style={{ position: 'relative', maxWidth: '28rem' }}
      >
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" 
          style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#71717a' }}
        />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar drinks..."
          className="pl-10 bg-zinc-900 border-zinc-800 text-white"
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      {/* Content Grid */}
      <DrinksGrid
        drinks={filteredDrinks}
        loading={loading}
        searchTerm={searchTerm}
        canEdit={canEdit}
        onEdit={handleEdit}
        onDelete={setDeleteConfirm}
        onCreateFirst={handleOpenCreate}
      />

      {/* Form Dialog */}
      <DrinkFormDialog
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        drink={editingDrink}
        onSave={handleSave}
        isLoading={saving}
      />

      {/* Delete Confirmation */}
      <DeleteDrinkDialog
        drink={deleteConfirm}
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
      />

      {/* CSS for responsive layout */}
      <style>{`
        @media (min-width: 640px) {
          .sm\\:flex-row { flex-direction: row !important; }
          .sm\\:items-center { align-items: center !important; }
          .sm\\:justify-between { justify-content: space-between !important; }
        }
      `}</style>
    </div>
  );
}
