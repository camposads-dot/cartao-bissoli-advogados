import React, { useState, useEffect } from 'react';
import { apiStore } from '../lib/supabase';
import {
  Users,
  Search,
  X,
  Phone,
  Mail,
  Calendar,
  FileText,
  UserPlus,
  ArrowUpRight,
  MessageSquare,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Cliente } from '../types';

interface ClientContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient?: (cliente: Cliente) => void;
}

export const ClientContactsModal: React.FC<ClientContactsModalProps> = ({
  isOpen,
  onClose,
  onSelectClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [, setRefreshTick] = useState(0);

  // New Client Form
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Edit Client Form
  const [editNome, setEditNome] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Delete Client State
  const [deletingClient, setDeletingClient] = useState<Cliente | null>(null);

  const confirmDeleteClient = () => {
    if (!deletingClient) return;
    try {
      apiStore.deleteCliente(deletingClient.id, 'Equipe / Colaborador');
      setDeletingClient(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir cadastro do cliente.');
    }
  };

  // Live updates
  useEffect(() => {
    const trigger = () => setRefreshTick((prev) => prev + 1);
    window.addEventListener('indica_data_updated', trigger);
    window.addEventListener('storage', trigger);
    const timer = setInterval(trigger, 2000);
    return () => {
      window.removeEventListener('indica_data_updated', trigger);
      window.removeEventListener('storage', trigger);
      clearInterval(timer);
    };
  }, []);

  if (!isOpen) return null;

  const clientes = apiStore.getClientes();
  const indicacoes = apiStore.getIndicacoes();
  const cupons = apiStore.getCupons();

  const filteredClientes = clientes.filter((c) => {
    const cleanSearch = searchTerm.toLowerCase();
    const cleanCpf = c.cpf.replace(/\D/g, '');
    const cleanPhone = c.telefone.replace(/\D/g, '');
    const cEmail = c.email || '';
    return (
      c.nome.toLowerCase().includes(cleanSearch) ||
      cleanCpf.includes(cleanSearch.replace(/\D/g, '')) ||
      c.cpf.includes(searchTerm) ||
      cEmail.toLowerCase().includes(cleanSearch) ||
      cleanPhone.includes(cleanSearch.replace(/\D/g, ''))
    );
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!nome.trim() || !cpf.trim() || !telefone.trim()) {
      setFormError('Por favor, preencha Nome, CPF e Telefone.');
      return;
    }

    try {
      const created = apiStore.saveCliente({
        nome: nome.trim(),
        cpf: cpf.trim(),
        email: email.trim() || `${cpf.replace(/\D/g, '')}@cliente.adv.br`,
        telefone: telefone.trim(),
      });

      setFormSuccess(`Cliente ${created.nome} cadastrado com sucesso!`);
      setNome('');
      setCpf('');
      setEmail('');
      setTelefone('');
      setTimeout(() => {
        setFormSuccess('');
        setNewClientOpen(false);
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao cadastrar cliente.');
    }
  };

  const startEditClient = (c: Cliente) => {
    setEditingClient(c);
    setEditNome(c.nome);
    setEditCpf(c.cpf);
    setEditTelefone(c.telefone);
    setEditEmail(c.email || '');
    setEditError('');
    setEditSuccess('');
  };

  const handleUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setEditError('');
    setEditSuccess('');

    if (!editNome.trim() || !editCpf.trim() || !editTelefone.trim()) {
      setEditError('Nome, CPF e Telefone são campos obrigatórios.');
      return;
    }

    try {
      const updated = apiStore.updateCliente(editingClient.id, {
        nome: editNome.trim(),
        cpf: editCpf.trim(),
        telefone: editTelefone.trim(),
        email: editEmail.trim(),
      });

      setEditSuccess(`Cadastro de ${updated.nome} atualizado com sucesso! Novo CPF já liberado para acesso.`);
      setTimeout(() => {
        setEditingClient(null);
        setEditSuccess('');
      }, 1800);
    } catch (err: any) {
      setEditError(err.message || 'Erro ao atualizar dados do cliente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white my-auto">
        
        {/* HEADER */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#071325] via-[#0B192C] to-[#071325] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 sm:p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-xl font-bold text-white leading-tight">
                  Lista de Clientes
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {clientes.length} Cadastrados
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 hidden sm:block">
                Gerencie todos os clientes, edite CPFs/telefones e consulte históricos de indicação
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setEditingClient(null);
                setNewClientOpen(!newClientOpen);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all cursor-pointer shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Cliente</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NEW CLIENT FORM COLLAPSIBLE */}
        {newClientOpen && (
          <div className="p-4 sm:p-5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700">
            <form onSubmit={handleAddClient} className="space-y-3 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-500" />
                  Cadastrar Novo Cliente
                </h3>
                <button
                  type="button"
                  onClick={() => setNewClientOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Cancelar
                </button>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
                  {formSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    E-mail (Opcional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@email.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        )}

        {/* EDIT CLIENT FORM MODAL COLLAPSIBLE */}
        {editingClient && (
          <div className="p-4 sm:p-5 bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/30">
            <form onSubmit={handleUpdateClient} className="space-y-3 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Editar Dados do Cliente #{editingClient.id}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Cancelar Edição
                </button>
              </div>

              {editError && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}
              {editSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    CPF (Altera Acesso no Site) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCpf}
                    onChange={(e) => setEditCpf(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTelefone}
                    onChange={(e) => setEditTelefone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        )}

        {/* BODY */}
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Nome, CPF, Telefone ou E-mail..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* CONTACTS LIST */}
          {filteredClientes.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Users className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
              <p className="text-sm font-semibold">Nenhum cliente encontrado.</p>
              <p className="text-xs text-slate-500">
                Tente buscar com outro termo ou clique em "Novo Cliente" para adicionar um contato.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredClientes.map((c) => {
                const userInds = indicacoes.filter(
                  (i) => i.clienteId === c.id || i.clienteCpf.replace(/\D/g, '') === c.cpf.replace(/\D/g, '')
                );
                const userContratos = userInds.filter(
                  (i) => i.status === 'Contrato Fechado' || i.status === 'Cupom Gerado' || i.status === 'Cupom Utilizado'
                );
                const userCupons = cupons.filter(
                  (cup) => cup.clienteId === c.id || cup.clienteCpf.replace(/\D/g, '') === c.cpf.replace(/\D/g, '')
                );
                const totalRecompensas = userCupons.reduce((sum, cup) => sum + cup.valor, 0);

                const cleanPhone = c.telefone.replace(/\D/g, '');
                const whatsappUrl = cleanPhone
                  ? `https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(c.nome)}%2C%20tudo%20bem%3F%20Falo%20do%20escrit%C3%B3rio%20Bissoli%20%26%20Bissoli%20Advogados.`
                  : '#';

                return (
                  <div
                    key={c.id}
                    className="p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:border-amber-400/60 hover:bg-white dark:hover:bg-slate-800 transition-all flex flex-col justify-between space-y-3.5 shadow-xs group min-w-0"
                  >
                    <div>
                      {/* TOP ROW: NAME & STATUS & EDIT BUTTON */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">
                            {c.nome}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            CPF: {c.cpf}
                          </p>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => startEditClient(c)}
                            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-bold border border-amber-500/30 transition-all cursor-pointer"
                            title="Editar dados do cliente (CPF, Telefone, Nome)"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => setDeletingClient(c)}
                            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold border border-rose-500/30 transition-all cursor-pointer"
                            title="Excluir cadastro do cliente"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>

                      {/* CONTACT INFOS */}
                      <div className="mt-2.5 space-y-1 text-xs text-slate-600 dark:text-slate-300 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium truncate">{c.telefone}</span>
                        </div>
                        {c.email && (
                          <div className="flex items-center space-x-2 min-w-0">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a
                              href={`mailto:${c.email}`}
                              className="hover:underline text-indigo-600 dark:text-indigo-400 truncate text-[11px] sm:text-xs"
                            >
                              {c.email}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            Cadastrado em:{' '}
                            {c.criadoEm ? new Date(c.criadoEm).toLocaleDateString('pt-BR') : 'Recentemente'}
                          </span>
                        </div>
                      </div>

                      {/* SUMMARY BADGES */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 grid grid-cols-3 gap-1.5 text-center">
                        <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60">
                          <span className="block text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold">Indicações</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {userInds.length}
                          </span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-emerald-500/10">
                          <span className="block text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold">
                            Contratos
                          </span>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            {userContratos.length}
                          </span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-amber-500/10">
                          <span className="block text-[9px] sm:text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold">
                            Cupons R$
                          </span>
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                            R$ {totalRecompensas.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200/80 dark:border-slate-700/80 flex-wrap">
                      {cleanPhone ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400">Sem whats</span>
                      )}

                      <button
                        onClick={() => {
                          if (onSelectClient) {
                            onSelectClient(c);
                          }
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                      >
                        <span>Ficha & Indicações</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs text-slate-500 flex justify-between items-center shrink-0">
          <span>{filteredClientes.length} de {clientes.length} clientes</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* DELETE CONFIRMATION OVERLAY */}
      {deletingClient && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-500/40 space-y-4 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-500">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirmar Exclusão de Cadastro</h3>
                <p className="text-xs text-rose-500 font-medium">Ação irreversível no sistema</p>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-100 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
              Tem certeza que deseja apagar permanentemente o cadastro do cliente <strong className="text-slate-900 dark:text-white font-bold">{deletingClient.nome}</strong> (CPF: <span className="font-mono text-amber-500 font-semibold">{deletingClient.cpf}</span>)?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDeletingClient(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteClient}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Cadastro</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
