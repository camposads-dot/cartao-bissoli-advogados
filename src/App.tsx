import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ClientPortal } from './components/ClientPortal';
import { ComercialPanel } from './components/ComercialPanel';
import { FinanceiroPanel } from './components/FinanceiroPanel';
import { GestaoPanel } from './components/GestaoPanel';
import { AdminPanel } from './components/AdminPanel';
import { ReportsModal } from './components/ReportsModal';
import { SqlSchemaViewer } from './components/SqlSchemaViewer';
import { Building2, ShieldCheck, Heart } from 'lucide-react';

const MainContent: React.FC = () => {
  const auth = useAuth();
  const [reportsOpen, setReportsOpen] = useState(false);
  const [sqlViewerOpen, setSqlViewerOpen] = useState(false);

  const renderInternalPanel = () => {
    const perfil = auth.staffActive?.perfil || 'comercial';
    switch (perfil) {
      case 'comercial':
        return <ComercialPanel />;
      case 'financeiro':
        return <FinanceiroPanel />;
      case 'gestao':
        return <GestaoPanel />;
      case 'admin_master':
      case 'super_admin':
      case 'SUPER_ADMIN':
        return <AdminPanel />;
      default:
        return <ComercialPanel />;
    }
  };

  const isLandingScreen = auth.portalType === 'cliente' && !auth.clienteActive;

  if (isLandingScreen) {
    return (
      <div className="min-h-screen bg-[#071325] text-slate-100 flex flex-col font-sans">
        <main className="flex-1">
          <ClientPortal />
        </main>
        <ReportsModal isOpen={reportsOpen} onClose={() => setReportsOpen(false)} />
        <SqlSchemaViewer isOpen={sqlViewerOpen} onClose={() => setSqlViewerOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar
        onOpenReports={() => setReportsOpen(true)}
        onOpenSqlViewer={() => setSqlViewerOpen(true)}
      />

      <main className="flex-1">
        {auth.portalType === 'cliente' ? <ClientPortal /> : renderInternalPanel()}
      </main>

      {/* FOOTER (EXCLUSIVO PARA ÁREA LOGADA E COLABORADORES) */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-6 mt-12 transition-colors">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Bissoli & Bissoli Advogados Associados
            </span>
            <span>— Sistema de Indicações & CRM Comercial</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSqlViewerOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Script SQL Supabase
            </button>
            <span>•</span>
            <span>Conectado ao Supabase</span>
          </div>
        </div>
      </footer>

      <ReportsModal isOpen={reportsOpen} onClose={() => setReportsOpen(false)} />
      <SqlSchemaViewer isOpen={sqlViewerOpen} onClose={() => setSqlViewerOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
