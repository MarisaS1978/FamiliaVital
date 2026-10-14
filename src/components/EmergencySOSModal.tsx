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

    const summary = `🚨 FICHA MÉDICA DE EMERGENCIA - SALUDFAMILIAR
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
Generado desde SaludFamiliar`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-8">
        {/* Top Emergency Header */}
        <div className="bg-rose-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Ficha Médica de Emergencia (SOS)</h2>
              <p className="text-xs text-rose-100">
                Información vital accesible para médicos de guardia, paramédicos y cuidadores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Selector Tabs */}
        <div className="bg-neutral-100 px-6 py-3 border-b border-neutral-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-neutral-600 whitespace-nowrap mr-1">
            Ficha de:
          </span>
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedId === m.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
              }`}
            >
              {m.name.split(' ')[0]} ({m.relationship})
            </button>
          ))}
        </div>

        {/* Emergency Card Content */}
        {currentMember && (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Top Identity Grid */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0">
                  {currentMember.avatarUrl ? (
                    <img
                      src={currentMember.avatarUrl}
                      alt={currentMember.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl text-neutral-600">
                      {currentMember.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">{currentMember.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 mt-0.5">
                    <span>{currentMember.relationship}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">DNI {currentMember.idNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatAge(currentMember.birthDate)}</span>
                  </div>
                </div>
              </div>

              {/* Blood group spotlight */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-5 py-2.5 text-center shrink-0 w-full sm:w-auto">
                <div className="text-[10px] font-semibold text-rose-800 uppercase tracking-wider">
                  Grupo Sanguíneo
                </div>
                <div className="text-2xl font-black text-rose-600 font-mono tabular-nums">
                  {currentMember.bloodType}
                </div>
              </div>
            </div>

            {/* Critical Allergy Warning Banner (if any) */}
            {severeAllergies.length > 0 && (
              <div className="p-4 rounded-xl bg-red-50 border-2 border-red-500/40 text-red-950">
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
                  <span>ALERTA CRÍTICA DE SEGURIDAD DEL PACIENTE</span>
                </div>
                <div className="mt-2 space-y-2">
                  {severeAllergies.map((allergy) => (
                    <div key={allergy.id} className="text-xs">
                      <div className="font-semibold text-red-900">
                        {allergy.allergen}
                      </div>
                      <div className="text-red-800 mt-0.5">
                        <span className="font-medium">Protocolo de emergencia:</span>{' '}
                        {allergy.emergencyProtocol}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Insurance & Pediatrician / Doctor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-neutral-200 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Cobertura Médica & Urgencias</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">Obra Social / Prepaga:</span>
                    <span className="font-semibold text-neutral-900">
                      {currentMember.medicalInsurance.provider} (Plan {currentMember.medicalInsurance.plan})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">N° de Afiliado:</span>
                    <span className="font-mono font-semibold text-neutral-900 tabular-nums">
                      {currentMember.medicalInsurance.affiliateNumber}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 pt-2">
                    <span className="text-neutral-500">Teléfono Urgencias:</span>
                    {currentMember.medicalInsurance.emergencyPhone ? (
                      <a
                        href={`tel:${currentMember.medicalInsurance.emergencyPhone}`}
                        className="font-mono font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {currentMember.medicalInsurance.emergencyPhone}
                      </a>
                    ) : (
                      <span className="text-neutral-600">107 (SAME)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Primary Doctor */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Médico / Pediatra de Cabecera</span>
                </div>
                {currentMember.primaryDoctor ? (
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-neutral-900">
                      {currentMember.primaryDoctor.name}
                    </div>
                    <div className="text-neutral-500">{currentMember.primaryDoctor.specialty}</div>
                    <div className="text-neutral-500">{currentMember.primaryDoctor.clinic}</div>
                    <div className="pt-2">
                      <a
                        href={`tel:${currentMember.primaryDoctor.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Llamar al médico: {currentMember.primaryDoctor.phone}</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500 py-3">
                    No hay médico de cabecera registrado para este miembro.
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Contactos Familiares de Urgencia</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentMember.emergencyContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-neutral-900">{contact.name}</div>
                      <div className="text-[11px] text-neutral-500">{contact.relation}</div>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-800 text-xs font-bold hover:bg-neutral-100 transition-colors shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{contact.phone}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* National Emergency Hotline numbers */}
            <div className="p-3.5 rounded-xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Ambulance className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold">Líneas Públicas Gratuitas de Urgencia</div>
                  <div className="text-neutral-400 text-[11px]">
                    SAME Emergencias: 107 · Policía: 911 · Centro Toxicología Posadas: 0800-333-0160
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="tel:107"
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md font-bold transition-colors"
                >
                  Llamar 107
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer with Actions */}
        <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-500">
            Ficha lista para imprimir o compartir vía WhatsApp
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleCopySummary}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar Resumen'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Ficha</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
