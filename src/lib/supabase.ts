import { createClient } from '@supabase/supabase-js';
import {
  Cliente,
  Cupom,
  Indicacao,
  LogSistema,
  TipoAcao,
  UsuarioInterno,
  ConfiguracaoSistema,
} from '../types';

// Supabase Credentials from prompt or environment
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://smprrzcgxnyvmcbaaxmv.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_V_E083P72EW3Cg8-GkWYBw_DbC5_N3U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// LOCAL STORAGE HYBRID ENGINE (Guarantees instant preview functionality)
const STORAGE_KEYS = {
  CLIENTES: 'indica_adv_clientes',
  INDICACOES: 'indica_adv_indicacoes',
  CUPONS: 'indica_adv_cupons',
  USUARIOS: 'indica_adv_usuarios',
  TIPOS_ACAO: 'indica_adv_tipos_acao',
  LOGS: 'indica_adv_logs',
  CONFIG: 'indica_adv_config',
};

// INITIAL SEED DATA
const defaultTiposAcao: TipoAcao[] = [
  { id: '1', nome: 'Previdenciário', ativo: true, criadoEm: new Date().toISOString() },
  { id: '2', nome: 'Trabalhista', ativo: true, criadoEm: new Date().toISOString() },
  { id: '3', nome: 'Consumidor', ativo: true, criadoEm: new Date().toISOString() },
  { id: '4', nome: 'Família', ativo: true, criadoEm: new Date().toISOString() },
  { id: '5', nome: 'Inventário', ativo: true, criadoEm: new Date().toISOString() },
  { id: '6', nome: 'Empresarial', ativo: true, criadoEm: new Date().toISOString() },
  { id: '7', nome: 'Outro', ativo: true, criadoEm: new Date().toISOString() },
];

const defaultUsuarios: UsuarioInterno[] = [
  {
    id: 'u_super_admin',
    nome: 'Elnatan Campos',
    email: 'elnatacampos@outlook.com',
    perfil: 'super_admin',
    ativo: true,
    criadoEm: new Date().toISOString(),
    senha: 'Er@n4t4n',
  },
  { id: 'u1', nome: 'Administrador Master', email: 'admin@escritorio.adv.br', perfil: 'admin_master', ativo: true, criadoEm: new Date().toISOString() },
  { id: 'u2', nome: 'Natan Campos', email: 'natan.campos@escritorio.adv.br', perfil: 'comercial', ativo: true, criadoEm: new Date().toISOString() },
  { id: 'u3', nome: 'Letícia', email: 'leticia.financeiro@escritorio.adv.br', perfil: 'financeiro', ativo: true, criadoEm: new Date().toISOString() },
  { id: 'u4', nome: 'Dra. Cristiane', email: 'dra.cristiane@escritorio.adv.br', perfil: 'gestao', ativo: true, criadoEm: new Date().toISOString() },
];

const defaultClientes: Cliente[] = [];

const defaultIndicacoes: Indicacao[] = [];

const defaultCupons: Cupom[] = [];

const defaultLogs: LogSistema[] = [];

const defaultConfig: ConfiguracaoSistema = {
  valorPadraoCupom: 500,
  nomeEscritorio: 'Bissoli & Bissoli Advogados',
  permitirAutoCadastroCliente: true,
};

// INITIALIZE LOCAL STORAGE IF EMPTY
export function initLocalStore() {
  // Clear legacy mock seed data if present in localStorage
  const mockClientIds = ['c1', 'c2', 'c3'];
  const mockIndIds = ['i1', 'i2', 'i3', 'i4'];
  const mockCupIds = ['cup1'];
  const mockLogIds = ['l1'];

  const rawClientes = localStorage.getItem(STORAGE_KEYS.CLIENTES);
  if (rawClientes) {
    const clients: Cliente[] = JSON.parse(rawClientes);
    const cleaned = clients.filter((c) => !mockClientIds.includes(c.id));
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(cleaned));
  } else {
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(defaultClientes));
  }

  const rawInds = localStorage.getItem(STORAGE_KEYS.INDICACOES);
  if (rawInds) {
    const inds: Indicacao[] = JSON.parse(rawInds);
    const cleaned = inds.filter((i) => !mockIndIds.includes(i.id));
    localStorage.setItem(STORAGE_KEYS.INDICACOES, JSON.stringify(cleaned));
  } else {
    localStorage.setItem(STORAGE_KEYS.INDICACOES, JSON.stringify(defaultIndicacoes));
  }

  const rawCups = localStorage.getItem(STORAGE_KEYS.CUPONS);
  if (rawCups) {
    const cups: Cupom[] = JSON.parse(rawCups);
    const cleaned = cups.filter((c) => !mockCupIds.includes(c.id));
    localStorage.setItem(STORAGE_KEYS.CUPONS, JSON.stringify(cleaned));
  } else {
    localStorage.setItem(STORAGE_KEYS.CUPONS, JSON.stringify(defaultCupons));
  }

  const rawLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
  if (rawLogs) {
    const logs: LogSistema[] = JSON.parse(rawLogs);
    const cleaned = logs.filter((l) => !mockLogIds.includes(l.id));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(cleaned));
  } else {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(defaultLogs));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USUARIOS)) {
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(defaultUsuarios));
  } else {
    // Ensure Super Admin user exists
    const currentUsers: UsuarioInterno[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USUARIOS) || '[]');
    const hasSuperAdmin = currentUsers.some(
      (u) => u.email.toLowerCase() === 'elnatacampos@outlook.com' || u.perfil === 'super_admin' || u.perfil === 'SUPER_ADMIN'
    );
    if (!hasSuperAdmin) {
      const superAdminUser: UsuarioInterno = {
        id: 'u_super_admin',
        nome: 'Elnatan Campos',
        email: 'elnatacampos@outlook.com',
        perfil: 'super_admin',
        ativo: true,
        criadoEm: new Date().toISOString(),
        senha: 'Er@n4t4n',
      };
      localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify([superAdminUser, ...currentUsers]));
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.TIPOS_ACAO)) {
    localStorage.setItem(STORAGE_KEYS.TIPOS_ACAO, JSON.stringify(defaultTiposAcao));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(defaultConfig));
  }
}

// STORAGE READ/WRITE HELPERS
export function getStoreData<T>(key: string): T {
  initLocalStore();
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : ([] as unknown as T);
}

export function setStoreData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// DATA MANAGEMENT API
export const apiStore = {
  getClientes: (): Cliente[] => getStoreData<Cliente[]>(STORAGE_KEYS.CLIENTES),
  saveCliente: (cliente: Omit<Cliente, 'id' | 'criadoEm'>): Cliente => {
    const clientes = apiStore.getClientes();
    const existing = clientes.find((c) => c.cpf.replace(/\D/g, '') === cliente.cpf.replace(/\D/g, ''));
    if (existing) return existing;

    const newCliente: Cliente = {
      ...cliente,
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      criadoEm: new Date().toISOString(),
    };
    setStoreData(STORAGE_KEYS.CLIENTES, [newCliente, ...clientes]);
    return newCliente;
  },

  getIndicacoes: (): Indicacao[] => getStoreData<Indicacao[]>(STORAGE_KEYS.INDICACOES),
  saveIndicacao: (indicacao: Omit<Indicacao, 'id' | 'criadoEm' | 'atualizadoEm' | 'status'>): Indicacao => {
    const indicacoes = apiStore.getIndicacoes();
    const config = apiStore.getConfig();
    const newIndicacao: Indicacao = {
      ...indicacao,
      id: 'ind_' + Math.random().toString(36).substring(2, 9),
      status: 'Recebida',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      historico: [
        {
          id: 'hist_' + Math.random().toString(36).substring(2, 9),
          indicacaoId: '',
          statusAnterior: null,
          statusNovo: 'Recebida',
          responsavelNome: indicacao.clienteNome || 'Cliente',
          observacao: 'Indicação recebida pelo sistema.',
          criadoEm: new Date().toISOString(),
        },
      ],
    };
    newIndicacao.historico![0].indicacaoId = newIndicacao.id;
    setStoreData(STORAGE_KEYS.INDICACOES, [newIndicacao, ...indicacoes]);

    apiStore.addLog(
      indicacao.clienteNome || 'Cliente',
      'Nova Indicação Cadastrada',
      `Indicação de ${indicacao.nomeIndicado} para ${indicacao.tipoAcaoNome || 'Ação Judicial'}.`
    );

    return newIndicacao;
  },

  updateIndicacaoStatus: (
    indicacaoId: string,
    novoStatus: Indicacao['status'],
    responsavelNome: string,
    observacao?: string
  ): { indicacao: Indicacao; cupomGerado?: Cupom } => {
    const indicacoes = apiStore.getIndicacoes();
    const index = indicacoes.findIndex((i) => i.id === indicacaoId);
    if (index === -1) throw new Error('Indicação não encontrada.');

    const target = { ...indicacoes[index] };
    const statusAnterior = target.status;
    target.status = novoStatus;
    target.atualizadoEm = new Date().toISOString();

    const novoHistorico = {
      id: 'hist_' + Math.random().toString(36).substring(2, 9),
      indicacaoId: target.id,
      statusAnterior,
      statusNovo: novoStatus,
      responsavelNome,
      observacao: observacao || `Status alterado de ${statusAnterior} para ${novoStatus}`,
      criadoEm: new Date().toISOString(),
    };

    target.historico = [novoHistorico, ...(target.historico || [])];
    indicacoes[index] = target;
    setStoreData(STORAGE_KEYS.INDICACOES, indicacoes);

    let cupomGerado: Cupom | undefined = undefined;

    // IF CONTRACT CLOSED -> AUTO GENERATE REWARD COUPON
    if (novoStatus === 'Contrato Fechado') {
      const config = apiStore.getConfig();
      const cupons = apiStore.getCupons();
      const existingCupom = cupons.find((c) => c.indicacaoId === target.id);

      if (!existingCupom) {
        const codAleatorio = Math.random().toString(36).substring(2, 8).toUpperCase();
        cupomGerado = {
          id: 'cup_' + Math.random().toString(36).substring(2, 9),
          codigo: `CUP-${codAleatorio}`,
          indicacaoId: target.id,
          clienteId: target.clienteId,
          clienteNome: target.clienteNome,
          clienteCpf: target.clienteCpf,
          nomeIndicado: target.nomeIndicado,
          valor: config.valorPadraoCupom,
          status: 'Disponivel',
          dataGeracao: new Date().toISOString(),
          responsavelValidacaoNome: responsavelNome,
        };

        setStoreData(STORAGE_KEYS.CUPONS, [cupomGerado, ...cupons]);

        apiStore.addLog(
          responsavelNome,
          'Contrato Fechado & Geração de Cupom',
          `Contrato validado para ${target.nomeIndicado}. Cupom ${cupomGerado.codigo} de R$ ${config.valorPadraoCupom.toFixed(2)} disponibilizado para o cliente ${target.clienteNome}.`
        );
      }
    } else {
      apiStore.addLog(
        responsavelNome,
        'Atualização de Status de Indicação',
        `Indicação de ${target.nomeIndicado} alterada para status ${novoStatus}.`
      );
    }

    return { indicacao: target, cupomGerado };
  },

  getCupons: (): Cupom[] => getStoreData<Cupom[]>(STORAGE_KEYS.CUPONS),

  abaterCupom: (
    cupomId: string,
    responsavelNome: string,
    valorAbatido: number,
    observacaoAbate?: string
  ): Cupom => {
    const cupons = apiStore.getCupons();
    const index = cupons.findIndex((c) => c.id === cupomId);
    if (index === -1) throw new Error('Cupom não encontrado.');

    const cupom = cupons[index];
    if (cupom.status === 'Utilizado') {
      throw new Error('Este cupom já foi utilizado anteriormente e não pode ser reutilizado!');
    }

    cupom.status = 'Utilizado';
    cupom.dataUso = new Date().toISOString();
    cupom.responsavelAbateNome = responsavelNome;
    cupom.valorAbatido = valorAbatido;
    cupom.observacaoAbate = observacaoAbate || 'Abate de cupom realizado no setor financeiro.';

    cupons[index] = cupom;
    setStoreData(STORAGE_KEYS.CUPONS, cupons);

    apiStore.addLog(
      responsavelNome,
      'Abate de Cupom Financeiro',
      `Cupom ${cupom.codigo} no valor de R$ ${valorAbatido.toFixed(2)} abatido para o cliente ${cupom.clienteNome}.`
    );

    return cupom;
  },

  getUsuarios: (): UsuarioInterno[] => getStoreData<UsuarioInterno[]>(STORAGE_KEYS.USUARIOS),
  saveUsuario: (usuario: Omit<UsuarioInterno, 'id' | 'criadoEm'>): UsuarioInterno => {
    const usuarios = apiStore.getUsuarios();
    const newUsuario: UsuarioInterno = {
      ...usuario,
      id: 'u_' + Math.random().toString(36).substring(2, 9),
      criadoEm: new Date().toISOString(),
    };
    setStoreData(STORAGE_KEYS.USUARIOS, [newUsuario, ...usuarios]);
    apiStore.addLog('Elnatan Campos (Super Admin)', 'Criação de Usuário Interno', `Novo usuário ${usuario.nome} (${usuario.email}) criado com perfil ${usuario.perfil}.`);
    return newUsuario;
  },
  updateUsuario: (id: string, updates: Partial<UsuarioInterno>, executorNome = 'Super Admin'): UsuarioInterno => {
    const usuarios = apiStore.getUsuarios();
    const idx = usuarios.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('Usuário não encontrado.');

    const target = usuarios[idx];
    // Check if modifying super admin email/role constraints if needed
    const updated = { ...target, ...updates };
    usuarios[idx] = updated;
    setStoreData(STORAGE_KEYS.USUARIOS, usuarios);
    apiStore.addLog(executorNome, 'Atualização de Usuário', `Dados do usuário ${updated.nome} (${updated.email}) atualizados.`);
    return updated;
  },
  deleteUsuario: (id: string, executorNome = 'Super Admin'): void => {
    const usuarios = apiStore.getUsuarios();
    const target = usuarios.find((u) => u.id === id);
    if (!target) throw new Error('Usuário não encontrado.');

    if (
      target.email.toLowerCase() === 'elnatacampos@outlook.com' ||
      target.perfil === 'super_admin' ||
      target.perfil === 'SUPER_ADMIN'
    ) {
      throw new Error('O usuário Super Administrador não pode ser excluído por nenhum usuário!');
    }

    const filtered = usuarios.filter((u) => u.id !== id);
    setStoreData(STORAGE_KEYS.USUARIOS, filtered);
    apiStore.addLog(executorNome, 'Exclusão de Usuário', `Usuário ${target.nome} (${target.email}) foi excluído do sistema.`);
  },
  resetSenhaUsuario: (id: string, novaSenha: string, executorNome = 'Super Admin'): void => {
    const usuarios = apiStore.getUsuarios();
    const target = usuarios.find((u) => u.id === id);
    if (!target) throw new Error('Usuário não encontrado.');

    target.senha = novaSenha;
    setStoreData(STORAGE_KEYS.USUARIOS, usuarios);
    apiStore.addLog(executorNome, 'Redefinição de Senha', `Senha do usuário ${target.nome} (${target.email}) redefinida.`);
  },
  toggleUsuarioAtivo: (id: string): void => {
    const usuarios = apiStore.getUsuarios();
    const target = usuarios.find((u) => u.id === id);
    if (target) {
      target.ativo = !target.ativo;
      setStoreData(STORAGE_KEYS.USUARIOS, usuarios);
      apiStore.addLog('Super Admin', 'Alteração de Status de Usuário', `Usuário ${target.nome} alterado para ${target.ativo ? 'Ativo' : 'Inativo'}.`);
    }
  },

  gerarBackup: () => {
    const data = {
      timestamp: new Date().toISOString(),
      clientes: apiStore.getClientes(),
      indicacoes: apiStore.getIndicacoes(),
      cupons: apiStore.getCupons(),
      usuarios: apiStore.getUsuarios(),
      tiposAcao: apiStore.getTiposAcao(),
      config: apiStore.getConfig(),
      logs: apiStore.getLogs(),
    };
    apiStore.addLog('Super Admin', 'Geração de Backup', 'Backup completo do banco de dados gerado e exportado.');
    return data;
  },

  restaurarBackup: (backupJsonStr: string) => {
    try {
      const parsed = JSON.parse(backupJsonStr);
      if (parsed.clientes) setStoreData(STORAGE_KEYS.CLIENTES, parsed.clientes);
      if (parsed.indicacoes) setStoreData(STORAGE_KEYS.INDICACOES, parsed.indicacoes);
      if (parsed.cupons) setStoreData(STORAGE_KEYS.CUPONS, parsed.cupons);
      if (parsed.usuarios) setStoreData(STORAGE_KEYS.USUARIOS, parsed.usuarios);
      if (parsed.tiposAcao) setStoreData(STORAGE_KEYS.TIPOS_ACAO, parsed.tiposAcao);
      if (parsed.config) setStoreData(STORAGE_KEYS.CONFIG, parsed.config);
      if (parsed.logs) setStoreData(STORAGE_KEYS.LOGS, parsed.logs);

      apiStore.addLog('Super Admin', 'Restauração de Backup', 'Banco de dados restaurado a partir de arquivo de backup.');
      return true;
    } catch (e) {
      throw new Error('Formato de arquivo de backup inválido.');
    }
  },

  getTiposAcao: (): TipoAcao[] => getStoreData<TipoAcao[]>(STORAGE_KEYS.TIPOS_ACAO),
  saveTipoAcao: (nome: string): TipoAcao => {
    const tipos = apiStore.getTiposAcao();
    const newTipo: TipoAcao = {
      id: 'ta_' + Math.random().toString(36).substring(2, 9),
      nome,
      ativo: true,
      criadoEm: new Date().toISOString(),
    };
    setStoreData(STORAGE_KEYS.TIPOS_ACAO, [...tipos, newTipo]);
    return newTipo;
  },
  toggleTipoAcaoAtivo: (id: string): void => {
    const tipos = apiStore.getTiposAcao();
    const target = tipos.find((t) => t.id === id);
    if (target) {
      target.ativo = !target.ativo;
      setStoreData(STORAGE_KEYS.TIPOS_ACAO, tipos);
    }
  },

  getConfig: (): ConfiguracaoSistema => getStoreData<ConfiguracaoSistema>(STORAGE_KEYS.CONFIG),
  updateConfig: (novasConfigs: Partial<ConfiguracaoSistema>): ConfiguracaoSistema => {
    const config = { ...apiStore.getConfig(), ...novasConfigs };
    setStoreData(STORAGE_KEYS.CONFIG, config);
    return config;
  },

  getLogs: (): LogSistema[] => getStoreData<LogSistema[]>(STORAGE_KEYS.LOGS),
  addLog: (usuarioNome: string, acao: string, detalhes: string): void => {
    const logs = apiStore.getLogs();
    const newLog: LogSistema = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      usuarioNome,
      acao,
      detalhes,
      criadoEm: new Date().toISOString(),
    };
    setStoreData(STORAGE_KEYS.LOGS, [newLog, ...logs.slice(0, 199)]);
  },
};
