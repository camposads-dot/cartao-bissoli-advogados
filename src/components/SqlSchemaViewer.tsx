import React, { useState } from 'react';
import { Database, Copy, Check, X, Code } from 'lucide-react';

interface SqlSchemaViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSchemaViewer: React.FC<SqlSchemaViewerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const sqlCode = `-- ==============================================================================
-- SISTEMA DE GERENCIAMENTO DE INDICAÇÕES PARA ESCRITÓRIO DE ADVOCACIA
-- SCRIPT SQL COMPLETO PARA O SUPABASE (POSTGRESQL + RLS + TRIGGERS)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE status_indicacao_enum AS ENUM (
    'Recebida', 'Em Atendimento', 'Qualificada', 'Desqualificada', 'Contrato Fechado', 'Cupom Gerado', 'Cupom Utilizado'
);
CREATE TYPE status_cupom_enum AS ENUM ('Disponivel', 'Utilizado');
CREATE TYPE perfil_codigo_enum AS ENUM ('super_admin', 'admin_master', 'comercial', 'financeiro', 'gestao');

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

-- ROW LEVEL SECURITY
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Livre Clientes" ON public.clientes FOR ALL USING (true);
CREATE POLICY "Acesso Livre Indicacoes" ON public.indicacoes FOR ALL USING (true);
CREATE POLICY "Acesso Livre Cupons" ON public.cupons FOR ALL USING (true);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            Script DDL de Estrutura do Supabase
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Copie este script SQL e cole diretamente no <strong>SQL Editor</strong> do seu projeto Supabase para criar todas as tabelas, chaves primárias, chaves estrangeiras e políticas RLS!
        </p>

        <div className="relative bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs max-h-96 overflow-y-auto">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar SQL'}</span>
          </button>
          <pre>{sqlCode}</pre>
        </div>
      </div>
    </div>
  );
};
