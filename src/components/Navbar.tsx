import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Building2,
  Users,
  ShieldCheck,
  Briefcase,
  DollarSign,
  BarChart3,
  Moon,
  Sun,
  FileText,
  Database,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { PerfilCodigo } from '../types';

interface NavbarProps {
  onOpenReports: () => void;
  onOpenSqlViewer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenReports, onOpenSqlViewer }) => {
  const {
    portalType,
    setPortalType,
    clienteActive,
    staffActive,
    logoutCliente,
    switchStaffRole,
    refreshData,
  } = useTheme() as any; // fallback theme
  const { theme, toggleTheme } = useTheme();
  const auth = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roles: { codigo: PerfilCodigo; nome: string; gestor: string; icon: React.ReactNode }[] = [
    {
      codigo: 'super_admin',
      nome: 'Super Admin',
      gestor: 'Elnatan Campos',
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
    },
    {
      codigo: 'comercial',
      nome: 'Comercial',
      gestor: 'Natan Campos',
      icon: <Briefcase className="w-4 h-4 text-blue-500" />,
    },
    {
      codigo: 'financeiro',
      nome: 'Financeiro',
      gestor: 'Letícia',
      icon: <DollarSign className="w-4 h-4 text-emerald-500" />,
    },
    {
      codigo: 'gestao',
      nome: 'Gestão',
      gestor: 'Dra. Cristiane',
      icon: <BarChart3 className="w-4 h-4 text-purple-500" />,
    },
    {
      codigo: 'admin_master',
      nome: 'Admin Master',
      gestor: 'Administrador',
      icon: <ShieldCheck className="w-4 h-4 text-amber-500" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* BRAND / LOGO */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                Advocacia Cristiane & Associados
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  LegalReferral CRM
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sistema de Gestão Comercial, Controle de Indicações & Recompensas
              </p>
            </div>
          </div>

          {/* MAIN PORTAL SWITCHER TABS */}
          <div className="hidden lg:flex items-center bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => auth.setPortalType('cliente')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                auth.portalType === 'cliente'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Portal do Cliente</span>
              {auth.clienteActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            <button
              onClick={() => auth.setPortalType('interno')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                auth.portalType === 'interno'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Painéis Internos (Equipe)</span>
            </button>
          </div>

          {/* RIGHT ACTIONS: QUICK ROLE SWITCHER, REPORTS, THEME TOGGLE, SQL */}
          <div className="flex items-center space-x-2">
            {/* ROLE SELECTOR WHEN IN INTERNAL PORTAL */}
            {auth.portalType === 'interno' && (
              <div className="hidden xl:flex items-center space-x-1 mr-1 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2">Perfil:</span>
                {roles.map((r) => (
                  <button
                    key={r.codigo}
                    onClick={() => auth.switchStaffRole(r.codigo)}
                    title={`Acessar como ${r.nome} (${r.gestor})`}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      auth.staffActive?.perfil === r.codigo
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                    }`}
                  >
                    {r.icon}
                    <span>{r.nome}</span>
                  </button>
                ))}
              </div>
            )}

            {/* REPORTS BUTTON */}
            <button
              onClick={onOpenReports}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Gerar e Exportar Relatórios"
            >
              <FileText className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Relatórios</span>
            </button>

            {/* SUPABASE SQL SCRIPT BUTTON */}
            <button
              onClick={onOpenSqlViewer}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 transition-colors"
              title="Ver Script SQL do Supabase"
            >
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Script SQL</span>
            </button>

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Alternar Tema Claro/Escuro"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE PORTAL & ROLE SWITCHER */}
        <div className="lg:hidden py-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* ACCESS MODE SELECTOR (2 MAIN OPTIONS) */}
          <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                auth.setPortalType('cliente');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold text-center flex items-center justify-center space-x-1.5 transition-all ${
                auth.portalType === 'cliente'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Acesso Cliente</span>
            </button>
            <button
              onClick={() => {
                auth.setPortalType('interno');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold text-center flex items-center justify-center space-x-1.5 transition-all ${
                auth.portalType === 'interno'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acesso Colaborador</span>
            </button>
          </div>

          {/* IF INTERNAL COLABORADOR MODE ACTIVE ON MOBILE, SHOW SECTOR SWITCHER */}
          {auth.portalType === 'interno' && (
            <div className="pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Selecione o Setor / Perfil:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {roles.map((r) => (
                  <button
                    key={r.codigo}
                    onClick={() => auth.switchStaffRole(r.codigo)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                      auth.staffActive?.perfil === r.codigo
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {r.icon}
                    <span className="truncate">{r.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
