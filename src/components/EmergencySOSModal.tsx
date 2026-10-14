import React, { useState } from 'react';
import { FamilyMember, AllergyRecord } from '../types/health';
import { formatAge } from '../utils/healthUtils';
import {
  ShieldAlert,
  Phone,
  Printer,
  Copy,
  Check,
  X,
  AlertTriangle,
  User,
  Heart,
  FileText,
  Ambulance,
} from 'lucide-react';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  allergies: AllergyRecord[];
  activeMemberId: string | 'all';
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  members,
  allergies,
  activeMemberId,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    activeMemberId !== 'all' ? activeMemberId : members[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentMember = members.find((m) => m.id === selectedId) || members[0];
  const memberAllergies = allergies.filter((a) => a.memberId === currentMember?.id);
  const severeAllergies = memberAllergies.filter((a) =>
    a.severity.toLowerCase().includes('severa')
  );

  const handleCopySummary = () => {
    if (!currentMember) return;
    const allergyText =
      memberAllergies.length > 0
        ? memberAllergies
            .map((a) => `• ${a.allergen} (${a.severity}): ${a.reactionDescription}`)
            .join('\n')
        : 'Sin alergias registradas';

    const emergencyContacts = currentMember.emergencyContacts
      .map((c) => `• ${c.name} (${c.relation}): ${c.phone}`)
      .join('\n');

    const summary = `🚨 FICHA MÉDICA DE EMERGENCIA - FAMILIAVITAL
Nombre: ${currentMember.name}
Edad: ${formatAge(currentMember.birthDate)} (${currentMember.birthDate})
DNI: ${currentMember.idNumber}
Grupo Sanguíneo: ${currentMember.bloodType}

🏥 COBERTURA MÉDICA:
Prestador: ${currentMember.medicalInsurance.provider} (Plan ${currentMember.medicalInsurance.plan})
N° Afiliado: ${currentMember.medicalInsurance.affiliateNumber}
Urgencias: ${currentMember.medicalInsurance.emergencyPhone || '107'}

⚠️ ALERGIAS:
${allergyText}

🩺 MÉDICO DE CABECERA:
${currentMember.primaryDoctor?.name || 'No especificado'} (${currentMember.primaryDoctor?.phone || '-'})

📞 CONTACTOS DE URGENCIA:
${emergencyContacts}

Notas: ${currentMember.vitalNotes || 'Ninguna'}
Generado desde FamiliaVital`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E9DCC4] shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[85vh]">
        {/* Top Emergency Header - Always pinned and fully visible */}
        <div className="bg-[#B42332] px-4 py-3 sm:px-6 sm:py-3.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                Ficha Médica de Emergencia (SOS)
              </h2>
              <p className="text-[11px] text-white/90 leading-tight">
                Información vital accesible para guardia y cuidadores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Cerrar modal"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Member Selector Tabs - Always pinned */}
        <div className="bg-[#FFF9ED] px-4 py-2 sm:px-6 sm:py-2.5 border-b border-[#E9DCC4] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-[#796B59] whitespace-nowrap mr-1">
            Ficha de:
          </span>
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedId === m.id
                  ? 'bg-[#B87932] text-white shadow-xs'
                  : 'bg-white text-[#493B2A] hover:bg-[#F8E8A6]/40 border border-[#E9DCC4]'
              }`}
            >
              {m.name.split(' ')[0]} ({m.relationship})
            </button>
          ))}
        </div>

        {/* Emergency Card Content - Independently scrollable */}
        {currentMember && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 sm:space-y-4">
            {/* Top Identity Grid - Compact & Responsive */}
            <div className="p-3 sm:p-4 rounded-xl bg-[#FFF9ED] border border-[#E9DCC4] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-white border border-[#E9DCC4] shrink-0">
                  {currentMember.avatarUrl ? (
                    <img
                      src={currentMember.avatarUrl}
                      alt={currentMember.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-lg text-[#B87932]">
                      {currentMember.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-[#493B2A] truncate">
                    {currentMember.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#796B59] mt-0.5">
                    <span>{currentMember.relationship}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">DNI {currentMember.idNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatAge(currentMember.birthDate)}</span>
                  </div>
                </div>
              </div>

              {/* Compact Blood group badge */}
              <div className="bg-[#FDF1F2] border border-[#F5B8BE] rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-center shrink-0">
                <div className="text-[9px] sm:text-[10px] font-bold text-[#B42332] uppercase tracking-wider">
                  Grupo
                </div>
                <div className="text-lg sm:text-xl font-black text-[#B42332] font-mono tabular-nums leading-none mt-0.5">
                  {currentMember.bloodType}
                </div>
              </div>
            </div>

            {/* Critical Allergy Warning Banner */}
            {severeAllergies.length > 0 && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#FDF1F2] border border-[#F5B8BE] text-[#493B2A]">
                <div className="flex items-center gap-1.5 text-[#B42332] font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#B42332]" />
                  <span>ALERTA CRÍTICA: RIESGO DE SEGURIDAD</span>
                </div>
                <div className="mt-1.5 space-y-1.5">
                  {severeAllergies.map((allergy) => (
                    <div key={allergy.id} className="text-xs">
                      <div className="font-bold text-[#B42332]">
                        {allergy.allergen}
                      </div>
                      <div className="text-[#796B59] text-[11px] mt-0.5">
                        <strong className="text-[#493B2A]">Protocolo de urgencia:</strong>{' '}
                        {allergy.emergencyProtocol}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Insurance & Pediatrician / Doctor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 sm:p-3.5 rounded-xl border border-[#E9DCC4] bg-white">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#493B2A] uppercase tracking-wider mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#D9A441]" />
                  <span>Cobertura Médica</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between py-0.5 border-b border-[#E9DCC4]/40">
                    <span className="text-[#796B59]">Prestador:</span>
                    <span className="font-semibold text-[#493B2A]">
                      {currentMember.medicalInsurance.provider} (Plan {currentMember.medicalInsurance.plan})
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-[#E9DCC4]/40">
                    <span className="text-[#796B59]">N° Afiliado:</span>
                    <span className="font-mono font-semibold text-[#493B2A] tabular-nums">
                      {currentMember.medicalInsurance.affiliateNumber}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 pt-1">
                    <span className="text-[#796B59]">Urgencias:</span>
                    {currentMember.medicalInsurance.emergencyPhone ? (
                      <a
                        href={`tel:${currentMember.medicalInsurance.emergencyPhone}`}
                        className="font-mono font-bold text-[#B42332] hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {currentMember.medicalInsurance.emergencyPhone}
                      </a>
                    ) : (
                      <span className="text-[#796B59]">107 (SAME)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Primary Doctor */}
              <div className="p-3 sm:p-3.5 rounded-xl border border-[#E9DCC4] bg-white">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#493B2A] uppercase tracking-wider mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#D9A441]" />
                  <span>Médico de Cabecera</span>
                </div>
                {currentMember.primaryDoctor ? (
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-[#493B2A]">
                      {currentMember.primaryDoctor.name}
                    </div>
                    <div className="text-[#796B59] text-[11px]">{currentMember.primaryDoctor.specialty} · {currentMember.primaryDoctor.clinic}</div>
                    <div className="pt-1">
                      <a
                        href={`tel:${currentMember.primaryDoctor.phone}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF9ED] text-[#B87932] font-semibold border border-[#E9DCC4] hover:bg-[#F8E8A6]/40 transition-colors text-xs"
                      >
                        <Phone className="w-3 h-3 text-[#B87932]" />
                        <span>Llamar: {currentMember.primaryDoctor.phone}</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#796B59] py-2">
                    Sin médico registrado
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="p-3 sm:p-3.5 rounded-xl border border-[#E9DCC4] bg-white">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#493B2A] uppercase tracking-wider mb-2">
                <Heart className="w-3.5 h-3.5 text-[#C97759]" />
                <span>Contactos Familiares Urgentes</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentMember.emergencyContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="p-2 sm:p-2.5 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#493B2A] truncate">{contact.name}</div>
                      <div className="text-[10px] text-[#796B59]">{contact.relation}</div>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#E9DCC4] text-[#B87932] text-xs font-bold hover:bg-[#F8E8A6]/30 transition-colors shrink-0"
                    >
                      <Phone className="w-3 h-3 text-[#B87932]" />
                      <span>{contact.phone}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* National Emergency Hotline numbers */}
            <div className="p-3 rounded-xl bg-[#493B2A] text-white flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Ambulance className="w-4 h-4 text-[#E9C46A] shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold">SAME: 107</span> · <span>911</span> · <span>Toxicológico: 0800-333-0160</span>
                </div>
              </div>
              <a
                href="tel:107"
                className="px-2.5 py-1 bg-[#B42332] hover:bg-[#9E1B28] text-white rounded text-xs font-bold whitespace-nowrap shadow-2xs"
              >
                Llamar 107
              </a>
            </div>
          </div>
        )}

        {/* Modal Footer with Actions - ALWAYS PINNED, ALWAYS 100% VISIBLE */}
        <div className="bg-[#FFF9ED] px-4 py-2.5 sm:px-6 sm:py-3.5 border-t border-[#E9DCC4] flex items-center justify-between gap-2 shrink-0">
          <div className="hidden sm:block text-xs text-[#796B59] truncate">
            Ficha lista para imprimir o compartir
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopySummary}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#493B2A] bg-white border border-[#E9DCC4] rounded-lg hover:bg-[#F8E8A6]/40 transition-colors shadow-2xs whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#287653]" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#B87932]" />
                  <span>Copiar Resumen</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#B87932] hover:bg-[#A06424] rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Imprimir Ficha</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
