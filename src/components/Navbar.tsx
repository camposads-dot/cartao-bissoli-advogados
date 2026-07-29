import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiStore } from '../lib/supabase';
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
  Bell,
  Contact,
  CheckCircle2,
  Clock,
  UserPlus,
  ArrowRight,
  X,
} from 'lucide-react';
import { PerfilCodigo } from '../types';

interface NavbarProps {
  onOpenReports: () => void;
  onOpenSqlViewer: () => void;
  onOpenSearchCpf: () => void;
  onOpenContacts: () => void;
  onOpenClientWithCpf?: (cpf: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenReports,
  onOpenSqlViewer,
  onOpenSearchCpf,
  onOpenContacts,
  onOpenClientWithCpf,
}) => {
  const { theme, toggleTheme } = useTheme();
  const auth = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const [, setRefreshTick] = useState(0);

  // Live real-time toast alert state for collaborators
  const [toastNotif, setToastNotif] = useState<{
    id: string;
    titulo: string;
    descricao: string;
    usuario: string;
    data: string;
    cpf: string;
    tipo: string;
  } | null>(null);

  const [lastSeenLogId, setLastSeenLogId] = useState<string | null>(null);

  // Live real-time update listener & poller
  useEffect(() => {
    const trigger = () => setRefreshTick((prev) => prev + 1);
    window.addEventListener('indica_data_updated', trigger);
    window.addEventListener('storage', trigger);
    const timer = setInterval(trigger, 2000);
    return () => {
      window.removeEventListener('indica_data_updated', trigger);
      window.removeEventListener('storage', trigger);
      clearInterval(timer);
    };
  }, []);

  // DERIVE RECENT SYSTEM NOTIFICATIONS
  const logs = apiStore.getLogs();
  const clientes = apiStore.getClientes();
  const indicacoes = apiStore.getIndicacoes();

  // Combine top recent events into a notifications array
  const rawNotifications = logs.map((log) => {
    let targetCpf = '';
    // find client cpf match from log description
    const foundClient = clientes.find((c) => (log.detalhes && log.detalhes.includes(c.nome)) || (log.usuarioNome && log.usuarioNome.includes(c.nome)));
    const foundInd = indicacoes.find((i) => (log.detalhes && log.detalhes.includes(i.nomeIndicado)) || (i.clienteNome && log.detalhes && log.detalhes.includes(i.clienteNome)));

    if (foundClient) targetCpf = foundClient.cpf;
    else if (foundInd) targetCpf = foundInd.clienteCpf;

    return {
      id: log.id,
      titulo: log.acao,
      descricao: log.detalhes,
      usuario: log.usuarioNome,
      data: log.criadoEm,
      cpf: targetCpf,
      tipo: log.acao.includes('Cliente') ? 'cliente' : 'indicacao',
    };
  });

  // Check for new logs in real time and trigger toast alert for collaborators
  useEffect(() => {
    if (logs.length > 0) {
      const topLog = logs[0];
      if (lastSeenLogId && topLog.id !== lastSeenLogId) {
        const matchingNotif = rawNotifications.find((n) => n.id === topLog.id);
        if (matchingNotif && auth.portalType === 'interno') {
          setToastNotif(matchingNotif);
        }
      } else if (!lastSeenLogId) {
        setLastSeenLogId(topLog.id);
      }
      if (topLog.id !== lastSeenLogId) {
        setLastSeenLogId(topLog.id);
      }
    }
  }, [logs.length, logs[0]?.id, auth.portalType]);

  const notifications = rawNotifications.slice(0, 8);
  const unreadCount = notifications.filter((n) => !readNotifications.includes(n.id)).length;

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    setReadNotifications((prev) => [...prev, notif.id]);
    setNotificationsOpen(false);

    if (notif.cpf && onOpenClientWithCpf) {
      onOpenClientWithCpf(notif.cpf);
    } else {
      onOpenContacts();
    }
  };

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
            <button
              onClick={onOpenContacts}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Contact className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Lista de Clientes</span>
            </button>

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

          {/* RIGHT ACTIONS: NOTIFICATIONS, THEME TOGGLE & LOGOUT */}
          <div className="flex items-center space-x-2 relative">
            {/* NOTIFICATION BELL BUTTON */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Notificações do Sistema"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-extrabold text-slate-950 shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN POPOVER */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-slate-900 dark:text-white animate-in fade-in slide-in-from-top-2">
                  <div className="p-3.5 bg-gradient-to-r from-slate-900 to-[#071325] text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold">Últimas Atualizações ({notifications.length})</span>
                    </div>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        Nenhuma notificação recente.
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isUnread = !readNotifications.includes(notif.id);
                        return (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3 hover:bg-amber-500/10 cursor-pointer transition-colors flex items-start space-x-3 ${
                              isUnread ? 'bg-amber-500/5 dark:bg-amber-500/10' : ''
                            }`}
                          >
                            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0 mt-0.5">
                              {notif.tipo === 'cliente' ? (
                                <UserPlus className="w-4 h-4" />
                              ) : (
                                <Clock className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white">
                                  {notif.titulo}
                                </h4>
                                {isUnread && (
                                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                                {notif.descricao}
                              </p>
                              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                                <span>Por: {notif.usuario}</span>
                                <span>{new Date(notif.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2 bg-slate-50 dark:bg-slate-900/90 text-center border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setNotificationsOpen(false);
                        onOpenContacts();
                      }}
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-bold"
                    >
                      Ver todos os contatos e clientes →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* THEME TOGGLE */}
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
          {/* TOP MOBILE ACTIONS */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenContacts}
              className="py-2.5 px-3 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-400/40 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Contact className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Lista Clientes</span>
            </button>
            <button
              onClick={onOpenSearchCpf}
              className="py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Buscar CPF</span>
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

      {/* REAL-TIME FLOATING TOAST NOTIFICATION FOR COLABORADORES */}
      {toastNotif && auth.portalType === 'interno' && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-[#0B192C] text-white p-4 rounded-2xl shadow-2xl border-2 border-amber-500/80 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Bell className="w-4 h-4 animate-bounce" />
              <span>Notificação da Equipe em Tempo Real</span>
            </div>
            <button
              onClick={() => setToastNotif(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2.5">
            <h4 className="text-sm font-extrabold text-white leading-tight">{toastNotif.titulo}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toastNotif.descricao}</p>
          </div>
          <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium">
              Por: {toastNotif.usuario}
            </span>
            <button
              onClick={() => {
                const current = toastNotif;
                setToastNotif(null);
                handleNotificationClick(current);
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Ver Detalhes / Cliente →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
