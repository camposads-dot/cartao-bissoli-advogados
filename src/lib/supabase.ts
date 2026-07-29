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
  { id: '1', nome: 'Previdenciário', valorRecompensa: 500, ativo: true, criadoEm: new Date().toISOString() },
  { id: '2', nome: 'Trabalhista', valorRecompensa: 600, ativo: true, criadoEm: new Date().toISOString() },
  { id: '3', nome: 'Consumidor', valorRecompensa: 300, ativo: true, criadoEm: new Date().toISOString() },
  { id: '4', nome: 'Família', valorRecompensa: 500, ativo: true, criadoEm: new Date().toISOString() },
  { id: '5', nome: 'Inventário', valorRecompensa: 800, ativo: true, criadoEm: new Date().toISOString() },
  { id: '6', nome: 'Empresarial', valorRecompensa: 1000, ativo: true, criadoEm: new Date().toISOString() },
  { id: '7', nome: 'Outro', valorRecompensa: 500, ativo: true, criadoEm: new Date().toISOString() },
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

const defaultClientes: Cliente[] = [
  {
    id: 'c_maria',
    nome: 'Maria Oliveira Costa',
    cpf: '123.456.789-00',
    telefone: '(11) 98765-4321',
    email: 'maria.costa@gmail.com',
    criadoEm: '2026-07-28T10:15:00.000Z',
  },
  {
    id: 'c_joao',
    nome: 'João Santos Ribeiro',
    cpf: '987.654.321-11',
    telefone: '(21) 99887-6655',
    email: 'joao.ribeiro@hotmail.com',
    criadoEm: '2026-07-28T11:30:00.000Z',
  },
  {
    id: 'c_ana',
    nome: 'Ana Paula Ferreira',
    cpf: '456.789.012-33',
    telefone: '(31) 99123-8877',
    email: 'ana.ferreira@outlook.com',
    criadoEm: '2026-07-28T14:20:00.000Z',
  },
  {
    id: 'c_marcos',
    nome: 'Marcos Antonio Pereira',
    cpf: '321.654.987-44',
    telefone: '(41) 98877-1122',
    email: 'marcos.pereira@gmail.com',
    criadoEm: '2026-07-29T08:10:00.000Z',
  },
];

const defaultIndicacoes: Indicacao[] = [
  {
    id: 'ind_01',
    clienteId: 'c_maria',
    clienteNome: 'Maria Oliveira Costa',
    clienteCpf: '123.456.789-00',
    nomeIndicado: 'Carlos Eduardo Silva',
    cpfIndicado: '234.567.890-11',
    telefoneIndicado: '(11) 97654-3210',
    tipoAcaoId: '1',
    tipoAcaoNome: 'Previdenciário',
    observacoes: 'Indicação feita pelo portal do cliente para aposentadoria por tempo de contribuição.',
    status: 'Em Atendimento',
    criadoEm: '2026-07-28T10:30:00.000Z',
    atualizadoEm: '2026-07-28T10:45:00.000Z',
    historico: [
      {
        id: 'h1',
        indicacaoId: 'ind_01',
        statusAnterior: 'Recebida',
        statusNovo: 'Em Atendimento',
        responsavelNome: 'Natan Campos',
        observacao: 'Contato inicial realizado via WhatsApp com o indicado.',
        criadoEm: '2026-07-28T10:45:00.000Z',
      },
      {
        id: 'h0',
        indicacaoId: 'ind_01',
        statusAnterior: null,
        statusNovo: 'Recebida',
        responsavelNome: 'Maria Oliveira Costa',
        observacao: 'Indicação cadastrada no Acesso de Cliente.',
        criadoEm: '2026-07-28T10:30:00.000Z',
      },
    ],
  },
  {
    id: 'ind_02',
    clienteId: 'c_maria',
    clienteNome: 'Maria Oliveira Costa',
    clienteCpf: '123.456.789-00',
    nomeIndicado: 'Patricia Souza',
    cpfIndicado: '345.678.901-22',
    telefoneIndicado: '(11) 96543-2109',
    tipoAcaoId: '2',
    tipoAcaoNome: 'Trabalhista',
    observacoes: 'Revisão de rescisão contratual e horas extras.',
    status: 'Contrato Fechado',
    criadoEm: '2026-07-28T11:00:00.000Z',
    atualizadoEm: '2026-07-28T15:20:00.000Z',
    historico: [
      {
        id: 'h2',
        indicacaoId: 'ind_02',
        statusAnterior: 'Em Atendimento',
        statusNovo: 'Contrato Fechado',
        responsavelNome: 'Natan Campos',
        observacao: 'Contrato assinado. Cupom de recompensa liberado para a cliente.',
        criadoEm: '2026-07-28T15:20:00.000Z',
      },
    ],
  },
  {
    id: 'ind_03',
    clienteId: 'c_joao',
    clienteNome: 'João Santos Ribeiro',
    clienteCpf: '987.654.321-11',
    nomeIndicado: 'Fernanda Lima',
    cpfIndicado: '567.890.123-44',
    telefoneIndicado: '(21) 98712-3456',
    tipoAcaoId: '4',
    tipoAcaoNome: 'Família',
    observacoes: 'Ação de pensão alimentícia e guarda compartilhada.',
    status: 'Qualificada',
    criadoEm: '2026-07-28T12:00:00.000Z',
    atualizadoEm: '2026-07-28T14:10:00.000Z',
    historico: [
      {
        id: 'h3',
        indicacaoId: 'ind_03',
        statusAnterior: 'Recebida',
        statusNovo: 'Qualificada',
        responsavelNome: 'Dra. Cristiane',
        observacao: 'Documentação validada com sucesso pela equipe jurídica.',
        criadoEm: '2026-07-28T14:10:00.000Z',
      },
    ],
  },
  {
    id: 'ind_04',
    clienteId: 'c_ana',
    clienteNome: 'Ana Paula Ferreira',
    clienteCpf: '456.789.012-33',
    nomeIndicado: 'Roberto Alves',
    cpfIndicado: '678.901.234-55',
    telefoneIndicado: '(31) 99876-5432',
    tipoAcaoId: '6',
    tipoAcaoNome: 'Empresarial',
    observacoes: 'Consultoria de reestruturação de contratos comerciais.',
    status: 'Recebida',
    criadoEm: '2026-07-28T14:30:00.000Z',
    atualizadoEm: '2026-07-28T14:30:00.000Z',
    historico: [
      {
        id: 'h4',
        indicacaoId: 'ind_04',
        statusAnterior: null,
        statusNovo: 'Recebida',
        responsavelNome: 'Ana Paula Ferreira',
        observacao: 'Indicação enviada pelo Acesso de Cliente.',
        criadoEm: '2026-07-28T14:30:00.000Z',
      },
    ],
  },
];

const defaultCupons: Cupom[] = [
  {
    id: 'cup_01',
    codigo: 'CUP-M78129',
    indicacaoId: 'ind_02',
    clienteId: 'c_maria',
    clienteNome: 'Maria Oliveira Costa',
    clienteCpf: '123.456.789-00',
    nomeIndicado: 'Patricia Souza',
    valor: 600,
    status: 'Disponivel',
    dataGeracao: '2026-07-28T15:20:00.000Z',
    responsavelValidacaoNome: 'Natan Campos',
  },
];

const defaultLogs: LogSistema[] = [
  {
    id: 'l_01',
    usuarioNome: 'Maria Oliveira Costa',
    acao: 'Acesso de Cliente',
    detalhes: 'Cliente Maria Oliveira Costa (CPF: 123.456.789-00) acessou a Área do Cliente.',
    criadoEm: '2026-07-28T10:15:00.000Z',
  },
  {
    id: 'l_02',
    usuarioNome: 'Maria Oliveira Costa',
    acao: 'Nova Indicação Cadastrada',
    detalhes: 'Indicação de Carlos Eduardo Silva para Previdenciário.',
    criadoEm: '2026-07-28T10:30:00.000Z',
  },
  {
    id: 'l_03',
    usuarioNome: 'Maria Oliveira Costa',
    acao: 'Nova Indicação Cadastrada',
    detalhes: 'Indicação de Patricia Souza para Trabalhista.',
    criadoEm: '2026-07-28T11:00:00.000Z',
  },
  {
    id: 'l_04',
    usuarioNome: 'Natan Campos',
    acao: 'Contrato Fechado & Geração de Cupom',
    detalhes: 'Contrato fechado para Patricia Souza. Cupom CUP-M78129 no valor de R$ 600.00 gerado para Maria Oliveira Costa.',
    criadoEm: '2026-07-28T15:20:00.000Z',
  },
];

const defaultConfig: ConfiguracaoSistema = {
  valorPadraoCupom: 500,
  nomeEscritorio: 'Bissoli & Bissoli Advogados',
  permitirAutoCadastroCliente: true,
};

// INITIALIZE LOCAL STORAGE WITH SEED & AUTO MERGE
export function initLocalStore() {
  const rawClientes = localStorage.getItem(STORAGE_KEYS.CLIENTES);
  if (!rawClientes || rawClientes === '[]') {
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(defaultClientes));
  } else {
    try {
      const clients: Cliente[] = JSON.parse(rawClientes);
      let changed = false;
      for (const def of defaultClientes) {
        if (!clients.some((c) => c.cpf.replace(/\D/g, '') === def.cpf.replace(/\D/g, ''))) {
          clients.push(def);
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clients));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(defaultClientes));
    }
  }

  const rawInds = localStorage.getItem(STORAGE_KEYS.INDICACOES);
  if (!rawInds || rawInds === '[]') {
    localStorage.setItem(STORAGE_KEYS.INDICACOES, JSON.stringify(defaultIndicacoes));
  } else {
    try {
      const inds: Indicacao[] = JSON.parse(rawInds);
      let changed = false;
      for (const def of defaultIndicacoes) {
        if (!inds.some((i) => i.id === def.id)) {
          inds.push(def);
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.INDICACOES, JSON.stringify(inds));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.INDICACOES, JSON.stringify(defaultIndicacoes));
    }
  }

  const rawCups = localStorage.getItem(STORAGE_KEYS.CUPONS);
  if (!rawCups || rawCups === '[]') {
    localStorage.setItem(STORAGE_KEYS.CUPONS, JSON.stringify(defaultCupons));
  } else {
    try {
      const cups: Cupom[] = JSON.parse(rawCups);
      let changed = false;
      for (const def of defaultCupons) {
        if (!cups.some((c) => c.id === def.id)) {
          cups.push(def);
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.CUPONS, JSON.stringify(cups));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.CUPONS, JSON.stringify(defaultCupons));
    }
  }

  const rawLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
  if (!rawLogs || rawLogs === '[]') {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(defaultLogs));
  } else {
    try {
      const logs: LogSistema[] = JSON.parse(rawLogs);
      let changed = false;
      for (const def of defaultLogs) {
        if (!logs.some((l) => l.id === def.id)) {
          logs.push(def);
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(defaultLogs));
    }
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

// BROADCAST CHANNEL FOR CROSS-TAB / MULTI-WINDOW REAL-TIME SYNC
const bc = typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('indica_channel') : null;

if (bc) {
  bc.onmessage = (event) => {
    if (event.data && event.data.type === 'indica_data_updated') {
      window.dispatchEvent(new CustomEvent('indica_data_updated', { detail: event.data }));
    }
  };
}

// STORAGE READ/WRITE HELPERS
export function getStoreData<T>(key: string): T {
  initLocalStore();
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : ([] as unknown as T);
}

export function setStoreData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('indica_data_updated', { detail: { key } }));
    if (bc) {
      try {
        bc.postMessage({ type: 'indica_data_updated', key });
      } catch {}
    }
  }
}

// DATA MANAGEMENT API
export const apiStore = {
  getClientes: (): Cliente[] => {
    const clientes = getStoreData<Cliente[]>(STORAGE_KEYS.CLIENTES);
    const indicacoes = getStoreData<Indicacao[]>(STORAGE_KEYS.INDICACOES);
    const cupons = getStoreData<Cupom[]>(STORAGE_KEYS.CUPONS);
    let updated = false;

    const syncClient = (cpfRaw?: string, nomeRaw?: string, clienteId?: string, criadoEm?: string) => {
      if (!cpfRaw) return;
      const cleanCpf = cpfRaw.replace(/\D/g, '');
      if (!cleanCpf) return;

      const formattedCpf =
        cleanCpf.length === 11
          ? `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6, 9)}-${cleanCpf.slice(9)}`
          : cpfRaw;

      const idx = clientes.findIndex((c) => c.cpf.replace(/\D/g, '') === cleanCpf);
      if (idx === -1) {
        clientes.push({
          id: clienteId || 'c_' + Math.random().toString(36).substring(2, 9),
          nome: nomeRaw && nomeRaw.trim() ? nomeRaw.trim() : 'Cliente Não Identificado',
          cpf: formattedCpf,
          telefone: '(00) 00000-0000',
          email: `${cleanCpf}@cliente.adv.br`,
          criadoEm: criadoEm || new Date().toISOString(),
        });
        updated = true;
      } else {
        if (nomeRaw && nomeRaw.trim() && (clientes[idx].nome === 'Cliente Não Identificado' || !clientes[idx].nome)) {
          clientes[idx].nome = nomeRaw.trim();
          updated = true;
        }
      }
    };

    for (const ind of indicacoes) {
      syncClient(ind.clienteCpf, ind.clienteNome, ind.clienteId, ind.criadoEm);
    }
    for (const cup of cupons) {
      syncClient(cup.clienteCpf, cup.clienteNome, cup.clienteId, cup.dataGeracao);
    }

    if (updated) {
      setStoreData(STORAGE_KEYS.CLIENTES, clientes);
    }

    return clientes;
  },
  saveCliente: (cliente: Omit<Cliente, 'id' | 'criadoEm'>): Cliente => {
    const clientes = apiStore.getClientes();
    const cleanCpf = cliente.cpf.replace(/\D/g, '');
    const existing = clientes.find((c) => c.cpf.replace(/\D/g, '') === cleanCpf);
    if (existing) {
      let updated = false;
      if (cliente.telefone && cliente.telefone !== '(00) 00000-0000' && existing.telefone !== cliente.telefone) {
        existing.telefone = cliente.telefone;
        updated = true;
      }
      if (cliente.email && existing.email !== cliente.email) {
        existing.email = cliente.email;
        updated = true;
      }
      if (cliente.nome && cliente.nome !== 'Cliente Não Identificado' && existing.nome !== cliente.nome) {
        existing.nome = cliente.nome;
        updated = true;
      }
      // Always broadcast event so all components reload latest state
      setStoreData(STORAGE_KEYS.CLIENTES, clientes);
      if (updated) {
        apiStore.addLog(
          'Sistema',
          'Cliente Atualizado',
          `Dados do cliente ${existing.nome} (CPF: ${existing.cpf}) foram atualizados no sistema.`
        );
      } else {
        apiStore.addLog(
          'Sistema',
          'Acesso de Cliente',
          `Cliente ${existing.nome} (CPF: ${existing.cpf}) acessou a Área do Cliente.`
        );
      }
      return existing;
    }

    const newCliente: Cliente = {
      ...cliente,
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      criadoEm: new Date().toISOString(),
    };
    setStoreData(STORAGE_KEYS.CLIENTES, [newCliente, ...clientes]);

    apiStore.addLog(
      'Sistema',
      'Novo Cliente Cadastrado',
      `Cliente ${newCliente.nome} (CPF: ${newCliente.cpf}) foi registrado no sistema.`
    );

    return newCliente;
  },

  updateCliente: (
    clienteId: string,
    updatedData: { nome?: string; cpf?: string; telefone?: string; email?: string },
    usuarioResponsavel?: string
  ): Cliente => {
    const clientes = apiStore.getClientes();
    const index = clientes.findIndex((c) => c.id === clienteId);
    if (index === -1) throw new Error('Cliente não encontrado.');

    const oldCliente = clientes[index];
    const newCpf = updatedData.cpf ? updatedData.cpf.trim() : oldCliente.cpf;
    const oldCpfClean = oldCliente.cpf.replace(/\D/g, '');
    const newCpfClean = newCpf.replace(/\D/g, '');

    if (newCpfClean !== oldCpfClean) {
      const duplicate = clientes.find((c) => c.id !== clienteId && c.cpf.replace(/\D/g, '') === newCpfClean);
      if (duplicate) {
        throw new Error(`O CPF ${newCpf} já está cadastrado para outro cliente (${duplicate.nome}).`);
      }
    }

    const updatedCliente: Cliente = {
      ...oldCliente,
      nome: updatedData.nome !== undefined ? updatedData.nome.trim() : oldCliente.nome,
      cpf: newCpf,
      telefone: updatedData.telefone !== undefined ? updatedData.telefone.trim() : oldCliente.telefone,
      email: updatedData.email !== undefined ? updatedData.email.trim() : oldCliente.email,
    };

    clientes[index] = updatedCliente;
    setStoreData(STORAGE_KEYS.CLIENTES, clientes);

    // Synchronize indicacoes with new CPF or new Nome
    const indicacoes = apiStore.getIndicacoes();
    let indChanged = false;
    const updatedIndicacoes = indicacoes.map((ind) => {
      if (ind.clienteId === clienteId || ind.clienteCpf.replace(/\D/g, '') === oldCpfClean) {
        indChanged = true;
        return {
          ...ind,
          clienteId: clienteId,
          clienteCpf: updatedCliente.cpf,
          clienteNome: updatedCliente.nome,
        };
      }
      return ind;
    });

    if (indChanged) {
      setStoreData(STORAGE_KEYS.INDICACOES, updatedIndicacoes);
    }

    // Synchronize cupons
    const cupons = apiStore.getCupons();
    let cupChanged = false;
    const updatedCupons = cupons.map((cup) => {
      if (cup.clienteId === clienteId || cup.clienteCpf.replace(/\D/g, '') === oldCpfClean) {
        cupChanged = true;
        return {
          ...cup,
          clienteId: clienteId,
          clienteCpf: updatedCliente.cpf,
          clienteNome: updatedCliente.nome,
        };
      }
      return cup;
    });

    if (cupChanged) {
      setStoreData(STORAGE_KEYS.CUPONS, updatedCupons);
    }

    // If active client session matches this client, update local storage session
    const activeSaved = localStorage.getItem('indica_active_cliente');
    if (activeSaved) {
      try {
        const parsed = JSON.parse(activeSaved);
        if (parsed.id === clienteId || parsed.cpf.replace(/\D/g, '') === oldCpfClean) {
          localStorage.setItem('indica_active_cliente', JSON.stringify(updatedCliente));
        }
      } catch {}
    }

    apiStore.addLog(
      usuarioResponsavel || 'Sistema',
      'Cadastro de Cliente Editado',
      `Dados do cliente ${updatedCliente.nome} alterados. Novo CPF: ${updatedCliente.cpf}, Tel: ${updatedCliente.telefone}.`
    );

    return updatedCliente;
  },

  deleteCliente: (clienteId: string, usuarioResponsavel?: string): void => {
    const clientes = getStoreData<Cliente[]>(STORAGE_KEYS.CLIENTES);
    const target = clientes.find((c) => c.id === clienteId);
    if (!target) throw new Error('Cliente não encontrado.');

    const novosClientes = clientes.filter((c) => c.id !== clienteId);
    setStoreData(STORAGE_KEYS.CLIENTES, novosClientes);

    apiStore.addLog(
      usuarioResponsavel || 'Sistema',
      'Cliente Removido',
      `O cadastro do cliente ${target.nome} (CPF: ${target.cpf}) foi excluído do sistema.`
    );
  },

  getIndicacoes: (): Indicacao[] => getStoreData<Indicacao[]>(STORAGE_KEYS.INDICACOES),
  saveIndicacao: (indicacao: Omit<Indicacao, 'id' | 'criadoEm' | 'atualizadoEm' | 'status'>): Indicacao => {
    // Ensure client is present in CLIENTES store
    if (indicacao.clienteCpf && indicacao.clienteNome) {
      apiStore.saveCliente({
        nome: indicacao.clienteNome,
        cpf: indicacao.clienteCpf,
        telefone: '(00) 00000-0000',
      });
    }

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
        // Look up the specific TipoAcao reward value first
        const tiposAcao = apiStore.getTiposAcao();
        const tipoEncontrado = tiposAcao.find(
          (t) => t.id === target.tipoAcaoId || t.nome.toLowerCase() === (target.tipoAcaoNome || '').toLowerCase()
        );
        const valorRecompensa = (tipoEncontrado && typeof tipoEncontrado.valorRecompensa === 'number' && tipoEncontrado.valorRecompensa > 0)
          ? tipoEncontrado.valorRecompensa
          : config.valorPadraoCupom;

        const codAleatorio = Math.random().toString(36).substring(2, 8).toUpperCase();
        cupomGerado = {
          id: 'cup_' + Math.random().toString(36).substring(2, 9),
          codigo: `CUP-${codAleatorio}`,
          indicacaoId: target.id,
          clienteId: target.clienteId,
          clienteNome: target.clienteNome,
          clienteCpf: target.clienteCpf,
          nomeIndicado: target.nomeIndicado,
          valor: valorRecompensa,
          status: 'Disponivel',
          dataGeracao: new Date().toISOString(),
          responsavelValidacaoNome: responsavelNome,
        };

        setStoreData(STORAGE_KEYS.CUPONS, [cupomGerado, ...cupons]);

        apiStore.addLog(
          responsavelNome,
          'Contrato Fechado & Geração de Cupom',
          `Contrato validado para ${target.nomeIndicado}. Cupom ${cupomGerado.codigo} de R$ ${valorRecompensa.toFixed(2)} (${tipoEncontrado?.nome || 'Ação'}) disponibilizado para o cliente ${target.clienteNome}.`
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
  saveTipoAcao: (nome: string, valorRecompensa?: number): TipoAcao => {
    const tipos = apiStore.getTiposAcao();
    const config = apiStore.getConfig();
    const val = typeof valorRecompensa === 'number' && !isNaN(valorRecompensa) ? valorRecompensa : config.valorPadraoCupom;
    const newTipo: TipoAcao = {
      id: 'ta_' + Math.random().toString(36).substring(2, 9),
      nome,
      valorRecompensa: val,
      ativo: true,
      criadoEm: new Date().toISOString(),
    };
    setStoreData(STORAGE_KEYS.TIPOS_ACAO, [...tipos, newTipo]);
    apiStore.addLog('Super Admin', 'Criação de Tipo de Ação', `Nova ação '${nome}' cadastrada com valor de recompensa R$ ${val.toFixed(2)}.`);
    return newTipo;
  },
  updateTipoAcao: (id: string, updates: Partial<TipoAcao>): TipoAcao => {
    const tipos = apiStore.getTiposAcao();
    const idx = tipos.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Tipo de Ação não encontrado.');

    const target = { ...tipos[idx], ...updates };
    tipos[idx] = target;
    setStoreData(STORAGE_KEYS.TIPOS_ACAO, tipos);
    apiStore.addLog('Super Admin', 'Atualização de Tipo de Ação', `Tipo de ação '${target.nome}' atualizado com recompensa R$ ${(target.valorRecompensa || 0).toFixed(2)}.`);
    return target;
  },
  deleteTipoAcao: (id: string): void => {
    const tipos = apiStore.getTiposAcao();
    const target = tipos.find((t) => t.id === id);
    if (!target) throw new Error('Tipo de Ação não encontrado.');

    const filtered = tipos.filter((t) => t.id !== id);
    setStoreData(STORAGE_KEYS.TIPOS_ACAO, filtered);
    apiStore.addLog('Super Admin', 'Exclusão de Tipo de Ação', `Tipo de ação '${target.nome}' excluído.`);
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
