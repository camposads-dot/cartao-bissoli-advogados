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
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* OFFICE LOGO & BRAND */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink min-w-0">
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
                  Bissoli & Bissoli
                </h1>
                <p className="text-[10px] sm:text-[11px] font-bold text-amber-400 tracking-wide uppercase truncate hidden sm:block">
                  Área Oficial do Cliente
                </p>
              </div>
            </div>

            {/* RIGHT SIDE: CLIENT BADGE & LOGOUT */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
              {auth.clienteActive && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-amber-400/10 rounded-xl border border-amber-400/30 text-amber-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="truncate max-w-[140px]">{auth.clienteActive.nome.split(' ')[0]}</span>
                </div>
              )}

              {/* THEME TOGGLE (HIDDEN ON MOBILE TO PREVENT CUTTING OFF LOGOUT) */}
              <button
                onClick={toggleTheme}
                className="hidden lg:flex p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors shrink-0"
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
                  className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold border border-rose-500/50 shadow-xs transition-colors cursor-pointer shrink-0"
                  title="Sair da Área do Cliente"
                >
                  <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Sair</span>
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
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* BRAND / LOGO */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight flex flex-wrap items-center gap-1 sm:gap-2 truncate">
                <span className="truncate">Bissoli & Bissoli</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                  Painel da Equipe
                </span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Sistema Interno de Gestão & CRM
              </p>
            </div>
          </div>

          {/* SEARCH CLIENT BY CPF BUTTON & LOGGED-IN STAFF BADGE (VISIBLE ON DESKTOP) */}
          <div className="hidden lg:flex items-center space-x-3">
            {auth.staffActive && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <div className="text-left leading-tight">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">
                    {auth.staffActive.nome} ({auth.staffActive.perfil.replace('_', ' ').toUpperCase()})
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate max-w-[180px]">
                    {auth.staffActive.email}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT ACTIONS: THEME TOGGLE & LOGOUT (CLEAN & NON-DUPLICATED ON DESKTOP) */}
          <div className="flex items-center space-x-2">
            {/* THEME TOGGLE (DESKTOP ONLY - HIDDEN ON MOBILE TO GIVE MAXIMUM SPACE TO LOGOUT) */}
            <button
              onClick={toggleTheme}
              className="hidden lg:flex p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Alternar Tema Claro/Escuro"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* LOGOUT BUTTON - PROMINENT & UNCLIPPED */}
            {auth.staffActive ? (
              <button
                onClick={() => auth.logoutStaff()}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                title="Sair do Painel da Equipe"
              >
                <LogOut className="w-3.5 h-3.5 text-white" />
                <span>Sair</span>
              </button>
            ) : auth.clienteActive ? (
              <button
                onClick={() => auth.logoutCliente()}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                title="Sair do Portal do Cliente"
              >
                <LogOut className="w-3.5 h-3.5 text-white" />
                <span>Sair</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* MOBILE ACTIONS SUB-SECTION */}
        <div className="lg:hidden py-2.5 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* TOP MOBILE ACTION: ONLY BUSCAR POR CPF */}
          <div>
            <button
              onClick={onOpenSearchCpf}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Buscar por CPF</span>
            </button>
          </div>

          {/* IF INTERNAL COLABORADOR MODE ACTIVE ON MOBILE, SHOW SECTOR / USER ROLE SWITCHER */}
          {auth.portalType === 'interno' && (
            <div className="pt-1 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-0.5">
                Selecione o Setor / Perfil:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {roles.map((r) => (
                  <button
                    key={r.codigo}
                    onClick={() => auth.switchStaffRole(r.codigo)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
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

          {/* BELOW THE LAST SYSTEM USER / ROLE: RELATÓRIOS ON TOP, SQL SUPABASE ON BOTTOM */}
          <div className="pt-1 space-y-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-0.5">
              Relatórios & Sistema:
            </span>
            <button
              onClick={onOpenReports}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Relatórios</span>
            </button>

            <button
              onClick={onOpenSqlViewer}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center space-x-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Script SQL Supabase</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
