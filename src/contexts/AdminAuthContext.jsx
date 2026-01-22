import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AdminAuthContext = createContext(null);

const ADMIN_STORAGE_KEY = 'vincci_admin_session';

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const savedSession = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Verify session is still valid (check expiration)
        if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
          setAdmin(parsed.admin);
        } else {
          localStorage.removeItem(ADMIN_STORAGE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await supabase.functions.invoke('admin-auth', {
        body: { action: 'login', email, password },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao fazer login');
      }

      const data = response.data;
      
      if (!data.success) {
        throw new Error(data.error || 'Credenciais inválidas');
      }

      // Set session with 24h expiration
      const session = {
        admin: data.admin,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
      setAdmin(data.admin);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setAdmin(null);
  };

  const isManager = admin?.role === 'manager';
  const isPlanner = admin?.role === 'planner';
  const isViewer = admin?.role === 'viewer';
  const canEdit = isManager || isPlanner;
  const canManageUsers = isManager;

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        isAuthenticated: !!admin,
        isManager,
        isPlanner,
        isViewer,
        canEdit,
        canManageUsers,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}