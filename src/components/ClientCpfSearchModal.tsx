import React, { useState } from 'react';
import { apiStore } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  UserCheck,
  X,
  Gift,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Phone,
  User,
  Calendar,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Cliente, Indicacao, StatusIndicacao } from '../types';

interface ClientCpfSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientCpfSearchModal: React.FC<ClientCpfSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const auth = useAuth();
  const [cpfSearch, setCpfSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [, setRefreshTick] = useState(0);

  // Live real-time update listener & poller
  React.useEffect(() => {
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

  if (!isOpen) return null;

  const allClientes = apiStore.getClientes();
  const allIndicacoes = apiStore.getIndicacoes();
  const allCupons = apiStore.getCupons();

  // Clean search CPF input
  const cleanSearch = cpfSearch.replace(/\D/g, '');

  const matchedClientes = allClientes.filter((c) => {
    if (!cpfSearch.trim()) return true;
    const cleanCpf = c.cpf.replace(/\D/g, '');
    return (
      cleanCpf.includes(cleanSearch) ||
      c.nome.toLowerCase().includes(cpfSearch.toLowerCase()) ||
      c.cpf.includes(cpfSearch)
    );
  });

  // Indications & Coupons for selected client
  const clientIndicacoes = selectedClient
    ? allIndicacoes.filter(
        (i) =>
          i.clienteId === selectedClient.id ||
          i.clienteCpf.replace(/\D/g, '') === selectedClient.cpf.replace(/\D/g, '')
      )
    : [];

  const clientCupons = selectedClient
    ? allCupons.filter(
        (cup) =>
          cup.clienteId === selectedClient.id ||
          cup.clienteCpf.replace(/\D/g, '') === selectedClient.cpf.replace(/\D/g, '')
      )
    : [];

  const cuponsDisponiveis = clientCupons.filter((c) => c.status === 'Disponivel');
  const cuponsUtilizados = clientCupons.filter((c) => c.status === 'Utilizado');

  const valorTotalCupons = clientCupons.reduce((acc, c) => acc + c.valor, 0);
  const valorTotalDisponivel = cuponsDisponiveis.reduce((acc, c) => acc + c.valor, 0);
  const valorTotalAbatido = cuponsUtilizados.reduce((acc, c) => acc + (c.valorAbatido || c.valor), 0);

  const getStatusBadge = (status: StatusIndicacao) => {
    switch (status) {
      case 'Recebida':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-3 h-3 mr-1 text-slate-500" />
            Recebida
          </span>
        );
      case 'Em Atendimento':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            <Clock className="w-3 h-3 mr-1 text-blue-500" />
            Em Atendimento
          </span>
        );
      case 'Qualificada':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
            <Sparkles className="w-3 h-3 mr-1 text-purple-500" />
            Qualificada
          </span>
        );
      case 'Desqualificada':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
            <XCircle className="w-3 h-3 mr-1 text-rose-500" />
            Desqualificada
          </span>
        );
      case 'Contrato Fechado':
      case 'Cupom Gerado':
      case 'Cupom Utilizado':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
            Contrato Fechado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white my-auto">
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-[#0B192C] to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-400/20 border border-amber-400/40 rounded-xl">
              <UserCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                Pesquisar Cliente por CPF
              </h2>
              <p className="text-xs text-amber-300">
                Consulte informações, indicações realizadas e cupons do cliente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* SEARCH INPUT */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Informe o CPF ou Nome do Cliente:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={cpfSearch}
                onChange={(e) => {
                  setCpfSearch(e.target.value);
                  if (selectedClient) setSelectedClient(null);
                }}
                placeholder="Ex: 123.456.789-00 ou João Pedro..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* CLIENT SELECTOR LIST */}
          {!selectedClient && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Clientes Encontrados ({matchedClientes.length}):
              </p>
              {matchedClientes.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                  Nenhum cliente cadastrado com este CPF ou nome.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {matchedClientes.map((c) => {
                    const countInd = allIndicacoes.filter(
                      (i) => i.clienteId === c.id || i.clienteCpf.replace(/\D/g, '') === c.cpf.replace(/\D/g, '')
                    ).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedClient(c)}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400/60 bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-500/5 text-left transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                            {c.nome}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            CPF: <span className="font-mono">{c.cpf}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {countInd} {countInd === 1 ? 'indicação' : 'indicações'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SELECTED CLIENT DETAILS */}
          {selectedClient && (
            <div className="space-y-6">
              {/* BACK TO LIST BUTTON */}
              <button
                onClick={() => setSelectedClient(null)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← Selecionar outro cliente
              </button>

              {/* CLIENT CARD */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B192C] to-slate-900 text-white border border-amber-500/30 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-1">
                    Cliente Selecionado
                  </div>
                  <h3 className="text-xl font-bold text-white">{selectedClient.nome}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
                    <span>CPF: <strong className="font-mono text-amber-300">{selectedClient.cpf}</strong></span>
                    <span>Telefone: {selectedClient.telefone || 'Não informado'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-xs">
                  <div className="text-center px-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Indicações</p>
                    <p className="text-lg font-bold text-white">{clientIndicacoes.length}</p>
                  </div>
                  <div className="h-8 border-l border-slate-700 hidden sm:block" />
                  <div className="text-center px-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Gerado</p>
                    <p className="text-lg font-bold text-amber-400">R$ {valorTotalCupons.toFixed(2)}</p>
                  </div>
                  <div className="h-8 border-l border-slate-700 hidden sm:block" />
                  <div className="text-center px-2">
                    <p className="text-[10px] uppercase font-bold text-emerald-400">Disponível</p>
                    <p className="text-lg font-bold text-emerald-400">R$ {valorTotalDisponivel.toFixed(2)}</p>
                  </div>
                  <div className="h-8 border-l border-slate-700 hidden sm:block" />
                  <div className="text-center px-2">
                    <p className="text-[10px] uppercase font-bold text-indigo-300">Abatidos</p>
                    <p className="text-lg font-bold text-indigo-300">R$ {valorTotalAbatido.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* INDICATIONS LIST */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Histórico de Indicações ({clientIndicacoes.length})</span>
                </h4>

                {clientIndicacoes.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    Este cliente ainda não realizou nenhuma indicação.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {clientIndicacoes.map((ind) => (
                      <div
                        key={ind.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {ind.nomeIndicado}
                            </span>
                            {getStatusBadge(ind.status)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>CPF: {ind.cpfIndicado}</span>
                            <span>Tel: {ind.telefoneIndicado}</span>
                            <span>Ação: {ind.tipoAcaoNome || 'Jurídico'}</span>
                          </div>
                          {ind.observacoes && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-0.5">
                              "{ind.observacoes}"
                            </p>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 text-right shrink-0">
                          {new Date(ind.criadoEm).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* COUPONS LIST */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-500" />
                    Histórico de Cupons e Recompensas ({clientCupons.length})
                  </span>
                  {cuponsUtilizados.length > 0 && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {cuponsUtilizados.length} {cuponsUtilizados.length === 1 ? 'cupom abatido' : 'cupons abatidos'}
                    </span>
                  )}
                </h4>

                {clientCupons.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    Nenhum cupom gerado para este cliente até o momento.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clientCupons.map((cup) => (
                      <div
                        key={cup.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                          cup.status === 'Disponivel'
                            ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-300/40 dark:border-amber-500/30'
                            : 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-400/40 dark:border-emerald-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                              {cup.codigo}
                            </span>
                            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                              R$ {cup.valor.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Indicado: <strong>{cup.nomeIndicado || 'Indicação vinculada'}</strong>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Gerado em {new Date(cup.dataGeracao).toLocaleDateString('pt-BR')} por {cup.responsavelValidacaoNome || 'Equipe'}
                            </p>
                          </div>

                          <div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                                cup.status === 'Disponivel'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                              }`}
                            >
                              {cup.status === 'Disponivel' ? (
                                <>
                                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  <span>Disponível</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>Abatido</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* DETALHES DO ABATE DO CUPOM QUANDO STATUS FOR UTILIZADO */}
                        {cup.status === 'Utilizado' && (
                          <div className="pt-2.5 border-t border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Abatido: R$ {(cup.valorAbatido || cup.valor).toFixed(2)}
                              </span>
                              {cup.dataUso && (
                                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                                  Data: {new Date(cup.dataUso).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                            {cup.responsavelAbateNome && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                Responsável pelo Abate: <strong>{cup.responsavelAbateNome}</strong>
                              </p>
                            )}
                            {cup.observacaoAbate && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-0.5">
                                Obs: "{cup.observacaoAbate}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar Consulta
          </button>
        </div>
      </div>
    </div>
  );
};
