import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiStore } from '../lib/supabase';
import { Cliente, PerfilCodigo, UsuarioInterno } from '../types';

interface AuthContextType {
  portalType: 'cliente' | 'interno';
  setPortalType: (type: 'cliente' | 'interno') => void;
  clienteActive: Cliente | null;
  staffActive: UsuarioInterno | null;
  activeSector: PerfilCodigo;
  allowedSectors: PerfilCodigo[];
  canAccessSector: (sector: PerfilCodigo) => boolean;
  loginCliente: (param1: string, param2?: string) => { success: boolean; cliente?: Cliente; message?: string; isNotRegistered?: boolean };
  cadastrarCliente: (nome: string, cpf: string, telefone?: string, email?: string) => { success: boolean; cliente?: Cliente; message?: string; alreadyRegistered?: boolean; isNew?: boolean };
  logoutCliente: () => void;
  loginStaffByEmail: (email: string) => UsuarioInterno | null;
  loginStaffWithCredentials: (email: string, password?: string) => { success: boolean; user?: UsuarioInterno; message?: string };
  switchStaffRole: (perfil: PerfilCodigo) => boolean;
  logoutStaff: () => void;
  refreshData: () => void;
}

export function getSectorPermissions(perfil?: PerfilCodigo): PerfilCodigo[] {
  if (!perfil) return ['comercial'];
  const p = perfil.toLowerCase();
  if (p === 'super_admin' || p === 'admin_master') {
    return ['admin_master', 'gestao', 'financeiro', 'comercial', 'super_admin'];
  }
  if (p === 'gestao') {
    return ['gestao', 'comercial', 'financeiro'];
  }
  if (p === 'financeiro') {
    return ['financeiro'];
  }
  if (p === 'comercial') {
    return ['comercial'];
  }
  return ['comercial'];
}

export function canAccessSectorHelper(userPerfil?: PerfilCodigo, targetSector?: PerfilCodigo): boolean {
  if (!userPerfil || !targetSector) return false;
  const allowed = getSectorPermissions(userPerfil);
  const targetNorm = targetSector.toLowerCase();
  if (targetNorm === 'admin_master' || targetNorm === 'super_admin') {
    return allowed.includes('super_admin') || allowed.includes('admin_master');
  }
  return allowed.includes(targetSector as PerfilCodigo);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clienteActive, setClienteActive] = useState<Cliente | null>(() => {
    const saved = localStorage.getItem('indica_active_cliente');
    if (saved) {
      try {
        const parsed: Cliente = JSON.parse(saved);
        const clientes = apiStore.getClientes();
        if (clientes.length === 0) {
          // Data still loading from server/supabase on startup
          return parsed;
        }
        const cleanCpf = parsed.cpf ? parsed.cpf.replace(/\D/g, '') : '';
        const exists = clientes.some((c) => c.id === parsed.id || (cleanCpf && c.cpf.replace(/\D/g, '') === cleanCpf));
        if (exists) return parsed;
        localStorage.removeItem('indica_active_cliente');
        return null;
      } catch {
        localStorage.removeItem('indica_active_cliente');
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

  const [activeSector, setActiveSectorState] = useState<PerfilCodigo>(() => {
    const savedSector = localStorage.getItem('indica_active_sector') as PerfilCodigo;
    const savedStaff = localStorage.getItem('indica_active_staff');
    if (savedStaff) {
      try {
        const parsed: UsuarioInterno = JSON.parse(savedStaff);
        if (savedSector && canAccessSectorHelper(parsed.perfil, savedSector)) {
          return savedSector;
        }
        return parsed.perfil || 'comercial';
      } catch {}
    }
    return 'comercial';
  });

  const allowedSectors = getSectorPermissions(staffActive?.perfil || 'comercial');

  const canAccessSector = (sector: PerfilCodigo): boolean => {
    if (!staffActive) return false;
    return canAccessSectorHelper(staffActive.perfil, sector);
  };

  const [portalType, setPortalType] = useState<'cliente' | 'interno'>(() => {
    const savedType = localStorage.getItem('indica_portal_type');
    if (savedType === 'interno' || savedType === 'cliente') {
      return savedType;
    }
    const savedStaff = localStorage.getItem('indica_active_staff');
    if (savedStaff) return 'interno';
    const savedCliente = localStorage.getItem('indica_active_cliente');
    if (savedCliente) return 'cliente';
    return 'cliente';
  });

  const [tick, setTick] = useState(0);
  const refreshData = () => setTick((t) => t + 1);

  // Live real-time event listener for storage and data updates
  useEffect(() => {
    const handleSync = () => {
      setTick((t) => t + 1);
      const savedType = localStorage.getItem('indica_portal_type');
      if (savedType === 'interno' || savedType === 'cliente') {
        setPortalType(savedType);
      }
      const savedCliente = localStorage.getItem('indica_active_cliente');
      if (savedCliente) {
        try {
          const parsed = JSON.parse(savedCliente);
          const currentClientes = apiStore.getClientes();
          if (currentClientes.length === 0) {
            setClienteActive(parsed);
          } else {
            const cleanCpf = parsed.cpf ? parsed.cpf.replace(/\D/g, '') : '';
            const exists = currentClientes.some((c) => c.id === parsed.id || (cleanCpf && c.cpf.replace(/\D/g, '') === cleanCpf));
            if (exists) {
              setClienteActive(parsed);
            } else {
              setClienteActive(null);
              localStorage.removeItem('indica_active_cliente');
            }
          }
        } catch {
          setClienteActive(null);
          localStorage.removeItem('indica_active_cliente');
        }
      } else {
        setClienteActive(null);
      }
      const savedStaff = localStorage.getItem('indica_active_staff');
      if (savedStaff) {
        try {
          const parsed = JSON.parse(savedStaff);
          setStaffActive(parsed);
        } catch {}
      }
    };

    window.addEventListener('indica_data_updated', handleSync);
    window.addEventListener('storage', handleSync);
    const timer = setInterval(handleSync, 2000);
    return () => {
      window.removeEventListener('indica_data_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('indica_portal_type', portalType);
  }, [portalType]);

  useEffect(() => {
    if (clienteActive) {
      const currentClientes = apiStore.getClientes();
      const cleanCpf = clienteActive.cpf ? clienteActive.cpf.replace(/\D/g, '') : '';
      const exists = currentClientes.some((c) => c.id === clienteActive.id || (cleanCpf && c.cpf.replace(/\D/g, '') === cleanCpf));
      if (exists) {
        localStorage.setItem('indica_active_cliente', JSON.stringify(clienteActive));
      } else {
        setClienteActive(null);
        localStorage.removeItem('indica_active_cliente');
      }
    } else {
      localStorage.removeItem('indica_active_cliente');
    }
  }, [clienteActive, tick]);

  useEffect(() => {
    if (staffActive) {
      localStorage.setItem('indica_active_staff', JSON.stringify(staffActive));
    } else {
      localStorage.removeItem('indica_active_staff');
    }
  }, [staffActive]);

  const loginCliente = (
    param1: string,
    param2?: string
  ): { success: boolean; cliente?: Cliente; message?: string; isNotRegistered?: boolean } => {
    const cpfRaw = param2 || param1;
    const cpfClean = cpfRaw.replace(/\D/g, '');

    if (cpfClean.length < 11) {
      return { success: false, message: 'Por favor, informe um CPF válido com 11 dígitos.' };
    }

    const clientes = apiStore.getClientes();
    const existing = clientes.find((c) => c.cpf.replace(/\D/g, '') === cpfClean);

    if (!existing) {
      return {
        success: false,
        isNotRegistered: true,
        message: 'CPF não cadastrado. Por favor, realize seu cadastro antes de acessar o painel.',
      };
    }

    // Update name if name provided and different
    if (param2 && param1.trim() && param1.trim() !== 'Cliente Não Identificado') {
      const inputName = param1.trim();
      if (existing.nome !== inputName) {
        existing.nome = inputName;
        apiStore.saveCliente(existing);
      }
    }

    setClienteActive(existing);
    setPortalType('cliente');
    return { success: true, cliente: existing };
  };

  const cadastrarCliente = (
    nome: string,
    cpfRaw: string,
    telefone?: string,
    email?: string
  ): { success: boolean; cliente?: Cliente; message?: string; alreadyRegistered?: boolean; isNew?: boolean } => {
    const cpfClean = cpfRaw.replace(/\D/g, '');
    if (cpfClean.length < 11) {
      return { success: false, message: 'Por favor, informe um CPF válido com 11 dígitos.' };
    }
    if (!nome.trim()) {
      return { success: false, message: 'Por favor, informe seu Nome Completo.' };
    }
    if (!telefone || !telefone.trim()) {
      return { success: false, message: 'Por favor, informe seu Telefone / WhatsApp.' };
    }

    const formattedCpf = `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9)}`;
    const clientes = apiStore.getClientes();
    const existing = clientes.find((c) => c.cpf.replace(/\D/g, '') === cpfClean);

    if (existing) {
      return {
        success: false,
        alreadyRegistered: true,
        cliente: existing,
        message: `O CPF ${formattedCpf} já possui um cadastro ativo em nome de ${existing.nome}.`,
      };
    }

    const newCliente = apiStore.saveCliente({
      nome: nome.trim(),
      cpf: formattedCpf,
      telefone: telefone && telefone.trim() ? telefone.trim() : '(00) 00000-0000',
      email: email && email.trim() ? email.trim() : '',
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('indica_data_updated'));
    }

    setClienteActive(newCliente);
    setPortalType('cliente');
    return {
      success: true,
      isNew: true,
      cliente: newCliente,
      message: `Seja bem-vindo(a), ${newCliente.nome}! Seu cadastro foi realizado com sucesso.`,
    };
  };

  const logoutCliente = () => {
    setClienteActive(null);
    setPortalType('cliente');
    localStorage.removeItem('indica_active_cliente');
    localStorage.removeItem('indica_portal_type');
  };

  const loginStaffByEmail = (email: string): UsuarioInterno | null => {
    const usuarios = apiStore.getUsuarios();
    const user = usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.ativo);
    if (user) {
      setStaffActive(user);
      setActiveSectorState(user.perfil || 'comercial');
      localStorage.setItem('indica_active_sector', user.perfil || 'comercial');
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
    setActiveSectorState(user.perfil || 'comercial');
    localStorage.setItem('indica_active_sector', user.perfil || 'comercial');
    setPortalType('interno');
    return { success: true, user };
  };

  const switchStaffRole = (targetSector: PerfilCodigo): boolean => {
    if (!staffActive) return false;
    if (canAccessSectorHelper(staffActive.perfil, targetSector)) {
      setActiveSectorState(targetSector);
      localStorage.setItem('indica_active_sector', targetSector);
      return true;
    } else {
      alert(`Acesso Restrito ao Setor: Sua conta (${staffActive.nome}) está designada ao setor '${staffActive.perfil.toUpperCase()}' e não possui permissão para acessar o setor '${targetSector.toUpperCase()}'.`);
      return false;
    }
  };

  const logoutStaff = () => {
    setStaffActive(null);
    setPortalType('cliente');
    localStorage.removeItem('indica_active_staff');
    localStorage.removeItem('indica_active_sector');
    localStorage.removeItem('indica_portal_type');
  };

  return (
    <AuthContext.Provider
      value={{
        portalType,
        setPortalType,
        clienteActive,
        staffActive,
        activeSector,
        allowedSectors,
        canAccessSector,
        loginCliente,
        cadastrarCliente,
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
