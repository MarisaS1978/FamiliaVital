import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, AlertTriangle, KeyRound, HeartPulse, Check, Eye, EyeOff } from 'lucide-react';
import { verifyPin, addAuditLog } from '../utils/securityCrypto';

interface LockScreenProps {
  pinHash: string;
  pinSalt: string;
  onUnlock: () => void;
  onOpenEmergencySOS: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  pinHash,
  pinSalt,
  onUnlock,
  onOpenEmergencySOS,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setTimeout(() => {
        setLockoutSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLockedOut && lockoutSeconds === 0) {
      setIsLockedOut(false);
      setErrorMsg(null);
    }
  }, [lockoutSeconds, isLockedOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    if (!pinInput.trim()) {
      setErrorMsg('Por favor introduce tu PIN de seguridad.');
      return;
    }

    const isValid = await verifyPin(pinInput, pinHash, pinSalt);

    if (isValid) {
      await addAuditLog(
        'VAULT_UNLOCK',
        'Control de Acceso (A.5.15 / CC6.1)',
        'Acceso exitoso al sistema mediante PIN de seguridad.',
        'Usuario Propietario',
        'info'
      );
      setErrorMsg(null);
      setAttempts(0);
      onUnlock();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      await addAuditLog(
        'VAULT_UNLOCK',
        'Control de Acceso (A.5.15 / CC6.1)',
        `Intento de acceso fallido con PIN incorrecto (Intento ${newAttempts}).`,
        'Intento No Autorizado',
        'warning'
      );

      if (newAttempts >= 5) {
        setIsLockedOut(true);
        setLockoutSeconds(30);
        setErrorMsg('Demasiados intentos fallidos. Bloqueo temporal por 30 segundos (Protección contra fuerza bruta SOC 2 CC6.1).');
      } else {
        setErrorMsg(`PIN incorrecto. Intento ${newAttempts} de 5.`);
      }
      setPinInput('');
    }
  };

  const handleBreakGlassSOS = async () => {
    await addAuditLog(
      'SOS_BREAK_GLASS',
      'Gestión de Incidentes (A.8.18 / CC7.3)',
      'Activación de protocolo Break-Glass: Acceso directo a Ficha Médica de Emergencia desde pantalla de bloqueo.',
      'Personal de Emergencia / Rescatista',
      'critical'
    );
    onOpenEmergencySOS();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#3E3020]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E9DCC4] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Badge */}
        <div className="bg-[#FFF9ED] p-6 text-center border-b border-[#E9DCC4] relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#E27D18] flex items-center justify-center text-white shadow-md shadow-[#E27D18]/30 mb-3">
            <Lock className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-xl font-bold text-[#3E3020]">Bóveda de Salud Bloqueada</h2>
          <p className="text-xs text-[#6E5F4D] mt-1 max-w-xs mx-auto">
            Protección de datos médicos sensibles según estándares <strong>SOC 2 Type II</strong> e <strong>ISO/IEC 27001:2022</strong>.
          </p>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EDF7F2] border border-[#B8DDCB] text-[#1E7E52] text-[10px] font-bold mt-2.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cifrado AES-256-GCM Activo</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#3E3020] uppercase tracking-wider mb-1.5 text-center">
                Ingresa tu PIN o Clave Maestra
              </label>

              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  value={pinInput}
                  disabled={isLockedOut}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  maxLength={12}
                  className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 bg-[#FFF9ED] border-2 border-[#E9DCC4] focus:border-[#E27D18] focus:bg-white rounded-xl text-[#3E3020] focus:outline-none transition-all disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#6E5F4D] hover:text-[#3E3020]"
                  title={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#FDF1F2] border border-[#F5B8BE] text-[#C21D30] rounded-xl text-xs flex items-start gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {isLockedOut && (
              <div className="text-center font-mono text-xs font-bold text-[#C21D30]">
                Espera {lockoutSeconds}s para reintentar...
              </div>
            )}

            <button
              type="submit"
              disabled={isLockedOut || !pinInput}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#E27D18] hover:bg-[#C66506] disabled:opacity-50 transition-colors shadow-sm shadow-[#E27D18]/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Desbloquear Bóveda Familiar</span>
            </button>
          </form>

          {/* Quick numbers keypad for touch screens */}
          <div className="pt-2 border-t border-[#E9DCC4]">
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  disabled={isLockedOut}
                  onClick={() => {
                    if (digit === 'C') setPinInput('');
                    else if (digit === '⌫') setPinInput((prev) => prev.slice(0, -1));
                    else if (pinInput.length < 8) setPinInput((prev) => prev + digit);
                  }}
                  className="py-2.5 rounded-lg bg-[#FFF9ED] hover:bg-[#FEEAA2] border border-[#E9DCC4] text-base font-bold text-[#3E3020] transition-colors active:scale-95 cursor-pointer disabled:opacity-40"
                >
                  {digit}
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Break-Glass (Mandatory for Medical ISO 27001 systems) */}
          <div className="pt-4 border-t border-[#E9DCC4] text-center space-y-2">
            <p className="text-[11px] text-[#6E5F4D]">
              ¿Urgencia médica o ambulancia? Accede sin clave a la ficha SOS:
            </p>

            <button
              type="button"
              onClick={handleBreakGlassSOS}
              className="w-full py-2.5 px-4 rounded-xl border border-[#F5B8BE] bg-[#FDF1F2] hover:bg-[#FCE3E5] text-[#C21D30] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <HeartPulse className="w-4 h-4 text-[#C21D30] animate-pulse" />
              <span>Modo Emergencia / SOS (Break-Glass Médico)</span>
            </button>
            <span className="text-[10px] text-[#6E5F4D] block italic">
              * El acceso de emergencia queda registrado en el log inmutable de auditoría.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
