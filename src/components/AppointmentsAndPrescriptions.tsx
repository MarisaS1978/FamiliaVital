import React, { useState } from 'react';
import {
  MedicalAppointment,
  PrescriptionRecord,
  FamilyMember,
} from '../types/health';
import {
  formatDate,
  formatDateTime,
  downloadCalendarEvent,
} from '../utils/healthUtils';
import {
  Calendar,
  FileText,
  Clock,
  MapPin,
  User,
  Plus,
  CheckCircle2,
  CalendarPlus,
  Eye,
  FileCheck,
  Check,
  AlertCircle,
} from 'lucide-react';

interface AppointmentsAndPrescriptionsProps {
  appointments: MedicalAppointment[];
  prescriptions: PrescriptionRecord[];
  members: FamilyMember[];
  selectedMemberId: string | 'all';
  onUpdateAppointment: (apt: MedicalAppointment) => void;
  onUpdatePrescription: (rx: PrescriptionRecord) => void;
  onAddAppointment: () => void;
  onAddPrescription: () => void;
}

export const AppointmentsAndPrescriptions: React.FC<AppointmentsAndPrescriptionsProps> = ({
  appointments,
  prescriptions,
  members,
  selectedMemberId,
  onUpdateAppointment,
  onUpdatePrescription,
  onAddAppointment,
  onAddPrescription,
}) => {
  const [activeSection, setActiveSection] = useState<'appointments' | 'prescriptions'>('appointments');
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionRecord | null>(null);

  // Filter by selected member
  const filteredAppointments = appointments.filter(
    (a) => selectedMemberId === 'all' || a.memberId === selectedMemberId
  );
  const filteredPrescriptions = prescriptions.filter(
    (p) => selectedMemberId === 'all' || p.memberId === selectedMemberId
  );

  const upcomingAppointments = filteredAppointments.filter((a) => a.status === 'scheduled');
  const pastAppointments = filteredAppointments.filter((a) => a.status !== 'scheduled');

  const handleToggleComplete = (apt: MedicalAppointment) => {
    const newStatus = apt.status === 'scheduled' ? 'completed' : 'scheduled';
    onUpdateAppointment({ ...apt, status: newStatus });
  };

  const handleExportICS = (apt: MedicalAppointment) => {
    const member = members.find((m) => m.id === apt.memberId);
    const title = `Turno: ${apt.specialty} - ${member ? member.name.split(' ')[0] : 'Salud'}`;
    const desc = `Consulta con ${apt.doctorName}.\nMotivo: ${apt.reason}\nPreparación: ${apt.preparationNotes || 'Ninguna'}`;
    downloadCalendarEvent(title, desc, apt.clinicAddress, apt.dateTime);
  };

  const handleTogglePrescriptionStatus = (rx: PrescriptionRecord) => {
    const newStatus = rx.status === 'Vigente' ? 'Utilizada en farmacia' : 'Vigente';
    onUpdatePrescription({ ...rx, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Section Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-[#E9DCC4] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#493B2A]">
            Agenda Médica y Documentación Digital
          </h2>
          <p className="text-xs text-[#796B59] mt-0.5">
            Turnos programados, preparación previa, recetas de farmacia y certificados de aptitud
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSection === 'appointments' ? (
            <button
              onClick={onAddAppointment}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#B87932] hover:bg-[#A06424] rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Agendar Turno</span>
            </button>
          ) : (
            <button
              onClick={onAddPrescription}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#B87932] hover:bg-[#A06424] rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Subir Receta / Estudio</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Switcher between Appointments & Prescriptions */}
      <div className="flex items-center gap-2 p-1 bg-[#FFF9ED] border border-[#E9DCC4] rounded-lg w-fit">
        <button
          onClick={() => setActiveSection('appointments')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            activeSection === 'appointments'
              ? 'bg-white text-[#493B2A] shadow-xs'
              : 'text-[#796B59] hover:text-[#493B2A]'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#D9A441]" />
          <span>Turnos Médicos ({upcomingAppointments.length} próximos)</span>
        </button>
        <button
          onClick={() => setActiveSection('prescriptions')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            activeSection === 'prescriptions'
              ? 'bg-white text-[#493B2A] shadow-xs'
              : 'text-[#796B59] hover:text-[#493B2A]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#D9A441]" />
          <span>Recetas y Estudios ({filteredPrescriptions.length})</span>
        </button>
      </div>

      {/* SECTION 1: APPOINTMENTS */}
      {activeSection === 'appointments' && (
        <div className="space-y-6">
          {/* Upcoming appointments */}
          <div>
            <h3 className="text-xs font-bold text-[#493B2A] uppercase tracking-wider mb-3">
              Próximos Turnos Programados
            </h3>

            {upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-[#E9DCC4]">
                <Calendar className="w-8 h-8 text-[#D9A441] mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-[#493B2A]">
                  No hay turnos próximos programados
                </h4>
                <p className="text-xs text-[#796B59] mt-1">
                  Mantén al día los controles médicos anuales y visitas pediátricas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingAppointments.map((apt) => {
                  const member = members.find((m) => m.id === apt.memberId);

                  return (
                    <div
                      key={apt.id}
                      className="p-5 rounded-xl border border-[#E9DCC4] bg-white hover:border-[#D9A441] transition-all flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        {/* Header: Specialty & Member */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[11px] font-bold text-[#B87932] uppercase tracking-wider">
                              {apt.specialty}
                            </span>
                            <h4 className="text-base font-bold text-[#493B2A] mt-0.5">
                              {apt.doctorName}
                            </h4>
                          </div>
                          {member && (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-[#FFF9ED] border border-[#E9DCC4] rounded text-[#493B2A]">
                              {member.name.split(' ')[0]}
                            </span>
                          )}
                        </div>

                        {/* Date and Clinic Info */}
                        <div className="space-y-1.5 text-xs text-[#796B59] my-3">
                          <div className="flex items-center gap-2 font-mono font-semibold text-[#493B2A]">
                            <Clock className="w-3.5 h-3.5 text-[#D9A441]" />
                            <span>{formatDateTime(apt.dateTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#796B59]">
                            <MapPin className="w-3.5 h-3.5 text-[#D9A441] shrink-0" />
                            <span className="truncate">{apt.clinicAddress}</span>
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="text-xs text-[#493B2A] bg-[#FFF9ED] p-2.5 rounded-lg border border-[#E9DCC4] mb-3">
                          <div className="font-semibold text-[#493B2A] mb-0.5">Motivo de consulta:</div>
                          {apt.reason}
                        </div>

                        {/* Preparation instructions */}
                        {apt.preparationNotes && (
                          <div className="text-[11px] text-[#8A570A] bg-[#FDF5E6] p-2.5 rounded-lg border border-[#F4DF9B] mb-2 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-[#8A570A] shrink-0 mt-0.5" />
                            <div>
                              <strong>Preparación:</strong> {apt.preparationNotes}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card actions */}
                      <div className="mt-4 pt-3 border-t border-[#E9DCC4] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleExportICS(apt)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#493B2A] hover:text-[#B87932] bg-[#FFF9ED] hover:bg-[#F8E8A6]/40 border border-[#E9DCC4] px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                          title="Descargar archivo .ics para Google Calendar / Apple"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-[#B87932]" />
                          <span>Añadir a Calendario</span>
                        </button>

                        <button
                          onClick={() => handleToggleComplete(apt)}
                          className="flex items-center gap-1 text-xs font-semibold text-[#287653] bg-[#EDF6F1] hover:bg-[#DDF0E5] px-3 py-1.5 rounded-lg border border-[#B8DDCB] transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Marcar Realizado</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past / Completed Consultations */}
          {pastAppointments.length > 0 && (
            <div className="pt-4 border-t border-[#E9DCC4]">
              <h3 className="text-xs font-bold text-[#796B59] uppercase tracking-wider mb-3">
                Historial de Consultas Realizadas
              </h3>
              <div className="bg-white rounded-xl border border-[#E9DCC4] divide-y divide-[#E9DCC4]/50 overflow-hidden">
                {pastAppointments.map((apt) => {
                  const member = members.find((m) => m.id === apt.memberId);
                  return (
                    <div key={apt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#287653] shrink-0" />
                          <span className="font-bold text-[#493B2A]">{apt.specialty}</span>
                          <span className="text-[#796B59]">· {apt.doctorName}</span>
                          {member && (
                            <span className="px-1.5 py-0.2 bg-[#FFF9ED] border border-[#E9DCC4] text-[#493B2A] rounded text-[10px]">
                              {member.name.split(' ')[0]}
                            </span>
                          )}
                        </div>
                        <div className="text-[#796B59] mt-1 pl-6">
                          {formatDateTime(apt.dateTime)} · Motivo: {apt.reason}
                        </div>
                        {apt.postVisitNotes && (
                          <div className="text-[#493B2A] bg-[#FFF9ED] p-2 rounded mt-2 ml-6 text-[11px] border border-[#E9DCC4]">
                            <strong>Indicaciones del médico:</strong> {apt.postVisitNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: PRESCRIPTIONS & MEDICAL DOCUMENTS */}
      {activeSection === 'prescriptions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrescriptions.map((rx) => {
              const member = members.find((m) => m.id === rx.memberId);
              const isVigente = rx.status === 'Vigente';

              return (
                <div
                  key={rx.id}
                  className="p-5 rounded-xl border border-[#E9DCC4] bg-white hover:border-[#D9A441] transition-all flex flex-col justify-between shadow-xs"
                >
                  <div>
                    {/* Badge & Member */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-semibold text-[#B87932] bg-[#F8E8A6]/40 px-2 py-0.5 rounded border border-[#E9DCC4]">
                        {rx.type}
                      </span>
                      {member && (
                        <span className="text-xs font-semibold text-[#796B59]">
                          {member.name.split(' ')[0]}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-[#493B2A] leading-snug">
                      {rx.title}
                    </h4>
                    <div className="text-xs text-[#796B59] mt-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#D9A441]" />
                      <span>{rx.doctorName}</span>
                    </div>

                    {/* Dates */}
                    <div className="mt-3 py-2 border-y border-[#E9DCC4] text-xs space-y-1">
                      <div className="flex justify-between text-[#796B59]">
                        <span>Emisión:</span>
                        <span className="font-mono tabular-nums text-[#493B2A]">{formatDate(rx.issueDate)}</span>
                      </div>
                      {rx.expiryDate && (
                        <div className="flex justify-between text-[#796B59]">
                          <span>Vencimiento receta:</span>
                          <span className="font-mono tabular-nums font-semibold text-[#493B2A]">
                            {formatDate(rx.expiryDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Medications list */}
                    {rx.medicationsIncluded && rx.medicationsIncluded.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[11px] font-semibold text-[#493B2A] mb-1">
                          Medicamentos indicados:
                        </div>
                        <ul className="text-xs text-[#796B59] list-disc list-inside space-y-0.5">
                          {rx.medicationsIncluded.map((med, i) => (
                            <li key={i}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {rx.notes && (
                      <div className="mt-2 text-[11px] text-[#796B59] italic">
                        {rx.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-[#E9DCC4] flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleTogglePrescriptionStatus(rx)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors font-semibold ${
                        isVigente
                          ? 'bg-[#FFF9ED] text-[#493B2A] border border-[#E9DCC4] hover:bg-[#F8E8A6]/40'
                          : 'bg-[#EDF6F1] text-[#287653] border border-[#B8DDCB]'
                      }`}
                    >
                      {isVigente ? 'Marcar Comprada' : 'Comprada en Farmacia'}
                    </button>

                    <button
                      onClick={() => setSelectedPrescription(rx)}
                      className="flex items-center gap-1 text-xs font-semibold text-[#B87932] hover:text-[#A06424] hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Receta</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Prescription Preview Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E9DCC4] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9DCC4] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#B87932]" />
                <h3 className="text-base font-bold text-[#493B2A]">
                  {selectedPrescription.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="text-[#796B59] hover:text-[#493B2A] text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            {/* Medical Document Sheet */}
            <div className="bg-[#FFF9ED] p-6 rounded-xl border border-[#E9DCC4] space-y-4 text-xs">
              <div className="border-b border-[#E9DCC4] pb-3 flex justify-between items-start">
                <div>
                  <div className="font-bold text-[#493B2A] text-sm">
                    {selectedPrescription.doctorName}
                  </div>
                  <div className="text-[#796B59]">Médico Matriculado · Receta Oficial</div>
                </div>
                <div className="text-right">
                  <div className="text-[#796B59] text-[10px]">FECHA DE EMISIÓN</div>
                  <div className="font-mono font-semibold text-[#493B2A] tabular-nums">
                    {formatDate(selectedPrescription.issueDate)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-[#B87932] uppercase tracking-wider mb-1">
                  Rp. / Prescripción:
                </div>
                {selectedPrescription.medicationsIncluded ? (
                  <div className="space-y-1">
                    {selectedPrescription.medicationsIncluded.map((item, idx) => (
                      <div key={idx} className="font-semibold text-[#493B2A] pl-2 border-l-2 border-[#D9A441]">
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#493B2A]">{selectedPrescription.notes}</p>
                )}
              </div>

              {selectedPrescription.expiryDate && (
                <div className="text-[11px] text-[#796B59] pt-2 border-t border-[#E9DCC4]">
                  Válido para compra en farmacias hasta el {formatDate(selectedPrescription.expiryDate)}.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-[#796B59]">
                Archivo: {selectedPrescription.fileName || 'documento_medico.pdf'}
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#B87932] hover:bg-[#A06424] rounded-lg transition-colors shadow-xs"
              >
                Imprimir Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
