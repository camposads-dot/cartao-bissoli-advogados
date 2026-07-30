-- ==============================================================================
-- SISTEMA DE GERENCIAMENTO DE INDICAÇÕES PARA ESCRITÓRIO DE ADVOCACIA
-- SCRIPT SQL COMPLETO PARA O SUPABASE (POSTGRESQL + RLS + TRIGGERS)
-- ==============================================================================

-- 1. HABILITAR EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS DE STATUS
DO $$ BEGIN
    CREATE TYPE status_indicacao_enum AS ENUM (
        'Recebida',
        'Em Atendimento',
        'Qualificada',
        'Desqualificada',
        'Contrato Fechado',
        'Cupom Gerado',
        'Cupom Utilizado'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE status_cupom_enum AS ENUM ('Disponivel', 'Utilizado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE perfil_codigo_enum AS ENUM ('admin_master', 'comercial', 'financeiro', 'gestao');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABELA DE PERFIS DE ACESSO INTERNO
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo perfil_codigo_enum UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE USUÁRIOS INTERNOS
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE, -- ID vinculado ao Supabase Auth
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    perfil perfil_codigo_enum NOT NULL DEFAULT 'comercial',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE CLIENTES (INDICADORES) - ACESSO VIA CPF (SEM SENHA)
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL, -- Formatado: 000.000.000-00 ou numérico
    telefone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE TIPOS DE AÇÃO
CREATE TABLE IF NOT EXISTS public.tipos_acao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE INDICAÇÕES
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

-- 8. TABELA DE CUPONS DE RECOMPENSA
CREATE TABLE IF NOT EXISTS public.cupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    indicacao_id UUID UNIQUE NOT NULL REFERENCES public.indicacoes(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    valor NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    status status_cupom_enum NOT NULL DEFAULT 'Disponivel',
    data_geracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responsavel_validacao_id UUID REFERENCES public.usuarios(id),
    responsavel_validacao_nome VARCHAR(150),
    data_uso TIMESTAMP WITH TIME ZONE,
    responsavel_abate_id UUID REFERENCES public.usuarios(id),
    responsavel_abate_nome VARCHAR(150),
    valor_abatido NUMERIC(10, 2),
    observacao_abate TEXT
);

-- 9. TABELA DE HISTÓRICO DE STATUS
CREATE TABLE IF NOT EXISTS public.historico_indicacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    indicacao_id UUID NOT NULL REFERENCES public.indicacoes(id) ON DELETE CASCADE,
    status_anterior status_indicacao_enum,
    status_novo status_indicacao_enum NOT NULL,
    responsavel_nome VARCHAR(150) NOT NULL,
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABELA DE LOGS DO SISTEMA
CREATE TABLE IF NOT EXISTS public.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_nome VARCHAR(150) NOT NULL,
    acao VARCHAR(100) NOT NULL,
    detalhes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. TABELA DE CONFIGURAÇÕES GERAIS
CREATE TABLE IF NOT EXISTS public.configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TABELA DE SINCRONIZAÇÃO EM NUVEM (STORE SYNC)
CREATE TABLE IF NOT EXISTS public.app_store_sync (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES PARA ALTA PERFORMANCE DE CONSULTA
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON public.clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_indicacoes_cliente_id ON public.indicacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_indicacoes_status ON public.indicacoes(status);
CREATE INDEX IF NOT EXISTS idx_indicacoes_tipo_acao ON public.indicacoes(tipo_acao_id);
CREATE INDEX IF NOT EXISTS idx_cupons_cliente_id ON public.cupons(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cupons_status ON public.cupons(status);
CREATE INDEX IF NOT EXISTS idx_historico_indicacao_id ON public.historico_indicacao(indicacao_id);

-- ==============================================================================
-- POPULAR DADOS INICIAIS (SEED)
-- ==============================================================================

-- Tipos de Ação Padrão
INSERT INTO public.tipos_acao (nome) VALUES
    ('Previdenciário'),
    ('Trabalhista'),
    ('Consumidor'),
    ('Família'),
    ('Inventário'),
    ('Empresarial'),
    ('Outro')
ON CONFLICT (nome) DO NOTHING;

-- Perfis de Usuário
INSERT INTO public.perfis (codigo, nome, descricao) VALUES
    ('admin_master', 'Administrador Master', 'Acesso irrestrito a todas as configurações, usuários e dados'),
    ('comercial', 'Comercial', 'Gestão de indicações e validação de contratos'),
    ('financeiro', 'Financeiro', 'Gestão de cupons, saldo acumulado e abate financeiro'),
    ('gestao', 'Gestão', 'Acesso aos dashboards executivos, relatórios e métricas gerais')
ON CONFLICT (codigo) DO NOTHING;

-- Usuários Internos dos Gestores Solicitados
INSERT INTO public.usuarios (nome, email, perfil, ativo) VALUES
    ('Administrador Master', 'admin@escritorio.adv.br', 'admin_master', true),
    ('Natan Campos', 'natan.campos@escritorio.adv.br', 'comercial', true),
    ('Letícia', 'leticia.financeiro@escritorio.adv.br', 'financeiro', true),
    ('Dra. Cristiane', 'dra.cristiane@escritorio.adv.br', 'gestao', true)
ON CONFLICT (email) DO NOTHING;

-- Configuração inicial do valor do cupom (R$ 500,00)
INSERT INTO public.configuracoes (chave, valor) VALUES
    ('VALOR_PADRAO_CUPOM', '500.00'::jsonb),
    ('NOME_ESCRITORIO', '"Advocacia Cristiane & Associados"'::jsonb)
ON CONFLICT (chave) DO NOTHING;

-- ==============================================================================
-- VIEW ANALÍTICA DE RESUMO DE CLIENTES E CUPONS
-- ==============================================================================
CREATE OR REPLACE VIEW public.v_resumo_clientes AS
SELECT 
    c.id AS cliente_id,
    c.nome AS cliente_nome,
    c.cpf AS cliente_cpf,
    c.telefone AS cliente_telefone,
    COUNT(i.id) AS total_indicacoes,
    COUNT(CASE WHEN i.status = 'Contrato Fechado' OR i.status = 'Cupom Gerado' OR i.status = 'Cupom Utilizado' THEN 1 END) AS total_contratos,
    COUNT(cp.id) AS total_cupons,
    COALESCE(SUM(cp.valor), 0) AS valor_total_cupons,
    COALESCE(SUM(CASE WHEN cp.status = 'Utilizado' THEN cp.valor_abatido ELSE 0 END), 0) AS valor_utilizado,
    COALESCE(SUM(CASE WHEN cp.status = 'Disponivel' THEN cp.valor ELSE 0 END), 0) AS saldo_disponivel
FROM public.clientes c
LEFT JOIN public.indicacoes i ON i.cliente_id = c.id
LEFT JOIN public.cupons cp ON cp.cliente_id = c.id
GROUP BY c.id, c.nome, c.cpf, c.telefone;

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_indicacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_acao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_store_sync ENABLE ROW LEVEL SECURITY;

-- Permissões públicas/anon para permitir acesso do Cliente por CPF
DROP POLICY IF EXISTS "Permitir leitura/cadastro publico de clientes por CPF" ON public.clientes;
CREATE POLICY "Permitir leitura/cadastro publico de clientes por CPF" 
    ON public.clientes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso público de indicações associadas" ON public.indicacoes;
CREATE POLICY "Permitir acesso público de indicações associadas" 
    ON public.indicacoes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso público de cupons do cliente" ON public.cupons;
CREATE POLICY "Permitir acesso público de cupons do cliente" 
    ON public.cupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso público aos tipos de acao" ON public.tipos_acao;
CREATE POLICY "Permitir acesso público aos tipos de acao" 
    ON public.tipos_acao FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir acesso público ao histórico de indicacao" ON public.historico_indicacao;
CREATE POLICY "Permitir acesso público ao histórico de indicacao" 
    ON public.historico_indicacao FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso a usuarios e configuracoes" ON public.usuarios;
CREATE POLICY "Permitir acesso a usuarios e configuracoes" 
    ON public.usuarios FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir acesso as configuracoes" ON public.configuracoes;
CREATE POLICY "Permitir acesso as configuracoes" 
    ON public.configuracoes FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir acesso app store sync" ON public.app_store_sync;
CREATE POLICY "Permitir acesso app store sync" 
    ON public.app_store_sync FOR ALL USING (true);
