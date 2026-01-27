import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Wine, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';
import SimpleModal from '@/components/admin/drinks/SimpleModal';
import SimpleConfirmDialog from '@/components/admin/drinks/SimpleConfirmDialog';
import DrinkFormNew from '@/components/admin/drinks/DrinkFormNew';

/**
 * Página de gerenciamento de drinks reconstruída do zero.
 * Usa componentes simples com Portal para garantir funcionamento dos modais.
 */

const normalizeText = (value) => {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const getCategoryLabel = (categoria) => {
  const labels = {
    'drinks-sem-alcool': 'Clássicos Vincci',
    'drinks-padrao': 'Festival de Caipirinhas',
    'sublime': 'Sublime',
  };
  return labels[categoria] || categoria?.replace(/-/g, ' ') || 'Sem categoria';
};

export default function AdminDrinksPage() {
  const { canEdit, admin } = useAdminAuth();
  
  // States
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState(null);
  const [deletingDrink, setDeletingDrink] = useState(null);

  // Fetch drinks
  const fetchDrinks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drinks')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Fetch error:', error);
        toast.error('Erro ao carregar drinks');
        return;
      }

      const normalized = (data || []).map((d) => ({
        ...d,
        caracteristicas: normalizeArray(d.caracteristicas),
        ingredientes: normalizeArray(d.ingredientes),
      }));

      setDrinks(normalized);
    } catch (err) {
      console.error('Fetch exception:', err);
      toast.error('Erro ao carregar drinks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrinks();
  }, [fetchDrinks]);

  // Handle save (create/update)
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

      const action = editingDrink ? 'update' : 'create';
      const body = {
        action,
        adminId,
        drinkData: formData,
        ...(editingDrink && { drinkId: editingDrink.id }),
      };

      const { data, error } = await supabase.functions.invoke('admin-drinks', { body });

      if (error || !data?.success) {
        toast.error(data?.error || `Erro ao ${editingDrink ? 'atualizar' : 'criar'} drink`);
        console.error('Save error:', error || data?.error);
      } else {
        toast.success(`Drink ${editingDrink ? 'atualizado' : 'criado'} com sucesso!`);
        setIsFormOpen(false);
        setEditingDrink(null);
        fetchDrinks();
      }
    } catch (err) {
      console.error('Save exception:', err);
      toast.error('Erro ao salvar drink');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingDrink) return;

    try {
      const adminSession = JSON.parse(localStorage.getItem('vincci_admin_session') || '{}');
      const adminId = adminSession?.admin?.id;

      if (!adminId) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-drinks', {
        body: {
          action: 'delete',
          adminId,
          drinkId: deletingDrink.id,
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
      console.error('Delete exception:', err);
      toast.error('Erro ao excluir drink');
    }
  };

  // Open create modal
  const handleOpenCreate = () => {
    setEditingDrink(null);
    setIsFormOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (drink) => {
    setEditingDrink(drink);
    setIsFormOpen(true);
  };

  // Close form modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDrink(null);
  };

  // Filter drinks
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'white',
              margin: 0,
            }}
          >
            Gerenciamento de Drinks
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#a1a1aa',
              margin: '0.25rem 0 0 0',
            }}
          >
            {drinks.length} drink{drinks.length !== 1 ? 's' : ''} cadastrado{drinks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={handleOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              backgroundColor: '#f59e0b',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'black',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d97706'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f59e0b'; }}
          >
            <Plus size={18} />
            Novo Drink
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '28rem' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#71717a',
          }}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar drinks..."
          style={{
            width: '100%',
            padding: '0.625rem 0.75rem 0.625rem 2.5rem',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '0.5rem',
            color: 'white',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5rem 0',
          }}
        >
          <Loader2
            size={32}
            style={{ color: '#f59e0b', animation: 'spin 1s linear infinite' }}
          />
        </div>
      ) : filteredDrinks.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5rem 0',
            textAlign: 'center',
          }}
        >
          <Wine size={64} style={{ color: '#3f3f46', marginBottom: '1rem' }} />
          <p style={{ color: '#a1a1aa', margin: '0 0 1rem 0' }}>
            {searchTerm ? 'Nenhum drink encontrado' : 'Nenhum drink cadastrado'}
          </p>
          {canEdit && !searchTerm && (
            <button
              type="button"
              onClick={handleOpenCreate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                backgroundColor: '#f59e0b',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'black',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Plus size={18} />
              Criar primeiro drink
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredDrinks.map((drink) => (
            <div
              key={drink.id}
              style={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#27272a'; }}
            >
              {/* Image */}
              <div
                style={{
                  width: '100%',
                  height: '160px',
                  backgroundColor: '#27272a',
                  overflow: 'hidden',
                }}
              >
                {drink.imagem_url ? (
                  <img
                    src={drink.imagem_url}
                    alt={drink.nome}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Wine size={40} style={{ color: '#3f3f46' }} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'white',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {drink.nome}
                    </h3>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.5rem',
                        marginTop: '0.375rem',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontWeight: 'normal',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      {getCategoryLabel(drink.categoria)}
                    </span>
                  </div>

                  {drink.destacar_home && (
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.375rem',
                        borderRadius: '0.25rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Destaque
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#71717a',
                    margin: '0.75rem 0 0 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4,
                  }}
                >
                  {drink.descricao}
                </p>

                {/* Actions */}
                {canEdit && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #27272a',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(drink)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#27272a',
                        border: '1px solid #3f3f46',
                        borderRadius: '0.375rem',
                        color: '#d4d4d8',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#3f3f46';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#27272a';
                        e.currentTarget.style.color = '#d4d4d8';
                      }}
                    >
                      <Pencil size={14} />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingDrink(drink)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '2.25rem',
                        height: '2.25rem',
                        backgroundColor: 'transparent',
                        border: '1px solid #3f3f46',
                        borderRadius: '0.375rem',
                        color: '#71717a',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.borderColor = '#ef4444';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = '#3f3f46';
                        e.currentTarget.style.color = '#71717a';
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <SimpleModal
        open={isFormOpen}
        onClose={handleCloseForm}
        title={editingDrink ? 'Editar Drink' : 'Novo Drink'}
        description="Preencha as informações do drink abaixo"
      >
        <DrinkFormNew
          drink={editingDrink}
          onSave={handleSave}
          onCancel={handleCloseForm}
          isLoading={saving}
        />
      </SimpleModal>

      {/* Delete Confirmation */}
      <SimpleConfirmDialog
        open={!!deletingDrink}
        onClose={() => setDeletingDrink(null)}
        onConfirm={handleDelete}
        title="Excluir Drink"
        description={`Tem certeza que deseja excluir "${deletingDrink?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
