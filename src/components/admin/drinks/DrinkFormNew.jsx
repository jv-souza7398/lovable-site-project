import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ImageCropModal from './ImageCropModal';

/**
 * Formulário de drink com estilos inline para produção.
 */

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.75rem',
  backgroundColor: '#27272a',
  border: '1px solid #3f3f46',
  borderRadius: '0.5rem',
  color: 'white',
  fontSize: '0.875rem',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#d4d4d8',
  marginBottom: '0.5rem',
};

const buttonStyle = {
  padding: '0.625rem 1rem',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s',
};

function CharacteristicPreview({ nivel }) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            width: '0.5rem',
            height: '0.5rem',
            borderRadius: '9999px',
            backgroundColor: i <= nivel ? '#f59e0b' : '#3f3f46',
          }}
        />
      ))}
    </div>
  );
}

export default function DrinkFormNew({ drink, onSave, onCancel, isLoading }) {
  const fileInputRef = useRef(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [uploading, setUploading] = useState(false);
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
      const caracteristicas = Array.isArray(drink.caracteristicas) 
        ? drink.caracteristicas 
        : [];
      const ingredientes = Array.isArray(drink.ingredientes) 
        ? drink.ingredientes 
        : [];
      
      setFormData({
        nome: drink.nome || '',
        descricao: drink.descricao || '',
        video_url: drink.video_url || '',
        imagem_url: drink.imagem_url || '',
        categoria: drink.categoria || '',
        caracteristicas: caracteristicas.map(c => ({
          nome: String(c?.nome || ''),
          nivel: Number(c?.nivel) || 3,
        })),
        ingredientes: ingredientes.map(i => String(i || '')),
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
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
        }}
      >
        {/* Coluna Esquerda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Nome do Drink *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Caipirinha"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Descrição *</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descreva o drink..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Categoria *</label>
            <select
              value={formData.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="" style={{ backgroundColor: '#27272a', color: 'white' }}>Selecione a categoria</option>
              <option value="drinks-sem-alcool" style={{ backgroundColor: '#27272a', color: 'white' }}>Clássicos Vincci</option>
              <option value="drinks-padrao" style={{ backgroundColor: '#27272a', color: 'white' }}>Festival de Caipirinhas</option>
              <option value="sublime" style={{ backgroundColor: '#27272a', color: 'white' }}>Sublime</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              id="destacar_home"
              checked={formData.destacar_home}
              onChange={(e) => handleChange('destacar_home', e.target.checked)}
              style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
            />
            <label htmlFor="destacar_home" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
              Destacar na home?
            </label>
          </div>

          <div>
            <label style={labelStyle}>Imagem de Capa *</label>
            
            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 10 * 1024 * 1024) {
                  toast.error('Imagem deve ter no máximo 10MB');
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => setCropImageSrc(reader.result);
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  ...buttonStyle,
                  flex: 1,
                  backgroundColor: '#27272a',
                  border: '1px solid #3f3f46',
                  color: '#d4d4d8',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8rem',
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                <Upload size={14} /> {uploading ? 'Enviando...' : 'Upload de Imagem'}
              </button>
              {formData.imagem_url && (
                <button
                  type="button"
                  onClick={() => setCropImageSrc(formData.imagem_url)}
                  disabled={uploading}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    color: '#d4d4d8',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                  }}
                  title="Ajustar/recortar imagem"
                >
                  <ImageIcon size={14} /> Ajustar
                </button>
              )}
            </div>

            {/* URL input */}
            <input
              type="text"
              value={formData.imagem_url}
              onChange={(e) => handleChange('imagem_url', e.target.value)}
              placeholder="Ou cole a URL da imagem..."
              style={{ ...inputStyle, fontSize: '0.8rem' }}
            />

            {/* Preview - click to edit */}
            {formData.imagem_url && (
              <div
                onClick={() => setCropImageSrc(formData.imagem_url)}
                style={{
                  marginTop: '0.5rem',
                  width: '8rem',
                  height: '8rem',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  backgroundColor: '#27272a',
                  position: 'relative',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f59e0b'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                title="Clique para ajustar a imagem"
              >
                <img
                  src={formData.imagem_url}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  fontSize: '0.6rem',
                  textAlign: 'center',
                  padding: '0.15rem',
                }}>
                  Clique para ajustar
                </div>
              </div>
            )}

            {/* Crop Modal */}
            {cropImageSrc && (
              <ImageCropModal
                imageSrc={cropImageSrc}
                onClose={() => setCropImageSrc(null)}
                onCropDone={async (blob) => {
                  setCropImageSrc(null);
                  setUploading(true);
                  try {
                    const fileName = `drink_${Date.now()}.jpg`;
                    const { error: uploadError } = await supabase.storage
                      .from('drinks-images')
                      .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
                    
                    if (uploadError) throw uploadError;

                    const { data: urlData } = supabase.storage
                      .from('drinks-images')
                      .getPublicUrl(fileName);

                    handleChange('imagem_url', urlData.publicUrl);
                    toast.success('Imagem enviada com sucesso!');
                  } catch (err) {
                    console.error('Upload error:', err);
                    toast.error('Erro ao enviar imagem');
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            )}
          </div>

          <div>
            <label style={labelStyle}>URL do Vídeo YouTube</label>
            <input
              type="text"
              value={formData.video_url}
              onChange={(e) => handleChange('video_url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              style={inputStyle}
            />
          </div>
        </div>

        {/* Coluna Direita */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Características</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {formData.caracteristicas.map((caract, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#27272a',
                    borderRadius: '0.5rem',
                  }}
                >
                  <input
                    type="text"
                    value={caract.nome || ''}
                    onChange={(e) => updateCaracteristica(index, 'nome', e.target.value)}
                    placeholder="Ex: Doçura, Acidez"
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: '0.625rem 0.75rem',
                      backgroundColor: '#18181b',
                      border: '1px solid #3f3f46',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={caract.nivel || 3}
                    onChange={(e) => updateCaracteristica(index, 'nivel', parseInt(e.target.value))}
                    style={{ width: '5rem', accentColor: '#f59e0b', flexShrink: 0 }}
                  />
                  <CharacteristicPreview nivel={caract.nivel || 3} />
                  <button
                    type="button"
                    onClick={() => removeCaracteristica(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.25rem',
                      cursor: 'pointer',
                      color: '#71717a',
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addCaracteristica}
              style={{
                ...buttonStyle,
                marginTop: '0.5rem',
                backgroundColor: 'transparent',
                border: '1px solid #3f3f46',
                color: '#d4d4d8',
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
              }}
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>

          <div>
            <label style={labelStyle}>Ingredientes</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {formData.ingredientes.map((ing, index) => (
                <div
                  key={index}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <input
                    type="text"
                    value={ing || ''}
                    onChange={(e) => updateIngrediente(index, e.target.value)}
                    placeholder="Ex: 50ml Vodka"
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '0.625rem 0.75rem',
                      backgroundColor: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeIngrediente(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.25rem',
                      cursor: 'pointer',
                      color: '#71717a',
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngrediente}
              style={{
                ...buttonStyle,
                marginTop: '0.5rem',
                backgroundColor: 'transparent',
                border: '1px solid #3f3f46',
                color: '#d4d4d8',
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
              }}
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #27272a',
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            ...buttonStyle,
            backgroundColor: 'transparent',
            border: '1px solid #3f3f46',
            color: '#d4d4d8',
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            ...buttonStyle,
            backgroundColor: '#f59e0b',
            border: 'none',
            color: 'black',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
          {drink ? 'Atualizar' : 'Criar'} Drink
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
