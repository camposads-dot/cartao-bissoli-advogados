import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiStore } from '../lib/supabase';
import officeImg from '../assets/images/office_building_1785179140211.jpg';
import {
  User,
  Users,
  PlusCircle,
  Gift,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Award,
  Phone,
  FileText,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Search,
  Scale,
  QrCode,
  Building2,
  MapPin,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Indicacao, StatusIndicacao } from '../types';

export const ClientPortal: React.FC = () => {
  const auth = useAuth();

  // LOGIN STATE
  const [nomeInput, setNomeInput] = useState('');
  const [cpfInput, setCpfInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // NEW INDICATION FORM STATE
  const [showNewModal, setShowNewModal] = useState(false);
  const [nomeIndicado, setNomeIndicado] = useState('');
  const [cpfIndicado, setCpfIndicado] = useState('');
  const [telefoneIndicado, setTelefoneIndicado] = useState('');
  const [tipoAcaoId, setTipoAcaoId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // DATA
  const tiposAcao = apiStore.getTiposAcao().filter((t) => t.ativo);
  const allIndicacoes = apiStore.getIndicacoes();
  const allCupons = apiStore.getCupons();

  // CLIENT SPECIFIC DATA
  const clienteIndicacoes = auth.clienteActive
    ? allIndicacoes.filter((i) => i.clienteId === auth.clienteActive?.id)
    : [];

  const clienteCupons = auth.clienteActive
    ? allCupons.filter((c) => c.clienteId === auth.clienteActive?.id)
    : [];

  // STATS
  const countTotal = clienteIndicacoes.length;
  const countAtendimento = clienteIndicacoes.filter((i) => i.status === 'Em Atendimento').length;
  const countQualificadas = clienteIndicacoes.filter((i) => i.status === 'Qualificada').length;
  const countDesqualificadas = clienteIndicacoes.filter((i) => i.status === 'Desqualificada').length;
  const countContratos = clienteIndicacoes.filter(
    (i) => i.status === 'Contrato Fechado' || i.status === 'Cupom Gerado' || i.status === 'Cupom Utilizado'
  ).length;

  const valorTotalArrecadado = clienteCupons.reduce((sum, c) => sum + c.valor, 0);
  const cuponsDisponiveis = clienteCupons.filter((c) => c.status === 'Disponivel');
  const valorAcumuladoDisponivel = cuponsDisponiveis.reduce((sum, c) => sum + c.valor, 0);

  // CPF MASKING HELPER
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`;
    }
    setter(value);
  };

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfInput || cpfInput.replace(/\D/g, '').length < 11) {
      setLoginError('Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }
    if (!nomeInput.trim()) {
      setLoginError('Por favor, informe seu Nome completo.');
      return;
    }

    setLoginError('');
    const res = auth.loginCliente(nomeInput, cpfInput);
    if (!res.success) {
      setLoginError(res.message || 'Erro ao realizar login com o CPF informado.');
    } else {
      auth.refreshData();
    }
  };

  const handleCreateIndicacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.clienteActive) return;

    if (!nomeIndicado.trim() || !cpfIndicado || !telefoneIndicado || !tipoAcaoId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const selectedTipo = tiposAcao.find((t) => t.id === tipoAcaoId);

    apiStore.saveIndicacao({
      clienteId: auth.clienteActive.id,
      clienteNome: auth.clienteActive.nome,
      clienteCpf: auth.clienteActive.cpf,
      nomeIndicado: nomeIndicado.trim(),
      cpfIndicado: cpfIndicado,
      telefoneIndicado: telefoneIndicado,
      tipoAcaoId: tipoAcaoId,
      tipoAcaoNome: selectedTipo?.nome || 'Ação Judicial',
      observacoes: observacoes,
    });

    setFormSuccess('Indicação cadastrada com sucesso! Status inicial: Recebida.');
    setNomeIndicado('');
    setCpfIndicado('');
    setTelefoneIndicado('');
    setObservacoes('');
    setTimeout(() => {
      setFormSuccess('');
      setShowNewModal(false);
    }, 1800);
    auth.refreshData();
  };

  const getStatusBadge = (status: StatusIndicacao) => {
    switch (status) {
      case 'Recebida':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3 h-3 mr-1 text-slate-500" />
            Recebida
          </span>
        );
      case 'Em Atendimento':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3 h-3 mr-1 text-blue-500" />
            Em Atendimento
          </span>
        );
      case 'Qualificada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3 h-3 mr-1 text-purple-500" />
            Qualificada
          </span>
        );
      case 'Desqualificada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3 mr-1 text-rose-500" />
            Desqualificada
          </span>
        );
      case 'Contrato Fechado':
      case 'Cupom Gerado':
      case 'Cupom Utilizado':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
            Contrato Fechado
          </span>
        );
      default:
        return null;
    }
  };

  // IF NO CLIENT LOGGED IN -> EXCLUSIVE INSTITUTIONAL LANDING & LOGIN SCREEN
  if (!auth.clienteActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#071325] via-[#0B192C] to-[#050C17] text-slate-100 flex flex-col justify-between p-3 sm:p-6 lg:p-8 xl:p-10 relative overflow-x-hidden w-full max-w-full font-sans">
        {/* BACKGROUND DECORATIVE GLOWS */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] max-w-full h-[350px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] max-w-full h-[300px] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

        {/* TOP BRAND HEADER (MOBILE/DESKTOP) */}
        <div className="max-w-6xl xl:max-w-7xl mx-auto w-full pt-2 sm:pt-4 pb-2 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#0B192C]/90 rounded-xl border border-amber-400/40 shadow-lg shrink-0">
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
                  className="h-10 sm:h-12 w-auto object-contain rounded"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                  Bissoli & Bissoli Advogados Associados
                </h1>
                <p className="text-[11px] sm:text-xs font-bold text-amber-400 tracking-wider uppercase">
                  Portal do Cliente • Sistema de Indicações
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                auth.setPortalType('interno');
                auth.refreshData();
              }}
              className="px-3.5 py-1.5 rounded-xl font-semibold text-xs border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 flex items-center space-x-1.5 transition-colors shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Acesso Equipe / Colaborador</span>
            </button>
          </div>
        </div>

        {/* MAIN DUAL COLUMN HERO (DESKTOP GRID / MOBILE STACK) */}
        <div className="max-w-6xl xl:max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center my-auto py-6 relative z-10">
          
          {/* LEFT COLUMN: BRANDING, VISUAL CLIENT CARD & INSTITUTIONAL CARD */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30 uppercase">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                Programa de Benefícios & Acompanhamento
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Indique amigos e receba <span className="text-amber-400">recompensas exclusivas</span> em honorários
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Bem-vindo ao Portal Oficial de Clientes do escritório Bissoli & Bissoli. Cadastre e acompanhe suas indicações de forma 100% transparente, segura e digital.
              </p>
            </div>

            {/* VISUAL CLIENT CARD (CARTÃO DO CLIENTE) */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#0B192C] via-[#1E3A8A] to-[#071325] p-5 sm:p-6 border-2 border-amber-400/40 shadow-2xl shadow-amber-500/10 overflow-hidden">
              {/* GOLD STRIPE TOP */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600" />
              
              {/* WATERMARK EMBLEM */}
              <Scale className="absolute -right-6 -bottom-6 w-36 h-36 text-amber-400/5 pointer-events-none" />

              {/* CARD TOP ROW */}
              <div className="flex items-center justify-between mb-5 gap-2">
                <div className="flex items-center space-x-2 min-w-0">
                  <img
                    src="https://i.ibb.co/hxkKFSXL/logo.png"
                    alt="Logo"
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
                    className="h-7 w-auto object-contain bg-amber-400/10 p-0.5 rounded border border-amber-400/40 shrink-0"
                  />
                  <span className="text-[11px] font-extrabold tracking-widest text-amber-300 uppercase truncate">
                    Bissoli & Bissoli
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                  Cartão do Cliente
                </span>
              </div>

              {/* CARD MIDDLE ROW */}
              <div className="flex items-center justify-between my-3">
                <div className="space-y-1">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center border border-amber-100/50">
                    <div className="w-full h-full border border-amber-900/20 rounded-xs flex items-center justify-center">
                      <div className="w-3 h-3 border-r border-b border-amber-900/40" />
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-300 tracking-widest block pt-1">
                    MEMBER ID • CLIENTE PREFERENCIAL
                  </span>
                </div>

                {/* QR CODE GRAPHIC */}
                <div className="bg-white p-1.5 rounded-lg shadow-md border border-amber-400/40">
                  <QrCode className="w-8 h-8 text-slate-900" />
                </div>
              </div>

              {/* CARD BOTTOM ROW */}
              <div className="pt-2 border-t border-amber-400/20 flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-amber-400/80">
                    Acesso Preferencial
                  </p>
                  <p className="text-xs font-bold text-white tracking-wide">
                    Área Oficial do Cliente Bissoli & Bissoli
                  </p>
                </div>
              </div>
            </div>

            {/* CARD INSTITUCIONAL DO ESCRITÓRIO */}
            <div className="bg-[#0B192C]/90 backdrop-blur-md rounded-2xl border border-amber-500/30 p-4 shadow-2xl text-xs text-slate-300 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <img
                src="https://i.ibb.co/8g86BQ1f/office.jpg"
                alt="Bissoli & Bissoli Advogados"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.triedPng) {
                    target.dataset.triedPng = 'true';
                    target.src = 'https://i.ibb.co/8g86BQ1f/office.png';
                  } else if (!target.dataset.triedFallback) {
                    target.dataset.triedFallback = 'true';
                    target.src = officeImg;
                  }
                }}
                className="w-full sm:w-36 h-28 object-cover rounded-xl border border-amber-400/30 shrink-0"
              />
              <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                <h3 className="font-bold text-sm text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Atendimento Especializado em Ariquemes - RO</span>
                </h3>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Oferecemos atendimento em diversas áreas do Direito com rigor técnico, sigilo e transparência.
                </p>
                <div className="pt-2 border-t border-slate-700/60 space-y-1 text-[10px] text-slate-400">
                  <p className="flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="break-words">Tv. Marajoara, 3796 - St. 02, Ariquemes - RO</span>
                  </p>
                  <p className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                      (69) 99944-6100
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-amber-400 shrink-0" />
                      advogados.eb@gmail.com
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACCESS FORM CARD */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-2xl shadow-blue-950/40 border border-amber-500/20 text-slate-900 w-full">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Acesso à Área do Cliente
                </h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Informe seu Nome e CPF para acessar seu painel de indicações. Seu cadastro será criado ou sincronizado automaticamente.
                </p>
              </div>

              <form onSubmit={handleClientLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={nomeInput}
                      onChange={(e) => setNomeInput(e.target.value)}
                      placeholder="Ex: João Pedro da Silva"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    CPF (Identificador Único) *
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={cpfInput}
                      onChange={(e) => handleCpfChange(e, setCpfInput)}
                      placeholder="000.000.000-00"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#1E3A8A] via-[#172E6F] to-[#0F285F] hover:from-[#172E6F] hover:to-[#0B1E48] text-white shadow-lg shadow-blue-900/30 border border-amber-400/30 transition-all flex items-center justify-center space-x-2 cursor-pointer group"
                >
                  <span>Entrar no Meu Painel</span>
                  <ChevronRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* SECONDARY ACTION: COLLABORATOR LOGIN */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    auth.setPortalType('interno');
                    auth.refreshData();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Acessar como colaborador da equipe</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER COPYRIGHT */}
        <div className="max-w-6xl xl:max-w-7xl mx-auto w-full pt-2 pb-2 relative z-10 text-center text-[11px] text-slate-400 border-t border-slate-800/80">
          <p>© {new Date().getFullYear()} Bissoli & Bissoli Advogados Associados. Todos os direitos reservados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      {/* WELCOME HEADER */}
      <div className="bg-[#0F172A] rounded-2xl p-5 sm:p-8 text-white shadow-xs relative overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-slate-700 mb-2">
              <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
              Área Exclusiva do Cliente
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-white">
              Olá, {auth.clienteActive.nome}!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              CPF: <span className="font-mono">{auth.clienteActive.cpf}</span> | Acompanhe suas indicações e cupons.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowNewModal(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Nova Indicação</span>
            </button>

            <button
              onClick={() => auth.logoutCliente()}
              className="px-3.5 py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-200 transition-colors border border-rose-800/80 flex items-center space-x-1.5 text-xs font-bold shrink-0"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4 text-rose-300" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRICS CARDS GRID (Apenas Indicados Validados e Valor Arrecadado) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Indicados Validados
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {countTotal}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {countTotal === 1 ? '1 indicação cadastrada' : `${countTotal} indicações cadastradas`}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 via-[#1E3A8A] to-[#0F285F] text-white p-5 rounded-2xl shadow-md border border-amber-400/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
              Valor Arrecadado
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              R$ {valorTotalArrecadado.toFixed(2)}
            </p>
            <p className="text-xs text-indigo-200 mt-1">
              {clienteCupons.length} cupom(ns) acumulado(s) em recompensas
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6 text-amber-300" />
          </div>
        </div>
      </div>

      {/* SECTIONS GRID: MY REWARDS & MY INDICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REWARDS & COUPONS COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                Meus Cupons de Recompensa
              </h3>
            </div>

            {clienteCupons.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nenhum cupom gerado ainda. Sempre que uma indicação sua resultar em um <strong>Contrato Fechado</strong>, um cupom de R$ 500 será gerado aqui!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clienteCupons.map((cupom) => (
                  <div
                    key={cupom.id}
                    className={`p-4 rounded-xl border transition-all ${
                      cupom.status === 'Disponivel'
                        ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-slate-900 border-amber-300 dark:border-amber-800/80 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                          {cupom.codigo}
                        </span>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          R$ {cupom.valor.toFixed(2)}
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cupom.status === 'Disponivel'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cupom.status === 'Disponivel' ? 'Disponível para uso' : 'Utilizado'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                      Origem: <strong>{cupom.nomeIndicado}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Gerado em: {new Date(cupom.dataGeracao).toLocaleDateString('pt-BR')} por {cupom.responsavelValidacaoNome}
                    </p>

                    {cupom.status === 'Utilizado' && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500">
                        Abatido em: {cupom.dataUso ? new Date(cupom.dataUso).toLocaleDateString('pt-BR') : ''} por {cupom.responsavelAbateNome}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* INDICATIONS LIST COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Histórico de Indicações ({clienteIndicacoes.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acompanhe a evolução do atendimento de cada pessoa que você indicou.
                </p>
              </div>

              <button
                onClick={() => setShowNewModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Cadastrar Indicação</span>
              </button>
            </div>

            {clienteIndicacoes.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <User className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Você ainda não cadastrou nenhuma indicação
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  Conhece alguém que precisa de atendimento jurídico? Indique um amigo e receba cupons de recompensa!
                </p>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-xs"
                >
                  Indicar Primeiro Contato
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {clienteIndicacoes.map((ind) => (
                  <div
                    key={ind.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-800 transition-all bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {ind.nomeIndicado}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                          <span>CPF: {ind.cpfIndicado}</span>
                          <span>Tel: {ind.telefoneIndicado}</span>
                        </p>
                      </div>
                      <div>{getStatusBadge(ind.status)}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2 text-xs border-t border-b border-slate-200/60 dark:border-slate-700/60 my-2">
                      <div>
                        <span className="text-slate-400">Tipo de Ação:</span>{' '}
                        <strong className="text-slate-700 dark:text-slate-300">{ind.tipoAcaoNome || 'Geral'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Cadastrada em:</span>{' '}
                        <span className="text-slate-700 dark:text-slate-300">
                          {new Date(ind.criadoEm).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {ind.observacoes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 mb-3">
                        <strong className="text-slate-500 font-semibold">Observações:</strong> {ind.observacoes}
                      </p>
                    )}

                    {/* STATUS HISTORY TIMELINE */}
                    {ind.historico && ind.historico.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                          Histórico de Atendimento:
                        </p>
                        <div className="space-y-2 pl-2 border-l-2 border-amber-400 dark:border-amber-600">
                          {ind.historico.map((h) => (
                            <div key={h.id} className="text-xs">
                              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                                <span className="font-semibold">{h.statusNovo}</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(h.criadoEm).toLocaleDateString('pt-BR')} às{' '}
                                  {new Date(h.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Por: {h.responsavelNome} {h.observacao ? `— ${h.observacao}` : ''}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW INDICATION MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-500" />
                Cadastrar Nova Indicação
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {formSuccess && (
              <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs rounded-xl font-medium">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateIndicacao} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Indicado *
                </label>
                <input
                  type="text"
                  required
                  value={nomeIndicado}
                  onChange={(e) => setNomeIndicado(e.target.value)}
                  placeholder="Nome do cliente/amigo que você está indicando"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CPF do Indicado *
                  </label>
                  <input
                    type="text"
                    required
                    value={cpfIndicado}
                    onChange={(e) => handleCpfChange(e, setCpfIndicado)}
                    placeholder="000.000.000-00"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={telefoneIndicado}
                    onChange={(e) => setTelefoneIndicado(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Ação *
                </label>
                <select
                  required
                  value={tipoAcaoId}
                  onChange={(e) => setTipoAcaoId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">Selecione o tipo de ação jurídica</option>
                  {tiposAcao.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nome} {tipo.valorRecompensa ? `— Recompensa: R$ ${tipo.valorRecompensa.toFixed(2)}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observações Gerais
                </label>
                <textarea
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Descreva detalhes do caso ou o horário ideal para contato..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md"
                >
                  Enviar Indicação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
