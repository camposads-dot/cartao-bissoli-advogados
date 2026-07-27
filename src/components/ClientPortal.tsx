import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiStore } from '../lib/supabase';
import {
  User,
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
    auth.loginCliente(nomeInput, cpfInput);
    auth.refreshData();
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

  // IF NO CLIENT LOGGED IN -> SHOW LOGIN / QUICK IDENTIFICATION SCREEN
  if (!auth.clienteActive) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 transition-colors">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Portal de Indicações</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Acesso simples e direto sem necessidade de senha.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 mb-6 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              Informe seu <strong>Nome</strong> e <strong>CPF</strong>. Caso seja o seu primeiro acesso, seu cadastro será criado automaticamente!
            </span>
          </div>

          <form onSubmit={handleClientLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={nomeInput}
                onChange={(e) => setNomeInput(e.target.value)}
                placeholder="Ex: João Pedro da Silva"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CPF (Identificador Único) *
              </label>
              <input
                type="text"
                required
                value={cpfInput}
                onChange={(e) => handleCpfChange(e, setCpfInput)}
                placeholder="000.000.000-00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition-all"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>Entrar no Meu Painel</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* DEMO ACCOUNTS PREVIEW FOR FAST TESTING */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 text-center">
              Ou escolha um cliente para teste rápido:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  setNomeInput('João Pedro da Silva');
                  setCpfInput('123.456.789-00');
                  auth.loginCliente('João Pedro da Silva', '123.456.789-00');
                  auth.refreshData();
                }}
                className="text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold block">João Pedro da Silva</span>
                  <span className="text-slate-400">CPF: 123.456.789-00</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  1 Cupom Disponível (R$ 500)
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8 space-y-8">
      {/* WELCOME HEADER */}
      <div className="bg-[#0F172A] rounded-2xl p-6 sm:p-8 text-white shadow-xs relative overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-slate-700 mb-2">
              <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
              Área Exclusiva do Cliente
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Olá, {auth.clienteActive.nome}!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              CPF: <span className="font-mono">{auth.clienteActive.cpf}</span> | Acompanhe suas indicações e seus cupons acumulados.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Nova Indicação</span>
            </button>

            <button
              onClick={() => auth.logoutCliente()}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Indicações</p>
          <p className="text-2xl font-light text-slate-900 dark:text-white">{countTotal}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Em Atendimento</p>
          <p className="text-2xl font-light text-blue-600 dark:text-blue-400">{countAtendimento}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Qualificadas</p>
          <p className="text-2xl font-light text-indigo-600 dark:text-indigo-400">{countQualificadas}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Desqualificadas</p>
          <p className="text-2xl font-light text-rose-600 dark:text-rose-400">{countDesqualificadas}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contratos Fechados</p>
          <p className="text-2xl font-light text-emerald-600 dark:text-emerald-400">{countContratos}</p>
        </div>

        <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider mb-1">Saldo Cupons</p>
          <p className="text-2xl font-light">R$ {valorAcumuladoDisponivel.toFixed(2)}</p>
          <p className="text-[10px] text-indigo-300 mt-0.5">{cuponsDisponiveis.length} cupom(ns) ativo(s)</p>
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
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-0.5">
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
                      {tipo.nome}
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
