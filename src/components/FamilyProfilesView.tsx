import React, { useState } from 'react';
import { FamilyMember, AllergyRecord } from '../types/health';
import { formatAge } from '../utils/healthUtils';
import {
  User,
  Shield,
  AlertTriangle,
  Phone,
  Heart,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Building,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            Fichas Médicas Familiares y Registro de Alergias
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Datos clínicos esenciales, grupo sanguíneo, coberturas, médicos y protocolos de emergencia
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddAllergy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Registrar Alergia</span>
          </button>
          <button
            onClick={onAddMember}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
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
              className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden"
            >
              {/* Profile Top Bar */}
              <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-neutral-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xl text-neutral-600">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-neutral-900">{member.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-neutral-200 rounded text-neutral-800 font-medium">
                        {member.relationship}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                      <span>{formatAge(member.birthDate)}</span>
                      <span aria-hidden="true">·</span>
                      <span>Nacimiento: {member.birthDate}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">DNI {member.idNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center px-4 py-2 bg-white rounded-lg border border-neutral-200 shadow-2xs">
                    <div className="text-[10px] text-neutral-500 font-medium">Grupo Sanguíneo</div>
                    <div className="text-lg font-bold font-mono text-rose-600 tabular-nums">
                      {member.bloodType}
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingMember(member)}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Editar Ficha</span>
                  </button>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Cobertura Médica */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Cobertura de Salud</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs space-y-1.5">
                    <div className="font-semibold text-neutral-900 text-sm">
                      {member.medicalInsurance.provider}
                    </div>
                    <div className="text-neutral-600">Plan: {member.medicalInsurance.plan}</div>
                    <div className="text-neutral-600 font-mono">
                      N° Afiliado: {member.medicalInsurance.affiliateNumber}
                    </div>
                    {member.medicalInsurance.emergencyPhone && (
                      <div className="pt-1 border-t border-neutral-200 flex items-center justify-between">
                        <span className="text-neutral-500">Urgencias:</span>
                        <a
                          href={`tel:${member.medicalInsurance.emergencyPhone}`}
                          className="font-bold text-rose-600 hover:underline font-mono"
                        >
                          {member.medicalInsurance.emergencyPhone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Médico de cabecera */}
                  {member.primaryDoctor && (
                    <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs space-y-1">
                      <div className="font-semibold text-neutral-900">
                        {member.primaryDoctor.name}
                      </div>
                      <div className="text-neutral-500">{member.primaryDoctor.specialty}</div>
                      <div className="text-neutral-500">{member.primaryDoctor.clinic}</div>
                      <div className="pt-1.5">
                        <a
                          href={`tel:${member.primaryDoctor.phone}`}
                          className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{member.primaryDoctor.phone}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Historial de Alergias & Intolerancias */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Alergias ({memberAllergies.length})</span>
                    </div>
                  </div>

                  {memberAllergies.length === 0 ? (
                    <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100 text-xs text-neutral-500 text-center">
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
                                ? 'bg-red-50/70 border-red-200 text-red-950'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <span className="font-bold text-neutral-900 block">
                                  {allergy.allergen}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                                    isSevere ? 'text-red-700' : 'text-neutral-500'
                                  }`}
                                >
                                  {allergy.type} · {allergy.severity}
                                </span>
                              </div>
                              <button
                                onClick={() => onDeleteAllergy(allergy.id)}
                                className="text-neutral-400 hover:text-red-600 p-0.5 rounded"
                                title="Eliminar registro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="text-[11px] text-neutral-700 mt-1">
                              <strong>Síntoma:</strong> {allergy.reactionDescription}
                            </p>
                            <p className="text-[11px] text-neutral-700">
                              <strong>Protocolo:</strong> {allergy.emergencyProtocol}
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
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Condiciones & Notas Vitales</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs space-y-2">
                      {member.chronicConditions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {member.chronicConditions.map((cond, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-white border border-neutral-200 rounded text-neutral-800 font-medium"
                            >
                              {cond}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-neutral-500">Sin patologías crónicas declaradas.</div>
                      )}

                      {member.vitalNotes && (
                        <div className="pt-2 border-t border-neutral-200 text-neutral-700 italic">
                          "{member.vitalNotes}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                      <Heart className="w-4 h-4 text-rose-600" />
                      <span>Contactos de Emergencia</span>
                    </div>
                    <div className="space-y-1.5">
                      {member.emergencyContacts.map((contact, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-neutral-50 border border-neutral-200 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-neutral-900">{contact.name}</span>
                            <span className="text-neutral-500 text-[11px] ml-1">({contact.relation})</span>
                          </div>
                          <a
                            href={`tel:${contact.phone}`}
                            className="font-bold font-mono text-emerald-700 hover:underline"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-neutral-900">
              Editar Ficha: {editingMember.name}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
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
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">DNI / Documento</label>
                  <input
                    type="text"
                    value={editingMember.idNumber}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, idNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Obra Social / Prepaga</label>
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
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">N° de Afiliado</label>
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
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Notas Vitales / Antecedentes</label>
                <textarea
                  rows={3}
                  value={editingMember.vitalNotes || ''}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, vitalNotes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                onClick={() => setEditingMember(null)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onUpdateMember(editingMember);
                  setEditingMember(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
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
