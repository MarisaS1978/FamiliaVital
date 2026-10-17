import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check, X, Share, PlusSquare, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface InstallShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallShortcutModal: React.FC<InstallShortcutModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>('android');

  useEffect(() => {
    // Detect iOS
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIos) {
      setActivePlatform('ios');
    }

    // Check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#E9DCC4] shadow-2xl overflow-hidden flex flex-col">
        {/* Pinned Header */}
        <div className="bg-[#E27D18] px-4 py-3 sm:px-5 sm:py-3.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                Instalar Acceso Directo
              </h3>
              <p className="text-[11px] text-white/90">
                Lleva FamiliaVital en la pantalla de inicio de tu celular
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Official App Icon Showcase */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-b from-[#FFF9ED] to-[#FEEAA2]/40 border border-[#E9DCC4] text-center space-y-2">
            <div className="relative">
              {/* App Icon with subtle drop shadow */}
              <img
                src="/icon-192.png"
                alt="Ícono Oficial FamiliaVital"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-md border-2 border-white object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/favicon.svg';
                }}
              />
              <div className="absolute -bottom-1.5 -right-1.5 bg-[#1E7E52] text-white p-1 rounded-full shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="font-bold text-base text-[#3E3020]">FamiliaVital</div>
              <div className="text-xs text-[#6E5F4D]">Libreta Digital de Salud & Mascotas</div>
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white border border-[#E9DCC4] text-[10px] font-semibold text-[#E27D18]">
              Acceso Rápido · 100% Gratuito y Seguro
            </span>
          </div>

          {/* Native Install Button (Android / Chrome) */}
          {deferredPrompt && !isInstalled && (
            <button
              onClick={handleNativeInstall}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E27D18] hover:bg-[#C66506] text-white font-bold rounded-xl text-sm transition-all shadow-sm shadow-[#E27D18]/25 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Acceso Directo con este Ícono</span>
            </button>
          )}

          {isInstalled && (
            <div className="p-3 rounded-lg bg-[#EDF7F2] border border-[#A3E0C0] text-[#1E7E52] text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>¡La aplicación ya está instalada en tu dispositivo! Puedes abrirla desde tu pantalla de inicio.</span>
            </div>
          )}

          {/* Platform Switcher Tabs */}
          <div className="flex border border-[#E9DCC4] rounded-lg p-1 bg-[#FFF9ED]">
            <button
              onClick={() => setActivePlatform('android')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activePlatform === 'android' ? 'bg-white text-[#3E3020] shadow-xs' : 'text-[#6E5F4D]'
              }`}
            >
              Android (Chrome)
            </button>
            <button
              onClick={() => setActivePlatform('ios')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activePlatform === 'ios' ? 'bg-white text-[#3E3020] shadow-xs' : 'text-[#6E5F4D]'
              }`}
            >
              iPhone / iPad (Safari)
            </button>
          </div>

          {/* Step-by-Step Instructions */}
          {activePlatform === 'android' ? (
            <div className="p-3.5 rounded-xl bg-[#FFF9ED] border border-[#E9DCC4] text-xs text-[#493B2A] space-y-2">
              <div className="font-bold text-[#E27D18] text-xs uppercase tracking-wider">
                Instrucciones para Android:
              </div>
              <ol className="space-y-1.5 list-decimal list-inside text-[#6E5F4D]">
                <li>
                  Abre el menú de opciones de Chrome tocando los <strong>tres puntos (⋮)</strong> en la esquina superior derecha.
                </li>
                <li>
                  Selecciona la opción <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.
                </li>
                <li>
                  Confirma con el botón <strong>"Instalar"</strong>.
                </li>
                <li>
                  ¡Listo! El ícono de FamiliaVital aparecerá en tu pantalla de inicio junto a tus otras apps.
                </li>
              </ol>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#FFF9ED] border border-[#E9DCC4] text-xs text-[#493B2A] space-y-2">
              <div className="font-bold text-[#E27D18] text-xs uppercase tracking-wider">
                Instrucciones para iPhone / iPad (Safari):
              </div>
              <ol className="space-y-1.5 text-[#6E5F4D]">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold">1.</span>
                  <span>Toca el botón <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline text-[#007AFF] mx-0.5" /> (cuadrado con flecha hacia arriba en la barra de Safari).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold">2.</span>
                  <span>Desliza hacia abajo y toca <strong>"Agregar a la pantalla de inicio"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-[#3E3020] mx-0.5" />.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold">3.</span>
                  <span>Verás el <strong>ícono oficial de FamiliaVital</strong> con el nombre. Toca <strong>"Agregar"</strong> arriba a la derecha.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold">4.</span>
                  <span>¡Listo! Ya tienes acceso directo de un solo toque con el ícono en tu pantalla de inicio.</span>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Pinned Footer */}
        <div className="bg-[#FFF9ED] px-4 py-3 border-t border-[#E9DCC4] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#493B2A] bg-white border border-[#E9DCC4] hover:bg-[#FFF9ED] rounded-lg transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
