import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiStore } from '../lib/supabase';
import {
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  Gift,
  ShieldCheck,
  User,
  AlertTriangle,
  Receipt,
  Tag,
} from 'lucide-react';
import { Cliente, Cupom } from '../types';

export const FinanceiroPanel: React.FC = () => {
  const auth = useAuth();
  const gestoraNome = auth.staffActive?.nome || 'Letícia';

  // SEARCH CLIENT BY CPF OR NAME
  const [searchCpf, setSearchCpf] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // ABATER CUPOM MODAL
  const [selectedCupom, setSelectedCupom] = useState<Cupom | null>(null);
  const [valorAbatidoInput, setValorAbatidoInput] = useState<number>(500);
  const [observacaoAbateInput, setObservacaoAbateInput] = useState('');
  const [abateSuccessMsg, setAbateSuccessMsg] = useState('');

  // DATA
  const clientes = apiStore.getClientes();
  const cupons = apiStore.getCupons();
  const indicacoes = apiStore.getIndicacoes();

  // FILTERED CUPONS BY SEARCH OR SELECTED CLIENTE
  const filteredCupons = cupons.filter((c) => {
    if (!searchCpf) return true;
    const term = searchCpf.toLowerCase().trim();
    return (
      (c.clienteNome && c.clienteNome.toLowerCase().includes(term)) ||
      (c.clienteCpf && c.clienteCpf.includes(term)) ||
      c.codigo.toLowerCase().includes(term)
    );
  });

  // STATS TOTAL FINANCEIRO
  const totalValorGerado = cupons.reduce((sum, c) => sum + c.valor, 0);
  const totalValorUtilizado = cupons
    .filter((c) => c.status === 'Utilizado')
    .reduce((sum, c) => sum + (c.valorAbatido || c.valor), 0);
  const totalSaldoDisponivel = cupons
    .filter((c) => c.status === 'Disponivel')
    .reduce((sum, c) => sum + c.valor, 0);

  const handleAbaterCupomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCupom) return;

    try {
      apiStore.abaterCupom(
        selectedCupom.id,
        gestoraNome,
        valorAbatidoInput,
        observacaoAbateInput
      );

      setAbateSuccessMsg(`Cupom ${selectedCupom.codigo} abatido com sucesso no valor de R$ ${valorAbatidoInput.toFixed(2)}!`);

      setTimeout(() => {
        setAbateSuccessMsg('');
        setSelectedCupom(null);
        setObservacaoAbateInput('');
      }, 1800);

      auth.refreshData();
    } catch (err: any) {
      alert(err.message || 'Erro ao abater cupom.');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mb-1 border border-emerald-200 dark:border-emerald-800">
            Setor Financeiro
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Painel Financeiro & Gestão de Cupons
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestora Financeira: <strong>{gestoraNome}</strong> | Controle de Abates, Saldo Acumulado e Histórico de Recompensas
          </p>
        </div>

        {/* METRICS SUMMARY */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Valor Gerado</span>
            <strong className="text-slate-900 dark:text-white text-base font-light">R$ {totalValorGerado.toFixed(2)}</strong>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Valor Utilizado</span>
            <strong className="text-indigo-600 dark:text-indigo-400 text-base font-light">R$ {totalValorUtilizado.toFixed(2)}</strong>
          </div>
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Saldo Aberto</span>
            <strong className="text-emerald-700 dark:text-emerald-300 text-base font-light">R$ {totalSaldoDisponivel.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* SEARCH CLIENT TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Buscar Cliente por CPF, Nome ou Código do Cupom
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchCpf}
            onChange={(e) => setSearchCpf(e.target.value)}
            placeholder="Digite o CPF do cliente ou código do cupom..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* CLIENT STATS CARD IF SEARCHED */}
      {searchCpf.trim() !== '' && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-md space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5" />
            Resumo Financeiro do Cliente Filtrado
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-emerald-500/40 text-xs">
            <div>
              <span className="text-emerald-200 block">Cupons Totais:</span>
              <strong className="text-lg">{filteredCupons.length}</strong>
            </div>
            <div>
              <span className="text-emerald-200 block">Cupons Disponíveis:</span>
              <strong className="text-lg">{filteredCupons.filter((c) => c.status === 'Disponivel').length}</strong>
            </div>
            <div>
              <span className="text-emerald-200 block">Saldo Disponível:</span>
              <strong className="text-lg">
                R${' '}
                {filteredCupons
                  .filter((c) => c.status === 'Disponivel')
                  .reduce((sum, c) => sum + c.valor, 0)
                  .toFixed(2)}
              </strong>
            </div>
            <div>
              <span className="text-emerald-200 block">Total Abatido:</span>
              <strong className="text-lg">
                R${' '}
                {filteredCupons
                  .filter((c) => c.status === 'Utilizado')
                  .reduce((sum, c) => sum + (c.valorAbatido || c.valor), 0)
                  .toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* COUPONS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-500" />
            Lista de Cupons de Recompensa ({filteredCupons.length})
          </h3>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Cliente Beneficiário</th>
                <th className="py-3.5 px-4">Valor</th>
                <th className="py-3.5 px-4">Origem / Indicado</th>
                <th className="py-3.5 px-4">Data Geração</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredCupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum cupom localizado.
                  </td>
                </tr>
              ) : (
                filteredCupons.map((cupom) => (
                  <tr key={cupom.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {cupom.codigo}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      <div>{cupom.clienteNome}</div>
                      <div className="text-[10px] text-slate-400">CPF: {cupom.clienteCpf}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">
                      R$ {cupom.valor.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {cupom.nomeIndicado || 'Indicação Aprovada'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(cupom.dataGeracao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4">
                      {cupom.status === 'Disponivel' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Disponível
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                          Utilizado em {cupom.dataUso ? new Date(cupom.dataUso).toLocaleDateString('pt-BR') : ''}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {cupom.status === 'Disponivel' ? (
                        <button
                          onClick={() => {
                            setSelectedCupom(cupom);
                            setValorAbatidoInput(cupom.valor);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs"
                        >
                          Abater Cupom
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium italic">
                          Abatido por {cupom.responsavelAbateNome}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="block md:hidden p-4 space-y-3">
          {filteredCupons.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nenhum cupom localizado.
            </div>
          ) : (
            filteredCupons.map((cupom) => (
              <div
                key={cupom.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white bg-slate-200/80 dark:bg-slate-700/80 px-2.5 py-0.5 rounded-md">
                    {cupom.codigo}
                  </span>
                  <div>
                    {cupom.status === 'Disponivel' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                        Disponível
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        Utilizado
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Cliente:
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {cupom.clienteNome}
                    </h4>
                    <p className="text-[10px] text-slate-400">CPF: {cupom.clienteCpf}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Valor Recompensa:
                    </span>
                    <strong className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      R$ {cupom.valor.toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="text-xs text-slate-500 border-t border-slate-200/60 dark:border-slate-700/60 pt-2 flex justify-between">
                  <span>Indicado: <strong>{cupom.nomeIndicado || 'Geral'}</strong></span>
                  <span>{new Date(cupom.dataGeracao).toLocaleDateString('pt-BR')}</span>
                </div>

                {cupom.status === 'Disponivel' ? (
                  <button
                    onClick={() => {
                      setSelectedCupom(cupom);
                      setValorAbatidoInput(cupom.valor);
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center shadow-xs"
                  >
                    Abater Valor em Honorários
                  </button>
                ) : (
                  <p className="text-[11px] text-slate-400 italic text-center">
                    Abatido por {cupom.responsavelAbateNome}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ABATER CUPOM MODAL */}
      {selectedCupom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-500" />
                Abater Cupom de Recompensa
              </h3>
              <button
                onClick={() => setSelectedCupom(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl text-xs space-y-1.5 border border-emerald-200 dark:border-emerald-800/80">
              <div className="flex justify-between text-emerald-900 dark:text-emerald-200 font-bold">
                <span>Cupom: {selectedCupom.codigo}</span>
                <span>Valor Nominal: R$ {selectedCupom.valor.toFixed(2)}</span>
              </div>
              <div className="text-emerald-800 dark:text-emerald-300">
                Cliente: <strong>{selectedCupom.clienteNome}</strong> (CPF: {selectedCupom.clienteCpf})
              </div>
              <div className="text-emerald-700 dark:text-emerald-400">
                Origem da Indicação: {selectedCupom.nomeIndicado}
              </div>
            </div>

            {abateSuccessMsg && (
              <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs rounded-xl font-medium">
                {abateSuccessMsg}
              </div>
            )}

            <form onSubmit={handleAbaterCupomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Valor a Abater (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={valorAbatidoInput}
                  onChange={(e) => setValorAbatidoInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observações do Abate Financeiro
                </label>
                <textarea
                  rows={3}
                  value={observacaoAbateInput}
                  onChange={(e) => setObservacaoAbateInput(e.target.value)}
                  placeholder="Ex: Abatido no pagamento de honorários contratuais..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                ></textarea>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Uma vez abatido, o cupom será marcado como <strong>Utilizado</strong> e nunca poderá ser reaproveitado.</span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedCupom(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                >
                  Confirmar Abate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
