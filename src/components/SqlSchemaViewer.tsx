import React, { useState, useEffect } from 'react';
import { Database, Copy, Check, X, RefreshCw, AlertTriangle, CheckCircle2, Key, Link2, ExternalLink } from 'lucide-react';
import {
  getSupabaseConfig,
  getSupabaseStatus,
  saveSupabaseConfig,
  pullFromSupabase,
  SupabaseStatusState,
} from '../lib/supabase';

interface SqlSchemaViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSchemaViewer: React.FC<SqlSchemaViewerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<SupabaseStatusState>(getSupabaseStatus());
  const [config, setConfig] = useState(getSupabaseConfig());
  const [showConfigEdit, setShowConfigEdit] = useState(false);
  const [customUrl, setCustomUrl] = useState(config.url);
  const [customKey, setCustomKey] = useState(config.key);
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleStatusChange = () => {
      setStatus(getSupabaseStatus());
    };
    window.addEventListener('supabase_status_changed', handleStatusChange);
    // Initial check
    pullFromSupabase();
    return () => {
      window.removeEventListener('supabase_status_changed', handleStatusChange);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await pullFromSupabase();
    setTimeout(() => {
      setIsSyncing(false);
      setStatus(getSupabaseStatus());
    }, 600);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(customUrl, customKey);
    setConfig(getSupabaseConfig());
    setSaveMessage('Configurações salvas e conexão reiniciada!');
    setTimeout(() => setSaveMessage(null), 3000);
    handleManualSync();
  };

  const sqlCode = `-- ==============================================================================
-- SISTEMA DE GERENCIAMENTO DE INDICAÇÕES PARA ESCRITÓRIO DE ADVOCACIA
-- SCRIPT SQL COMPLETO PARA O SUPABASE (POSTGRESQL + RLS + TRIGGERS)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS (CRIAR APENAS SE NÃO EXISTIREM)
DO $$ BEGIN
    CREATE TYPE status_indicacao_enum AS ENUM (
        'Recebida', 'Em Atendimento', 'Qualificada', 'Desqualificada', 'Contrato Fechado', 'Cupom Gerado', 'Cupom Utilizado'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE status_cupom_enum AS ENUM ('Disponivel', 'Utilizado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE perfil_codigo_enum AS ENUM ('super_admin', 'admin_master', 'comercial', 'financeiro', 'gestao');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- TABELA CLIENTES (ACESSO POR CPF SEM SENHA)
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA USUARIOS INTERNOS
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    perfil perfil_codigo_enum NOT NULL DEFAULT 'comercial',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INSERIR SUPER ADMINISTRADOR PADRÃO CASO NÃO EXISTA
INSERT INTO public.usuarios (nome, email, perfil, ativo)
VALUES ('Elnatan Campos', 'elnatacampos@outlook.com', 'super_admin', true)
ON CONFLICT (email) DO UPDATE SET perfil = 'super_admin';

-- TABELA TIPOS DE AÇÃO
CREATE TABLE IF NOT EXISTS public.tipos_acao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA INDICAÇÕES
CREATE TABLE IF NOT EXISTS public.indicacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    nome_indicado VARCHAR(150) NOT NULL,
    cpf_indicado VARCHAR(14) NOT NULL,
    telefone_indicado VARCHAR(20) NOT NULL,
    tipo_acao_id UUID NOT NULL REFERENCES public.tipos_acao(id),
    observacoes TEXT,
    status status_indicacao_enum NOT NULL DEFAULT 'Recebida',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA CUPONS
CREATE TABLE IF NOT EXISTS public.cupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    indicacao_id UUID UNIQUE NOT NULL REFERENCES public.indicacoes(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    valor NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    status status_cupom_enum NOT NULL DEFAULT 'Disponivel',
    data_geracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responsavel_validacao_nome VARCHAR(150),
    data_uso TIMESTAMP WITH TIME ZONE,
    responsavel_abate_nome VARCHAR(150),
    valor_abatido NUMERIC(10, 2),
    observacao_abate TEXT
);

-- TABELA DE SINCRONIZAÇÃO EM NUVEM (MOBILE + DESKTOP PAINEL)
CREATE TABLE IF NOT EXISTS public.app_store_sync (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY POLICIES
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_store_sync ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso Livre Clientes" ON public.clientes;
CREATE POLICY "Acesso Livre Clientes" ON public.clientes FOR ALL USING (true);

DROP POLICY IF EXISTS "Acesso Livre Indicacoes" ON public.indicacoes;
CREATE POLICY "Acesso Livre Indicacoes" ON public.indicacoes FOR ALL USING (true);

DROP POLICY IF EXISTS "Acesso Livre Cupons" ON public.cupons;
CREATE POLICY "Acesso Livre Cupons" ON public.cupons FOR ALL USING (true);

DROP POLICY IF EXISTS "Acesso Livre App Store Sync" ON public.app_store_sync;
CREATE POLICY "Acesso Livre App Store Sync" ON public.app_store_sync FOR ALL USING (true);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Vinculação e Sincronização Supabase Cloud
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Garante dados sincronizados em tempo real entre Mobile, Desktop e Colaboradores.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STATUS BANNER */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            status.connected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {status.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <div className="font-bold text-sm flex items-center gap-2">
                <span>
                  {status.connected
                    ? 'Conexão Supabase Ativa & Sincronizada'
                    : 'Atenção: Supabase Não Conectado ou Pendente'}
                </span>
              </div>
              <p className="text-xs opacity-90">
                {status.connected
                  ? 'Todos os cadastros e indicações feitos no Celular ou Computador estão salvos e sincronizados na nuvem em tempo real.'
                  : status.error
                  ? `Causa detectada: "${status.error}". Cole o script SQL abaixo no Supabase ou verifique suas credenciais.`
                  : 'Sincronização em segundo plano tentando conectar...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sincronizar Agora</span>
            </button>
            <button
              onClick={() => setShowConfigEdit(!showConfigEdit)}
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
            >
              {showConfigEdit ? 'Fechar Credenciais' : 'Editar Chaves'}
            </button>
          </div>
        </div>

        {/* CREDENTIALS FORM */}
        {showConfigEdit && (
          <form onSubmit={handleSaveConfig} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              Configurar Projeto Supabase Próprio (URL e Anon Key)
            </h4>
            {saveMessage && (
              <div className="p-2 rounded bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                {saveMessage}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  SUPABASE URL
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://xxx.supabase.co"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  SUPABASE ANON KEY (JWT)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="eyJhbGci..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-sm"
              >
                Salvar Credenciais e Conectar
              </button>
            </div>
          </form>
        )}

        {/* STEP-BY-STEP INSTRUCTIONS */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Passo a Passo para Ativar o Banco de Dados no Supabase (Gratuito e Perpétuo):
          </h4>
          <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-decimal list-inside bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
            <li>Acesse o seu painel do <strong>Supabase</strong> (https://supabase.com).</li>
            <li>Abra o seu projeto e clique na aba <strong>SQL Editor</strong> na barra lateral esquerda.</li>
            <li>Clique em <strong>"New query"</strong>, cole o código SQL abaixo e clique no botão verde <strong>"Run"</strong>.</li>
            <li>Pronto! Todas as tabelas, políticas RLS e permissões de sincronização serão criadas instantaneamente.</li>
          </ol>
        </div>

        {/* SQL CODE VIEWER */}
        <div className="relative bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs max-h-80 overflow-y-auto border border-slate-800 shadow-inner">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all z-10"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            <span>{copied ? 'Copiado para a Área de Transferência!' : 'Copiar Script SQL'}</span>
          </button>
          <pre className="text-[11px] leading-relaxed select-all">{sqlCode}</pre>
        </div>
      </div>
    </div>
  );
};

