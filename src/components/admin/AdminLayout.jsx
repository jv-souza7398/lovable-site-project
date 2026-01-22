import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Wine, 
  Users, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    id: 'drinks',
    label: 'Admin Drinks',
    icon: Wine,
    path: '/admin/drinks',
    roles: ['manager', 'planner', 'viewer'],
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    path: '/admin/users',
    roles: ['manager'],
  },
  {
    id: 'dashs',
    label: 'Dashs',
    icon: BarChart3,
    path: '/admin/dashs',
    roles: ['manager', 'planner', 'viewer'],
  },
];

function Sidebar({ onNavigate }) {
  const location = useLocation();
  const { admin, canManageUsers } = useAdminAuth();

  const visibleItems = menuItems.filter((item) => {
    if (item.id === 'users' && !canManageUsers) return false;
    return true;
  });

  return (
    <div 
      className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#18181b',
        borderRight: '1px solid #27272a'
      }}
    >
      {/* Logo */}
      <div 
        className="p-6 border-b border-zinc-800"
        style={{ padding: '1.5rem', borderBottom: '1px solid #27272a' }}
      >
        <Link 
          to="/admin/drinks" 
          className="flex items-center gap-3"
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
        >
          <div 
            className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Wine className="w-5 h-5 text-amber-500" style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', margin: 0 }}>Vincci Bar</h1>
            <p className="text-xs text-zinc-500" style={{ fontSize: '0.75rem', color: '#71717a', margin: 0 }}>Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav 
        className="flex-1 p-4 space-y-1"
        style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
      >
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onNavigate?.()}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                backgroundColor: isActive ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                color: isActive ? '#f59e0b' : '#a1a1aa',
                border: isActive ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid transparent'
              }}
            >
              <Icon className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem' }} />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" style={{ width: '1rem', height: '1rem', marginLeft: 'auto' }} />}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div 
        className="p-4 border-t border-zinc-800"
        style={{ padding: '1rem', borderTop: '1px solid #27272a' }}
      >
        <div 
          className="px-4 py-3 rounded-xl bg-zinc-800/50"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(39, 39, 42, 0.5)'
          }}
        >
          <p className="text-sm font-medium text-white truncate" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {admin?.nome_completo}
          </p>
          <p className="text-xs text-zinc-500 capitalize" style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'capitalize', margin: 0 }}>{admin?.role}</p>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getRoleBadgeColor = (role) => {
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

  const roleColors = getRoleBadgeColor(admin?.role);

  return (
    <header 
      className="h-16 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6"
      style={{
        height: '4rem',
        backgroundColor: 'rgba(24, 24, 27, 0.8)',
        backdropFilter: 'blur(4px)',
        borderBottom: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem'
      }}
    >
      {/* Mobile Menu Button */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-zinc-400 hover:text-white"
            style={{ display: 'flex' }}
          >
            <Menu className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem' }} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-zinc-900 border-zinc-800">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Title - Mobile */}
      <h1 
        className="lg:hidden text-lg font-semibold text-white" 
        style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', margin: 0 }}
      >
        Vincci Admin
      </h1>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" style={{ display: 'none' }} />

      {/* User Info & Actions */}
      <div 
        className="flex items-center gap-4"
        style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
      >
        <div 
          className="hidden sm:flex items-center gap-3"
          style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }}
        >
          <div style={{ textAlign: 'right' }}>
            <p className="text-sm font-medium text-white" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', margin: 0 }}>
              {admin?.nome_completo}
            </p>
            <span
              style={{
                display: 'inline-flex',
                fontSize: '0.75rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
                border: `1px solid ${roleColors.border}`,
                backgroundColor: roleColors.bg,
                color: roleColors.color,
                textTransform: 'capitalize'
              }}
            >
              {admin?.role}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          title="Sair"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <LogOut className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem' }} />
        </Button>
      </div>
    </header>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-zinc-900"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#18181b'
        }}
      >
        <div 
          className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"
          style={{
            width: '2rem',
            height: '2rem',
            border: '2px solid #f59e0b',
            borderTopColor: 'transparent',
            borderRadius: '9999px',
            animation: 'spin 1s linear infinite'
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div 
      className="min-h-screen flex bg-zinc-950"
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#09090b',
        width: '100%'
      }}
    >
      {/* Desktop Sidebar */}
      <aside 
        className="hidden lg:block w-64 flex-shrink-0"
        style={{
          width: '16rem',
          flexShrink: 0
        }}
      >
        <div 
          className="fixed top-0 left-0 w-64 h-screen"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '16rem',
            height: '100vh'
          }}
        >
          <Sidebar />
        </div>
      </aside>

      {/* Main Content */}
      <div 
        className="flex-1 flex flex-col min-h-screen"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}
      >
        <Header />
        <main 
          className="flex-1 p-4 lg:p-6 overflow-auto"
          style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto'
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (min-width: 1024px) {
          .hidden.lg\\:block { display: block !important; }
          .lg\\:hidden { display: none !important; }
        }
        @media (max-width: 1023px) {
          .hidden.lg\\:block { display: none !important; }
        }
        @media (min-width: 640px) {
          .hidden.sm\\:flex { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
