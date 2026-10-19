import React from 'react';
import { ShieldAlert, Plus, Share2, HeartPulse, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
  onOpenShare: () => void;
  onOpenEmergencySOS: () => void;
  onOpenInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickAdd,
  onOpenShare,
  onOpenEmergencySOS,
  onOpenInstall,
}) => {
  const navItems = [
    { id: 'resumen', label: 'Inicio & Alertas', shortLabel: 'Inicio' },
    { id: 'vacunas', label: 'Calendario de Vacunación', shortLabel: 'Vacunas' },
    { id: 'turnos-recetas', label: 'Agenda & Recetas', shortLabel: 'Agenda' },
    { id: 'botiquin', label: 'Botiquín Familiar', shortLabel: 'Botiquín' },
    { id: 'perfiles', label: 'Fichas Familiares', shortLabel: 'Fichas' },
    { id: 'mascotas', label: 'Mascotas & Veterinaria', shortLabel: 'Mascotas' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E9DCC4] shadow-xs">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-1 sm:gap-4 h-13 sm:h-16">
          {/* Zone 1: Brand Wordmark (Clickable to scroll to top & home) */}
          <button
            onClick={() => onSelectTab('resumen')}
            className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 text-left hover:opacity-90 transition-opacity cursor-pointer group min-w-0"
            title="Ir a Inicio"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#E27D18] flex items-center justify-center text-white shadow-sm shadow-[#E27D18]/30 group-hover:scale-105 transition-all shrink-0">
              <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-lg font-bold tracking-tight text-[#3E3020] truncate leading-tight">
                FamiliaVital
              </span>
              <span className="hidden sm:block text-[10px] text-[#6E5F4D] leading-tight">
                Libreta Digital de Salud & Mascotas
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Responsive: full labels on xl, short on md) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#E27D18] text-white shadow-xs'
                      : 'text-[#6E5F4D] hover:text-[#3E3020] hover:bg-[#FFF9ED]'
                  }`}
                >
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden">{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions & SOS - ALWAYS 100% VISIBLE WITH CLEAR LABELS */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Ficha SOS Button */}
            <button
              onClick={onOpenEmergencySOS}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-bold text-[#C21D30] bg-[#FDF1F2] border border-[#F5B8BE] rounded-lg hover:bg-[#FCE3E5] transition-colors whitespace-nowrap shadow-2xs cursor-pointer shrink-0"
              title="Acceso instantáneo a Ficha Médica de Emergencia (SOS)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#C21D30] shrink-0 animate-pulse" />
              <span>SOS</span>
              <span className="hidden lg:inline font-bold">Emergencia</span>
            </button>

            {/* Compartir Button */}
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-semibold text-[#3E3020] bg-[#FFF9ED] border border-[#E9DCC4] rounded-lg hover:bg-[#FEEAA2]/40 transition-colors whitespace-nowrap shadow-2xs cursor-pointer shrink-0"
              title="Compartir fichas con cuidadores o médicos"
            >
              <Share2 className="w-3.5 h-3.5 text-[#E27D18] shrink-0" />
              <span className="hidden sm:inline">Compartir</span>
            </button>

            {/* Instalar Acceso Directo Button */}
            {onOpenInstall && (
              <button
                onClick={onOpenInstall}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-[#3E3020] bg-white border border-[#E9DCC4] rounded-lg hover:bg-[#FFF9ED] transition-colors whitespace-nowrap shadow-2xs cursor-pointer shrink-0"
                title="Instalar ícono de acceso directo en tu celular o PC"
              >
                <img src="/favicon.svg" alt="" className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Acceso Directo</span>
                <span className="sm:hidden">App</span>
              </button>
            )}

            {/* Nuevo Registro Primary Action Button */}
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-[#E27D18] hover:bg-[#C66506] rounded-lg transition-colors shadow-sm shadow-[#E27D18]/25 whitespace-nowrap shrink-0 cursor-pointer"
              title="Agregar nuevo registro médico"
            >
              <Plus className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Nuevo</span>
              <span className="hidden lg:inline">Registro</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar with responsive horizontal scroll and clean badges */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-[#E9DCC4] no-scrollbar overscroll-x-contain">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#E27D18] text-white shadow-2xs'
                    : 'text-[#6E5F4D] hover:bg-[#FFF9ED] hover:text-[#3E3020]'
                }`}
              >
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
