import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Search, Pencil, Trash2, Users, Loader2, Eye, EyeOff, AlertCircle, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';

/**
 * Página de gerenciamento de usuários admin reconstruída do zero.
 */

// =====================
// Helpers
// =====================

const normalizeText = (value) => {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const formatCPF = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const validateCPF = (cpf) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;
  
  return true;
};

const getRoleBadgeColors = (role) => {
  switch (role) {
    case 'manager':
      return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'rgba(16, 185, 129, 0.2)' };
    case 'planner':
      return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' };
    case 'viewer':
      return { bg: 'rgba(113, 113, 122, 0.1)', color: '#a1a1aa', border: 'rgba(113, 113, 122, 0.2)' };
    default:
      return { bg: 'rgba(113, 113, 122, 0.1)', color: '#a1a1aa', border: 'rgba(113, 113, 122, 0.2)' };
  }
};

const roleDescriptions = {
  manager: 'Acesso total: gerencia usuários, drinks e dashboards',
  planner: 'Operacional: gerencia drinks e dashboards, sem acesso a usuários',
  viewer: 'Somente leitura: visualiza dados sem poder editar',
};

// =====================
// Styles
// =====================

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

const inputErrorStyle = {
  ...inputStyle,
  borderColor: '#ef4444',
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

// =====================
// User Form Component
// =====================

function UserForm({ user, onSave, onCancel, isLoading, currentAdminId }) {
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    email: '',
    role: 'planner',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        nome_completo: user.nome_completo || '',
        cpf: formatCPF(user.cpf || ''),
        email: user.email || '',
        role: user.role || 'planner',
        password: '',
        confirmPassword: '',
      });
    } else {
      setFormData({
        nome_completo: '',
        cpf: '',
        email: '',
        role: 'planner',
        password: '',
        confirmPassword: '',
      });
    }
    setErrors({});
  }, [user]);

  const handleChange = (field, value) => {
    if (field === 'cpf') {
      value = formatCPF(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    const labels = ['Fraca', 'Regular', 'Boa', 'Forte'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#10b981'];
    
    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || '',
    };
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nome_completo.trim() || formData.nome_completo.trim().length < 3) {
      newErrors.nome_completo = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Email inválido';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    if (user && user.id === currentAdminId && formData.role !== 'manager') {
      newErrors.role = 'Você não pode alterar sua própria role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Nome Completo *</label>
          <input
            type="text"
            value={formData.nome_completo}
            onChange={(e) => handleChange('nome_completo', e.target.value)}
            placeholder="João da Silva"
            style={errors.nome_completo ? inputErrorStyle : inputStyle}
          />
          {errors.nome_completo && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertCircle size={12} /> {errors.nome_completo}
            </p>
          )}
        </div>

        <div>
          <label style={labelStyle}>CPF *</label>
          <input
            type="text"
            value={formData.cpf}
            onChange={(e) => handleChange('cpf', e.target.value)}
            placeholder="000.000.000-00"
            style={errors.cpf ? inputErrorStyle : inputStyle}
          />
          {errors.cpf && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertCircle size={12} /> {errors.cpf}
            </p>
          )}
        </div>

        <div>
          <label style={labelStyle}>Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="joao@exemplo.com"
            style={errors.email ? inputErrorStyle : inputStyle}
          />
          {errors.email && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertCircle size={12} /> {errors.email}
            </p>
          )}
        </div>

        <div>
          <label style={labelStyle}>Permissão *</label>
          <select
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer', ...(errors.role ? { borderColor: '#ef4444' } : {}) }}
          >
            <option value="manager">Manager</option>
            <option value="planner">Planner</option>
            <option value="viewer">Viewer</option>
          </select>
          <p style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.25rem' }}>
            {roleDescriptions[formData.role]}
          </p>
          {errors.role && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertCircle size={12} /> {errors.role}
            </p>
          )}
        </div>

        <div>
          <label style={labelStyle}>
            Senha {user ? '(deixe em branco para manter)' : '*'}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              style={{
                ...(errors.password ? inputErrorStyle : inputStyle),
                paddingRight: '3rem',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: '0.25rem',
                cursor: 'pointer',
                color: '#71717a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {formData.password && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ flex: 1, height: '0.25rem', backgroundColor: '#3f3f46', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${passwordStrength.strength * 25}%`,
                    backgroundColor: passwordStrength.color,
                    transition: 'all 0.2s',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>{passwordStrength.label}</span>
            </div>
          )}
          {errors.password && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertCircle size={12} /> {errors.password}
            </p>
          )}
        </div>

        {formData.password && (
          <div>
            <label style={labelStyle}>Confirmar Senha *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              style={errors.confirmPassword ? inputErrorStyle : inputStyle}
            />
            {errors.confirmPassword && (
              <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={12} /> {errors.confirmPassword}
              </p>
            )}
          </div>
        )}
      </div>

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
          {user ? 'Atualizar' : 'Criar'} Usuário
        </button>
      </div>
    </form>
  );
}

// =====================
// Modal Component
// =====================

function Modal({ open, onClose, title, description, children }) {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        style={{
          position: 'relative',
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: '28rem',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '1.5rem',
            paddingRight: '3.5rem',
            borderBottom: '1px solid #27272a',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', margin: 0 }}>{title}</h2>
            {description && (
              <p style={{ fontSize: '0.875rem', color: '#71717a', margin: '0.25rem 0 0 0' }}>{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '2rem',
              height: '2rem',
              borderRadius: '9999px',
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#a1a1aa',
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

// =====================
// Confirm Dialog Component
// =====================

function ConfirmDialog({ open, onClose, onConfirm, title, description }) {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        style={{
          position: 'relative',
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: '28rem',
          padding: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <AlertTriangle size={24} style={{ color: '#ef4444' }} />
        </div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', margin: '0 0 0.5rem 0' }}>{title}</h3>
        <p style={{ fontSize: '0.875rem', color: '#a1a1aa', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>{description}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
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
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              ...buttonStyle,
              backgroundColor: '#ef4444',
              border: 'none',
              color: 'white',
            }}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// =====================
// Main Page Component
// =====================

export default function AdminUsersPageNew() {
  const { admin, canManageUsers } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('admin-auth', {
        body: { action: 'get_admins', adminId: admin.id },
      });

      if (response.error || !response.data.success) {
        throw new Error(response.data?.error || 'Erro ao carregar usuários');
      }

      setUsers(response.data.admins || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [admin?.id]);

  useEffect(() => {
    if (canManageUsers && admin?.id) {
      fetchUsers();
    }
  }, [canManageUsers, admin?.id, fetchUsers]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const action = formData.id ? 'update_admin' : 'create_admin';
      const response = await supabase.functions.invoke('admin-auth', {
        body: {
          action,
          adminId: admin.id,
          userData: formData,
        },
      });

      if (response.error || !response.data.success) {
        throw new Error(response.data?.error || 'Erro ao salvar usuário');
      }

      toast.success(formData.id ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
      setIsFormOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    try {
      const response = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'delete_admin',
          adminId: admin.id,
          userData: { targetId: deletingUser.id },
        },
      });

      if (response.error || !response.data.success) {
        throw new Error(response.data?.error || 'Erro ao excluir usuário');
      }

      toast.success('Usuário excluído com sucesso!');
      fetchUsers();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message);
    }
  };

  // Filter
  const q = normalizeText(searchTerm);
  const qCpf = String(searchTerm ?? '').replace(/\D/g, '');
  const filteredUsers = q
    ? users.filter((user) => {
        const nome = normalizeText(user?.nome_completo);
        const email = normalizeText(user?.email);
        const cpfDigits = String(user?.cpf ?? '').replace(/\D/g, '');
        return nome.includes(q) || email.includes(q) || (qCpf ? cpfDigits.includes(qCpf) : false);
      })
    : users;

  // Access denied
  if (!canManageUsers) {
    return (
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
        <Users size={64} style={{ color: '#3f3f46', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', margin: '0 0 0.5rem 0' }}>Acesso Negado</h2>
        <p style={{ color: '#a1a1aa', margin: 0 }}>Você não tem permissão para acessar esta seção.</p>
      </div>
    );
  }

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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: 0 }}>
            Gerenciamento de Usuários
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#a1a1aa', margin: '0.25rem 0 0 0' }}>
            {users.length} administrador{users.length !== 1 ? 'es' : ''} cadastrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingUser(null);
            setIsFormOpen(true);
          }}
          style={{
            ...buttonStyle,
            backgroundColor: '#f59e0b',
            border: 'none',
            color: 'black',
          }}
        >
          <Plus size={18} />
          Novo Usuário
        </button>
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
          placeholder="Buscar por nome, email ou CPF..."
          style={{
            ...inputStyle,
            paddingLeft: '2.5rem',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
          }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
          <Loader2 size={32} style={{ color: '#f59e0b', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filteredUsers.length === 0 ? (
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
          <Users size={64} style={{ color: '#3f3f46', marginBottom: '1rem' }} />
          <p style={{ color: '#a1a1aa', margin: '0 0 1rem 0' }}>
            {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
          </p>
          {!searchTerm && (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              style={{
                ...buttonStyle,
                backgroundColor: '#f59e0b',
                border: 'none',
                color: 'black',
              }}
            >
              <Plus size={18} />
              Criar primeiro usuário
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #27272a' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa' }}>Nome</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa' }}>CPF</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa' }}>Permissão</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const roleColors = getRoleBadgeColors(user.role);
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #27272a' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'white', fontWeight: 500 }}>{user.nome_completo}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#d4d4d8' }}>{formatCPF(user.cpf)}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#d4d4d8' }}>{user.email}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          backgroundColor: roleColors.bg,
                          color: roleColors.color,
                          border: `1px solid ${roleColors.border}`,
                          textTransform: 'capitalize',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(user);
                            setIsFormOpen(true);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: '#71717a',
                            borderRadius: '0.375rem',
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingUser(user)}
                          disabled={user.id === admin.id}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.5rem',
                            cursor: user.id === admin.id ? 'not-allowed' : 'pointer',
                            color: '#71717a',
                            borderRadius: '0.375rem',
                            opacity: user.id === admin.id ? 0.3 : 1,
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <Modal
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário Administrativo'}
        description={editingUser ? 'Atualize as informações do usuário' : 'Preencha os dados para criar um novo administrador'}
      >
        <UserForm
          user={editingUser}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingUser(null);
          }}
          isLoading={saving}
          currentAdminId={admin.id}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        title="Excluir Usuário"
        description={`Tem certeza que deseja excluir "${deletingUser?.nome_completo}"? Esta ação não pode ser desfeita.`}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
