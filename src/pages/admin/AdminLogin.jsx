import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, Loader2, Lock, Mail } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/admin/drinks');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLogging(true);
    
    try {
      const result = await login(email, password);

      if (result.success) {
        toast.success('Login realizado com sucesso!');
        // Use setTimeout to ensure state is updated before navigation
        setTimeout(() => {
          navigate('/admin/drinks', { replace: true });
        }, 100);
      } else {
        toast.error(result.error || 'Erro ao fazer login');
        setIsLogging(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao fazer login');
      setIsLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: 'linear-gradient(to bottom right, #18181b, #27272a, #18181b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%'
      }}
    >
      <div className="w-full max-w-md" style={{ maxWidth: '28rem', width: '100%' }}>
        {/* Logo/Brand */}
        <div className="text-center mb-8" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              marginBottom: '1rem'
            }}
          >
            <Wine className="w-8 h-8 text-amber-500" style={{ width: '2rem', height: '2rem', color: '#f59e0b' }} />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: 0 }}>Vincci Bar</h1>
          <p className="text-zinc-400 text-sm mt-1" style={{ fontSize: '0.875rem', color: '#a1a1aa', marginTop: '0.25rem' }}>Painel Administrativo</p>
        </div>

        {/* Login Form */}
        <div 
          className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-8 shadow-xl"
          style={{
            backgroundColor: 'rgba(39, 39, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(63, 63, 70, 0.5)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 text-center" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '1.5rem', textAlign: 'center' }}>Entrar</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Label htmlFor="email" className="text-zinc-300" style={{ color: '#d4d4d8', fontSize: '0.875rem' }}>Email</Label>
              <div className="relative" style={{ position: 'relative' }}>
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#71717a' }} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                  style={{ paddingLeft: '2.5rem', backgroundColor: 'rgba(24, 24, 27, 0.5)', borderColor: '#3f3f46', color: 'white' }}
                />
              </div>
            </div>

            <div className="space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Label htmlFor="password" className="text-zinc-300" style={{ color: '#d4d4d8', fontSize: '0.875rem' }}>Senha</Label>
              <div className="relative" style={{ position: 'relative' }}>
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#71717a' }} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                  style={{ paddingLeft: '2.5rem', backgroundColor: 'rgba(24, 24, 27, 0.5)', borderColor: '#3f3f46', color: 'white' }}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLogging}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-5"
              style={{ width: '100%', backgroundColor: '#f59e0b', color: 'black', fontWeight: 600, padding: '1.25rem 0' }}
            >
              {isLogging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6" style={{ textAlign: 'center', color: '#71717a', fontSize: '0.875rem', marginTop: '1.5rem' }}>
          Acesso restrito a administradores
        </p>
      </div>
    </div>
  );
}