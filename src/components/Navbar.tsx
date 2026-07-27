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
  UserCheck,
  Search,
} from 'lucide-react';
import { PerfilCodigo } from '../types';

interface NavbarProps {
  onOpenReports: () => void;
  onOpenSqlViewer: () => void;
  onOpenSearchCpf: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenReports, onOpenSqlViewer, onOpenSearchCpf }) => {
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

  // EXCLUSIVE CLIENT NAVBAR - NO ADMIN/STAFF CONTROLS OR PORTAL SWITCHERS
  if (auth.portalType === 'cliente') {
    return (
      <header className="sticky top-0 z-40 bg-[#0B192C]/95 backdrop-blur-md border-b border-amber-500/30 text-white shadow-lg transition-colors duration-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* OFFICE LOGO & BRAND */}
            <div className="flex items-center space-x-3 shrink-0 min-w-0">
              <img
                src="https://i.ibb.co/hxkKFSXL/logo.png"
                alt="Bissoli & Bissoli"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.triedJpg) {
                    target.dataset.triedJpg = 'true';
                    target.src = 'https://i.ibb.co/hxkKFSXL/logo.jpg';
                  } else if (!target.dataset.triedWebp) {
                    target.dataset.triedWebp = 'true';
                    target.src = 'https://i.ibb.co/hxkKFSXL/logo.webp';
                  } else if (!target.dataset.triedImg) {
                    target.dataset.triedImg = 'true';
                    target.src = 'https://i.ibb.co/hxkKFSXL/image.png';
                  }
                }}
                className="h-8 sm:h-9 w-auto object-contain bg-amber-400/10 p-1 rounded-lg border border-amber-400/40 shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-extrabold text-white leading-tight truncate">
                  Bissoli & Bissoli Advogados
                </h1>
                <p className="text-[10px] sm:text-[11px] font-bold text-amber-400 tracking-wide uppercase truncate">
                  Área Oficial do Cliente
                </p>
              </div>
            </div>

            {/* RIGHT SIDE: CLIENT BADGE & LOGOUT */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              {auth.clienteActive && (
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-amber-400/10 rounded-xl border border-amber-400/30 text-amber-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="truncate max-w-[140px]">{auth.clienteActive.nome.split(' ')[0]}</span>
                </div>
              )}

              {/* THEME TOGGLE */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
                title="Alternar Tema Claro/Escuro"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-300" />
                )}
              </button>

              {/* LOGOUT CLIENT */}
              {auth.clienteActive && (
                <button
                  onClick={() => auth.logoutCliente()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-900/50 hover:bg-rose-900/80 text-rose-200 text-xs font-semibold border border-rose-700/60 transition-colors cursor-pointer"
                  title="Sair da Área do Cliente"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // INTERNAL STAFF NAVBAR (EQUIPE)
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
                Bissoli & Bissoli Advogados
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Painel da Equipe
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sistema Interno de Gestão Comercial & CRM
              </p>
            </div>
          </div>

          {/* SEARCH CLIENT BY CPF BUTTON & LOGGED-IN STAFF BADGE */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={onOpenSearchCpf}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 dark:hover:bg-amber-500/30 border border-amber-400/40 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Pesquisar Cliente por CPF</span>
            </button>

            {auth.staffActive && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <div className="text-left leading-tight">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[150px]">
                    {auth.staffActive.nome}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate max-w-[150px]">
                    {auth.staffActive.email}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT ACTIONS: QUICK ROLE SWITCHER, REPORTS, THEME TOGGLE, LOGOUT */}
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

            {/* STAFF LOGOUT BUTTON */}
            <button
              onClick={() => auth.logoutStaff()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              title="Sair do Painel da Equipe"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* MOBILE ACTIONS */}
        <div className="lg:hidden py-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={onOpenSearchCpf}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-400/40 flex items-center justify-center space-x-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Pesquisar por CPF</span>
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
