# Sistema de Gerenciamento de Indicações - Escritório de Advocacia

Sistema web profissional e responsivo para gestão completa de indicações de clientes, cupons de recompensa, fluxo comercial e painéis analíticos e financeiros para escritórios de advocacia.

---

## 🚀 Principais Funcionalidades

### 👥 1. Portal do Cliente (Acesso Simplificado via CPF)
* **Sem Senha**: Acesso direto informando apenas **Nome** e **CPF** (formato único e padronizado).
* **Auto-Cadastro**: Se o CPF não for encontrado, cria a conta instantaneamente.
* **Métricas do Cliente**:
  * Total de indicações cadastradas.
  * Status em tempo real (*Recebida*, *Em Atendimento*, *Qualificada*, *Desqualificada*, *Contrato Fechado*, *Cupom Gerado*, *Cupom Utilizado*).
  * Cupons disponíveis e valor acumulado em R$.
* **Cadastro de Indicação**: Formulário simples com validação do indicado (Nome, CPF, Telefone, Tipo de Ação, Observações).

### 👔 2. Painel Comercial (Gestor: Natan Campos)
* Visualização completa de todas as indicações do escritório.
* Pesquisa avançada por CPF, Nome e Telefone.
* Filtros dinâmicos por **Data**, **Status** e **Tipo de Ação**.
* Alteração de status com histórico de auditoria:
  * `Recebida` ➔ `Em Atendimento` ➔ `Qualificada` / `Desqualificada` ➔ `Contrato Fechado`.
* **Geração Automática de Cupom**: Ao marcar a indicação como *Contrato Fechado*, o sistema gera automaticamente o cupom de recompensa e registra o responsável (Natan Campos), data e hora.

### 💰 3. Painel Financeiro (Gestora: Letícia)
* Pesquisa do cliente por CPF.
* Métricas do cliente: Total de contratos, valor gerado, valor utilizado e saldo disponível.
* Listagem detalhada de todos os cupons (*Disponível* / *Utilizado*).
* **Mecanismo de Abate de Cupom**:
  * Botão **Abater Cupom**.
  * Registro de data, hora, usuário (Letícia), valor abatido e observação.
  * **Trava de Segurança**: Nunca permite reutilização de um mesmo cupom.

### 📊 4. Painel de Gestão (Gestora: Dra. Cristiane)
* Dashboard executivo completo inspirado no HubSpot, ClickUp, Asana e Notion.
* KPIs: Total de clientes, total de indicações, total de contratos, taxa de conversão %, valor em cupons e saldo disponível.
* Ranking dos melhores clientes indicadores e ranking por tipo de ação.
* Gráficos interativos por período (**Semanal**, **Mensal**, **Anual**).

### ⚙️ 5. Administrador Master
* Gerenciamento de Usuários Internos (Criar, Editar, Desativar).
* Configuração dos Tipos de Ação (*Previdenciário, Trabalhista, Consumidor, Família, Inventário, Empresarial, etc.*).
* Definição do valor padrão do cupom de recompensa (ex: R$ 500,00).

### 📄 6. Relatórios & Exportação
* Filtros por Período, Tipo de Ação, Status e Usuário.
* Exportação profissional em **PDF**, **Excel (.xlsx)** e **CSV**.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion (Framer Motion)
* **Gráficos**: Recharts
* **Exportação**: jsPDF, XLSX
* **Banco de Dados & Autenticação**: Supabase (PostgreSQL, Row Level Security, Triggers e Views)

---

## ⚡ Configuração do Supabase e Variáveis de Ambiente

### 1. Arquivo `.env`
No diretório raiz da aplicação, crie ou altere o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://smprrzcgxnyvmcbaaxmv.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_V_E083P72EW3Cg8-GkWYBw_DbC5_N3U
SUPABASE_SERVICE_ROLE_KEY=Sua_Chave_Service_Role_Opcional
```

### 2. Executar o Script SQL no Supabase
1. Acesse o dashboard do seu projeto no Supabase (`https://app.supabase.com`).
2. Abra o **SQL Editor**.
3. Copie o conteúdo do arquivo `supabase_schema.sql` deste repositório e clique em **Run**.
4. O script criará as tabelas (`clientes`, `usuarios`, `indicacoes`, `cupons`, `tipos_acao`, etc.), enums, índices, views analíticas e regras de segurança (RLS).

---

## 💻 Como Rodar o Projeto Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Acesse a aplicação no navegador
http://localhost:3000
```

---

## 📂 Estrutura do Projeto

```
├── README.md
├── supabase_schema.sql          # Script SQL completo do Supabase
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx        # Painel do Admin Master
│   │   ├── ClientPortal.tsx      # Portal do Cliente (sem senha)
│   │   ├── ComercialPanel.tsx    # Painel do Comercial (Natan Campos)
│   │   ├── FinanceiroPanel.tsx   # Painel Financeiro (Letícia)
│   │   ├── GestaoPanel.tsx       # Dashboard Executivo (Dra. Cristiane)
│   │   ├── Navbar.tsx            # Barra de Navegação e Alternador de Perfis
│   │   ├── ReportsModal.tsx      # Módulo de Exportação PDF/Excel/CSV
│   │   └── SqlSchemaViewer.tsx   # Visualizador do Script SQL do Supabase
│   ├── context/
│   │   ├── AuthContext.tsx       # Contexto de Autenticação Cliente & Staff
│   │   └── ThemeContext.tsx      # Alternador de Tema Claro / Escuro
│   ├── lib/
│   │   ├── exportUtils.ts        # Gerador de relatórios PDF, XLSX, CSV
│   │   └── supabase.ts           # Cliente Supabase & Engine Híbrido de Fallback
│   ├── types/
│   │   └── index.ts              # Tipagens TypeScript completas
│   ├── App.tsx                   # Componente Principal
│   └── main.tsx                  # Ponto de Entrada
```
