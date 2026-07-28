import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiStore } from '../lib/supabase';
import { ClientCpfSearchModal } from './ClientCpfSearchModal';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Phone,
  User,
  Calendar,
  AlertCircle,
  Gift,
  FileCheck2,
  UserCheck,
} from 'lucide-react';
import { Indicacao, StatusIndicacao } from '../types';

export const ComercialPanel: React.FC = () => {
  const auth = useAuth();
  const gestorNome = auth.staffActive?.nome || 'Natan Campos';

  // CPF SEARCH MODAL STATE
  const [cpfModalOpen, setCpfModalOpen] = useState(false);

  // SEARCH AND FILTERS
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedTipoAcao, setSelectedTipoAcao] = useState<string>('todos');

  // UPDATE STATUS MODAL
  const [editingIndicacao, setEditingIndicacao] = useState<Indicacao | null>(null);
  const [novoStatus, setNovoStatus] = useState<StatusIndicacao>('Em Atendimento');
  const [observacaoStatus, setObservacaoStatus] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [, setRefreshTick] = useState(0);

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

  // DATA
  const allIndicacoes = apiStore.getIndicacoes();
  const tiposAcao = apiStore.getTiposAcao();

  // FILTERED DATA
  const filteredIndicacoes = allIndicacoes.filter((ind) => {
    const matchSearch =
      ind.nomeIndicado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.cpfIndicado.includes(searchTerm) ||
      ind.telefoneIndicado.includes(searchTerm) ||
      (ind.clienteNome && ind.clienteNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ind.clienteCpf && ind.clienteCpf.includes(searchTerm));

    const matchStatus = selectedStatus === 'todos' || ind.status === selectedStatus;
    const matchTipo = selectedTipoAcao === 'todos' || ind.tipoAcaoId === selectedTipoAcao;

    return matchSearch && matchStatus && matchTipo;
  });

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIndicacao) return;

    try {
      const result = apiStore.updateIndicacaoStatus(
        editingIndicacao.id,
        novoStatus,
        gestorNome,
        observacaoStatus
      );

      if (result.cupomGerado) {
        setModalSuccess(
          `Contrato validado com sucesso! Cupom ${result.cupomGerado.codigo} de R$ ${result.cupomGerado.valor.toFixed(
            2
          )} foi gerado automaticamente para ${editingIndicacao.clienteNome}.`
        );
      } else {
        setModalSuccess(`Status atualizado para ${novoStatus} com sucesso!`);
      }

      setTimeout(() => {
        setModalSuccess('');
        setEditingIndicacao(null);
        setObservacaoStatus('');
      }, 2000);

      auth.refreshData();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar status.');
    }
  };

  const getStatusBadge = (status: StatusIndicacao) => {
    switch (status) {
      case 'Recebida':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-3 h-3 mr-1 text-slate-500" />
            Recebida
          </span>
        );
      case 'Em Atendimento':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            <Clock className="w-3 h-3 mr-1 text-blue-500" />
            Em Atendimento
          </span>
        );
      case 'Qualificada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
            <Sparkles className="w-3 h-3 mr-1 text-purple-500" />
            Qualificada
          </span>
        );
      case 'Desqualificada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
            <XCircle className="w-3 h-3 mr-1 text-rose-500" />
            Desqualificada
          </span>
        );
      case 'Contrato Fechado':
      case 'Cupom Gerado':
      case 'Cupom Utilizado':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
            Contrato Fechado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-1 border border-indigo-200 dark:border-indigo-800">
            Setor Comercial
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
            Painel Comercial de Atendimento
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Responsável Comercial: <strong>{gestorNome}</strong> | Gestão de Indicações & Qualificação de Contratos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setCpfModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-slate-950" />
            <span>Pesquisar Cliente por CPF</span>
          </button>

          <div className="w-full sm:w-auto flex items-center justify-around sm:justify-start space-x-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Indicações:</span>
              <strong className="text-slate-900 dark:text-white text-base font-light">{allIndicacoes.length}</strong>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 h-8"></div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Contratos Fechados:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 text-base font-light">
                {allIndicacoes.filter((i) => i.status === 'Contrato Fechado' || i.status === 'Cupom Gerado' || i.status === 'Cupom Utilizado').length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* SEARCH BAR */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por CPF, Nome do Indicado, Cliente ou Telefone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* STATUS FILTER */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium outline-none"
          >
            <option value="todos">Todos os Status</option>
            <option value="Recebida">Recebida</option>
            <option value="Em Atendimento">Em Atendimento</option>
            <option value="Qualificada">Qualificada</option>
            <option value="Desqualificada">Desqualificada</option>
            <option value="Contrato Fechado">Contrato Fechado</option>
          </select>
        </div>

        {/* TIPO DE AÇÃO FILTER */}
        <div>
          <select
            value={selectedTipoAcao}
            onChange={(e) => setSelectedTipoAcao(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium outline-none"
          >
            <option value="todos">Todos os Tipos de Ação</option>
            {tiposAcao.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* INDICATIONS TABLE / MOBILE CARDS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden p-4 sm:p-0">
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-6">Cliente Indicado</th>
                <th className="py-3 px-6">Cliente Indicador</th>
                <th className="py-3 px-6">Tipo de Ação</th>
                <th className="py-3 px-6">Data Registro</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {filteredIndicacoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhuma indicação encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredIndicacoes.map((ind) => (
                  <tr
                    key={ind.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      <div>{ind.nomeIndicado}</div>
                      <div className="text-[11px] font-normal text-slate-400">
                        CPF: {ind.cpfIndicado} | Tel: {ind.telefoneIndicado}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {ind.clienteNome || 'N/I'}
                      </div>
                      <div className="text-[11px] font-normal text-slate-400">CPF: {ind.clienteCpf}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-300">
                      {ind.tipoAcaoNome || 'Geral'}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(ind.criadoEm).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(ind.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setEditingIndicacao(ind);
                          setNovoStatus(ind.status);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 font-bold text-[11px] transition-colors"
                      >
                        Gerenciar Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS LIST (Prevents horizontal scrolling on small screens) */}
        <div className="block md:hidden space-y-3">
          {filteredIndicacoes.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nenhuma indicação encontrada para os filtros selecionados.
            </div>
          ) : (
            filteredIndicacoes.map((ind) => (
              <div
                key={ind.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Indicado:
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {ind.nomeIndicado}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      CPF: {ind.cpfIndicado} • Tel: {ind.telefoneIndicado}
                    </p>
                  </div>
                  <div>{getStatusBadge(ind.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-2 text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Indicador:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {ind.clienteNome || 'N/I'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Ação / Data:
                    </span>
                    <span className="font-semibold">{ind.tipoAcaoNome || 'Geral'}</span>
                    <span className="block text-[10px] text-slate-400">
                      {new Date(ind.criadoEm).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingIndicacao(ind);
                    setNovoStatus(ind.status);
                  }}
                  className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs text-center shadow-xs"
                >
                  Gerenciar Status
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* EDIT STATUS MODAL */}
      {editingIndicacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-500" />
                Gerenciar Indicação
              </h3>
              <button
                onClick={() => setEditingIndicacao(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl text-xs space-y-1 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
              <div>
                Indicado: <strong>{editingIndicacao.nomeIndicado}</strong> (CPF: {editingIndicacao.cpfIndicado})
              </div>
              <div>
                Cliente Indicador: <strong>{editingIndicacao.clienteNome}</strong>
              </div>
              <div>
                Tipo de Ação: <strong>{editingIndicacao.tipoAcaoNome}</strong>
              </div>
            </div>

            {modalSuccess && (
              <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs rounded-xl font-medium">
                {modalSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Novo Status da Indicação *
                </label>
                <select
                  value={novoStatus}
                  onChange={(e) => setNovoStatus(e.target.value as StatusIndicacao)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold"
                >
                  <option value="Recebida">Recebida</option>
                  <option value="Em Atendimento">Em Atendimento</option>
                  <option value="Qualificada">Qualificada</option>
                  <option value="Desqualificada">Desqualificada</option>
                  <option value="Contrato Fechado">Contrato Fechado (Gera Cupom Automático)</option>
                </select>
              </div>

              {novoStatus === 'Contrato Fechado' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <Gift className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Atenção:</strong> Ao alterar para <strong>Contrato Fechado</strong>, o sistema gerará automaticamente um <strong>Cupom de Recompensa de R$ 500,00</strong> para o cliente {editingIndicacao.clienteNome}!
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observações / Histórico de Atendimento
                </label>
                <textarea
                  rows={3}
                  value={observacaoStatus}
                  onChange={(e) => setObservacaoStatus(e.target.value)}
                  placeholder="Registre os detalhes da conversa, reunião ou contrato..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingIndicacao(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                  Confirmar Alteração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ClientCpfSearchModal isOpen={cpfModalOpen} onClose={() => setCpfModalOpen(false)} />
    </div>
  );
};
