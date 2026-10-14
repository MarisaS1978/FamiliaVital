import React from 'react';
import { ShieldAlert, Plus, Share2, HeartPulse } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
  onOpenShare: () => void;
  onOpenEmergencySOS: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickAdd,
  onOpenShare,
  onOpenEmergencySOS,
}) => {
  const navItems = [
    { id: 'resumen', label: 'Inicio & Alertas', shortLabel: 'Inicio' },
    { id: 'vacunas', label: 'Calendario de Vacunación', shortLabel: 'Vacunas' },
    { id: 'botiquin', label: 'Botiquín Familiar', shortLabel: 'Botiquín' },
    { id: 'turnos-recetas', label: 'Turnos & Recetas', shortLabel: 'Turnos & Recetas' },
    { id: 'perfiles', label: 'Fichas Médicas', shortLabel: 'Fichas' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E9DCC4] shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-16">
          {/* Zone 1: Brand Wordmark (Clickable to scroll to top & home) */}
          <button
            onClick={() => onSelectTab('resumen')}
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 text-left hover:opacity-90 transition-opacity cursor-pointer group"
            title="Ir a Inicio"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#B87932] flex items-center justify-center text-white shadow-sm shadow-[#B87932]/25 group-hover:bg-[#A06424] transition-colors">
              <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-[#F8E8A6]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#493B2A] whitespace-nowrap leading-tight">
                FamiliaVital
              </span>
              <span className="hidden sm:block text-[10px] text-[#796B59] leading-tight">
                Libreta Digital de Salud
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Responsive: full labels on lg, short on md) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-2.5 lg:px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#B87932] text-white shadow-xs'
                      : 'text-[#796B59] hover:text-[#493B2A] hover:bg-[#FDF5E6]'
                  }`}
                >
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden">{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions & SOS - ALWAYS 100% VISIBLE WITH CLEAR LABELS */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Ficha SOS Button */}
            <button
              onClick={onOpenEmergencySOS}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#B42332] bg-[#FDF1F2] border border-[#F5B8BE] rounded-lg hover:bg-[#FCE3E5] transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
              title="Acceso instantáneo a Ficha Médica de Emergencia (SOS)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#B42332] shrink-0 animate-pulse" />
              <span>SOS</span>
              <span className="hidden lg:inline font-bold">Emergencia</span>
            </button>

            {/* Compartir Button */}
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#493B2A] bg-[#FFF9ED] border border-[#E9DCC4] rounded-lg hover:bg-[#F8E8A6]/40 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
              title="Compartir fichas con cuidadores o médicos"
            >
              <Share2 className="w-3.5 h-3.5 text-[#B87932] shrink-0" />
              <span>Compartir</span>
            </button>

            {/* Nuevo Registro Primary Action Button */}
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-[#B87932] hover:bg-[#A06424] rounded-lg transition-colors shadow-sm shadow-[#B87932]/20 whitespace-nowrap shrink-0 cursor-pointer"
              title="Agregar nuevo registro médico"
            >
              <Plus className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="sm:hidden">Nuevo</span>
              <span className="hidden sm:inline">Nuevo Registro</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar with responsive short labels that fit cleanly */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-[#E9DCC4] no-scrollbar overscroll-x-contain">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#B87932] text-white shadow-2xs'
                    : 'text-[#796B59] hover:bg-[#FDF5E6] hover:text-[#493B2A]'
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
