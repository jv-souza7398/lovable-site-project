import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Search, Users, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// CPF validation and formatting
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

const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'manager':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'planner':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'viewer':
      return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    default:
      return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  }
};

const roleDescriptions = {
  manager: 'Acesso total: gerencia usuários, drinks e dashboards',
  planner: 'Operacional: gerencia drinks e dashboards, sem acesso a usuários',
  viewer: 'Somente leitura: visualiza dados sem poder editar',
};

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
    }
  }, [user]);

  const handleChange = (field, value) => {
    if (field === 'cpf') {
      value = formatCPF(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field changes
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
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
    
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

    // Prevent self-demotion
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="nome_completo" className="text-zinc-300">Nome Completo *</Label>
        <Input
          id="nome_completo"
          value={formData.nome_completo}
          onChange={(e) => handleChange('nome_completo', e.target.value)}
          placeholder="João da Silva"
          className={cn(
            "bg-zinc-800 border-zinc-700 text-white",
            errors.nome_completo && "border-red-500"
          )}
        />
        {errors.nome_completo && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.nome_completo}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf" className="text-zinc-300">CPF *</Label>
        <Input
          id="cpf"
          value={formData.cpf}
          onChange={(e) => handleChange('cpf', e.target.value)}
          placeholder="000.000.000-00"
          className={cn(
            "bg-zinc-800 border-zinc-700 text-white",
            errors.cpf && "border-red-500"
          )}
        />
        {errors.cpf && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.cpf}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-zinc-300">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="joao@exemplo.com"
          className={cn(
            "bg-zinc-800 border-zinc-700 text-white",
            errors.email && "border-red-500"
          )}
        />
        {errors.email && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" className="text-zinc-300">Permissão *</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => handleChange('role', value)}
        >
          <SelectTrigger className={cn(
            "bg-zinc-800 border-zinc-700 text-white",
            errors.role && "border-red-500"
          )}>
            <SelectValue placeholder="Selecione a permissão" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700 text-white z-50">
            <SelectItem value="manager" className="text-white focus:bg-zinc-700 focus:text-white">
              <span className="font-medium">Manager</span>
            </SelectItem>
            <SelectItem value="planner" className="text-white focus:bg-zinc-700 focus:text-white">
              <span className="font-medium">Planner</span>
            </SelectItem>
            <SelectItem value="viewer" className="text-white focus:bg-zinc-700 focus:text-white">
              <span className="font-medium">Viewer</span>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-zinc-500">{roleDescriptions[formData.role]}</p>
        {errors.role && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.role}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-zinc-300">
          Senha {user ? '(deixe em branco para manter)' : '*'}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="••••••••"
            className={cn(
              "bg-zinc-800 border-zinc-700 text-white pr-10",
              errors.password && "border-red-500"
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
        {formData.password && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all", passwordStrength.color)}
                style={{ width: `${passwordStrength.strength * 25}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400">{passwordStrength.label}</span>
          </div>
        )}
        {errors.password && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.password}
          </p>
        )}
      </div>

      {formData.password && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-zinc-300">Confirmar Senha *</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="••••••••"
            className={cn(
              "bg-zinc-800 border-zinc-700 text-white",
              errors.confirmPassword && "border-red-500"
            )}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.confirmPassword}
            </p>
          )}
        </div>
      )}

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
          {user ? 'Atualizar' : 'Criar'} Usuário
        </Button>
      </div>
    </form>
  );
}

export default function AdminUsersPage() {
  const { admin, canManageUsers } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
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
    }
    setLoading(false);
  };

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers();
    }
  }, [canManageUsers]);

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
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'delete_admin',
          adminId: admin.id,
          userData: { targetId: deleteConfirm.id },
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
    setDeleteConfirm(null);
  };

  const filteredUsers = users.filter((user) =>
    user.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.cpf.includes(searchTerm.replace(/\D/g, ''))
  );

  if (!canManageUsers) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-20 text-center"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', textAlign: 'center' }}
      >
        <Users className="w-16 h-16 text-zinc-700 mb-4" style={{ width: '4rem', height: '4rem', color: '#3f3f46', marginBottom: '1rem' }} />
        <h2 className="text-xl font-semibold text-white mb-2" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>Acesso Negado</h2>
        <p className="text-zinc-400" style={{ color: '#a1a1aa', margin: 0, fontSize: '1rem' }}>Você não tem permissão para acessar esta seção.</p>
      </div>
    );
  }

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
            Gerenciamento de Usuários
          </h1>
          <p 
            className="text-zinc-400 text-sm"
            style={{ color: '#a1a1aa', fontSize: '0.875rem', margin: 0 }}
          >
            Gerencie os administradores do sistema
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null);
            setIsFormOpen(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-black"
          style={{ backgroundColor: '#f59e0b', color: 'black' }}
        >
          <Plus size={18} className="mr-2" style={{ marginRight: '0.5rem' }} /> Novo Usuário
        </Button>
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
          placeholder="Buscar por nome, email ou CPF..."
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
      ) : filteredUsers.length === 0 ? (
        <div 
          className="flex flex-col items-center justify-center py-20 text-center"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', textAlign: 'center' }}
        >
          <Users className="w-16 h-16 text-zinc-700 mb-4" style={{ width: '4rem', height: '4rem', color: '#3f3f46', marginBottom: '1rem' }} />
          <p className="text-zinc-400 mb-4" style={{ color: '#a1a1aa', marginBottom: '1rem', fontSize: '1rem' }}>
            {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-black"
              style={{ backgroundColor: '#f59e0b', color: 'black' }}
            >
              <Plus size={18} className="mr-2" style={{ marginRight: '0.5rem' }} /> Criar primeiro usuário
            </Button>
          )}
        </div>
      ) : (
        <div 
          className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
          style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', overflow: 'hidden' }}
        >
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400" style={{ color: '#a1a1aa' }}>Nome</TableHead>
                <TableHead className="text-zinc-400 hidden sm:table-cell" style={{ color: '#a1a1aa' }}>CPF</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell" style={{ color: '#a1a1aa' }}>Email</TableHead>
                <TableHead className="text-zinc-400" style={{ color: '#a1a1aa' }}>Permissão</TableHead>
                <TableHead className="text-zinc-400 text-right" style={{ color: '#a1a1aa', textAlign: 'right' }}>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-zinc-800">
                  <TableCell className="font-medium text-white" style={{ fontWeight: 500, color: 'white' }}>
                    <div>
                      <p style={{ margin: 0 }}>{user.nome_completo}</p>
                      <p className="text-xs text-zinc-500 sm:hidden" style={{ fontSize: '0.75rem', color: '#71717a', margin: 0 }}>{formatCPF(user.cpf)}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300 hidden sm:table-cell" style={{ color: '#d4d4d8' }}>
                    {formatCPF(user.cpf)}
                  </TableCell>
                  <TableCell className="text-zinc-300 hidden md:table-cell" style={{ color: '#d4d4d8' }}>
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex text-xs px-2 py-1 rounded-full border capitalize",
                        getRoleBadgeColor(user.role)
                      )}
                      style={{
                        display: 'inline-flex',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px',
                        textTransform: 'capitalize'
                      }}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right" style={{ textAlign: 'right' }}>
                    <div 
                      className="flex justify-end gap-1"
                      style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingUser(user);
                          setIsFormOpen(true);
                        }}
                        className="text-zinc-400 hover:text-white"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(user)}
                        disabled={user.id === admin.id}
                        className="text-zinc-400 hover:text-red-500 disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário Administrativo'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {editingUser
                ? 'Atualize as informações do usuário'
                : 'Preencha os dados para criar um novo administrador'}
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir "{deleteConfirm?.nome_completo}"? Esta ação não pode ser desfeita.
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

      {/* CSS for responsive layout */}
      <style>{`
        @media (min-width: 640px) {
          .sm\\:flex-row { flex-direction: row !important; }
          .sm\\:items-center { align-items: center !important; }
          .sm\\:justify-between { justify-content: space-between !important; }
          .sm\\:table-cell { display: table-cell !important; }
          .sm\\:hidden { display: none !important; }
        }
        @media (min-width: 768px) {
          .md\\:table-cell { display: table-cell !important; }
        }
        @media (max-width: 639px) {
          .hidden.sm\\:table-cell { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden.md\\:table-cell { display: none !important; }
        }
      `}</style>
    </div>
  );
}