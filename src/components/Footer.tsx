import React from 'react';
import { HeartPulse, ShieldAlert, Share2, Download } from 'lucide-react';

interface FooterProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenEmergencySOS: () => void;
  onOpenShare: () => void;
  onOpenInstall: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  activeTab,
  onSelectTab,
  onOpenEmergencySOS,
  onOpenShare,
  onOpenInstall,
}) => {
  const navLinks = [
    { id: 'resumen', label: 'Inicio & Alertas' },
    { id: 'vacunas', label: 'Calendario de Vacunación' },
    { id: 'turnos-recetas', label: 'Agenda & Recetas' },
    { id: 'botiquin', label: 'Botiquín Familiar' },
    { id: 'perfiles', label: 'Fichas Familiares' },
    { id: 'mascotas', label: 'Mascotas & Veterinaria' },
  ];

  return (
    <footer className="no-print bg-white border-t border-[#E9DCC4] mt-12 text-[#6E5F4D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-10 sm:pb-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#E9DCC4]/70">
          {/* Brand Identity & Description */}
          <div className="md:col-span-5 space-y-3">
            <button
              type="button"
              onClick={() => onSelectTab('resumen')}
              className="inline-flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E27D18] rounded-lg"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#E27D18] flex items-center justify-center text-white shadow-sm shadow-[#E27D18]/25 group-hover:scale-105 transition-transform duration-150 shrink-0">
                <HeartPulse className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#3E3020] group-hover:text-[#E27D18] transition-colors duration-150">
                FamiliaVital
              </span>
            </button>

            <p className="text-sm text-[#493B2A] leading-relaxed max-w-md">
              Tu información de salud familiar, organizada en un solo lugar.
            </p>
            <p className="text-xs italic text-[#6E5F4D]">
              Cuidar y organizar también es prevenir.
            </p>
          </div>

          {/* Navigation Sections */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-[#3E3020] tracking-wide">
              Secciones de la libreta
            </h3>
            <nav aria-label="Navegación del pie de página" className="grid grid-cols-2 gap-x-4 gap-y-2">
              {navLinks.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`text-left text-xs transition-all duration-150 cursor-pointer underline-offset-4 hover:underline hover:text-[#E27D18] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E27D18] rounded-xs py-0.5 ${
                      isActive ? 'font-bold text-[#E27D18]' : 'text-[#6E5F4D]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Health & Privacy Tools */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold text-[#3E3020] tracking-wide">
              Herramientas y cuidado
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onOpenEmergencySOS}
                  className="inline-flex items-center gap-2 text-[#C21D30] font-semibold hover:text-[#9E1B28] hover:underline underline-offset-4 transition-colors duration-150 cursor-pointer py-0.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Ficha de Emergencia (SOS)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenShare}
                  className="inline-flex items-center gap-2 text-[#6E5F4D] hover:text-[#E27D18] hover:underline underline-offset-4 transition-colors duration-150 cursor-pointer py-0.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#E27D18] shrink-0" />
                  <span>Compartir con cuidadores</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenInstall}
                  className="inline-flex items-center gap-2 text-[#6E5F4D] hover:text-[#E27D18] hover:underline underline-offset-4 transition-colors duration-150 cursor-pointer py-0.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#E27D18] shrink-0" />
                  <span>Instalar acceso directo</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Authorship & Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#6E5F4D] text-center sm:text-left">
          <p className="text-[#493B2A]">
            Desarrollado por{' '}
            <span className="font-semibold text-[#3E3020]">
              Marisa Silvina Sandroni
            </span>
          </p>
          <p className="tabular-nums">
            © 2026 FamiliaVital. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
