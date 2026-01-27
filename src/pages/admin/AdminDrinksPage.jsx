import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Search, Wine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

const CharacteristicPreview = ({ nivel }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            'w-2 h-2 rounded-full',
            i <= nivel ? 'bg-amber-500' : 'bg-zinc-700'
          )}
        />
      ))}
    </div>
  );
};

const DrinkForm = ({ drink, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    video_url: '',
    imagem_url: '',
    categoria: '',
    caracteristicas: [],
    ingredientes: [],
    destacar_home: false,
  });

  useEffect(() => {
    if (drink) {
      setFormData({
        nome: drink.nome || '',
        descricao: drink.descricao || '',
        video_url: drink.video_url || '',
        imagem_url: drink.imagem_url || '',
        categoria: drink.categoria || '',
        caracteristicas: normalizeCharacteristics(drink.caracteristicas),
        ingredientes: normalizeIngredients(drink.ingredientes),
        destacar_home: drink.destacar_home || false,
      });
    }
  }, [drink]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addCaracteristica = () => {
    setFormData((prev) => ({
      ...prev,
      caracteristicas: [...prev.caracteristicas, { nome: '', nivel: 3 }],
    }));
  };

  const updateCaracteristica = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.caracteristicas];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, caracteristicas: updated };
    });
  };

  const removeCaracteristica = (index) => {
    setFormData((prev) => ({
      ...prev,
      caracteristicas: prev.caracteristicas.filter((_, i) => i !== index),
    }));
  };

  const addIngrediente = () => {
    setFormData((prev) => ({
      ...prev,
      ingredientes: [...prev.ingredientes, ''],
    }));
  };

  const updateIngrediente = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.ingredientes];
      updated[index] = value;
      return { ...prev, ingredientes: updated };
    });
  };

  const removeIngrediente = (index) => {
    setFormData((prev) => ({
      ...prev,
      ingredientes: prev.ingredientes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast.error('O nome do drink é obrigatório');
      return;
    }
    if (!formData.descricao.trim()) {
      toast.error('A descrição é obrigatória');
      return;
    }
    if (!formData.imagem_url.trim()) {
      toast.error('A URL da imagem é obrigatória');
      return;
    }
    if (!formData.categoria) {
      toast.error('Selecione uma categoria');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-zinc-300">Nome do Drink *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Caipirinha"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-zinc-300">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descreva o drink..."
              rows={4}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-zinc-300">Categoria *</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => handleChange('categoria', value)}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="drinks-sem-alcool">Drinks sem Álcool</SelectItem>
                <SelectItem value="drinks-padrao">Drinks Padrões</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="destacar_home"
              checked={formData.destacar_home}
              onCheckedChange={(checked) => handleChange('destacar_home', checked)}
            />
            <Label htmlFor="destacar_home" className="text-zinc-300">
              Destacar na home?
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imagem_url" className="text-zinc-300">URL da Imagem *</Label>
            <Input
              id="imagem_url"
              value={formData.imagem_url}
              onChange={(e) => handleChange('imagem_url', e.target.value)}
              placeholder="https://..."
              className="bg-zinc-800 border-zinc-700 text-white"
            />
            {formData.imagem_url && (
              <div className="mt-2 rounded-lg overflow-hidden w-32 h-32 bg-zinc-800">
                <img
                  src={formData.imagem_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.style.display = 'none')}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url" className="text-zinc-300">URL do Vídeo YouTube</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) => handleChange('video_url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Características</Label>
            <div className="space-y-2">
              {formData.caracteristicas.map((caract, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-zinc-800 rounded-lg">
                  <Input
                    value={caract.nome}
                    onChange={(e) => updateCaracteristica(index, 'nome', e.target.value)}
                    placeholder="Nome"
                    className="flex-1 bg-zinc-900 border-zinc-700 text-white text-sm"
                  />
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={caract.nivel}
                    onChange={(e) => updateCaracteristica(index, 'nivel', parseInt(e.target.value))}
                    className="w-20 accent-amber-500"
                  />
                  <CharacteristicPreview nivel={caract.nivel} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCaracteristica(index)}
                    className="text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCaracteristica}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <Plus size={16} className="mr-1" /> Adicionar
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Ingredientes</Label>
            <div className="space-y-2">
              {formData.ingredientes.map((ing, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={ing}
                    onChange={(e) => updateIngrediente(index, e.target.value)}
                    placeholder="Ex: 50ml Vodka"
                    className="flex-1 bg-zinc-800 border-zinc-700 text-white text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngrediente(index)}
                    className="text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addIngrediente}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <Plus size={16} className="mr-1" /> Adicionar
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-amber-500 hover:bg-amber-600 text-black"
        >
          {isLoading && <Loader2 className="animate-spin mr-2" size={16} />}
          {drink ? 'Atualizar' : 'Criar'} Drink
        </Button>
      </div>
    </form>
  );
};

export default function AdminDrinksPage() {
  const { canEdit, isViewer, admin } = useAdminAuth();
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDrinks = async () => {
    console.log('[AdminDrinksPage] fetchDrinks started');
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
        console.log('[AdminDrinksPage] drinks loaded:', data?.length);
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
    console.log('[AdminDrinksPage] Component mounted, admin:', admin?.email);
    fetchDrinks();
  }, []);

  const handleSave = async (formData) => {
    console.log('[AdminDrinksPage] handleSave called with:', formData?.nome);
    setSaving(true);

    try {
      const adminSession = JSON.parse(localStorage.getItem('vincci_admin_session') || '{}');
      const adminId = adminSession?.admin?.id;
      console.log('[AdminDrinksPage] adminId:', adminId);

      if (!adminId) {
        toast.error('Sessão expirada. Faça login novamente.');
        setSaving(false);
        return;
      }

      if (editingDrink) {
        console.log('[AdminDrinksPage] Updating drink:', editingDrink.id);
        const { data, error } = await supabase.functions.invoke('admin-drinks', {
          body: {
            action: 'update',
            adminId,
            drinkId: editingDrink.id,
            drinkData: formData,
          },
        });
        console.log('[AdminDrinksPage] Update response:', { data, error });

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
        console.log('[AdminDrinksPage] Creating new drink');
        const { data, error } = await supabase.functions.invoke('admin-drinks', {
          body: {
            action: 'create',
            adminId,
            drinkData: formData,
          },
        });
        console.log('[AdminDrinksPage] Create response:', { data, error });

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
    console.log('[AdminDrinksPage] handleSave completed');
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
            onClick={(e) => {
              e.stopPropagation();
              alert('Botão Novo Drink clicado!');
              console.log('[AdminDrinksPage] Novo Drink button clicked');
              setEditingDrink(null);
              setIsFormOpen(true);
              console.log('[AdminDrinksPage] Modal should open now');
            }}
            className="bg-amber-500 hover:bg-amber-600 text-black"
            style={{ backgroundColor: '#f59e0b', color: 'black', position: 'relative', zIndex: 100 }}
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

      {/* Content */}
      {loading ? (
        <div 
          className="flex items-center justify-center py-20"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" style={{ width: '2rem', height: '2rem', color: '#f59e0b' }} />
        </div>
      ) : filteredDrinks.length === 0 ? (
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
              onClick={() => setIsFormOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-black"
              style={{ backgroundColor: '#f59e0b', color: 'black' }}
            >
              <Plus size={18} className="mr-2" style={{ marginRight: '0.5rem' }} /> Criar primeiro drink
            </Button>
          )}
        </div>
      ) : (
        <div 
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          style={{ 
            display: 'grid', 
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
          }}
        >
          {filteredDrinks.map((drink) => (
            <div
              key={drink.id}
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
                      onClick={() => {
                        console.log('[AdminDrinksPage] Editar button clicked for:', drink.nome);
                        setEditingDrink(drink);
                        setIsFormOpen(true);
                        console.log('[AdminDrinksPage] Edit modal should open');
                      }}
                      className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      style={{ flex: 1 }}
                    >
                      <Pencil size={14} className="mr-1" style={{ marginRight: '0.25rem' }} /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log('[AdminDrinksPage] Delete button clicked for:', drink.nome);
                        setDeleteConfirm(drink);
                      }}
                      size="icon"
                      className="h-9 w-9 border-zinc-700 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingDrink ? 'Editar Drink' : 'Novo Drink'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Preencha as informações do drink abaixo
            </DialogDescription>
          </DialogHeader>
          <DrinkForm
            drink={editingDrink}
            onSave={handleSave}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingDrink(null);
            }}
            isLoading={saving}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir Drink</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir "{deleteConfirm?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CSS for responsive grid */}
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