import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiStore } from '../lib/supabase';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  DollarSign,
  PieChart as PieIcon,
  CheckCircle2,
  Briefcase,
  Layers,
  Activity,
  ChevronUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const GestaoPanel: React.FC = () => {
  const auth = useAuth();
  const gestoraNome = auth.staffActive?.nome || 'Dra. Cristiane';

  const [timePeriod, setTimePeriod] = useState<'semana' | 'mes' | 'ano'>('mes');

  // DATA
  const clientes = apiStore.getClientes();
  const indicacoes = apiStore.getIndicacoes();
  const cupons = apiStore.getCupons();
  const tiposAcao = apiStore.getTiposAcao();
  const logs = apiStore.getLogs();

  // KPIS
  const totalClientes = clientes.length;
  const totalIndicacoes = indicacoes.length;
  const totalContratos = indicacoes.filter(
    (i) => i.status === 'Contrato Fechado' || i.status === 'Cupom Gerado' || i.status === 'Cupom Utilizado'
  ).length;

  const taxaConversao = totalIndicacoes > 0 ? ((totalContratos / totalIndicacoes) * 100).toFixed(1) : '0.0';

  const totalValorCupons = cupons.reduce((sum, c) => sum + c.valor, 0);
  const totalValorUtilizado = cupons
    .filter((c) => c.status === 'Utilizado')
    .reduce((sum, c) => sum + (c.valorAbatido || c.valor), 0);
  const saldoAberto = cupons
    .filter((c) => c.status === 'Disponivel')
    .reduce((sum, c) => sum + c.valor, 0);

  // TOP RECOMMANDERS RANKING
  const clientRankings = clientes.map((c) => {
    const userInds = indicacoes.filter((i) => i.clienteId === c.id);
    const userContratos = userInds.filter(
      (i) => i.status === 'Contrato Fechado' || i.status === 'Cupom Gerado' || i.status === 'Cupom Utilizado'
    ).length;
    const userCupons = cupons.filter((cup) => cup.clienteId === c.id);
    const totalCuponsValor = userCupons.reduce((s, cup) => s + cup.valor, 0);

    return {
      cliente: c,
      totalInds: userInds.length,
      contratos: userContratos,
      valorCupons: totalCuponsValor,
    };
  }).sort((a, b) => b.totalInds - a.totalInds);

  // ACTION TYPE RANKING & PIE DATA
  const actionTypeData = tiposAcao.map((t) => {
    const count = indicacoes.filter((i) => i.tipoAcaoId === t.id).length;
    return {
      name: t.nome,
      count,
    };
  }).filter((d) => d.count > 0);

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#6366f1', '#64748b'];

  // CHART DATA BY MONTH/PERIODO
  const monthlyData = [
    { name: 'Jan', indicações: 12, contratos: 4 },
    { name: 'Fev', indicações: 18, contratos: 7 },
    { name: 'Mar', indicações: 24, contratos: 11 },
    { name: 'Abr', indicações: 15, contratos: 6 },
    { name: 'Mai', indicações: 28, contratos: 14 },
    { name: 'Jun', indicações: totalIndicacoes, contratos: totalContratos },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-1 border border-indigo-200 dark:border-indigo-800">
            Painel Executivo de Gestão
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
            Dashboard da Gestão Geral
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestora Responsável: <strong>{gestoraNome}</strong> | Métricas Globais, Conversão & Inteligência Comercial
          </p>
        </div>

        {/* TIME PERIOD SELECTOR */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto justify-between sm:justify-start">
          {(['semana', 'mes', 'ano'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setTimePeriod(p)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                timePeriod === p
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {p === 'semana' ? 'Esta Semana' : p === 'mes' ? 'Este Mês' : 'Este Ano'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIS CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clientes Totais</p>
          <p className="text-xl sm:text-2xl font-light text-slate-900 dark:text-white">{totalClientes}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Indicações</p>
          <p className="text-xl sm:text-2xl font-light text-indigo-600 dark:text-indigo-400">{totalIndicacoes}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contratos Fechados</p>
          <p className="text-xl sm:text-2xl font-light text-emerald-600 dark:text-emerald-400">{totalContratos}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Conversão</p>
          <p className="text-2xl font-light text-indigo-600 dark:text-indigo-400">{taxaConversao}%</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Em Cupons</p>
          <p className="text-2xl font-light text-amber-600 dark:text-amber-400">R$ {totalValorCupons.toFixed(0)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Abatido</p>
          <p className="text-2xl font-light text-slate-800 dark:text-slate-200">R$ {totalValorUtilizado.toFixed(0)}</p>
        </div>

        <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider mb-1">Saldo Aberto</p>
          <p className="text-2xl font-light">R$ {saldoAberto.toFixed(0)}</p>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BAR CHART: MONTHLY TENDENCIES */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Evolução Comercial: Indicações vs Contratos Fechados
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="indicações" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="contratos" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: ACTION TYPES */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-amber-500" />
            Distribuição por Tipo de Ação
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {actionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend fontSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RANKINGS & RECENT LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RANKING TOP RECOMMANDERS */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Ranking de Clientes Indicadores
          </h3>
          <div className="space-y-3">
            {clientRankings.slice(0, 5).map((rank, idx) => (
              <div
                key={rank.cliente.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center ${
                      idx === 0
                        ? 'bg-amber-500 text-white shadow-xs'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-800'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {rank.cliente.nome}
                    </h4>
                    <p className="text-[10px] text-slate-400">CPF: {rank.cliente.cpf}</p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="font-bold text-blue-600 dark:text-blue-400">{rank.totalInds} ind.</span>
                  <span className="text-slate-400 mx-1">|</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{rank.contratos} contr.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT AUDIT LOGS */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Histórico de Auditoria & Logs do Sistema
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1"
              >
                <div className="flex justify-between items-center">
                  <strong className="text-slate-800 dark:text-slate-200 font-bold">{log.acao}</strong>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.criadoEm).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{log.detalhes}</p>
                <p className="text-[10px] text-slate-400">Por: {log.usuarioNome}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
