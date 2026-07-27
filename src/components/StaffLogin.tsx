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
    <div className="min-h-screen bg-gradient-to-b from-[#071325] via-[#0B192C] to-[#050C17] text-slate-100 flex flex-col justify-between p-3 sm:p-8 relative overflow-hidden w-full max-w-full font-sans">
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* TOP HEADER / BRANDING */}
      <div className="max-w-md mx-auto w-full pt-4 sm:pt-6 relative z-10 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-[#0B192C]/80 rounded-2xl border border-amber-400/40 shadow-2xl shadow-amber-500/10 backdrop-blur-md inline-block">
            <img
              src="https://i.ibb.co/hxkKFSXL/logo.png"
              alt="Bissoli & Bissoli Advogados Associados"
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
              className="h-16 sm:h-20 w-auto object-contain mx-auto rounded-lg max-w-[280px]"
            />
          </div>
        </div>

        <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
          Bissoli & Bissoli Advogados
        </h1>
        <p className="text-xs sm:text-sm font-bold text-amber-400 tracking-wide uppercase flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Área Restrita do Colaborador</span>
        </p>
        <p className="text-xs text-slate-400 max-w-lg mx-auto mt-2 px-2">
          Painel interno de gestão de indicações, acompanhamento de contratos e controle comercial.
        </p>
      </div>

      {/* CENTER LOGIN CARD */}
      <div className="max-w-md mx-auto w-full my-6 relative z-10">
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-2xl shadow-blue-950/50 border border-amber-500/30 text-slate-900">
          <div className="mb-6 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              <span>Acesso da Equipe</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Informe seu e-mail e senha cadastrados para acessar o painel.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2 animate-shake">
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
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="seu.email@escritorio.adv.br"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={senhaInput}
                  onChange={(e) => setSenhaInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-blue-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Entrar no Painel</span>
            </button>
          </form>

          {/* BACK TO CLIENT PORTAL BUTTON */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                auth.setPortalType('cliente');
              }}
              className="w-full py-2 px-3 rounded-xl hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Voltar para Área do Cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER OFFICE CARD */}
      <div className="max-w-2xl mx-auto w-full pt-2 pb-2 relative z-10">
        <div className="bg-[#0B192C]/90 backdrop-blur-md rounded-2xl border border-amber-500/30 p-4 shadow-2xl text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold text-white">Bissoli & Bissoli Advogados</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-amber-400 shrink-0" />
              (69) 99944-6100
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              Ariquemes - RO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
