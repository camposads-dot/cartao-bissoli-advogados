import React, { useState, useEffect } from 'react';
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
  Award,
  Phone,
  FileText,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Scale,
  QrCode,
  Building2,
  MapPin,
  Mail,
  ShieldCheck,
  Check,
  ListFilter,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { Indicacao, StatusIndicacao } from '../types';

export const ClientPortal: React.FC = () => {
  const auth = useAuth();

  // ACCESS MODE & LOGIN / CADASTRO STATE
  const [accessMode, setAccessMode] = useState<'login' | 'cadastro'>('login');
  const [nomeInput, setNomeInput] = useState('');
  const [cpfInput, setCpfInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [notRegisteredError, setNotRegisteredError] = useState(false);

  // CADASTRO FORM STATE
  const [regNome, setRegNome] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regTelefone, setRegTelefone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMsg, setRegMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string; cliente?: any } | null>(null);

  // NEW INDICATION FORM STATE
  const [showNewModal, setShowNewModal] = useState(false);
  const [nomeIndicado, setNomeIndicado] = useState('');
  const [cpfIndicado, setCpfIndicado] = useState('');
  const [telefoneIndicado, setTelefoneIndicado] = useState('');
  const [tipoAcaoId, setTipoAcaoId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // TAB FILTER IN CLIENT PORTAL: 'todos' | 'validados'
  const [activeTab, setActiveTab] = useState<'todos' | 'validados'>('todos');

  // REAL-TIME AUTO REFRESH TICK
  const [, setRefreshTick] = useState(0);

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

  // DATA
  const tiposAcao = apiStore.getTiposAcao().filter((t) => t.ativo);
  const allIndicacoes = apiStore.getIndicacoes();
  const allCupons = apiStore.getCupons();

  // CLIENT SPECIFIC DATA
  const activeCpfClean = auth.clienteActive?.cpf.replace(/\D/g, '') || '';
  const activeId = auth.clienteActive?.id || '';

  const clienteIndicacoes = auth.clienteActive
    ? allIndicacoes.filter(
        (i) => i.clienteId === activeId || (activeCpfClean && i.clienteCpf.replace(/\D/g, '') === activeCpfClean)
      )
    : [];

  const clienteCupons = auth.clienteActive
    ? allCupons.filter(
        (c) => c.clienteId === activeId || (activeCpfClean && c.clienteCpf.replace(/\D/g, '') === activeCpfClean)
      )
    : [];

  // FILTER VALIDATED INDICATIONS
  // Validated = staff reviewed and set status to 'Em Atendimento', 'Qualificada', 'Contrato Fechado', 'Cupom Gerado', or 'Cupom Utilizado'
  const isIndicacaoValidada = (ind: Indicacao) => {
    return (
      ind.status === 'Em Atendimento' ||
      ind.status === 'Qualificada' ||
      ind.status === 'Contrato Fechado' ||
      ind.status === 'Cupom Gerado' ||
      ind.status === 'Cupom Utilizado'
    );
  };

  const clienteIndicacoesValidadas = clienteIndicacoes.filter(isIndicacaoValidada);

  // DISPLAYED INDICATIONS BASED ON TAB
  const displayedIndicacoes =
    activeTab === 'validados' ? clienteIndicacoesValidadas : clienteIndicacoes;

  // STATS
  const countTotal = clienteIndicacoes.length;
  const countValidados = clienteIndicacoesValidadas.length;

  const valorTotalArrecadado = clienteCupons.reduce((sum, c) => sum + c.valor, 0);

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
    setLoginError('');
    setNotRegisteredError(false);

    if (!cpfInput || cpfInput.replace(/\D/g, '').length < 11) {
      setLoginError('Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }

    const res = auth.loginCliente(cpfInput);
    if (!res.success) {
      if (res.isNotRegistered) {
        setNotRegisteredError(true);
        setLoginError('CPF não cadastrado! Por favor, realize o seu cadastro antes de acessar o painel.');
      } else {
        setLoginError(res.message || 'Erro ao realizar acesso.');
      }
    } else {
      auth.refreshData();
    }
  };

  const handleClientRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegMsg(null);

    if (!regNome.trim()) {
      setRegMsg({ type: 'error', text: 'Por favor, informe seu Nome Completo.' });
      return;
    }
    if (!regCpf || regCpf.replace(/\D/g, '').length < 11) {
      setRegMsg({ type: 'error', text: 'Por favor, informe um CPF válido com 11 dígitos.' });
      return;
    }
    if (!regTelefone.trim()) {
      setRegMsg({ type: 'error', text: 'Por favor, informe seu Telefone / WhatsApp com DDD.' });
      return;
    }

    const res = auth.cadastrarCliente(regNome, regCpf, regTelefone, regEmail);
    if (res.alreadyRegistered) {
      setRegMsg({
        type: 'info',
        text: res.message || 'Você já possui um cadastro ativo!',
        cliente: res.cliente,
      });
    } else if (res.success && res.cliente) {
      setRegMsg({
        type: 'success',
        text: `Seja bem-vindo(a), ${res.cliente.nome}! Seu cadastro foi realizado com sucesso em nosso sistema.`,
        cliente: res.cliente,
      });
    } else {
      setRegMsg({ type: 'error', text: res.message || 'Erro ao realizar cadastro.' });
    }
  };

  const handleCreateIndicacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.clienteActive) return;

    if (!nomeIndicado.trim() || !telefoneIndicado || !tipoAcaoId) {
      alert('Por favor, preencha todos os campos obrigatórios (Nome, Telefone e Tipo de Ação).');
      return;
    }

    const selectedTipo = tiposAcao.find((t) => t.id === tipoAcaoId);

    apiStore.saveIndicacao({
      clienteId: auth.clienteActive.id,
      clienteNome: auth.clienteActive.nome,
      clienteCpf: auth.clienteActive.cpf,
      nomeIndicado: nomeIndicado.trim(),
      cpfIndicado: cpfIndicado.trim() || 'Não Informado',
      telefoneIndicado: telefoneIndicado,
      tipoAcaoId: tipoAcaoId,
      tipoAcaoNome: selectedTipo?.nome || 'Ação Judicial',
      observacoes: observacoes,
    });

    // Notify all app components that data was updated
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('indica_data_updated'));
    }

    setFormSuccess('Indicação cadastrada com sucesso! Ela já está visível para a equipe do escritório.');
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
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3 h-3 mr-1 text-amber-500 shrink-0" />
            Aguardando Validação
          </span>
        );
      case 'Em Atendimento':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3 h-3 mr-1 text-blue-500 shrink-0" />
            Em Atendimento (Validada)
          </span>
        );
      case 'Qualificada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3 h-3 mr-1 text-purple-500 shrink-0" />
            Qualificada (Validada)
          </span>
        );
      case 'Desqualificada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3 mr-1 text-rose-500 shrink-0" />
            Desqualificada
          </span>
        );
      case 'Contrato Fechado':
      case 'Cupom Gerado':
      case 'Cupom Utilizado':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Contrato Fechado (Validada)
          </span>
        );
      default:
        return null;
    }
  };

  // IF NO CLIENT LOGGED IN -> INSTITUTIONAL LANDING & LOGIN SCREEN
  if (!auth.clienteActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#071325] via-[#0B192C] to-[#050C17] text-slate-100 flex flex-col justify-between p-3 sm:p-8 relative overflow-hidden w-full max-w-full">
        {/* BACKGROUND DECORATIVE GLOWS */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

        {/* TOP BRAND HEADER */}
        <div className="max-w-4xl mx-auto w-full text-center pt-2 sm:pt-6 pb-2 relative z-10 px-2">
          {/* OFFICE LOGO IMAGE */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-[#0B192C]/80 rounded-2xl border border-amber-400/40 shadow-2xl shadow-amber-500/10 backdrop-blur-md inline-block">
              <img
                src="https://i.ibb.co/hxkKFSXL/logo.png"
                alt="Bissoli & Bissoli Advogados Associados"
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
                className="h-14 sm:h-20 w-auto object-contain mx-auto rounded-lg max-w-[240px] sm:max-w-[280px]"
              />
            </div>
          </div>

          <h1 className="text-lg sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-1 leading-tight">
            Bissoli & Bissoli Advogados Associados
          </h1>
          <p className="text-[11px] sm:text-sm font-bold text-amber-400 tracking-wide uppercase">
            Bem-vindo ao Portal do Cliente
          </p>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
            Acesse sua área exclusiva para acompanhar e realizar indicações de forma simples, transparente e segura.
          </p>
        </div>

        {/* CENTER CONTENT: CLIENT CARD + ACCESS FORM */}
        <div className="max-w-md mx-auto w-full space-y-4 sm:space-y-6 relative z-10 my-auto py-2 sm:py-4 px-1">
          
          {/* VISUAL CLIENT CARD (CARTÃO DO CLIENTE) */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#0B192C] via-[#1E3A8A] to-[#071325] p-4 sm:p-6 border-2 border-amber-400/40 shadow-2xl shadow-amber-500/10 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600" />
            <Scale className="absolute -right-6 -bottom-6 w-32 h-32 sm:w-36 sm:h-36 text-amber-400/5 pointer-events-none" />

            <div className="flex items-center justify-between mb-4 sm:mb-5 gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <img
                  src="https://i.ibb.co/hxkKFSXL/logo.png"
                  alt="Logo"
                  referrerPolicy="no-referrer"
                  className="h-6 sm:h-7 w-auto object-contain bg-amber-400/10 p-0.5 rounded border border-amber-400/40 shrink-0"
                />
                <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-amber-300 uppercase truncate">
                  Bissoli & Bissoli
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                Cartão do Cliente
              </span>
            </div>

            <div className="flex items-center justify-between my-2 sm:my-3">
              <div className="space-y-1">
                <div className="w-9 h-6 sm:w-10 sm:h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center border border-amber-100/50">
                  <div className="w-full h-full border border-amber-900/20 rounded-xs flex items-center justify-center">
                    <div className="w-2.5 h-2.5 border-r border-b border-amber-900/40" />
                  </div>
                </div>
                <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 tracking-widest block pt-1">
                  MEMBER ID • CLIENTE
                </span>
              </div>

              <div className="bg-white p-1 sm:p-1.5 rounded-lg shadow-md border border-amber-400/40 shrink-0">
                <QrCode className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
              </div>
            </div>

            <div className="pt-2 border-t border-amber-400/20 flex justify-between items-end">
              <div>
                <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-amber-400/70">
                  Acesso Preferencial
                </p>
                <p className="text-[11px] sm:text-xs font-bold text-white tracking-wide">
                  Área Oficial do Cliente Bissoli & Bissoli
                </p>
              </div>
            </div>
          </div>

          {/* ACCESS CARD FORM */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl shadow-blue-950/40 border border-amber-500/20 text-slate-900">
            {/* MODE TOGGLE TABS */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-5 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAccessMode('login');
                  setLoginError('');
                  setNotRegisteredError(false);
                  setRegMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  accessMode === 'login'
                    ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Entrar no Meu Painel</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccessMode('cadastro');
                  setLoginError('');
                  setNotRegisteredError(false);
                  setRegMsg(null);
                  if (cpfInput && !regCpf) setRegCpf(cpfInput);
                  if (nomeInput && !regNome) setRegNome(nomeInput);
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  accessMode === 'cadastro'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span>Fazer Cadastro</span>
              </button>
            </div>

            {accessMode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleClientLogin} className="space-y-3.5">
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                    Entrar no Meu Painel
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed">
                    Informe seu CPF cadastrado para acessar e acompanhar suas indicações.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                      <span className="font-medium">{loginError}</span>
                    </div>
                    {notRegisteredError && (
                      <button
                        type="button"
                        onClick={() => {
                          setRegCpf(cpfInput);
                          if (nomeInput) setRegNome(nomeInput);
                          setAccessMode('cadastro');
                          setLoginError('');
                          setNotRegisteredError(false);
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 shrink-0" />
                        <span>Fazer Cadastro Agora</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 1ST MAIN BUTTON: ENTRAR NO MEU PAINEL */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#1E3A8A] via-[#172E6F] to-[#0F285F] hover:from-[#172E6F] hover:to-[#0B1E48] text-white shadow-md border border-amber-400/30 transition-all flex items-center justify-center space-x-2 cursor-pointer group"
                >
                  <span>Entrar no Meu Painel</span>
                  <ChevronRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                {/* 2ND BUTTON BELOW: FAZER CADASTRO */}
                <div className="pt-3 border-t border-slate-100 text-center">
                  <p className="text-[11px] text-slate-500 mb-2">
                    Ainda não possui cadastro em nosso escritório?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRegCpf(cpfInput);
                      if (nomeInput) setRegNome(nomeInput);
                      setAccessMode('cadastro');
                      setLoginError('');
                      setNotRegisteredError(false);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600/30 shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>Fazer Cadastro</span>
                  </button>
                </div>
              </form>
            ) : (
              /* CADASTRO FORM */
              <form onSubmit={handleClientRegister} className="space-y-3.5">
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                    Fazer Cadastro de Cliente
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed">
                    Cadastre-se para acessar seu painel, realizar indicações e acumular cupons de desconto.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={regNome}
                      onChange={(e) => setRegNome(e.target.value)}
                      placeholder="Ex: João Pedro da Silva"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    CPF (Identificador Único) *
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={regCpf}
                      onChange={(e) => handleCpfChange(e, setRegCpf)}
                      placeholder="000.000.000-00"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Telefone / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={regTelefone}
                        onChange={(e) => setRegTelefone(e.target.value)}
                        placeholder="(69) 90000-0000"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      E-mail (Opcional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="cliente@email.com"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {regMsg && regMsg.type === 'error' && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{regMsg.text}</span>
                  </div>
                )}

                {regMsg && regMsg.type === 'info' && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-2">
                    <div className="flex items-start gap-2">
                      <UserCheck className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-bold">Cadastro Já Identificado!</p>
                        <p className="mt-0.5">{regMsg.text}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (regMsg.cliente) {
                          auth.loginCliente(regMsg.cliente.nome, regMsg.cliente.cpf);
                          auth.refreshData();
                        }
                      }}
                      className="w-full py-2.5 px-3 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Entrar no Meu Painel Agora</span>
                    </button>
                  </div>
                )}

                {regMsg && regMsg.type === 'success' && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 space-y-2">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-900">Cadastro Realizado com Sucesso!</p>
                        <p className="mt-0.5">{regMsg.text}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (regMsg.cliente) {
                          auth.loginCliente(regMsg.cliente.nome, regMsg.cliente.cpf);
                          auth.refreshData();
                        }
                      }}
                      className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-white shrink-0" />
                      <span>Entrar no Meu Painel Agora</span>
                    </button>
                  </div>
                )}

                {(!regMsg || regMsg.type === 'error') && (
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 shadow-md border border-amber-400/40 transition-all flex items-center justify-center space-x-2 cursor-pointer group"
                  >
                    <UserPlus className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>Confirmar e Realizar Cadastro</span>
                  </button>
                )}

                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAccessMode('login');
                      setRegMsg(null);
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-blue-900 underline cursor-pointer"
                  >
                    Já possui cadastro? Clique aqui para Entrar
                  </button>
                </div>
              </form>
            )}

            {/* 3RD ACCESS AREA: COLLABORATOR LOGIN */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => {
                  auth.setPortalType('interno');
                  auth.refreshData();
                }}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Acessar como colaborador</span>
              </button>
            </div>
          </div>
        </div>

        {/* PARTE INFERIOR: CARD INSTITUCIONAL DO ESCRITÓRIO */}
        <div className="max-w-2xl mx-auto w-full pt-2 pb-2 relative z-10 px-1">
          <div className="bg-[#0B192C]/90 backdrop-blur-md rounded-2xl border border-amber-500/30 p-3.5 sm:p-5 shadow-2xl text-xs text-slate-300 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
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
              className="w-full sm:w-36 h-24 sm:h-28 object-cover rounded-xl border border-amber-400/30 shrink-0"
            />
            <div className="space-y-1.5 text-center sm:text-left min-w-0 w-full">
              <h3 className="font-bold text-xs sm:text-sm text-white flex items-center justify-center sm:justify-start gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Bissoli & Bissoli Advogados Associados</span>
              </h3>
              <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                Nosso escritório oferece atendimento jurídico especializado e um programa de indicações transparente para nossos clientes.
              </p>
              <div className="pt-2 border-t border-slate-700/60 space-y-1 text-[10px] text-slate-400">
                <p className="flex items-center justify-center sm:justify-start gap-1 text-center sm:text-left">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="break-words">Tv. Marajoara, 3796 - St. 02, Ariquemes - RO, 76873-242</span>
                </p>
                <p className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
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
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      {/* WELCOME HEADER */}
      <div className="bg-[#0F172A] rounded-2xl p-4 sm:p-8 text-white shadow-xs relative overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-slate-700 mb-2">
              <Sparkles className="w-3 h-3 mr-1 text-indigo-400 shrink-0" />
              Área Exclusiva do Cliente
            </div>
            <h2 className="text-lg sm:text-3xl font-bold tracking-tight text-white break-words">
              Olá, {auth.clienteActive.nome}!
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              CPF: <span className="font-mono">{auth.clienteActive.cpf}</span> | Acompanhe e faça novas indicações.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowNewModal(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Nova Indicação</span>
            </button>

            <button
              onClick={() => auth.logoutCliente()}
              className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors border border-rose-500/50 flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4 text-white shrink-0" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRICS CARDS GRID (3 CARDS: LISTA DE INDICADOS, INDICADOS VALIDADOS, VALOR ARRECADADO) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* CARD 1: LISTA DE INDICADOS */}
        <div
          onClick={() => setActiveTab('todos')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            activeTab === 'todos'
              ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-500 dark:border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
          }`}
        >
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Lista de Indicados
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {countTotal}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {countTotal === 1 ? '1 indicação cadastrada' : `${countTotal} indicações cadastradas`}
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        {/* CARD 2: INDICADOS VALIDADOS */}
        <div
          onClick={() => setActiveTab('validados')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            activeTab === 'validados'
              ? 'bg-emerald-50/90 dark:bg-emerald-950/70 border-emerald-500 dark:border-emerald-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
              Indicados Validados
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 dark:text-emerald-300">
              {countValidados}
            </p>
            <p className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 mt-1 truncate">
              {countValidados === 1 ? '1 indicação validada' : `${countValidados} indicações validadas`}
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* CARD 3: VALOR ARRECADADO */}
        <div className="bg-gradient-to-br from-indigo-900 via-[#1E3A8A] to-[#0F285F] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-amber-400/30 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
              Valor Arrecadado
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              R$ {valorTotalArrecadado.toFixed(2)}
            </p>
            <p className="text-[11px] sm:text-xs text-indigo-200 mt-1 truncate">
              {clienteCupons.length} cupom(ns) acumulado(s)
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
          </div>
        </div>
      </div>

      {/* SECTIONS GRID: MY REWARDS & MY INDICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* REWARDS & COUPONS COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500 shrink-0" />
                <span>Meus Cupons de Recompensa</span>
              </h3>
            </div>

            {clienteCupons.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Nenhum cupom gerado ainda. Quando sua indicação resultar em <strong>Contrato Fechado</strong>, seu cupom de recompensa aparecerá aqui automaticamente!
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
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                          {cupom.codigo}
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          R$ {cupom.valor.toFixed(2)}
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          cupom.status === 'Disponivel'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
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
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs min-w-0">
            {/* TOP BAR: TITLE + ADD BUTTON */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Painel de Indicações ({clienteIndicacoes.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acompanhe em tempo real a validação e o progresso das suas indicações.
                </p>
              </div>

              <button
                onClick={() => setShowNewModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Cadastrar Indicação</span>
              </button>
            </div>

            {/* TAB SELECTOR: LISTA DE INDICADOS vs INDICADOS VALIDADOS */}
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('todos')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                  activeTab === 'todos'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Lista de Indicados ({countTotal})</span>
              </button>

              <button
                onClick={() => setActiveTab('validados')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                  activeTab === 'validados'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Indicados Validados ({countValidados})</span>
              </button>
            </div>

            {/* LIST OF INDICATIONS */}
            {displayedIndicacoes.length === 0 ? (
              <div className="text-center py-10 sm:py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {activeTab === 'validados'
                    ? 'Nenhuma indicação validada no momento'
                    : 'Você ainda não cadastrou nenhuma indicação'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
                  {activeTab === 'validados'
                    ? 'Assim que a equipe do escritório atender ou fechar contrato com sua indicação, ela aparecerá nesta lista de Validados!'
                    : 'Conhece alguém que precisa de atendimento jurídico? Faça sua primeira indicação!'}
                </p>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-xs cursor-pointer"
                >
                  Indicar Novo Contato
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {displayedIndicacoes.map((ind) => {
                  const isValidated = isIndicacaoValidada(ind);

                  return (
                    <div
                      key={ind.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isValidated
                          ? 'border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-500/5 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      {/* HEADER ROW: NAME & STATUS BADGE */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 min-w-0">
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                              {ind.nomeIndicado}
                            </h4>
                            {isValidated && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60 shrink-0">
                                Validada no Sistema
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 font-mono">
                            <span>CPF: {ind.cpfIndicado}</span>
                            <span>Tel: {ind.telefoneIndicado}</span>
                          </p>
                        </div>
                        <div className="shrink-0">{getStatusBadge(ind.status)}</div>
                      </div>

                      {/* DETAILS ROW */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2 text-xs border-t border-b border-slate-200/60 dark:border-slate-700/60 my-2">
                        <div>
                          <span className="text-slate-400">Tipo de Ação:</span>{' '}
                          <strong className="text-slate-700 dark:text-slate-300">{ind.tipoAcaoNome || 'Geral'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Data de Cadastro:</span>{' '}
                          <span className="text-slate-700 dark:text-slate-300">
                            {new Date(ind.criadoEm).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {ind.observacoes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 mb-3 break-words">
                          <strong className="text-slate-500 font-semibold">Observações:</strong> {ind.observacoes}
                        </p>
                      )}

                      {/* STATUS HISTORY TIMELINE */}
                      {ind.historico && ind.historico.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                            Histórico de Atendimento e Validação:
                          </p>
                          <div className="space-y-2 pl-2 border-l-2 border-amber-400 dark:border-amber-600">
                            {ind.historico.map((h) => (
                              <div key={h.id} className="text-xs">
                                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 flex-wrap gap-1">
                                  <span className="font-semibold">{h.statusNovo}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(h.criadoEm).toLocaleDateString('pt-BR')} às{' '}
                                    {new Date(h.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 break-words">
                                  Por: {h.responsavelNome} {h.observacao ? `— ${h.observacao}` : ''}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW INDICATION MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <span>Cadastrar Nova Indicação</span>
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {formSuccess && (
              <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs rounded-xl font-medium flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateIndicacao} className="space-y-3.5">
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CPF do Indicado <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={cpfIndicado}
                    onChange={(e) => handleCpfChange(e, setCpfIndicado)}
                    placeholder="000.000.000-00 (opcional)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
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
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md cursor-pointer"
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
