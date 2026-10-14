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
  Filter,
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
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Aplicada
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Atrasada / Urgente
          </span>
        );
      case 'due':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            En fecha de aplicación
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            Próxima por edad
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-neutral-900">
              Calendario Oficial de Vacunación
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Seguimiento de dosis del Calendario Nacional y vacunas especiales por edad
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
            <div className="text-right">
              <span className="text-neutral-500 block text-[11px] font-sans">Progreso</span>
              <span className="font-bold text-neutral-900 text-sm">{percentage}%</span>
            </div>
            <div className="w-24 bg-neutral-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-right pl-2 border-l border-neutral-200">
              <span className="text-neutral-500 block text-[11px] font-sans">Aplicadas</span>
              <span className="font-semibold text-emerald-700">
                {appliedCount} / {totalCount}
              </span>
            </div>
            {overdueCount > 0 && (
              <div className="text-right pl-2 border-l border-neutral-200">
                <span className="text-rose-600 block text-[11px] font-sans">Atrasadas</span>
                <span className="font-bold text-rose-700">{overdueCount}</span>
              </div>
            )}
          </div>

          <button
            onClick={onAddVaccine}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Vacuna</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Todas ({memberVaccines.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'pending'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Pendientes / Próximas ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('applied')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'applied'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Aplicadas ({appliedCount})
          </button>
        </div>

        <div className="text-xs text-neutral-500 hidden sm:block">
          Mostrando {filteredVaccines.length} registros
        </div>
      </div>

      {/* Vaccines Table / List */}
      {filteredVaccines.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-neutral-200">
          <Syringe className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-neutral-800">No hay vacunas en esta vista</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Puedes cambiar el filtro de estado o seleccionar otro integrante de la familia.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Vacuna & Protección</th>
                  <th className="py-3 px-4">Para</th>
                  <th className="py-3 px-4">Edad Sugerida</th>
                  <th className="py-3 px-4">Dosis</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Aplicación / Lote</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredVaccines.map((vac) => {
                  const member = members.find((m) => m.id === vac.memberId);
                  const isApplied = vac.status === 'applied';

                  return (
                    <tr
                      key={vac.id}
                      className="hover:bg-neutral-50/80 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{vac.vaccineName}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Protege contra: {vac.diseaseTarget}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-neutral-800">
                          {member ? member.name.split(' ')[0] : 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-700">
                        {vac.recommendedAge}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-700">
                        {vac.doseNumber}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(vac.status)}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {isApplied ? (
                          <div>
                            <div className="font-mono tabular-nums text-neutral-900 font-medium">
                              {formatDate(vac.applicationDate || '')}
                            </div>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                              {vac.lotNumber && (
                                <span className="flex items-center gap-0.5 font-mono">
                                  <Hash className="w-3 h-3 text-neutral-400" />
                                  {vac.lotNumber}
                                </span>
                              )}
                              {vac.lotNumber && vac.healthCenter && <span>·</span>}
                              {vac.healthCenter && (
                                <span className="flex items-center gap-0.5 truncate max-w-[140px]">
                                  <Building2 className="w-3 h-3 text-neutral-400" />
                                  {vac.healthCenter}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-neutral-400 italic text-[11px]">
                            {vac.notes || 'Pendiente de aplicación'}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isApplied ? (
                          <button
                            onClick={() => handleOpenMarkApplied(vac)}
                            className="text-xs text-neutral-600 hover:text-neutral-900 font-medium px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
                          >
                            Modificar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenMarkApplied(vac)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Registrar Aplicación de Vacuna
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {editingVaccine.vaccineName} ({editingVaccine.doseNumber})
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Fecha de Aplicación *
                </label>
                <input
                  type="date"
                  value={applyDateInput}
                  onChange={(e) => setApplyDateInput(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Número de Lote (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: VAC-2026-X8"
                  value={lotInput}
                  onChange={(e) => setLotInput(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Centro de Salud / Vacunatorio
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sanatorio de la Trinidad / Hospital Público"
                  value={centerInput}
                  onChange={(e) => setCenterInput(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                onClick={() => setEditingVaccine(null)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveApplied}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
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
