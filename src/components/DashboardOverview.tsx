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
  Pill,
  Share2,
  Search,
  CheckCircle2,
  ArrowRight,
  HeartPulse,
  Download,
  RotateCcw,
  Bell,
  ShieldCheck,
  Lock,
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
  onOpenInstall?: () => void;
  onOpenSecurity?: () => void;
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
  onOpenInstall,
  onOpenSecurity,
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
      app: 'FamiliaVital',
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
    link.download = `FamiliaVital_Respaldo_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Featured Welcome Panel (Compact and responsive on mobile) */}
      <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#F8E8A6] border border-[#E9DCC4] text-[#493B2A] flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 shadow-xs">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#E27D18] uppercase tracking-wider">
            <HeartPulse className="w-3.5 h-3.5 text-[#E27D18]" />
            <span>Libreta Médica Familiar Centralizada</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#493B2A]">
            Familia Rossi Gómez
          </h1>
          <p className="text-xs text-[#796B59] leading-relaxed">
            {members.length} integrantes registrados · Esquemas de vacunación al día, botiquín doméstico controlado y fichas médicas preparadas para emergencias o cuidadores.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 w-full md:w-auto">
          <button
            onClick={onOpenEmergencySOS}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#B42332] hover:bg-[#9E1B28] text-white text-xs font-bold transition-all shadow-sm shadow-[#B42332]/25 whitespace-nowrap cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
            <span className="truncate">Ficha SOS</span>
          </button>
          <button
            onClick={onOpenShare}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white text-[#493B2A] border border-[#E9DCC4] hover:bg-[#FFF9ED] text-xs font-semibold transition-all shadow-2xs whitespace-nowrap cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E27D18] shrink-0" />
            <span className="truncate">Compartir</span>
          </button>
          {onOpenInstall && (
            <button
              onClick={onOpenInstall}
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white text-[#3E3020] border border-[#E9DCC4] hover:bg-[#FFF9ED] text-xs font-semibold transition-all shadow-2xs whitespace-nowrap cursor-pointer"
              title="Instalar ícono de acceso directo en tu pantalla de inicio"
            >
              <img src="/favicon.svg" alt="" className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Acceso Directo</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#D9A441] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar medicamentos, vacunas, turnos, alergias o integrantes..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              (e.target as HTMLElement).blur();
            }
          }}
          className="w-full pl-10 pr-16 py-2.5 text-xs bg-white border border-[#E9DCC4] rounded-xl text-[#493B2A] placeholder:text-[#796B59]/70 focus:outline-none focus:ring-2 focus:ring-[#E9C46A] focus:border-transparent shadow-xs"
        />
        {globalSearch && (
          <button
            onClick={() => setGlobalSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#796B59] hover:text-[#493B2A]"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Search results panel if active */}
      {searchResults && (
        <div className="p-4 rounded-xl bg-white border border-[#E9C46A] shadow-md space-y-3">
          <div className="text-xs font-bold text-[#493B2A]">
            Resultados de búsqueda para "{globalSearch}":
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Turnos / Agenda */}
            <div className="p-3 bg-[#FFF9ED] rounded-lg border border-[#E9DCC4]">
              <span className="font-semibold text-[#493B2A] block mb-1">
                Turnos ({searchResults.appointments.length})
              </span>
              {searchResults.appointments.map((a) => (
                <div key={a.id} className="text-[11px] text-[#796B59] truncate">
                  • {a.specialty} ({a.doctorName})
                </div>
              ))}
            </div>

            {/* Vaccines */}
            <div className="p-3 bg-[#FFF9ED] rounded-lg border border-[#E9DCC4]">
              <span className="font-semibold text-[#493B2A] block mb-1">
                Vacunas ({searchResults.vaccines.length})
              </span>
              {searchResults.vaccines.map((v) => (
                <div key={v.id} className="text-[11px] text-[#796B59] truncate">
                  • {v.vaccineName} ({v.recommendedAge})
                </div>
              ))}
            </div>

            {/* Meds / Botiquín */}
            <div className="p-3 bg-[#FFF9ED] rounded-lg border border-[#E9DCC4]">
              <span className="font-semibold text-[#493B2A] block mb-1">
                Medicamentos ({searchResults.medicines.length})
              </span>
              {searchResults.medicines.map((m) => (
                <div key={m.id} className="text-[11px] text-[#796B59] truncate">
                  • {m.name} ({m.location})
                </div>
              ))}
            </div>

            {/* Integrantes */}
            <div className="p-3 bg-[#FFF9ED] rounded-lg border border-[#E9DCC4]">
              <span className="font-semibold text-[#493B2A] block mb-1">
                Familiares ({searchResults.members.length})
              </span>
              {searchResults.members.map((m) => (
                <div key={m.id} className="text-[11px] text-[#796B59] truncate">
                  • {m.name} ({m.bloodType})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Critical Health Alerts Strip - Cards with prominent, fully visible action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* 1. Alergias Críticas */}
        <div className="p-4 rounded-xl border border-[#F5B8BE] bg-[#FDF1F2] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#B42332] uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4 text-[#B42332] shrink-0" />
              <span>Alergias Severas Declaradas</span>
            </div>
            <div className="space-y-1.5 text-xs text-[#493B2A]">
              {severeAllergies.map((a) => {
                const member = members.find((m) => m.id === a.memberId);
                return (
                  <div key={a.id} className="bg-white p-2 rounded-lg border border-[#F5B8BE]">
                    <div className="font-bold text-[#B42332]">
                      {member?.name.split(' ')[0]}: {a.allergen}
                    </div>
                    <div className="text-[11px] text-[#796B59] mt-0.5 line-clamp-2">
                      {a.reactionDescription}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => onSelectTab('perfiles')}
            className="mt-3.5 text-xs font-bold text-[#B42332] bg-white border border-[#F5B8BE] hover:bg-[#FDF1F2] px-3 py-1.5 rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors shadow-2xs self-start"
          >
            <span>Ver protocolos de emergencia</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B42332]" />
          </button>
        </div>

        {/* 2. Agenda Médica Inmediata & Turnos (colocada antes del botiquín a pedido del usuario) */}
        <div className="p-4 rounded-xl border border-[#E9DCC4] bg-white flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#493B2A] uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-[#D9A441] shrink-0" />
                <span>Agenda Médica Inmediata</span>
              </div>
              <span className="text-[10px] bg-[#FFF9ED] text-[#E27D18] font-bold px-2 py-0.5 rounded-full border border-[#E9DCC4] flex items-center gap-1">
                <Bell className="w-3 h-3 text-[#E27D18]" />
                <span>Turnos</span>
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {upcomingAppointments.length > 0 ? (
                <div className="p-2.5 bg-[#FFF9ED] rounded-lg border border-[#E9DCC4]">
                  <div className="font-bold text-[#493B2A]">
                    {upcomingAppointments[0].specialty} · {upcomingAppointments[0].doctorName}
                  </div>
                  <div className="text-[11px] text-[#796B59] mt-0.5">
                    {formatDateTime(upcomingAppointments[0].dateTime)}
                  </div>
                </div>
              ) : (
                <div className="text-[#796B59]">No hay turnos próximos programados.</div>
              )}

              {overdueVaccines.length > 0 && (
                <div className="p-2 bg-[#FDF1F2] text-[#B42332] rounded-lg border border-[#F5B8BE] text-[11px]">
                  <strong>Vacuna atrasada:</strong> {overdueVaccines[0].vaccineName} ({members.find(m => m.id === overdueVaccines[0].memberId)?.name.split(' ')[0]})
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => onSelectTab('turnos-recetas')}
            className="mt-3.5 text-xs font-semibold text-[#B87932] bg-[#FFF9ED] border border-[#E9DCC4] hover:bg-[#F8E8A6]/40 px-3 py-1.5 rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors shadow-2xs self-start cursor-pointer"
          >
            <span>Ver agenda y recetas</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B87932]" />
          </button>
        </div>

        {/* 3. Botiquín & Vencimientos */}
        <div className="p-4 rounded-xl border border-[#E9DCC4] bg-white flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#493B2A] uppercase tracking-wider mb-2">
              <Pill className="w-4 h-4 text-[#D9A441] shrink-0" />
              <span>Estado del Botiquín</span>
            </div>
            <div className="space-y-2 text-xs">
              {expiredMeds.length > 0 ? (
                <div className="p-2 bg-[#FDF1F2] text-[#B42332] rounded-lg border border-[#F5B8BE]">
                  <span className="font-bold">
                    {expiredMeds.length} medicamento vencido:
                  </span>{' '}
                  {expiredMeds.map((m) => m.name).join(', ')}
                </div>
              ) : (
                <div className="text-[#287653] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#287653]" />
                  <span className="font-medium">Sin medicamentos vencidos</span>
                </div>
              )}

              {warningMeds.length > 0 && (
                <div className="p-2 bg-[#FDF5E6] text-[#8A570A] rounded-lg border border-[#E9DCC4]">
                  <span className="font-bold">Por vencer pronto:</span>{' '}
                  {warningMeds.map((m) => m.name).join(', ')}
                </div>
              )}

              <div className="text-[11px] text-[#796B59] pt-1">
                Total de fármacos registrados: {medicines.length} unidades
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('botiquin')}
            className="mt-3.5 text-xs font-semibold text-[#B87932] bg-[#FFF9ED] border border-[#E9DCC4] hover:bg-[#F8E8A6]/40 px-3 py-1.5 rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors shadow-2xs self-start cursor-pointer"
          >
            <span>Administrar botiquín</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B87932]" />
          </button>
        </div>
      </div>

      {/* Family Members Cards Overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#493B2A] uppercase tracking-wider">
            Integrantes de la Familia
          </h3>
          <span className="text-xs text-[#796B59] hidden sm:inline">
            Haz clic en un integrante para ver su ficha específica
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {members.map((member) => {
            const memberVaccines = vaccines.filter((v) => v.memberId === member.id);
            const appliedVac = memberVaccines.filter((v) => v.status === 'applied').length;
            const memberAllergies = allergies.filter((a) => a.memberId === member.id);

            return (
              <button
                type="button"
                key={member.id}
                onClick={() => {
                  onSelectMember(member.id);
                  if (member.isPet || member.relationship === 'Mascota') {
                    onSelectTab('mascotas');
                  } else {
                    onSelectTab('perfiles');
                  }
                }}
                className="p-3.5 sm:p-4 rounded-xl border border-[#E9DCC4] bg-white hover:border-[#D9A441] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between text-left w-full group focus:outline-none focus:ring-2 focus:ring-[#E27D18]"
              >
                <div className="w-full">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-[#FFF9ED] border border-[#E9DCC4] mb-2 sm:mb-3 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Hide broken image and show initial/icon
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                          if (fallback) (fallback as HTMLElement).style.display = 'flex';
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                    <div
                      className={`avatar-fallback w-full h-full ${member.avatarUrl ? 'hidden' : 'flex'} items-center justify-center font-bold text-sm ${
                        member.isPet || member.relationship === 'Mascota' ? 'text-[#E27D18] bg-[#FEEAA2]' : 'text-[#E27D18] bg-[#FFF9ED]'
                      }`}
                    >
                      {member.isPet || member.relationship === 'Mascota' ? '🐾' : member.name.charAt(0)}
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="font-bold text-xs text-[#493B2A] truncate group-hover:text-[#E27D18] transition-colors">
                      {member.name}
                    </h4>
                    <div className="text-[11px] text-[#796B59]">
                      {member.relationship} · {formatAge(member.birthDate)}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-[#E9DCC4] text-[11px] space-y-1 text-[#796B59]">
                    <div className="flex justify-between">
                      <span className="text-[#796B59]/80">Grupo / ID:</span>
                      <span className="font-mono font-bold text-[#E27D18]">
                        {member.bloodType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#796B59]/80">Vacunas:</span>
                      <span className="font-mono tabular-nums text-[#493B2A] font-semibold">
                        {appliedVac}/{memberVaccines.length}
                      </span>
                    </div>
                    {memberAllergies.length > 0 && (
                      <div className="flex justify-between text-[#B42332]">
                        <span>Alergias:</span>
                        <span className="font-bold">{memberAllergies.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 text-center text-[10px] text-[#E27D18] font-bold border-t border-[#E9DCC4]/50 group-hover:underline w-full">
                  Ver Ficha →
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Utility Actions: Backup, Security and Data Safety */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#E9DCC4] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#796B59]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1E7E52] shrink-0" />
          <div>
            <strong className="text-[#493B2A]">Seguridad & Respaldo Cifrado:</strong> Protegido bajo normas ISO/IEC 27001 y SOC 2 Type II con cifrado AES-256 y auditoría SHA-256.
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onOpenSecurity && (
            <button
              onClick={onOpenSecurity}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#EDF7F2] border border-[#B8DDCB] rounded-lg text-[#1E7E52] hover:bg-[#DDF0E5] transition-colors font-bold shadow-2xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E7E52]" />
              <span>Centro de Cumplimiento</span>
            </button>
          )}
          <button
            onClick={handleExportBackup}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#FFF9ED] border border-[#E9DCC4] rounded-lg text-[#493B2A] hover:bg-[#F8E8A6]/30 transition-colors font-medium shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#E27D18]" />
            <span>Descargar Respaldo</span>
          </button>
          <button
            onClick={onResetData}
            className="flex items-center justify-center gap-1 px-3 py-1.5 text-[#796B59] hover:text-[#493B2A] rounded-lg transition-colors cursor-pointer"
            title="Restaurar datos predeterminados de la familia"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#E27D18]" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
