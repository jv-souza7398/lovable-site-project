import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
  DialogFooter,
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
import styles from './AdminDrinks.module.css';

const CharacteristicPreview = ({ nivel }) => {
  const circles = [];
  for (let i = 0; i < 5; i++) {
    circles.push(
      <span
        key={i}
        className={`${styles.previewCircle} ${i < nivel ? styles.filled : ''}`}
      />
    );
  }
  return <div className={styles.previewCircles}>{circles}</div>;
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
        caracteristicas: drink.caracteristicas || [],
        ingredientes: drink.ingredientes || [],
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

  const validateYouTubeUrl = (url) => {
    if (!url) return true;
    const patterns = [
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]+/,
    ];
    return patterns.some((pattern) => pattern.test(url));
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
    if (formData.video_url && !validateYouTubeUrl(formData.video_url)) {
      toast.error('URL do YouTube inválida');
      return;
    }

    onSave(formData);
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/
    );
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(formData.video_url);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Informações Básicas</h3>

          <div className={styles.field}>
            <Label htmlFor="nome">Nome do Drink *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Caipirinha"
            />
          </div>

          <div className={styles.field}>
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descreva o drink, sua história, sabor..."
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <Label htmlFor="categoria">Categoria *</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => handleChange('categoria', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drinks-sem-alcool">
                  Drinks sem Álcool
                </SelectItem>
                <SelectItem value="drinks-padrao">Drinks Padrões</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.field}>
            <div className={styles.checkboxField}>
              <Checkbox
                id="destacar_home"
                checked={formData.destacar_home}
                onCheckedChange={(checked) => handleChange('destacar_home', checked)}
              />
              <Label htmlFor="destacar_home" className={styles.checkboxLabel}>
                Destacar na home?
              </Label>
            </div>
            <p className={styles.fieldHint}>
              Se marcado, este drink aparecerá no carrossel de destaques da página inicial
            </p>
          </div>

          <div className={styles.field}>
            <Label htmlFor="imagem_url">URL da Imagem *</Label>
            <Input
              id="imagem_url"
              value={formData.imagem_url}
              onChange={(e) => handleChange('imagem_url', e.target.value)}
              placeholder="https://..."
            />
            {formData.imagem_url && (
              <div className={styles.imagePreview}>
                <img
                  src={formData.imagem_url}
                  alt="Preview"
                  onError={(e) => (e.target.style.display = 'none')}
                />
              </div>
            )}
          </div>

          <div className={styles.field}>
            <Label htmlFor="video_url">URL do Vídeo YouTube</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) => handleChange('video_url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
            {videoId && (
              <div className={styles.videoPreview}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Preview"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Características</h3>
          <p className={styles.sectionHint}>
            Adicione características como Doçura, Acidez, Amargor, etc.
          </p>

          <div className={styles.caracteristicasList}>
            {formData.caracteristicas.map((caract, index) => (
              <div key={index} className={styles.caracteristicaItem}>
                <Input
                  value={caract.nome}
                  onChange={(e) =>
                    updateCaracteristica(index, 'nome', e.target.value)
                  }
                  placeholder="Nome da característica"
                  className={styles.caractNome}
                />
                <div className={styles.caractNivel}>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={caract.nivel}
                    onChange={(e) =>
                      updateCaracteristica(
                        index,
                        'nivel',
                        parseInt(e.target.value)
                      )
                    }
                    className={styles.slider}
                  />
                  <CharacteristicPreview nivel={caract.nivel} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCaracteristica(index)}
                  className={styles.removeBtn}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addCaracteristica}
            className={styles.addBtn}
          >
            <Plus size={16} /> Adicionar Característica
          </Button>

          <h3 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>
            Ingredientes
          </h3>

          <div className={styles.ingredientesList}>
            {formData.ingredientes.map((ing, index) => (
              <div key={index} className={styles.ingredienteItem}>
                <Input
                  value={ing}
                  onChange={(e) => updateIngrediente(index, e.target.value)}
                  placeholder="Ex: 50ml Vodka"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIngrediente(index)}
                  className={styles.removeBtn}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addIngrediente}
            className={styles.addBtn}
          >
            <Plus size={16} /> Adicionar Ingrediente
          </Button>
        </div>
      </div>

      <div className={styles.formActions}>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="animate-spin mr-2" size={16} />}
          {drink ? 'Atualizar Drink' : 'Criar Drink'}
        </Button>
      </div>
    </form>
  );
};

const AdminDrinks = () => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchDrinks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .order('nome');

    if (error) {
      toast.error('Erro ao carregar drinks');
      console.error(error);
    } else {
      setDrinks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrinks();
  }, []);

  const handleSave = async (formData) => {
    setSaving(true);

    if (editingDrink) {
      const { error } = await supabase
        .from('drinks')
        .update(formData)
        .eq('id', editingDrink.id);

      if (error) {
        toast.error('Erro ao atualizar drink');
        console.error(error);
      } else {
        toast.success('Drink atualizado com sucesso!');
        setIsFormOpen(false);
        setEditingDrink(null);
        fetchDrinks();
      }
    } else {
      const { error } = await supabase.from('drinks').insert([formData]);

      if (error) {
        toast.error('Erro ao criar drink');
        console.error(error);
      } else {
        toast.success('Drink criado com sucesso!');
        setIsFormOpen(false);
        fetchDrinks();
      }
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    const { error } = await supabase
      .from('drinks')
      .delete()
      .eq('id', deleteConfirm.id);

    if (error) {
      toast.error('Erro ao excluir drink');
      console.error(error);
    } else {
      toast.success('Drink excluído com sucesso!');
      fetchDrinks();
    }
    setDeleteConfirm(null);
  };

  const openEdit = (drink) => {
    setEditingDrink(drink);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingDrink(null);
    setIsFormOpen(true);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className={styles.title}>Administração de Drinks</h1>
            <p className={styles.subtitle}>Gerencie o catálogo de drinks</p>
          </div>
        </div>
        <Button onClick={openCreate} className={styles.newBtn}>
          <Plus size={18} /> Novo Drink
        </Button>
      </header>

      {loading ? (
        <div className={styles.loadingState}>
          <Loader2 className="animate-spin" size={32} />
          <p>Carregando drinks...</p>
        </div>
      ) : drinks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum drink cadastrado ainda.</p>
          <Button onClick={openCreate}>
            <Plus size={18} /> Criar primeiro drink
          </Button>
        </div>
      ) : (
        <div className={styles.drinksList}>
          {drinks.map((drink) => (
            <div key={drink.id} className={styles.drinkCard}>
              <div className={styles.drinkImage}>
                <img src={drink.imagem_url} alt={drink.nome} />
              </div>
              <div className={styles.drinkInfo}>
                <h3>{drink.nome}</h3>
                <span className={styles.categoria}>
                  {drink.categoria === 'drinks-sem-alcool'
                    ? 'Sem Álcool'
                    : 'Padrão'}
                </span>
              </div>
              <div className={styles.drinkActions}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(drink)}
                >
                  <Pencil size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteConfirm(drink)}
                  className={styles.deleteBtn}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader>
            <DialogTitle>
              {editingDrink ? 'Editar Drink' : 'Novo Drink'}
            </DialogTitle>
            <DialogDescription>
              {editingDrink
                ? 'Atualize as informações do drink'
                : 'Preencha os dados do novo drink'}
            </DialogDescription>
          </DialogHeader>
          <DrinkForm
            drink={editingDrink}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
            isLoading={saving}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteConfirm?.nome}"? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDrinks;
