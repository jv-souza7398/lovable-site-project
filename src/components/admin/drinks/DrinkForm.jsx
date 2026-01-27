import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

export default function DrinkForm({ drink, onSave, onCancel, isLoading }) {
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
    } else {
      setFormData({
        nome: '',
        descricao: '',
        video_url: '',
        imagem_url: '',
        categoria: '',
        caracteristicas: [],
        ingredientes: [],
        destacar_home: false,
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
                <SelectItem value="drinks-sem-alcool">Clássicos Vincci</SelectItem>
                <SelectItem value="drinks-padrao">Festival de Caipirinhas</SelectItem>
                <SelectItem value="sublime">Sublime</SelectItem>
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
}
