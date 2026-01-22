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
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <Link to="/admin/drinks" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Wine className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Vincci Bar</h1>
            <p className="text-xs text-zinc-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
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
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-zinc-800">
        <div className="px-4 py-3 rounded-xl bg-zinc-800/50">
          <p className="text-sm font-medium text-white truncate">
            {admin?.nome_completo}
          </p>
          <p className="text-xs text-zinc-500 capitalize">{admin?.role}</p>
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
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'planner':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'viewer':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <header className="h-16 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-zinc-900 border-zinc-800">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Title - Mobile */}
      <h1 className="lg:hidden text-lg font-semibold text-white">Vincci Admin</h1>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* User Info & Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {admin?.nome_completo}
            </p>
            <span
              className={cn(
                'inline-flex text-xs px-2 py-0.5 rounded-full border capitalize',
                getRoleBadgeColor(admin?.role)
              )}
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
        >
          <LogOut className="w-5 h-5" />
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
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="fixed top-0 left-0 w-64 h-screen">
          <Sidebar />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}