export type PerfilCodigo = 'super_admin' | 'SUPER_ADMIN' | 'admin_master' | 'comercial' | 'financeiro' | 'gestao';

export type StatusIndicacao =
  | 'Recebida'
  | 'Em Atendimento'
  | 'Qualificada'
  | 'Desqualificada'
  | 'Contrato Fechado'
  | 'Cupom Gerado'
  | 'Cupom Utilizado';

export type StatusCupom = 'Disponivel' | 'Utilizado';

export interface Perfil {
  id: string;
  codigo: PerfilCodigo;
  nome: string;
  descricao: string;
}

export interface UsuarioInterno {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilCodigo;
  ativo: boolean;
  criadoEm: string;
  senha?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  criadoEm: string;
}

export interface TipoAcao {
  id: string;
  nome: string;
  valorRecompensa?: number;
  ativo: boolean;
  criadoEm: string;
}

export interface HistoricoStatus {
  id: string;
  indicacaoId: string;
  statusAnterior: StatusIndicacao | null;
  statusNovo: StatusIndicacao;
  responsavelNome: string;
  observacao?: string;
  criadoEm: string;
}

export interface Indicacao {
  id: string;
  clienteId: string;
  clienteNome?: string;
  clienteCpf?: string;
  nomeIndicado: string;
  cpfIndicado: string;
  telefoneIndicado: string;
  tipoAcaoId: string;
  tipoAcaoNome?: string;
  observacoes?: string;
  status: StatusIndicacao;
  criadoEm: string;
  atualizadoEm: string;
  historico?: HistoricoStatus[];
}

export interface Cupom {
  id: string;
  codigo: string;
  indicacaoId: string;
  clienteId: string;
  clienteNome?: string;
  clienteCpf?: string;
  nomeIndicado?: string;
  valor: number;
  status: StatusCupom;
  dataGeracao: string;
  responsavelValidacaoNome: string;
  dataUso?: string;
  responsavelAbateNome?: string;
  valorAbatido?: number;
  observacaoAbate?: string;
}

export interface LogSistema {
  id: string;
  usuarioNome: string;
  acao: string;
  detalhes: string;
  criadoEm: string;
}

export interface ConfiguracaoSistema {
  valorPadraoCupom: number;
  nomeEscritorio: string;
  permitirAutoCadastroCliente: boolean;
}

export interface FiltrosRelatorio {
  periodo: 'todos' | 'semana' | 'mes' | 'ano' | 'personalizado';
  dataInicio?: string;
  dataFim?: string;
  tipoAcaoId?: string;
  status?: string;
  usuarioId?: string;
}
