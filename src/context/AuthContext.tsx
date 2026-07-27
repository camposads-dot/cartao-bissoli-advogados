import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiStore } from '../lib/supabase';
import { Cliente, PerfilCodigo, UsuarioInterno } from '../types';

interface AuthContextType {
  portalType: 'cliente' | 'interno';
  setPortalType: (type: 'cliente' | 'interno') => void;
  clienteActive: Cliente | null;
  staffActive: UsuarioInterno | null;
  loginCliente: (nome: string, cpf: string) => Cliente;
  logoutCliente: () => void;
  loginStaffByEmail: (email: string) => UsuarioInterno | null;
  switchStaffRole: (perfil: PerfilCodigo) => void;
  logoutStaff: () => void;
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portalType, setPortalType] = useState<'cliente' | 'interno'>('cliente');
  const [clienteActive, setClienteActive] = useState<Cliente | null>(() => {
    const saved = localStorage.getItem('indica_active_cliente');
    return saved ? JSON.parse(saved) : null;
  });

  const [staffActive, setStaffActive] = useState<UsuarioInterno | null>(() => {
    const saved = localStorage.getItem('indica_active_staff');
    if (saved) return JSON.parse(saved);
    // Default to Comercial (Natan Campos) for fast testing
    const usuarios = apiStore.getUsuarios();
    return usuarios.find((u) => u.perfil === 'comercial') || usuarios[0] || null;
  });

  const [, setTick] = useState(0);
  const refreshData = () => setTick((t) => t + 1);

  useEffect(() => {
    if (clienteActive) {
      localStorage.setItem('indica_active_cliente', JSON.stringify(clienteActive));
    } else {
      localStorage.removeItem('indica_active_cliente');
    }
  }, [clienteActive]);

  useEffect(() => {
    if (staffActive) {
      localStorage.setItem('indica_active_staff', JSON.stringify(staffActive));
    } else {
      localStorage.removeItem('indica_active_staff');
    }
  }, [staffActive]);

  const loginCliente = (nome: string, cpfRaw: string): Cliente => {
    const cpfClean = cpfRaw.replace(/\D/g, '');
    const formattedCpf =
      cpfClean.length === 11
        ? `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9)}`
        : cpfRaw;

    const cliente = apiStore.saveCliente({
      nome: nome.trim() || 'Cliente Não Identificado',
      cpf: formattedCpf,
      telefone: '(00) 00000-0000',
    });

    setClienteActive(cliente);
    setPortalType('cliente');
    return cliente;
  };

  const logoutCliente = () => {
    setClienteActive(null);
  };

  const loginStaffByEmail = (email: string): UsuarioInterno | null => {
    const usuarios = apiStore.getUsuarios();
    const user = usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.ativo);
    if (user) {
      setStaffActive(user);
      setPortalType('interno');
      return user;
    }
    return null;
  };

  const switchStaffRole = (perfil: PerfilCodigo) => {
    const usuarios = apiStore.getUsuarios();
    const targetUser = usuarios.find(
      (u) => (u.perfil === perfil || (perfil === 'super_admin' && (u.perfil === 'super_admin' || u.perfil === 'SUPER_ADMIN'))) && u.ativo
    );
    if (targetUser) {
      setStaffActive(targetUser);
      setPortalType('interno');
    }
  };

  const logoutStaff = () => {
    setStaffActive(null);
  };

  return (
    <AuthContext.Provider
      value={{
        portalType,
        setPortalType,
        clienteActive,
        staffActive,
        loginCliente,
        logoutCliente,
        loginStaffByEmail,
        switchStaffRole,
        logoutStaff,
        refreshData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  return context;
};
