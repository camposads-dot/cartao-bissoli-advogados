import React, { useState } from 'react';
import { apiStore } from '../lib/supabase';
import {
  exportToCSV,
  exportToExcel,
  exportIndicacoesPDF,
  exportCuponsPDF,
} from '../lib/exportUtils';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Filter,
  X,
  Printer,
  Calendar,
} from 'lucide-react';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [reportType, setReportType] = useState<'indicacoes' | 'cupons'>('indicacoes');
  const [periodo, setPeriodo] = useState<'todos' | 'semana' | 'mes' | 'ano'>('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  const indicacoes = apiStore.getIndicacoes();
  const cupons = apiStore.getCupons();
  const tiposAcao = apiStore.getTiposAcao();

  const handleExportCSV = () => {
    if (reportType === 'indicacoes') {
      const data = indicacoes.map((i) => ({
        Indicado: i.nomeIndicado,
        CPF_Indicado: i.cpfIndicado,
        Telefone: i.telefoneIndicado,
        Cliente_Indicador: i.clienteNome,
        CPF_Cliente: i.clienteCpf,
        Tipo_Acao: i.tipoAcaoNome,
        Status: i.status,
        Data_Cadastro: new Date(i.criadoEm).toLocaleDateString('pt-BR'),
      }));
      exportToCSV('Relatorio_Indicacoes', data);
    } else {
      const data = cupons.map((c) => ({
        Codigo_Cupom: c.codigo,
        Cliente: c.clienteNome,
        CPF_Cliente: c.clienteCpf,
        Valor: c.valor,
        Status: c.status,
        Data_Geracao: new Date(c.dataGeracao).toLocaleDateString('pt-BR'),
        Responsavel_Validacao: c.responsavelValidacaoNome,
        Data_Uso: c.dataUso ? new Date(c.dataUso).toLocaleDateString('pt-BR') : 'N/A',
        Responsavel_Abate: c.responsavelAbateNome || 'N/A',
      }));
      exportToCSV('Relatorio_Cupons', data);
    }
  };

  const handleExportExcel = () => {
    if (reportType === 'indicacoes') {
      const data = indicacoes.map((i) => ({
        Indicado: i.nomeIndicado,
        CPF_Indicado: i.cpfIndicado,
        Telefone: i.telefoneIndicado,
        Cliente_Indicador: i.clienteNome,
        CPF_Cliente: i.clienteCpf,
        Tipo_Acao: i.tipoAcaoNome,
        Status: i.status,
        Data_Cadastro: new Date(i.criadoEm).toLocaleDateString('pt-BR'),
      }));
      exportToExcel('Relatorio_Indicacoes', 'Indicações', data);
    } else {
      const data = cupons.map((c) => ({
        Codigo_Cupom: c.codigo,
        Cliente: c.clienteNome,
        CPF_Cliente: c.clienteCpf,
        Valor: c.valor,
        Status: c.status,
        Data_Geracao: new Date(c.dataGeracao).toLocaleDateString('pt-BR'),
        Responsavel_Validacao: c.responsavelValidacaoNome,
      }));
      exportToExcel('Relatorio_Cupons', 'Cupons', data);
    }
  };

  const handleExportPDF = () => {
    if (reportType === 'indicacoes') {
      exportIndicacoesPDF(indicacoes);
    } else {
      exportCuponsPDF(cupons);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-500" />
            Central de Exportação de Relatórios
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* REPORT TYPE SELECTOR */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            onClick={() => setReportType('indicacoes')}
            className={`p-3 rounded-xl border text-left font-bold transition-all ${
              reportType === 'indicacoes'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Relatório de Indicações
          </button>
          <button
            onClick={() => setReportType('cupons')}
            className={`p-3 rounded-xl border text-left font-bold transition-all ${
              reportType === 'cupons'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Relatório Financeiro de Cupons
          </button>
        </div>

        {/* EXPORT FORMAT BUTTONS */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleExportPDF}
            className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar em PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
