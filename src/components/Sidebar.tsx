import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiStore, getSupabaseStatus, SupabaseStatusState } from '../lib/supabase';
import {
  Briefcase,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Sparkles,
  FileText,
  Database,
  UserCheck,
  LogOut,
  Moon,
  Sun,
  LayoutDashboard,
  Users,
  ChevronRight,
  Gift,
  Building2,
  TrendingUp,
  Contact,
  CloudCheck,
  CloudOff,
} from 'lucide-react';
import { PerfilCodigo } from '../types';

interface SidebarProps {
  onOpenReports: () => void;
  onOpenSqlViewer: () => void;
  onOpenSearchCpf: () => void;
  onOpenContacts: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenReports,
  onOpenSqlViewer,
  onOpenSearchCpf,
  onOpenContacts,
}) => {
  const { theme, toggleTheme } = useTheme();
  const auth = useAuth();
  const [, setRefreshTick] = useState(0);
  const [supaStatus, setSupaStatus] = useState<SupabaseStatusState>(getSupabaseStatus());

  // Live updates listener & poller
  useEffect(() => {
    const trigger = () => setRefreshTick((prev) => prev + 1);
    const handleSupaStatus = () => setSupaStatus(getSupabaseStatus());
    window.addEventListener('indica_data_updated', trigger);
    window.addEventListener('storage', trigger);
    window.addEventListener('supabase_status_changed', handleSupaStatus);
    const timer = setInterval(trigger, 2000);
    return () => {
      window.removeEventListener('indica_data_updated', trigger);
      window.removeEventListener('storage', trigger);
      window.removeEventListener('supabase_status_changed', handleSupaStatus);
      clearInterval(timer);
    };
  }, []);

  // METRICS SUMMARY FOR SIDEBAR
  const indicacoes = apiStore.getIndicacoes();
  const cupons = apiStore.getCupons();

  const totalIndicacoes = indicacoes.length;
  const totalContratos = indicacoes.filter(
    (i) => i.status === 'Contrato Fechado' || i.status === 'Cupom Gerado' || i.status === 'Cupom Utilizado'
  ).length;
  const totalCuponsDisponiveis = cupons
    .filter((c) => c.status === 'Disponivel')
    .reduce((sum, c) => sum + c.valor, 0);

  const roles: { codigo: PerfilCodigo; nome: string; gestor: string; icon: React.ReactNode }[] = [
    {
      codigo: 'comercial',
      nome: 'Comercial',
      gestor: 'Natan Campos',
      icon: <Briefcase className="w-4 h-4 text-blue-400" />,
    },
    {
      codigo: 'financeiro',
      nome: 'Financeiro',
      gestor: 'Letícia',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
    },
    {
      codigo: 'gestao',
      nome: 'Gestão',
      gestor: 'Dra. Cristiane',
      icon: <BarChart3 className="w-4 h-4 text-purple-400" />,
    },
    {
      codigo: 'admin_master',
      nome: 'Admin Master',
      gestor: 'Administrador',
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
    },
    {
      codigo: 'super_admin',
      nome: 'Super Admin',
      gestor: 'Elnatan Campos',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-[#0B192C] text-slate-200 border-r border-slate-800/80 shrink-0 h-full select-none z-30 overflow-hidden transition-colors">
      
      {/* SIDEBAR BRAND HEADER (ALWAYS PINNED TO TOP) */}
      <div className="h-16 px-4 flex items-center space-x-3 border-b border-slate-800/80 shrink-0 bg-[#07111E]">
        <img
          src="https://i.ibb.co/hxkKFSXL/logo.png"
          alt="Bissoli & Bissoli"
          className="w-9 h-9 rounded-lg border border-amber-400/40 object-cover shadow-xs"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="min-w-0">
          <h2 className="text-xs font-extrabold text-white leading-tight truncate">
            Bissoli & Bissoli
          </h2>
          <p className="text-[10px] font-bold text-amber-400 tracking-wide uppercase truncate">
            Advogados
          </p>
        </div>
      </div>

      {/* SIDEBAR MAIN SCROLLABLE MENU CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">

        {/* LOGGED USER PROFILE CARD */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-inner">
            {auth.staffActive ? auth.staffActive.nome.charAt(0) : auth.clienteActive ? auth.clienteActive.nome.charAt(0) : 'B'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-white truncate">
              {auth.staffActive?.nome || auth.clienteActive?.nome || 'Visitante'}
            </h3>
            <p className="text-[10px] text-slate-400 truncate">
              {auth.staffActive ? auth.staffActive.email : auth.clienteActive ? `CPF: ${auth.clienteActive.cpf}` : 'Portal do Cliente'}
            </p>
          </div>
        </div>

        {/* METRICS DASHBOARD SUMMARY (EXCLUSIVO PARA ÁREA INTERNA DA EQUIPE) */}
        {auth.portalType === 'interno' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Resumo do Painel
              </span>
              <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Ao Vivo</span>
              </span>
            </div>

            <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Indicações</span>
                </span>
                <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md">{totalIndicacoes}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center space-x-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Contratos Fechados</span>
                </span>
                <span className="font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                  {totalContratos}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center space-x-2">
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cupons Disponíveis</span>
                </span>
                <span className="font-bold text-amber-400">R$ {totalCuponsDisponiveis.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM SHORTCUTS / FERRAMENTAS (EXCLUSIVO PARA ÁREA INTERNA DA EQUIPE) */}
        {auth.portalType === 'interno' && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 block">
              Ferramentas & Pesquisa
            </span>
            <div className="space-y-1">
              <button
                onClick={onOpenContacts}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <Contact className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Lista de Clientes</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={onOpenSearchCpf}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Buscar por CPF</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={onOpenReports}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Relatórios em PDF/CSV</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={onOpenSqlViewer}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer group ${
                  supaStatus.connected
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/80 border-transparent hover:border-slate-700'
                    : 'text-amber-300 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Database className={`w-4 h-4 shrink-0 ${supaStatus.connected ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
                  <span>Sincronização Supabase</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${supaStatus.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* SETORES INTERNOS (STAFF) */}
        {auth.portalType === 'interno' && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 block">
              Módulos / Setores
            </span>
            <div className="space-y-1">
              {roles.map((r) => {
                const isActive = auth.staffActive?.perfil === r.codigo;
                return (
                  <button
                    key={r.codigo}
                    onClick={() => auth.switchStaffRole(r.codigo)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-bold border-l-4 border-amber-400'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {r.icon}
                      <span>{r.nome}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* FOOTER SECTION: THEME TOGGLE & LOGOUT (ALWAYS PINNED TO BOTTOM) */}
      <div className="p-4 border-t border-slate-800/80 bg-[#07111E] shrink-0 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors border border-slate-800 cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
            <span>Tema {theme === 'dark' ? 'Escuro' : 'Claro'}</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
            {theme}
          </span>
        </button>

        {auth.staffActive ? (
          <button
            onClick={() => auth.logoutStaff()}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sair do Painel</span>
          </button>
        ) : auth.clienteActive ? (
          <button
            onClick={() => auth.logoutCliente()}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        ) : null}
      </div>

    </aside>
  );
};

