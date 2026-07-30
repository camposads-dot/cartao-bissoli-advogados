import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Cliente,
  Cupom,
  Indicacao,
  LogSistema,
  TipoAcao,
  UsuarioInterno,
  ConfiguracaoSistema,
} from '../types';

// Supabase Credentials from prompt or environment, with localStorage overrides
const DEFAULT_SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://smprrzcgxnyvmcbaaxmv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_V_E083P72EW3Cg8-GkWYBw_DbC5_N3U';

export function getSupabaseConfig(): { url: string; key: string } {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('indica_custom_supabase_url');
    const customKey = localStorage.getItem('indica_custom_supabase_key');
    if (customUrl && customKey) {
      return { url: customUrl.trim(), key: customKey.trim() };
    }
  }
  return { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_ANON_KEY };
}

let currentSupabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!currentSupabaseClient) {
    const config = getSupabaseConfig();
    currentSupabaseClient = createClient(config.url, config.key);
  }
  return currentSupabaseClient;
}

export const supabase = getSupabaseClient();

export function saveSupabaseConfig(url: string, key: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('indica_custom_supabase_url', url.trim());
  localStorage.setItem('indica_custom_supabase_key', key.trim());
  const newConfig = getSupabaseConfig();
  currentSupabaseClient = createClient(newConfig.url, newConfig.key);
  pullFromSupabase();
}

// SUPABASE CONNECTION STATUS STATE
export interface SupabaseStatusState {
  connected: boolean;
  lastCheck: string | null;
  error: string | null;
  url: string;
}

let supabaseStatusState: SupabaseStatusState = {
  connected: false,
  lastCheck: null,
  error: null,
  url: DEFAULT_SUPABASE_URL,
};

export function getSupabaseStatus(): SupabaseStatusState {
  return { ...supabaseStatusState, url: getSupabaseConfig().url };
}

function updateSupabaseStatus(connected: boolean, errorMsg: string | null) {
  supabaseStatusState = {
    connected,
    lastCheck: new Date().toLocaleTimeString(),
    error: errorMsg,
    url: getSupabaseConfig().url,
  };
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('supabase_status_changed', { detail: supabaseStatusState }));
  }
}

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

const defaultClientes: Cliente[] = [];
const defaultIndicacoes: Indicacao[] = [];
const defaultCupons: Cupom[] = [];
const defaultLogs: LogSistema[] = [];

const defaultConfig: ConfiguracaoSistema = {
  valorPadraoCupom: 500,
  nomeEscritorio: 'Bissoli & Bissoli Advogados',
  permitirAutoCadastroCliente: true,
};

// INITIALIZE LOCAL STORAGE AND AUTO-START SUPABASE CLOUD SYNC
export function initLocalStore() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.CLIENTES)) {
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INDICACOES)) {
    localStorage.setItem(STORAGE_KEYS.INDICACOES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUPONS)) {
    localStorage.setItem(STORAGE_KEYS.CUPONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USUARIOS)) {
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(defaultUsuarios));
  } else {
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

// CENTRAL EXPRESS SERVER SYNC ENGINE (Synchronizes Mobile and Desktop in Real-Time instantly)
let isSyncingFromServer = false;

// SMART UNION MERGE FOR LOCAL & REMOTE DATA
export function mergeStoreItems(
  key: string,
  localRaw: any,
  remoteRaw: any
): { merged: any; changed: boolean; needsPushBack: boolean } {
  if (remoteRaw === undefined || remoteRaw === null) {
    return { merged: localRaw, changed: false, needsPushBack: false };
  }

  let local = localRaw;
  if (typeof local === 'string') {
    try {
      local = JSON.parse(local);
    } catch {
      local = [];
    }
  }
  if (!local) local = [];

  let remote = remoteRaw;
  if (typeof remote === 'string') {
    try {
      remote = JSON.parse(remote);
    } catch {
      remote = [];
    }
  }

  // ARRAY MERGE STRATEGY
  if (Array.isArray(local) && Array.isArray(remote)) {
    let changed = false;
    let needsPushBack = false;

    if (key === STORAGE_KEYS.CLIENTES) {
      const mergedList = [...local];
      for (const rItem of remote) {
        if (!rItem || !rItem.cpf) continue;
        const cleanR = rItem.cpf.replace(/\D/g, '');
        if (!cleanR) continue;

        const idx = mergedList.findIndex((l) => l.cpf && l.cpf.replace(/\D/g, '') === cleanR);
        if (idx === -1) {
          mergedList.push(rItem);
          changed = true;
        } else {
          const lItem = mergedList[idx];
          if (rItem.nome && rItem.nome !== 'Cliente Não Identificado' && lItem.nome !== rItem.nome) {
            lItem.nome = rItem.nome;
            changed = true;
          }
          if (rItem.telefone && rItem.telefone !== '(00) 00000-0000' && lItem.telefone !== rItem.telefone) {
            lItem.telefone = rItem.telefone;
            changed = true;
          }
          if (rItem.email && lItem.email !== rItem.email) {
            lItem.email = rItem.email;
            changed = true;
          }
        }
      }
      for (const lItem of local) {
        if (!lItem || !lItem.cpf) continue;
        const cleanL = lItem.cpf.replace(/\D/g, '');
        const inRemote = remote.some((r) => r && r.cpf && r.cpf.replace(/\D/g, '') === cleanL);
        if (!inRemote) {
          needsPushBack = true;
        }
      }
      return { merged: mergedList, changed, needsPushBack };
    }

    if (key === STORAGE_KEYS.INDICACOES) {
      const mergedList = [...local];
      for (const rItem of remote) {
        if (!rItem || !rItem.id) continue;
        const idx = mergedList.findIndex((l) => l.id === rItem.id);
        if (idx === -1) {
          mergedList.push(rItem);
          changed = true;
        } else {
          const lItem = mergedList[idx];
          if (lItem.status !== rItem.status) {
            lItem.status = rItem.status;
            changed = true;
          }
          if (rItem.historicoStatus && rItem.historicoStatus.length > (lItem.historicoStatus?.length || 0)) {
            lItem.historicoStatus = rItem.historicoStatus;
            changed = true;
          }
        }
      }
      for (const lItem of local) {
        if (!lItem || !lItem.id) continue;
        if (!remote.some((r) => r && r.id === lItem.id)) {
          needsPushBack = true;
        }
      }
      return { merged: mergedList, changed, needsPushBack };
    }

    if (key === STORAGE_KEYS.CUPONS) {
      const mergedList = [...local];
      for (const rItem of remote) {
        if (!rItem || (!rItem.id && !rItem.codigo)) continue;
        const idx = mergedList.findIndex((l) => l.id === rItem.id || l.codigo === rItem.codigo);
        if (idx === -1) {
          mergedList.push(rItem);
          changed = true;
        } else {
          const lItem = mergedList[idx];
          if (lItem.status !== rItem.status) {
            lItem.status = rItem.status;
            changed = true;
          }
        }
      }
      for (const lItem of local) {
        if (!lItem || (!lItem.id && !lItem.codigo)) continue;
        if (!remote.some((r) => r && (r.id === lItem.id || r.codigo === lItem.codigo))) {
          needsPushBack = true;
        }
      }
      return { merged: mergedList, changed, needsPushBack };
    }

    if (key === STORAGE_KEYS.LOGS) {
      const mergedList = [...local];
      for (const rItem of remote) {
        if (!rItem || !rItem.id) continue;
        if (!mergedList.some((l) => l.id === rItem.id)) {
          mergedList.push(rItem);
          changed = true;
        }
      }
      mergedList.sort((a, b) => new Date(b.dataHora || 0).getTime() - new Date(a.dataHora || 0).getTime());
      return { merged: mergedList, changed, needsPushBack: false };
    }

    if (key === STORAGE_KEYS.USUARIOS) {
      const mergedList = [...local];
      for (const rItem of remote) {
        if (!rItem || (!rItem.id && !rItem.email)) continue;
        const idx = mergedList.findIndex((l) => l.id === rItem.id || l.email?.toLowerCase() === rItem.email?.toLowerCase());
        if (idx === -1) {
          mergedList.push(rItem);
          changed = true;
        } else {
          if (rItem.senha && mergedList[idx].senha !== rItem.senha) {
            mergedList[idx].senha = rItem.senha;
            changed = true;
          }
        }
      }
      return { merged: mergedList, changed, needsPushBack: false };
    }

    // Generic array merge
    const mergedList = [...local];
    for (const rItem of remote) {
      const rStr = JSON.stringify(rItem);
      if (!mergedList.some((l) => JSON.stringify(l) === rStr)) {
        mergedList.push(rItem);
        changed = true;
      }
    }
    return { merged: mergedList, changed, needsPushBack: false };
  }

  // Object or Primitive compare
  const localStr = JSON.stringify(local);
  const remoteStr = JSON.stringify(remote);
  if (localStr !== remoteStr) {
    return { merged: remote, changed: true, needsPushBack: false };
  }
  return { merged: local, changed: false, needsPushBack: false };
}

export async function pushToServer(key: string, data: any): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/sync/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: data, updatedAt: Date.now() }),
    });
  } catch (err) {
    // Offline / silent fallback
  }
}

export async function pullFromServer(): Promise<void> {
  if (typeof window === 'undefined' || isSyncingFromServer) return;
  isSyncingFromServer = true;
  try {
    const res = await fetch('/api/sync/pull');
    if (res.ok) {
      const { store } = await res.json();
      if (store) {
        let updatedAny = false;
        for (const [key, item] of Object.entries<any>(store)) {
          if (item && item.value !== undefined) {
            const localRaw = localStorage.getItem(key);
            const remoteStr = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
            if (localRaw !== remoteStr) {
              localStorage.setItem(key, remoteStr);
              updatedAny = true;
            }
          }
        }
        if (updatedAny) {
          window.dispatchEvent(new CustomEvent('indica_data_updated'));
        }
      }
    }
  } catch (err) {
    // Offline / silent fallback
  } finally {
    isSyncingFromServer = false;
  }
}

// SUPABASE CLOUD SYNC ENGINE (Synchronizes Mobile and Desktop in Real-Time)
let isSyncingFromSupabase = false;

export async function pushToSupabase(key: string, data: any): Promise<void> {
  if (typeof window === 'undefined') return;
  const client = getSupabaseClient();
  try {
    // 1. Unified Key-Value Store Sync (Primary Source of Truth)
    const { error: syncError } = await client.from('app_store_sync').upsert(
      {
        key,
        value: data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (syncError) {
      let friendlyErr = syncError.message;
      if (syncError.message.includes('app_store_sync') || syncError.message.includes('schema cache') || syncError.message.includes('relation')) {
        friendlyErr = "Tabelas do Supabase não encontradas no seu projeto. Por favor, cole o Script SQL no 'SQL Editor' do Supabase e clique em 'Run'.";
      }
      updateSupabaseStatus(false, friendlyErr);
    } else {
      updateSupabaseStatus(true, null);
    }

    // 2. Relational Table Sync (Mirror for SQL queries)
    if (key === STORAGE_KEYS.CLIENTES && Array.isArray(data)) {
      const activeCpfs = data.map((c: any) => c && c.cpf ? c.cpf.replace(/\D/g, '') : '').filter(Boolean);
      for (const c of data) {
        if (c && c.cpf) {
          try {
            await client.from('clientes').upsert(
              {
                nome: c.nome,
                cpf: c.cpf,
                telefone: c.telefone || '(00) 00000-0000',
                email: c.email || '',
              },
              { onConflict: 'cpf' }
            );
          } catch {}
        }
      }
      // Delete any rows in relational table `clientes` that are no longer active
      try {
        const { data: dbRows } = await client.from('clientes').select('cpf');
        if (dbRows && dbRows.length > 0) {
          for (const row of dbRows) {
            if (row.cpf) {
              const clean = row.cpf.replace(/\D/g, '');
              if (!activeCpfs.includes(clean)) {
                await client.from('clientes').delete().eq('cpf', row.cpf);
              }
            }
          }
        }
      } catch {}
    }
  } catch (err: any) {
    updateSupabaseStatus(false, err?.message || 'Falha ao salvar no Supabase');
  }
}

export async function pullFromSupabase(): Promise<void> {
  if (typeof window === 'undefined' || isSyncingFromSupabase) return;
  isSyncingFromSupabase = true;
  const client = getSupabaseClient();
  try {
    let updatedAny = false;
    let hasStoreSync = false;

    // 1. Pull from app_store_sync table (Master Store)
    const { data: syncRows, error: syncErr } = await client
      .from('app_store_sync')
      .select('*');

    if (syncErr) {
      let friendlyErr = syncErr.message;
      if (syncErr.message.includes('app_store_sync') || syncErr.message.includes('schema cache') || syncErr.message.includes('relation')) {
        friendlyErr = "Tabelas do Supabase não encontradas no seu projeto. Por favor, cole o Script SQL no 'SQL Editor' do Supabase e clique em 'Run'.";
      }
      updateSupabaseStatus(false, friendlyErr);
    } else {
      updateSupabaseStatus(true, null);
      if (syncRows && syncRows.length > 0) {
        for (const row of syncRows) {
          if (row.key && row.value !== undefined) {
            hasStoreSync = true;
            const currentLocal = localStorage.getItem(row.key);
            const remoteStr = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
            if (currentLocal !== remoteStr) {
              localStorage.setItem(row.key, remoteStr);
              updatedAny = true;
            }
          }
        }
      }
    }

    // 2. Pull from relational public.clientes table (Only if app_store_sync was empty or missing)
    if (!hasStoreSync) {
      const { data: dbClientes, error: cliErr } = await client
        .from('clientes')
        .select('*');

      if (!cliErr && dbClientes && dbClientes.length > 0) {
        const localRaw = localStorage.getItem(STORAGE_KEYS.CLIENTES);
        const remoteMapped = dbClientes.map((r) => ({
          id: r.id || 'c_' + Math.random().toString(36).substring(2, 9),
          nome: r.nome || 'Cliente',
          cpf: r.cpf,
          telefone: r.telefone || '(00) 00000-0000',
          email: r.email || '',
          criadoEm: r.created_at || new Date().toISOString(),
        }));

        const { merged, changed } = mergeStoreItems(STORAGE_KEYS.CLIENTES, localRaw, remoteMapped);

        if (changed) {
          localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(merged));
          updatedAny = true;
          pushToSupabase(STORAGE_KEYS.CLIENTES, merged);
        }
      }
    }

    if (updatedAny) {
      window.dispatchEvent(new CustomEvent('indica_data_updated'));
    }
  } catch (err: any) {
    updateSupabaseStatus(false, err?.message || 'Erro de conexão com Supabase');
  } finally {
    isSyncingFromSupabase = false;
  }
}

// Start real-time background cloud & server sync
if (typeof window !== 'undefined') {
  initLocalStore();
  pullFromServer();
  pullFromSupabase();

  // Background polling intervals (runs every 1.5s)
  setInterval(() => {
    pullFromServer();
    pullFromSupabase();
  }, 1500);

  // SSE Stream listener for instant server pushes (<1 second real-time updates)
  try {
    const sse = new EventSource('/api/sync/stream');
    sse.onmessage = (e) => {
      if (e.data) {
        try {
          const { key, value } = JSON.parse(e.data);
          if (key && value !== undefined) {
            const localRaw = localStorage.getItem(key);
            const { merged, changed } = mergeStoreItems(key, localRaw, value);
            if (changed) {
              localStorage.setItem(key, JSON.stringify(merged));
              window.dispatchEvent(new CustomEvent('indica_data_updated', { detail: { key } }));
            }
          }
        } catch {}
      }
    };
  } catch {}

  // Realtime Supabase channel listener
  try {
    getSupabaseClient()
      .channel('public:db-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        pullFromSupabase();
      })
      .subscribe();
  } catch {}
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
  // Dual Push: Push to central server API + Push to Supabase Cloud
  pushToServer(key, data);
  pushToSupabase(key, data);
}

// DATA MANAGEMENT API
export const apiStore = {
  getClientes: (): Cliente[] => {
    return getStoreData<Cliente[]>(STORAGE_KEYS.CLIENTES);
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

    const cleanCpf = target.cpf.replace(/\D/g, '');

    // 1. Remove client from CLIENTES
    const novosClientes = clientes.filter(
      (c) => c.id !== clienteId && c.cpf.replace(/\D/g, '') !== cleanCpf
    );
    setStoreData(STORAGE_KEYS.CLIENTES, novosClientes);

    // 2. Cascade delete ALL indications for this client
    const indicacoes = getStoreData<Indicacao[]>(STORAGE_KEYS.INDICACOES);
    const novasIndicacoes = indicacoes.filter(
      (ind) => ind.clienteId !== clienteId && ind.clienteCpf.replace(/\D/g, '') !== cleanCpf
    );
    setStoreData(STORAGE_KEYS.INDICACOES, novasIndicacoes);

    // 3. Cascade delete ALL coupons for this client
    const cupons = getStoreData<Cupom[]>(STORAGE_KEYS.CUPONS);
    const novosCupons = cupons.filter(
      (cup) => cup.clienteId !== clienteId && cup.clienteCpf.replace(/\D/g, '') !== cleanCpf
    );
    setStoreData(STORAGE_KEYS.CUPONS, novosCupons);

    // 4. Logout active client session if matched
    if (typeof localStorage !== 'undefined') {
      const activeSaved = localStorage.getItem('indica_active_cliente');
      if (activeSaved) {
        try {
          const parsed = JSON.parse(activeSaved);
          if (parsed.id === clienteId || parsed.cpf.replace(/\D/g, '') === cleanCpf) {
            localStorage.removeItem('indica_active_cliente');
          }
        } catch {}
      }
    }

    apiStore.addLog(
      usuarioResponsavel || 'Sistema',
      'Cliente e Indicações Removidos',
      `O cadastro do cliente ${target.nome} (CPF: ${target.cpf}) e todas as suas indicações/cupons foram permanentemente excluídos do sistema.`
    );

    // 5. Delete explicitly from Supabase relational tables
    const client = getSupabaseClient();
    if (client) {
      if (cleanCpf) {
        client.from('clientes').delete().eq('cpf', target.cpf).then(() => {}, () => {});
        client.from('indicacoes').delete().eq('cliente_cpf', target.cpf).then(() => {}, () => {});
        client.from('cupons').delete().eq('cliente_cpf', target.cpf).then(() => {}, () => {});
      }
      client.from('clientes').delete().eq('id', clienteId).then(() => {}, () => {});
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('indica_data_updated'));
    }
  },

  deleteIndicacao: (indicacaoId: string, usuarioResponsavel?: string): void => {
    const indicacoes = getStoreData<Indicacao[]>(STORAGE_KEYS.INDICACOES);
    const target = indicacoes.find((i) => i.id === indicacaoId);
    if (!target) return;

    const novasIndicacoes = indicacoes.filter((i) => i.id !== indicacaoId);
    setStoreData(STORAGE_KEYS.INDICACOES, novasIndicacoes);

    // Cascade delete associated coupon
    const cupons = getStoreData<Cupom[]>(STORAGE_KEYS.CUPONS);
    const novosCupons = cupons.filter((c) => c.indicacaoId !== indicacaoId);
    setStoreData(STORAGE_KEYS.CUPONS, novosCupons);

    apiStore.addLog(
      usuarioResponsavel || 'Sistema',
      'Indicação Excluída',
      `A indicação de ${target.nomeIndicado} (Cliente: ${target.clienteNome || 'N/I'}) foi excluída do sistema.`
    );

    // Delete explicitly from Supabase relational tables
    const client = getSupabaseClient();
    if (client) {
      client.from('indicacoes').delete().eq('id', indicacaoId).then(() => {}, () => {});
      client.from('cupons').delete().eq('indicacao_id', indicacaoId).then(() => {}, () => {});
    }
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
    const cleanCpfIndicado = (indicacao.cpfIndicado && indicacao.cpfIndicado.trim()) ? indicacao.cpfIndicado.trim() : 'Não Informado';
    const newIndicacao: Indicacao = {
      ...indicacao,
      cpfIndicado: cleanCpfIndicado,
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

    const client = getSupabaseClient();
    if (client) {
      client.from('usuarios').delete().eq('id', id).then(() => {}, () => {});
    }
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

  limparRegistrosClientesEIndicacoes: (usuarioResponsavel = 'Administrador') => {
    setStoreData(STORAGE_KEYS.CLIENTES, []);
    setStoreData(STORAGE_KEYS.INDICACOES, []);
    setStoreData(STORAGE_KEYS.CUPONS, []);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('indica_active_cliente');
    }
    const logInicial: LogSistema = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      usuarioNome: usuarioResponsavel,
      acao: 'Limpeza do Banco de Dados',
      detalhes: 'Todos os cadastros de clientes, indicações e cupons foram limpos para novos testes.',
      criadoEm: new Date().toISOString(),
    };
    setStoreData(STORAGE_KEYS.LOGS, [logInicial]);

    const client = getSupabaseClient();
    if (client) {
      client.from('clientes').delete().neq('id', '___none___').then(() => {}, () => {});
      client.from('indicacoes').delete().neq('id', '___none___').then(() => {}, () => {});
      client.from('cupons').delete().neq('id', '___none___').then(() => {}, () => {});
    }
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

    const client = getSupabaseClient();
    if (client) {
      client.from('tipos_acao').delete().eq('id', id).then(() => {}, () => {});
    }
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
