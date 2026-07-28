import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiStore } from '../lib/supabase';
import {
  ShieldCheck,
  UserPlus,
  Settings,
  Layers,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  KeyRound,
  Trash2,
  Edit2,
  FileText,
  Database,
  Download,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  User,
  Crown,
} from 'lucide-react';
import { LogSistema, PerfilCodigo, TipoAcao, UsuarioInterno } from '../types';

export const AdminPanel: React.FC = () => {
  const auth = useAuth();

  const [activeTab, setActiveTab] = useState<'usuarios' | 'tipos_acao' | 'configuracoes' | 'logs' | 'backups'>('usuarios');

  // EDIT USER STATE
  const [editingUser, setEditingUser] = useState<UsuarioInterno | null>(null);
  const [resetPassUser, setResetPassUser] = useState<UsuarioInterno | null>(null);
  const [novaSenha, setNovaSenha] = useState('');

  // NEW USER FORM STATE
  const [nomeUser, setNomeUser] = useState('');
  const [emailUser, setEmailUser] = useState('');
  const [perfilUser, setPerfilUser] = useState<PerfilCodigo>('comercial');
  const [senhaUser, setSenhaUser] = useState('');
  const [userMsg, setUserMsg] = useState('');
  const [userErrorMsg, setUserErrorMsg] = useState('');

  // NEW TIPO ACAO STATE
  const [nomeTipoAcao, setNomeTipoAcao] = useState('');
  const [tipoMsg, setTipoMsg] = useState('');

  // CONFIG STATE
  const currentConfig = apiStore.getConfig();
  const [valorCupomInput, setValorCupomInput] = useState<number>(currentConfig.valorPadraoCupom);
  const [nomeEscritorioInput, setNomeEscritorioInput] = useState<string>(currentConfig.nomeEscritorio);
  const [configMsg, setConfigMsg] = useState('');

  // LOGS FILTER
  const [logSearch, setLogSearch] = useState('');

  // BACKUP STATE
  const [backupMsg, setBackupMsg] = useState('');

  // DATA
  const usuarios = apiStore.getUsuarios();
  const tiposAcao = apiStore.getTiposAcao();
  const logs = apiStore.getLogs();

  const activeSuperAdmin = auth.staffActive?.perfil === 'super_admin' || auth.staffActive?.perfil === 'SUPER_ADMIN';

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserErrorMsg('');
    setUserMsg('');

    if (!nomeUser.trim() || !emailUser.trim()) return;

    // Check email uniqueness
    const existing = usuarios.find((u) => u.email.toLowerCase() === emailUser.trim().toLowerCase());
    if (existing) {
      setUserErrorMsg(`Já existe um usuário com o e-mail ${emailUser.trim()}!`);
      return;
    }

    apiStore.saveUsuario({
      nome: nomeUser.trim(),
      email: emailUser.trim(),
      perfil: perfilUser,
      ativo: true,
      senha: senhaUser.trim() || '123456',
    });

    setUserMsg(`Usuário ${nomeUser} criado com sucesso!`);
    setNomeUser('');
    setEmailUser('');
    setSenhaUser('');
    setTimeout(() => setUserMsg(''), 3000);
    auth.refreshData();
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      apiStore.updateUsuario(editingUser.id, {
        nome: editingUser.nome,
        email: editingUser.email,
        perfil: editingUser.perfil,
        ativo: editingUser.ativo,
      }, auth.staffActive?.nome || 'Super Admin');

      setUserMsg(`Usuário ${editingUser.nome} atualizado com sucesso!`);
      setEditingUser(null);
      setTimeout(() => setUserMsg(''), 3000);
      auth.refreshData();
    } catch (err: any) {
      setUserErrorMsg(err.message || 'Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = (user: UsuarioInterno) => {
    if (user.email.toLowerCase() === 'elnatacampos@outlook.com' || user.perfil === 'super_admin' || user.perfil === 'SUPER_ADMIN') {
      alert('O usuário Super Administrador (elnatacampos@outlook.com) não pode ser excluído por nenhum usuário do sistema!');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.nome} (${user.email})?`)) {
      try {
        apiStore.deleteUsuario(user.id, auth.staffActive?.nome || 'Super Admin');
        setUserMsg(`Usuário ${user.nome} excluído com sucesso!`);
        setTimeout(() => setUserMsg(''), 3000);
        auth.refreshData();
      } catch (err: any) {
        setUserErrorMsg(err.message || 'Erro ao excluir usuário');
      }
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassUser || !novaSenha.trim()) return;

    try {
      apiStore.resetSenhaUsuario(resetPassUser.id, novaSenha.trim(), auth.staffActive?.nome || 'Super Admin');
      setUserMsg(`Senha do usuário ${resetPassUser.nome} redefinida com sucesso!`);
      setResetPassUser(null);
      setNovaSenha('');
      setTimeout(() => setUserMsg(''), 3000);
      auth.refreshData();
    } catch (err: any) {
      setUserErrorMsg(err.message || 'Erro ao redefinir senha');
    }
  };

  const handleCreateTipoAcao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeTipoAcao.trim()) return;

    apiStore.saveTipoAcao(nomeTipoAcao.trim());
    setTipoMsg(`Tipo de Ação '${nomeTipoAcao}' criado com sucesso!`);
    setNomeTipoAcao('');
    setTimeout(() => setTipoMsg(''), 3000);
    auth.refreshData();
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    apiStore.updateConfig({
      valorPadraoCupom: valorCupomInput,
      nomeEscritorio: nomeEscritorioInput,
    });
    setConfigMsg('Configurações e valores de cupons atualizados com sucesso!');
    setTimeout(() => setConfigMsg(''), 3000);
    auth.refreshData();
  };

  const handleExportBackup = () => {
    const backupData = apiStore.gerarBackup();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_indica_adv_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setBackupMsg('Backup exportado com sucesso!');
    setTimeout(() => setBackupMsg(''), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          if (event.target?.result) {
            apiStore.restaurarBackup(event.target.result as string);
            setBackupMsg('Banco de dados restaurado com sucesso a partir do arquivo de backup!');
            setTimeout(() => setBackupMsg(''), 3000);
            auth.refreshData();
          }
        } catch (err: any) {
          alert('Erro ao restaurar arquivo de backup. Formato inválido.');
        }
      };
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.usuarioNome.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.acao.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.detalhes.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-1 border border-indigo-200 dark:border-indigo-800">
            <Crown className="w-3 h-3 text-amber-500" />
            <span>Painel Super Administrador</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Gestão do Sistema & Controle Geral
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Acesso irrestrito: Gerencie usuários, permissões, cupons, catálogo de ações, auditoria de logs e backups.
          </p>
        </div>

        {/* SUB TABS */}
        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'usuarios'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Usuários</span>
          </button>

          <button
            onClick={() => setActiveTab('tipos_acao')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'tipos_acao'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tipos de Ação</span>
          </button>

          <button
            onClick={() => setActiveTab('configuracoes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'configuracoes'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Parâmetros</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'logs'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('backups')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'backups'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backups</span>
          </button>
        </div>
      </div>

      {userMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{userMsg}</span>
        </div>
      )}

      {userErrorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs rounded-2xl font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{userErrorMsg}</span>
        </div>
      )}

      {/* TAB 1: USUÁRIOS INTERNOS */}
      {activeTab === 'usuarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CREATE USER FORM */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              Cadastrar Novo Usuário
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={nomeUser}
                    onChange={(e) => setNomeUser(e.target.value)}
                    placeholder="Ex: Dra. Mariana Costa"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail do Usuário *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={emailUser}
                    onChange={(e) => setEmailUser(e.target.value)}
                    placeholder="mariana@escritorio.adv.br"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Senha Inicial
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={senhaUser}
                    onChange={(e) => setSenhaUser(e.target.value)}
                    placeholder="Padrao: 123456"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Perfil de Acesso *
                </label>
                <select
                  value={perfilUser}
                  onChange={(e) => setPerfilUser(e.target.value as PerfilCodigo)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="super_admin">SUPER_ADMIN (Acesso Total)</option>
                  <option value="admin_master">Administrador Master</option>
                  <option value="comercial">Comercial (Atendimento & Fechamento)</option>
                  <option value="financeiro">Financeiro (Gestão de Cupons)</option>
                  <option value="gestao">Gestão Executiva (BI & Métricas)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Cadastrar Usuário
              </button>
            </form>
          </div>

          {/* USERS LIST */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Usuários do Sistema ({usuarios.length})
              </h3>
            </div>

            <div className="space-y-3">
              {usuarios.map((u) => {
                const isSuperAdminUser =
                  u.email.toLowerCase() === 'elnatacampos@outlook.com' ||
                  u.perfil === 'super_admin' ||
                  u.perfil === 'SUPER_ADMIN';

                return (
                  <div
                    key={u.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {u.nome}
                        </h4>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isSuperAdminUser
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200'
                              : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {isSuperAdminUser ? 'SUPER_ADMIN' : u.perfil}
                        </span>
                        {isSuperAdminUser && (
                          <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                            <Crown className="w-3 h-3" /> Protegido
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{u.email}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setResetPassUser(u)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Redefinir Senha"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setEditingUser(u)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition-colors"
                        title="Editar Dados"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          apiStore.toggleUsuarioAtivo(u.id);
                          auth.refreshData();
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        title="Alternar Status Ativo/Inativo"
                      >
                        {u.ativo ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <ToggleRight className="w-4 h-4" /> Ativo
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1">
                            <ToggleLeft className="w-4 h-4" /> Inativo
                          </span>
                        )}
                      </button>

                      {!isSuperAdminUser ? (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition-colors"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="p-1.5 text-slate-300 dark:text-slate-700 cursor-not-allowed" title="SUPER_ADMIN não pode ser excluído">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-indigo-600" />
              Editar Usuário: {editingUser.nome}
            </h3>

            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={editingUser.nome}
                  onChange={(e) => setEditingUser({ ...editingUser, nome: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Perfil</label>
                <select
                  value={editingUser.perfil}
                  onChange={(e) => setEditingUser({ ...editingUser, perfil: e.target.value as PerfilCodigo })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="super_admin">SUPER_ADMIN</option>
                  <option value="admin_master">Administrador Master</option>
                  <option value="comercial">Comercial</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="gestao">Gestão</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetPassUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              Redefinir Senha: {resetPassUser.nome}
            </h3>

            <p className="text-xs text-slate-500">
              Digite a nova senha para o e-mail <span className="font-mono text-slate-800 dark:text-slate-200">{resetPassUser.email}</span>:
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nova Senha *</label>
                <input
                  type="text"
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Informe a nova senha"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPassUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Confirmar Nova Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: TIPOS DE AÇÃO */}
      {activeTab === 'tipos_acao' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              Novo Tipo de Ação Jurídica
            </h3>

            {tipoMsg && (
              <div className="p-3 bg-emerald-100 text-emerald-800 text-xs rounded-xl font-medium">
                {tipoMsg}
              </div>
            )}

            <form onSubmit={handleCreateTipoAcao} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Ação / Ramo Jurídico *
                </label>
                <input
                  type="text"
                  required
                  value={nomeTipoAcao}
                  onChange={(e) => setNomeTipoAcao(e.target.value)}
                  placeholder="Ex: Tributário, Imobiliário..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Cadastrar Tipo de Ação
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Catálogo de Tipos de Ação Cadastrados ({tiposAcao.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tiposAcao.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{t.nome}</span>
                  <button
                    onClick={() => {
                      apiStore.toggleTipoAcaoAtivo(t.id);
                      auth.refreshData();
                    }}
                    className="text-xs"
                  >
                    {t.ativo ? (
                      <span className="text-emerald-600 font-semibold">Ativo</span>
                    ) : (
                      <span className="text-slate-400">Inativo</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURAÇÕES E PARÂMETROS */}
      {activeTab === 'configuracoes' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs max-w-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Parâmetros de Recompensa e Identidade
          </h3>

          {configMsg && (
            <div className="p-3 bg-emerald-100 text-emerald-800 text-xs rounded-xl font-medium">
              {configMsg}
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Oficial do Escritório *
              </label>
              <input
                type="text"
                required
                value={nomeEscritorioInput}
                onChange={(e) => setNomeEscritorioInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Valor Padrão do Cupom de Recompensa (R$) *
              </label>
              <input
                type="number"
                step="50"
                required
                value={valorCupomInput}
                onChange={(e) => setValorCupomInput(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Sempre que o Comercial marcar uma indicação como Contrato Fechado, o sistema gerará automaticamente um cupom com este valor.
              </p>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs text-xs"
            >
              Salvar Alterações de Parâmetros
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: AUDITORIA DE LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Registros e Auditoria de Logs do Sistema
              </h3>
              <p className="text-xs text-slate-500">
                Histórico completo de ações executadas pelos usuários e pelo SUPER_ADMIN.
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Filtrar por ação ou usuário..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* DESKTOP LOGS TABLE */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Data/Hora</th>
                  <th className="p-3">Usuário</th>
                  <th className="p-3">Ação</th>
                  <th className="p-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 whitespace-nowrap text-slate-400 font-mono text-[10px]">
                      {new Date(log.criadoEm).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {log.usuarioNome}
                    </td>
                    <td className="p-3 font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {log.acao}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {log.detalhes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE LOGS CARDS */}
          <div className="block sm:hidden space-y-2.5">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.acao}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date(log.criadoEm).toLocaleTimeString('pt-BR')}</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300">{log.detalhes}</div>
                <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span>Por: <strong>{log.usuarioNome}</strong></span>
                  <span>{new Date(log.criadoEm).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BACKUPS & DADOS */}
      {activeTab === 'backups' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Gestão de Backups e Dados do Sistema
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Gere backups em tempo real em formato JSON e restaure dados do sistema com permissão de SUPER_ADMIN.
            </p>
          </div>

          {backupMsg && (
            <div className="p-3 bg-emerald-100 text-emerald-800 text-xs rounded-xl font-medium">
              {backupMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
                <Download className="w-5 h-5 text-indigo-600" />
                <span>Exportar Backup Completo</span>
              </div>
              <p className="text-xs text-slate-500">
                Baixe um arquivo JSON contendo todas as indicações, clientes, cupons, usuários, configurações e logs.
              </p>
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Gerar e Baixar Backup</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Restaurar de Arquivo JSON</span>
              </div>
              <p className="text-xs text-slate-500">
                Selecione um arquivo de backup previamente exportado para restaurar o estado do banco.
              </p>
              <label className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs flex items-center justify-center space-x-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Selecionar Arquivo JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
