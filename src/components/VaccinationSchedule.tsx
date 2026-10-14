import React, { useState } from 'react';
import { VaccineRecord, FamilyMember, VaccineStatus } from '../types/health';
import { formatDate } from '../utils/healthUtils';
import {
  Syringe,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Check,
  Building2,
  Hash,
} from 'lucide-react';

interface VaccinationScheduleProps {
  vaccines: VaccineRecord[];
  members: FamilyMember[];
  selectedMemberId: string | 'all';
  onUpdateVaccine: (vaccine: VaccineRecord) => void;
  onAddVaccine: () => void;
}

export const VaccinationSchedule: React.FC<VaccinationScheduleProps> = ({
  vaccines,
  members,
  selectedMemberId,
  onUpdateVaccine,
  onAddVaccine,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'applied'>('all');
  const [editingVaccine, setEditingVaccine] = useState<VaccineRecord | null>(null);
  const [applyDateInput, setApplyDateInput] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [lotInput, setLotInput] = useState<string>('');
  const [centerInput, setCenterInput] = useState<string>('');

  // Filter vaccines by member
  const memberVaccines = vaccines.filter(
    (v) => selectedMemberId === 'all' || v.memberId === selectedMemberId
  );

  // Filter by status
  const filteredVaccines = memberVaccines.filter((v) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'applied') return v.status === 'applied';
    if (statusFilter === 'pending') return v.status === 'due' || v.status === 'overdue' || v.status === 'upcoming';
    return true;
  });

  // Calculate statistics
  const totalCount = memberVaccines.length;
  const appliedCount = memberVaccines.filter((v) => v.status === 'applied').length;
  const pendingCount = memberVaccines.filter((v) => v.status === 'due' || v.status === 'overdue').length;
  const overdueCount = memberVaccines.filter((v) => v.status === 'overdue').length;
  const percentage = totalCount > 0 ? Math.round((appliedCount / totalCount) * 100) : 0;

  const handleOpenMarkApplied = (vac: VaccineRecord) => {
    setEditingVaccine(vac);
    setApplyDateInput(vac.applicationDate || new Date().toISOString().split('T')[0]);
    setLotInput(vac.lotNumber || '');
    setCenterInput(vac.healthCenter || 'Vacunatorio Oficial');
  };

  const handleSaveApplied = () => {
    if (!editingVaccine) return;
    const updated: VaccineRecord = {
      ...editingVaccine,
      status: 'applied',
      applicationDate: applyDateInput,
      lotNumber: lotInput.trim() || undefined,
      healthCenter: centerInput.trim() || undefined,
    };
    onUpdateVaccine(updated);
    setEditingVaccine(null);
  };

  const getStatusBadge = (status: VaccineStatus) => {
    switch (status) {
      case 'applied':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#287653] bg-[#EDF6F1] px-2 py-0.5 rounded-md border border-[#B8DDCB]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#287653]" />
            Aplicada
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B42332] bg-[#FDF1F2] px-2 py-0.5 rounded-md border border-[#F5B8BE]">
            <AlertCircle className="w-3.5 h-3.5 text-[#B42332]" />
            Atrasada / Urgente
          </span>
        );
      case 'due':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A570A] bg-[#FDF5E6] px-2 py-0.5 rounded-md border border-[#F4DF9B]">
            <Clock className="w-3.5 h-3.5 text-[#8A570A]" />
            En fecha de aplicación
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#796B59] bg-[#FFF9ED] border border-[#E9DCC4] px-2 py-0.5 rounded-md">
            <Clock className="w-3.5 h-3.5 text-[#D9A441]" />
            Próxima por edad
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-[#E9DCC4] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-[#B87932]" />
            <h2 className="text-lg font-bold text-[#493B2A]">
              Calendario Oficial de Vacunación
            </h2>
          </div>
          <p className="text-xs text-[#796B59] mt-0.5">
            Seguimiento de dosis del Calendario Nacional y vacunas especiales por edad
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
            <div className="text-right">
              <span className="text-[#796B59] block text-[11px] font-sans">Progreso</span>
              <span className="font-bold text-[#493B2A] text-sm">{percentage}%</span>
            </div>
            <div className="w-24 bg-[#FFF9ED] border border-[#E9DCC4] h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-[#287653] h-full rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-right pl-2 border-l border-[#E9DCC4]">
              <span className="text-[#796B59] block text-[11px] font-sans">Aplicadas</span>
              <span className="font-semibold text-[#287653]">
                {appliedCount} / {totalCount}
              </span>
            </div>
            {overdueCount > 0 && (
              <div className="text-right pl-2 border-l border-[#E9DCC4]">
                <span className="text-[#B42332] block text-[11px] font-sans">Atrasadas</span>
                <span className="font-bold text-[#B42332]">{overdueCount}</span>
              </div>
            )}
          </div>

          <button
            onClick={onAddVaccine}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#B87932] hover:bg-[#A06424] rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Agregar Vacuna</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[#FFF9ED] border border-[#E9DCC4] rounded-lg">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-[#493B2A] shadow-xs font-semibold'
                : 'text-[#796B59] hover:text-[#493B2A]'
            }`}
          >
            Todas ({memberVaccines.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'pending'
                ? 'bg-white text-[#493B2A] shadow-xs font-semibold'
                : 'text-[#796B59] hover:text-[#493B2A]'
            }`}
          >
            Pendientes / Próximas ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('applied')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'applied'
                ? 'bg-white text-[#493B2A] shadow-xs font-semibold'
                : 'text-[#796B59] hover:text-[#493B2A]'
            }`}
          >
            Aplicadas ({appliedCount})
          </button>
        </div>

        <div className="text-xs text-[#796B59] hidden sm:block">
          Mostrando {filteredVaccines.length} registros
        </div>
      </div>

      {/* Vaccines Table / List */}
      {filteredVaccines.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-[#E9DCC4]">
          <Syringe className="w-8 h-8 text-[#D9A441] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[#493B2A]">No hay vacunas en esta vista</h3>
          <p className="text-xs text-[#796B59] mt-1 max-w-sm mx-auto">
            Puedes cambiar el filtro de estado o seleccionar otro integrante de la familia.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E9DCC4] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E9DCC4] bg-[#FFF9ED] text-[11px] font-semibold text-[#796B59] uppercase tracking-wider">
                  <th className="py-3 px-4">Vacuna & Protección</th>
                  <th className="py-3 px-4">Para</th>
                  <th className="py-3 px-4">Edad Sugerida</th>
                  <th className="py-3 px-4">Dosis</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Aplicación / Lote</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DCC4]/50 text-xs">
                {filteredVaccines.map((vac) => {
                  const member = members.find((m) => m.id === vac.memberId);
                  const isApplied = vac.status === 'applied';

                  return (
                    <tr
                      key={vac.id}
                      className="hover:bg-[#FFF9ED]/60 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#493B2A]">{vac.vaccineName}</div>
                        <div className="text-[11px] text-[#796B59] mt-0.5">
                          Protege contra: {vac.diseaseTarget}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-[#493B2A]">
                          {member ? member.name.split(' ')[0] : 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#796B59]">
                        {vac.recommendedAge}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#796B59]">
                        {vac.doseNumber}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(vac.status)}
                      </td>
                      <td className="py-3 px-4 text-[#796B59]">
                        {isApplied ? (
                          <div>
                            <div className="font-mono tabular-nums text-[#493B2A] font-semibold">
                              {formatDate(vac.applicationDate || '')}
                            </div>
                            <div className="text-[11px] text-[#796B59] flex items-center gap-1.5 mt-0.5">
                              {vac.lotNumber && (
                                <span className="flex items-center gap-0.5 font-mono">
                                  <Hash className="w-3 h-3 text-[#D9A441]" />
                                  {vac.lotNumber}
                                </span>
                              )}
                              {vac.lotNumber && vac.healthCenter && <span>·</span>}
                              {vac.healthCenter && (
                                <span className="flex items-center gap-0.5 truncate max-w-[140px]">
                                  <Building2 className="w-3 h-3 text-[#D9A441]" />
                                  {vac.healthCenter}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[#796B59]/70 italic text-[11px]">
                            {vac.notes || 'Pendiente de aplicación'}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isApplied ? (
                          <button
                            onClick={() => handleOpenMarkApplied(vac)}
                            className="text-xs text-[#796B59] hover:text-[#493B2A] font-medium px-2 py-1 rounded hover:bg-[#FFF9ED] transition-colors"
                          >
                            Modificar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenMarkApplied(vac)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#287653] hover:text-[#1F5C40] bg-[#EDF6F1] hover:bg-[#DDF0E5] px-2.5 py-1 rounded-md border border-[#B8DDCB] transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Marcar Aplicada</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mark Applied Modal */}
      {editingVaccine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E9DCC4] shadow-2xl max-w-md w-full flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden">
            {/* Pinned Modal Header */}
            <div className="bg-[#493B2A] text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Registrar Aplicación de Vacuna
                </h3>
                <p className="text-xs text-[#E9DCC4] mt-0.5">
                  {editingVaccine.vaccineName} ({editingVaccine.doseNumber})
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingVaccine(null);
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
                <label className="block font-semibold text-[#493B2A] mb-1">
                  Fecha de Aplicación *
                </label>
                <input
                  type="date"
                  value={applyDateInput}
                  onChange={(e) => setApplyDateInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9DCC4] rounded-lg text-[#493B2A] bg-[#FFF9ED]/30 focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#493B2A] mb-1">
                  Número de Lote (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: VAC-2026-X8"
                  value={lotInput}
                  onChange={(e) => setLotInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9DCC4] rounded-lg text-[#493B2A] bg-[#FFF9ED]/30 focus:outline-none focus:ring-2 focus:ring-[#E9C46A] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#493B2A] mb-1">
                  Centro de Salud / Vacunatorio
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sanatorio de la Trinidad / Hospital Público"
                  value={centerInput}
                  onChange={(e) => setCenterInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9DCC4] rounded-lg text-[#493B2A] bg-[#FFF9ED]/30 focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                />
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="bg-[#FFF9ED] px-4 py-3 sm:px-6 sm:py-3.5 border-t border-[#E9DCC4] flex items-center justify-end gap-2.5 shrink-0 z-10 shadow-2xs">
              <button
                onClick={() => {
                  setEditingVaccine(null);
                  scrollToTop();
                }}
                className="px-4 py-2 text-xs font-semibold text-[#796B59] hover:text-[#493B2A] hover:bg-white rounded-lg border border-transparent hover:border-[#E9DCC4] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleSaveApplied();
                  scrollToTop();
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#287653] hover:bg-[#1F5C40] rounded-lg transition-colors shadow-xs"
              >
                Guardar en Libreta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
