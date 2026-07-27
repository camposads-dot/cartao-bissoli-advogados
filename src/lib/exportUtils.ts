import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Cupom, Indicacao } from '../types';

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);

  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(filename: string, sheetName: string, data: Record<string, any>[]) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportIndicacoesPDF(indicacoes: Indicacao[], titulo = 'Relatorio_Indicacoes') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Advocacia Cristiane & Associados', 14, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Relatório de Indicações - Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
  doc.setLineWidth(0.5);
  doc.line(14, 32, pageWidth - 14, 32);

  let y = 40;
  doc.setFontSize(10);

  indicacoes.forEach((ind, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. Indicado: ${ind.nomeIndicado} (CPF: ${ind.cpfIndicado})`, 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`   Cliente Indicador: ${ind.clienteNome || 'N/I'} (${ind.clienteCpf || ''})`, 14, y);
    y += 5;
    doc.text(`   Tipo de Ação: ${ind.tipoAcaoNome || 'Geral'} | Status: ${ind.status}`, 14, y);
    y += 5;
    doc.text(`   Telefone: ${ind.telefoneIndicado} | Data: ${new Date(ind.criadoEm).toLocaleDateString('pt-BR')}`, 14, y);
    y += 8;
  });

  doc.save(`${titulo}_${Date.now()}.pdf`);
}

export function exportCuponsPDF(cupons: Cupom[], titulo = 'Relatorio_Cupons') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Advocacia Cristiane & Associados', 14, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Relatório Financeiro de Cupons - ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
  doc.line(14, 32, pageWidth - 14, 32);

  let y = 40;
  doc.setFontSize(10);

  cupons.forEach((cup, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. Código: ${cup.codigo} - R$ ${cup.valor.toFixed(2)} [${cup.status}]`, 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`   Cliente Beneficiário: ${cup.clienteNome} (${cup.clienteCpf})`, 14, y);
    y += 5;
    doc.text(`   Indicado de Origem: ${cup.nomeIndicado || 'N/A'}`, 14, y);
    y += 5;
    doc.text(`   Validação: ${cup.responsavelValidacaoNome} em ${new Date(cup.dataGeracao).toLocaleDateString('pt-BR')}`, 14, y);

    if (cup.status === 'Utilizado') {
      y += 5;
      doc.text(`   Abatido por: ${cup.responsavelAbateNome} em ${cup.dataUso ? new Date(cup.dataUso).toLocaleDateString('pt-BR') : ''} (Valor Abatido: R$ ${(cup.valorAbatido || cup.valor).toFixed(2)})`, 14, y);
    }

    y += 8;
  });

  doc.save(`${titulo}_${Date.now()}.pdf`);
}
