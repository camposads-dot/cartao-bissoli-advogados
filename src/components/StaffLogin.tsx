import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, Building2, MapPin, Phone, ArrowLeft, AlertCircle } from 'lucide-react';

export const StaffLogin: React.FC = () => {
  const auth = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailInput.trim()) {
      setErrorMessage('Por favor, informe seu e-mail corporativo.');
      return;
    }

    if (!senhaInput.trim()) {
      setErrorMessage('Por favor, informe sua senha de acesso.');
      return;
    }

    const result = auth.loginStaffWithCredentials(emailInput, senhaInput);
    if (!result.success) {
      setErrorMessage(result.message || 'Credenciais inválidas.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071325] via-[#0B192C] to-[#050C17] text-slate-100 flex flex-col justify-between p-3 sm:p-6 lg:p-8 xl:p-10 relative overflow-x-hidden w-full max-w-full font-sans">
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] max-w-full h-[350px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] max-w-full h-[300px] bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* TOP HEADER / BRANDING */}
      <div className="max-w-6xl xl:max-w-7xl mx-auto w-full pt-2 sm:pt-4 pb-2 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#0B192C]/90 rounded-xl border border-amber-400/40 shadow-lg shrink-0">
              <img
                src="https://i.ibb.co/hxkKFSXL/logo.png"
                alt="Bissoli & Bissoli"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.triedJpg) {
                    target.dataset.triedJpg = 'true';
                    target.src = 'https://i.ibb.co/hxkKFSXL/logo.jpg';
                  } else if (!target.dataset.triedWebp) {
                    target.dataset.triedWebp = 'true';
                    target.src = 'https://i.ibb.co/hxkKFSXL/logo.webp';
                  } else if (!target.dataset.triedImg) {
                    target.dataset.triedImg = 'true';
                    target.src = 'https://i.ibb.co/hxkKFSXL/image.png';
                  }
                }}
                className="h-10 sm:h-12 w-auto object-contain rounded"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                Bissoli & Bissoli Advogados
              </h1>
              <p className="text-[11px] sm:text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Área Restrita do Colaborador</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => auth.setPortalType('cliente')}
            className="px-3.5 py-1.5 rounded-xl font-semibold text-xs border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Voltar para Área do Cliente</span>
          </button>
        </div>
      </div>

      {/* CENTER DUAL-COLUMN GRID FOR DESKTOP */}
      <div className="max-w-5xl xl:max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center my-auto py-6 relative z-10">
        
        {/* LEFT COLUMN: BRAND PROPOSITION */}
        <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 uppercase">
            <Lock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            Acesso Autenticado da Equipe
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Gestão Interna de Indicações, Clientes & CRM
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Acesse seu painel corporativo conforme seu setor de atuação (Comercial, Financeiro, Gestão ou Administração Master).
          </p>

          <div className="bg-[#0B192C]/80 p-4 rounded-2xl border border-amber-500/20 text-xs text-slate-300 space-y-2 hidden sm:block">
            <p className="font-bold text-amber-300 flex items-center gap-1.5 justify-center lg:justify-start">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Bissoli & Bissoli Advogados Associados</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Caso ainda não possua credenciais corporativas, solicite liberação junto à Gestão do Escritório.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-2xl shadow-blue-950/50 border border-amber-500/30 text-slate-900 w-full">
            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center justify-center lg:justify-start gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <span>Entrar no Painel Restrito</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Informe seu e-mail corporativo e sua senha de acesso.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-mail Corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="seu.email@escritorio.adv.br"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={senhaInput}
                    onChange={(e) => setSenhaInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-blue-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Acessar o Painel</span>
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => auth.setPortalType('cliente')}
                className="w-full py-2.5 px-3 rounded-xl hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Voltar para Área do Cliente</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER OFFICE CARD */}
      <div className="max-w-5xl mx-auto w-full pt-2 pb-2 relative z-10 text-center text-[11px] text-slate-400 border-t border-slate-800/80">
        <p>© {new Date().getFullYear()} Bissoli & Bissoli Advogados Associados. Sistema de Gestão Interna.</p>
      </div>
    </div>
  );
};
