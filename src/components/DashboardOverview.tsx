import React, { useState } from 'react';
import {
  FamilyMember,
  VaccineRecord,
  MedicineItem,
  MedicalAppointment,
  AllergyRecord,
  PrescriptionRecord,
} from '../types/health';
import { formatAge, formatDate, formatDateTime, getMedicineExpiryInfo } from '../utils/healthUtils';
import {
  ShieldAlert,
  AlertTriangle,
  Calendar,
  Syringe,
  Pill,
  Share2,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  HeartPulse,
  Download,
  RotateCcw,
} from 'lucide-react';

interface DashboardOverviewProps {
  members: FamilyMember[];
  vaccines: VaccineRecord[];
  medicines: MedicineItem[];
  appointments: MedicalAppointment[];
  allergies: AllergyRecord[];
  prescriptions: PrescriptionRecord[];
  onSelectTab: (tab: string) => void;
  onSelectMember: (id: string | 'all') => void;
  onOpenEmergencySOS: () => void;
  onOpenShare: () => void;
  onResetData: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  members,
  vaccines,
  medicines,
  appointments,
  allergies,
  prescriptions,
  onSelectTab,
  onSelectMember,
  onOpenEmergencySOS,
  onOpenShare,
  onResetData,
}) => {
  const [globalSearch, setGlobalSearch] = useState('');

  // Critical alerts calculation
  const severeAllergies = allergies.filter((a) => a.severity.toLowerCase().includes('severa'));
  const overdueVaccines = vaccines.filter((v) => v.status === 'overdue');
  const upcomingAppointments = appointments
    .filter((a) => a.status === 'scheduled')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const medicinesWithExpiry = medicines.map((m) => ({
    ...m,
    expiryInfo: getMedicineExpiryInfo(m.expiryDate),
  }));
  const expiredMeds = medicinesWithExpiry.filter((m) => m.expiryInfo.status === 'expired');
  const warningMeds = medicinesWithExpiry.filter((m) => m.expiryInfo.status === 'expiring_soon');

  // Global search filtering
  const searchResults = globalSearch.trim()
    ? {
        members: members.filter(
          (m) =>
            m.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
            m.bloodType.toLowerCase().includes(globalSearch.toLowerCase())
        ),
        medicines: medicines.filter(
          (m) =>
            m.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
            m.activeIngredient.toLowerCase().includes(globalSearch.toLowerCase()) ||
            m.location.toLowerCase().includes(globalSearch.toLowerCase())
        ),
        vaccines: vaccines.filter(
          (v) =>
            v.vaccineName.toLowerCase().includes(globalSearch.toLowerCase()) ||
            v.diseaseTarget.toLowerCase().includes(globalSearch.toLowerCase())
        ),
        appointments: appointments.filter(
          (a) =>
            a.specialty.toLowerCase().includes(globalSearch.toLowerCase()) ||
            a.doctorName.toLowerCase().includes(globalSearch.toLowerCase()) ||
            a.reason.toLowerCase().includes(globalSearch.toLowerCase())
        ),
      }
    : null;

  const handleExportBackup = () => {
    const backupData = {
      app: 'SaludFamiliar',
      exportedAt: new Date().toISOString(),
      members,
      vaccines,
      medicines,
      appointments,
      allergies,
      prescriptions,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SaludFamiliar_Respaldo_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Quick SOS Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <HeartPulse className="w-4 h-4" />
            <span>Libreta Médica Familiar Centralizada</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Familia Rossi Gómez
          </h1>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {members.length} integrantes registrados · Esquemas de vacunación al día, botiquín doméstico controlado y fichas médicas preparadas para emergencias o cuidadores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenEmergencySOS}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-900/30 whitespace-nowrap"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Ficha SOS de Emergencia</span>
          </button>
          <button
            onClick={onOpenShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all backdrop-blur-xs whitespace-nowrap"
          >
            <Share2 className="w-4 h-4 text-neutral-300" />
            <span>Compartir con Cuidador</span>
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar medicamentos, vacunas, turnos, alergias o integrantes en toda la libreta..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
        {globalSearch && (
          <button
            onClick={() => setGlobalSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Search results popup if active */}
      {searchResults && (
        <div className="p-4 rounded-xl bg-white border border-emerald-300 shadow-md space-y-3">
          <div className="text-xs font-bold text-neutral-800">
            Resultados de búsqueda para "{globalSearch}":
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Meds */}
            <div className="p-3 bg-neutral-50 rounded-lg">
              <span className="font-semibold text-neutral-700 block mb-1">
                Medicamentos ({searchResults.medicines.length})
              </span>
              {searchResults.medicines.map((m) => (
                <div key={m.id} className="text-[11px] text-neutral-600 truncate">
                  • {m.name} ({m.location})
                </div>
              ))}
            </div>

            {/* Vaccines */}
            <div className="p-3 bg-neutral-50 rounded-lg">
              <span className="font-semibold text-neutral-700 block mb-1">
                Vacunas ({searchResults.vaccines.length})
              </span>
              {searchResults.vaccines.map((v) => (
                <div key={v.id} className="text-[11px] text-neutral-600 truncate">
                  • {v.vaccineName} ({v.recommendedAge})
                </div>
              ))}
            </div>

            {/* Turnos */}
            <div className="p-3 bg-neutral-50 rounded-lg">
              <span className="font-semibold text-neutral-700 block mb-1">
                Turnos ({searchResults.appointments.length})
              </span>
              {searchResults.appointments.map((a) => (
                <div key={a.id} className="text-[11px] text-neutral-600 truncate">
                  • {a.specialty} ({a.doctorName})
                </div>
              ))}
            </div>

            {/* Integrantes */}
            <div className="p-3 bg-neutral-50 rounded-lg">
              <span className="font-semibold text-neutral-700 block mb-1">
                Familiares ({searchResults.members.length})
              </span>
              {searchResults.members.map((m) => (
                <div key={m.id} className="text-[11px] text-neutral-600 truncate">
                  • {m.name} ({m.bloodType})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Critical Health Alerts Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Alergias Críticas */}
        <div className="p-4 rounded-xl border border-red-200 bg-red-50/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-800 uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Alergias Severas Declaradas</span>
            </div>
            <div className="space-y-1.5 text-xs text-red-950">
              {severeAllergies.map((a) => {
                const member = members.find((m) => m.id === a.memberId);
                return (
                  <div key={a.id} className="bg-white/80 p-2 rounded border border-red-200">
                    <div className="font-bold">
                      {member?.name.split(' ')[0]}: {a.allergen}
                    </div>
                    <div className="text-[11px] text-red-800 mt-0.5">
                      {a.reactionDescription}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => onSelectTab('perfiles')}
            className="mt-3 text-xs font-semibold text-red-700 hover:text-red-900 inline-flex items-center gap-1"
          >
            <span>Ver protocolos de emergencia</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Botiquín & Vencimientos */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
              <Pill className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Estado del Botiquín</span>
            </div>
            <div className="space-y-2 text-xs">
              {expiredMeds.length > 0 ? (
                <div className="p-2 bg-red-50 text-red-900 rounded border border-red-200">
                  <span className="font-bold">
                    {expiredMeds.length} medicamento vencido:
                  </span>{' '}
                  {expiredMeds.map((m) => m.name).join(', ')}
                </div>
              ) : (
                <div className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sin medicamentos vencidos</span>
                </div>
              )}

              {warningMeds.length > 0 && (
                <div className="p-2 bg-amber-50 text-amber-900 rounded border border-amber-200">
                  <span className="font-bold">Por vencer pronto:</span>{' '}
                  {warningMeds.map((m) => m.name).join(', ')}
                </div>
              )}

              <div className="text-[11px] text-neutral-500 pt-1">
                Total de fármacos e insumos registrados: {medicines.length} unidades
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('botiquin')}
            className="mt-3 text-xs font-semibold text-neutral-900 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            <span>Administrar botiquín</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. Vacunas & Próximos Turnos */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Agenda Médica Inmediata</span>
            </div>
            <div className="space-y-2 text-xs">
              {upcomingAppointments.length > 0 ? (
                <div className="p-2.5 bg-neutral-50 rounded border border-neutral-100">
                  <div className="font-bold text-neutral-900">
                    {upcomingAppointments[0].specialty} · {upcomingAppointments[0].doctorName}
                  </div>
                  <div className="text-[11px] text-neutral-600 mt-0.5">
                    {formatDateTime(upcomingAppointments[0].dateTime)}
                  </div>
                </div>
              ) : (
                <div className="text-neutral-500">No hay turnos próximos programados.</div>
              )}

              {overdueVaccines.length > 0 && (
                <div className="p-2 bg-rose-50 text-rose-900 rounded border border-rose-200 text-[11px]">
                  <strong>Vacuna atrasada:</strong> {overdueVaccines[0].vaccineName} ({members.find(m => m.id === overdueVaccines[0].memberId)?.name.split(' ')[0]})
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => onSelectTab('turnos-recetas')}
            className="mt-3 text-xs font-semibold text-neutral-900 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            <span>Ver agenda y recetas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Family Members Cards Overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
            Integrantes de la Familia
          </h3>
          <span className="text-xs text-neutral-500">
            Haz clic en un integrante para ver su ficha específica
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {members.map((member) => {
            const memberVaccines = vaccines.filter((v) => v.memberId === member.id);
            const appliedVac = memberVaccines.filter((v) => v.status === 'applied').length;
            const memberAllergies = allergies.filter((a) => a.memberId === member.id);
            const nextApt = appointments.find(
              (a) => a.memberId === member.id && a.status === 'scheduled'
            );

            return (
              <div
                key={member.id}
                onClick={() => {
                  onSelectMember(member.id);
                  onSelectTab('perfiles');
                }}
                className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 mb-3 mx-auto">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-sm text-neutral-600">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h4 className="font-bold text-xs text-neutral-900 truncate">
                      {member.name}
                    </h4>
                    <div className="text-[11px] text-neutral-500">
                      {member.relationship} · {formatAge(member.birthDate)}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-neutral-100 text-[11px] space-y-1 text-neutral-600">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Grupo:</span>
                      <span className="font-mono font-bold text-rose-600">
                        {member.bloodType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Vacunas:</span>
                      <span className="font-mono tabular-nums">
                        {appliedVac}/{memberVaccines.length}
                      </span>
                    </div>
                    {memberAllergies.length > 0 && (
                      <div className="flex justify-between text-rose-700">
                        <span>Alergias:</span>
                        <span className="font-bold">{memberAllergies.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 text-center text-[10px] text-emerald-700 font-semibold border-t border-neutral-50">
                  Ver Ficha Clínica →
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Utility Actions: Backup and Data Safety */}
      <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
        <div>
          <strong>Respaldo de Seguridad:</strong> Puedes descargar una copia completa de las fichas familiares o restaurar datos de demostración.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-800 hover:bg-neutral-50 transition-colors font-medium shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Respaldo JSON</span>
          </button>
          <button
            onClick={onResetData}
            className="flex items-center gap-1 px-3 py-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg transition-colors"
            title="Restaurar datos predeterminados de la familia"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
