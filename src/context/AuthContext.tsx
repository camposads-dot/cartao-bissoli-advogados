import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiStore } from '../lib/supabase';
import { Cliente, PerfilCodigo, UsuarioInterno } from '../types';

interface AuthContextType {
  portalType: 'cliente' | 'interno';
  setPortalType: (type: 'cliente' | 'interno') => void;
  clienteActive: Cliente | null;
  staffActive: UsuarioInterno | null;
  loginCliente: (nome: string, cpf: string) => { success: boolean; cliente?: Cliente; message?: string };
  logoutCliente: () => void;
  loginStaffByEmail: (email: string) => UsuarioInterno | null;
  loginStaffWithCredentials: (email: string, password?: string) => { success: boolean; user?: UsuarioInterno; message?: string };
  switchStaffRole: (perfil: PerfilCodigo) => void;
  logoutStaff: () => void;
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clienteActive, setClienteActive] = useState<Cliente | null>(() => {
    const saved = localStorage.getItem('indica_active_cliente');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [staffActive, setStaffActive] = useState<UsuarioInterno | null>(() => {
    const saved = localStorage.getItem('indica_active_staff');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [portalType, setPortalType] = useState<'cliente' | 'interno'>(() => {
    const savedPortal = localStorage.getItem('indica_portal_type');
    if (savedPortal === 'interno' || savedPortal === 'cliente') {
      return savedPortal;
    }
    const savedStaff = localStorage.getItem('indica_active_staff');
    if (savedStaff) return 'interno';
    return 'cliente';
  });

  const [, setTick] = useState(0);
  const refreshData = () => setTick((t) => t + 1);

  useEffect(() => {
    localStorage.setItem('indica_portal_type', portalType);
  }, [portalType]);

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

  const loginCliente = (
    nome: string,
    cpfRaw: string
  ): { success: boolean; cliente?: Cliente; message?: string } => {
    const cpfClean = cpfRaw.replace(/\D/g, '');
    const formattedCpf =
      cpfClean.length === 11
        ? `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9)}`
        : cpfRaw;

    const trimmedNome = nome.trim() || 'Cliente Não Identificado';

    try {
      const cliente = apiStore.saveCliente({
        nome: trimmedNome,
        cpf: formattedCpf,
        telefone: '(00) 00000-0000',
      });

      setClienteActive(cliente);
      setPortalType('cliente');
      return { success: true, cliente };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Erro ao realizar acesso com o CPF informado.',
      };
    }
  };

  const logoutCliente = () => {
    setClienteActive(null);
    setPortalType('cliente');
    localStorage.removeItem('indica_active_cliente');
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

  const loginStaffWithCredentials = (
    email: string,
    password?: string
  ): { success: boolean; user?: UsuarioInterno; message?: string } => {
    const usuarios = apiStore.getUsuarios();
    const cleanEmail = email.trim().toLowerCase();
    const user = usuarios.find((u) => u.email.toLowerCase() === cleanEmail && u.ativo);

    if (!user) {
      return { success: false, message: 'E-mail não cadastrado ou conta inativa.' };
    }

    if (user.senha && password !== undefined) {
      if (user.senha !== password.trim()) {
        return { success: false, message: 'Senha de acesso incorreta.' };
      }
    }

    setStaffActive(user);
    setPortalType('interno');
    return { success: true, user };
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
    setPortalType('cliente');
    localStorage.removeItem('indica_active_staff');
    localStorage.setItem('indica_portal_type', 'cliente');
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
        loginStaffWithCredentials,
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
