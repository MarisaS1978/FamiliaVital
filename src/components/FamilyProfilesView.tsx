import React, { useState } from 'react';
import { FamilyMember, AllergyRecord } from '../types/health';
import { formatAge } from '../utils/healthUtils';
import {
  Shield,
  AlertTriangle,
  Phone,
  Heart,
  Plus,
  Edit2,
  Trash2,
  FileText,
} from 'lucide-react';

interface FamilyProfilesViewProps {
  members: FamilyMember[];
  allergies: AllergyRecord[];
  selectedMemberId: string | 'all';
  onUpdateMember: (member: FamilyMember) => void;
  onAddAllergy: () => void;
  onDeleteAllergy: (id: string) => void;
  onAddMember: () => void;
}

export const FamilyProfilesView: React.FC<FamilyProfilesViewProps> = ({
  members,
  allergies,
  selectedMemberId,
  onUpdateMember,
  onAddAllergy,
  onDeleteAllergy,
  onAddMember,
}) => {
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const displayedMembers = members.filter(
    (m) => selectedMemberId === 'all' || m.id === selectedMemberId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-[#E9DCC4] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#493B2A]">
            Fichas Médicas Familiares y Registro de Alergias
          </h2>
          <p className="text-xs text-[#796B59] mt-0.5">
            Datos clínicos esenciales, grupo sanguíneo, coberturas, médicos y protocolos de emergencia
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddAllergy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#B42332] bg-[#FDF1F2] border border-[#F5B8BE] rounded-lg hover:bg-[#FCE3E5] transition-colors whitespace-nowrap shadow-2xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#B42332]" />
            <span>Registrar Alergia</span>
          </button>
          <button
            onClick={onAddMember}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#B87932] hover:bg-[#A06424] rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Nuevo Integrante</span>
          </button>
        </div>
      </div>

      {/* Members list */}
      <div className="space-y-6">
        {displayedMembers.map((member) => {
          const memberAllergies = allergies.filter((a) => a.memberId === member.id);

          return (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-[#E9DCC4] shadow-xs overflow-hidden"
            >
              {/* Profile Top Bar */}
              <div className="p-6 border-b border-[#E9DCC4] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FFF9ED]/60">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FFF9ED] border border-[#E9DCC4] shrink-0">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xl text-[#B87932]">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-[#493B2A]">{member.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-[#FFF9ED] border border-[#E9DCC4] rounded text-[#493B2A] font-medium">
                        {member.relationship}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#796B59] mt-1">
                      <span>{formatAge(member.birthDate)}</span>
                      <span aria-hidden="true">·</span>
                      <span>Nacimiento: {member.birthDate}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">DNI {member.idNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center px-4 py-2 bg-white rounded-lg border border-[#E9DCC4] shadow-2xs">
                    <div className="text-[10px] text-[#796B59] font-medium">Grupo Sanguíneo</div>
                    <div className="text-lg font-bold font-mono text-[#C97759] tabular-nums">
                      {member.bloodType}
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingMember(member)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#493B2A] bg-white border border-[#E9DCC4] hover:bg-[#FFF9ED] rounded-lg transition-colors shadow-2xs"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#B87932]" />
                    <span>Editar Ficha</span>
                  </button>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Cobertura Médica */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#493B2A] uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-[#D9A441]" />
                    <span>Cobertura de Salud</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] text-xs space-y-1.5">
                    <div className="font-semibold text-[#493B2A] text-sm">
                      {member.medicalInsurance.provider}
                    </div>
                    <div className="text-[#796B59]">Plan: {member.medicalInsurance.plan}</div>
                    <div className="text-[#796B59] font-mono">
                      N° Afiliado: {member.medicalInsurance.affiliateNumber}
                    </div>
                    {member.medicalInsurance.emergencyPhone && (
                      <div className="pt-1.5 border-t border-[#E9DCC4] flex items-center justify-between">
                        <span className="text-[#796B59]">Urgencias:</span>
                        <a
                          href={`tel:${member.medicalInsurance.emergencyPhone}`}
                          className="font-bold text-[#B42332] hover:underline font-mono"
                        >
                          {member.medicalInsurance.emergencyPhone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Médico de cabecera */}
                  {member.primaryDoctor && (
                    <div className="p-3.5 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] text-xs space-y-1">
                      <div className="font-semibold text-[#493B2A]">
                        {member.primaryDoctor.name}
                      </div>
                      <div className="text-[#796B59]">{member.primaryDoctor.specialty}</div>
                      <div className="text-[#796B59]">{member.primaryDoctor.clinic}</div>
                      <div className="pt-1.5">
                        <a
                          href={`tel:${member.primaryDoctor.phone}`}
                          className="inline-flex items-center gap-1 text-[#B87932] font-bold hover:underline"
                        >
                          <Phone className="w-3 h-3 text-[#B87932]" />
                          <span>{member.primaryDoctor.phone}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Historial de Alergias & Intolerancias */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#493B2A] uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-[#B42332]" />
                      <span>Alergias ({memberAllergies.length})</span>
                    </div>
                  </div>

                  {memberAllergies.length === 0 ? (
                    <div className="p-4 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] text-xs text-[#796B59] text-center">
                      Sin alergias registradas para este miembro.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {memberAllergies.map((allergy) => {
                        const isSevere = allergy.severity.toLowerCase().includes('severa');

                        return (
                          <div
                            key={allergy.id}
                            className={`p-3 rounded-lg border text-xs space-y-1 ${
                              isSevere
                                ? 'bg-[#FDF1F2] border-[#F5B8BE] text-[#493B2A]'
                                : 'bg-[#FFF9ED] border-[#E9DCC4] text-[#493B2A]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <span className={`font-bold block ${isSevere ? 'text-[#B42332]' : 'text-[#493B2A]'}`}>
                                  {allergy.allergen}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                                    isSevere ? 'text-[#B42332]' : 'text-[#796B59]'
                                  }`}
                                >
                                  {allergy.type} · {allergy.severity}
                                </span>
                              </div>
                              <button
                                onClick={() => onDeleteAllergy(allergy.id)}
                                className="text-[#796B59] hover:text-[#B42332] p-0.5 rounded"
                                title="Eliminar registro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="text-[11px] text-[#796B59] mt-1">
                              <strong className="text-[#493B2A]">Síntoma:</strong> {allergy.reactionDescription}
                            </p>
                            <p className="text-[11px] text-[#796B59]">
                              <strong className="text-[#493B2A]">Protocolo:</strong> {allergy.emergencyProtocol}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Condiciones Crónicas & Contactos de Emergencia */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#493B2A] uppercase tracking-wider mb-2">
                      <FileText className="w-4 h-4 text-[#B87932]" />
                      <span>Condiciones & Notas Vitales</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] text-xs space-y-2">
                      {member.chronicConditions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {member.chronicConditions.map((cond, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-white border border-[#E9DCC4] rounded text-[#493B2A] font-medium"
                            >
                              {cond}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[#796B59]">Sin patologías crónicas declaradas.</div>
                      )}

                      {member.vitalNotes && (
                        <div className="pt-2 border-t border-[#E9DCC4] text-[#796B59] italic">
                          "{member.vitalNotes}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#493B2A] uppercase tracking-wider mb-2">
                      <Heart className="w-4 h-4 text-[#C97759]" />
                      <span>Contactos de Emergencia</span>
                    </div>
                    <div className="space-y-1.5">
                      {member.emergencyContacts.map((contact, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-[#FFF9ED] border border-[#E9DCC4] text-xs"
                        >
                          <div>
                            <span className="font-semibold text-[#493B2A]">{contact.name}</span>
                            <span className="text-[#796B59] text-[11px] ml-1">({contact.relation})</span>
                          </div>
                          <a
                            href={`tel:${contact.phone}`}
                            className="font-bold font-mono text-[#B87932] hover:underline"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E9DCC4] shadow-2xl max-w-lg w-full flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden">
            {/* Pinned Modal Header */}
            <div className="bg-[#493B2A] text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between shrink-0">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Editar Ficha Médica: {editingMember.name}
              </h3>
              <button
                onClick={() => {
                  setEditingMember(null);
                  scrollToTop();
                }}
                className="p-1 rounded-lg text-[#E9DCC4] hover:text-white hover:bg-white/10 transition-colors"
                title="Cerrar ventana"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#493B2A] mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">
                    Grupo Sanguíneo
                  </label>
                  <select
                    value={editingMember.bloodType}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        bloodType: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">DNI / Documento</label>
                  <input
                    type="text"
                    value={editingMember.idNumber}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, idNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] font-mono focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Obra Social / Prepaga</label>
                  <input
                    type="text"
                    value={editingMember.medicalInsurance.provider}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        medicalInsurance: {
                          ...editingMember.medicalInsurance,
                          provider: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">N° de Afiliado</label>
                  <input
                    type="text"
                    value={editingMember.medicalInsurance.affiliateNumber}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        medicalInsurance: {
                          ...editingMember.medicalInsurance,
                          affiliateNumber: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] font-mono focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#493B2A] mb-1">Notas Vitales / Antecedentes</label>
                <textarea
                  rows={3}
                  value={editingMember.vitalNotes || ''}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, vitalNotes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                />
              </div>
            </div>

            {/* Pinned Action Footer - Always visible */}
            <div className="bg-[#FFF9ED] px-4 py-3 sm:px-6 sm:py-3.5 border-t border-[#E9DCC4] flex items-center justify-end gap-2.5 shrink-0 z-10 shadow-2xs">
              <button
                onClick={() => {
                  setEditingMember(null);
                  scrollToTop();
                }}
                className="px-4 py-2 text-xs font-semibold text-[#796B59] hover:text-[#493B2A] hover:bg-white rounded-lg border border-transparent hover:border-[#E9DCC4] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onUpdateMember(editingMember);
                  setEditingMember(null);
                  scrollToTop();
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#B87932] hover:bg-[#A06424] rounded-lg transition-colors shadow-xs"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
