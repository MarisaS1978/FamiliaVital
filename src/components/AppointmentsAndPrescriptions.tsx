import React, { useState, useRef } from 'react';
import {
  MedicalAppointment,
  PrescriptionRecord,
  FamilyMember,
} from '../types/health';
import {
  formatDate,
  formatDateTime,
  downloadCalendarEvent,
  shareViaWhatsApp,
  readFileAsDataURL,
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
  MessageCircle,
  Upload,
  Printer,
  Download,
  X,
  Camera,
  Share2,
  Info,
  Trash2,
  Bell,
  BellRing,
  ExternalLink,
} from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationsEnabled,
  setNotificationsEnabled,
  triggerImmediateTestNotification,
  generateGoogleCalendarUrl,
} from '../utils/appointmentNotifications';

interface AppointmentsAndPrescriptionsProps {
  appointments: MedicalAppointment[];
  prescriptions: PrescriptionRecord[];
  members: FamilyMember[];
  selectedMemberId: string | 'all';
  onUpdateAppointment: (apt: MedicalAppointment) => void;
  onDeleteAppointment?: (id: string) => void;
  onUpdatePrescription: (rx: PrescriptionRecord) => void;
  onDeletePrescription?: (id: string) => void;
  onAddAppointment: () => void;
  onAddPrescription: () => void;
}

export const AppointmentsAndPrescriptions: React.FC<AppointmentsAndPrescriptionsProps> = ({
  appointments,
  prescriptions,
  members,
  selectedMemberId,
  onUpdateAppointment,
  onDeleteAppointment,
  onUpdatePrescription,
  onDeletePrescription,
  onAddAppointment,
  onAddPrescription,
}) => {
  const [activeSection, setActiveSection] = useState<'appointments' | 'prescriptions'>('appointments');
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionRecord | null>(null);
  const rxFileInputRef = useRef<HTMLInputElement>(null);

  // Scanner modal state for prescriptions
  const [isScanningRx, setIsScanningRx] = useState(false);
  const [scanStepRx, setScanStepRx] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scannedRxData, setScannedRxData] = useState<any>(null);

  const [itemToDelete, setItemToDelete] = useState<{ type: 'appointment' | 'prescription'; id: string; name: string } | null>(null);

  // Notification states and controls
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission());
  const [notifEnabled, setNotifEnabled] = useState(isNotificationsEnabled());
  const [notifFeedback, setNotifFeedback] = useState<string | null>(null);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(getNotificationPermission());
    setNotifEnabled(granted);
    if (granted) {
      setNotifFeedback('¡Notificaciones activadas! Recibirás recordatorios automáticos de turnos.');
      triggerImmediateTestNotification();
    } else {
      setNotifFeedback('Tu navegador requiere autorizar las alertas desde la configuración del sitio.');
    }
    setTimeout(() => setNotifFeedback(null), 5000);
  };

  const handleTestNotification = (apt?: MedicalAppointment) => {
    const member = apt ? members.find((m) => m.id === apt.memberId) : undefined;
    const memberName = member ? member.name.split(' ')[0] : 'Familiar';
    const sent = triggerImmediateTestNotification(apt, memberName);
    if (sent) {
      setNotifFeedback('🔔 ¡Notificación de prueba enviada a tu pantalla!');
    } else {
      setNotifFeedback('Activa primero el permiso de notificaciones para recibir alertas.');
    }
    setTimeout(() => setNotifFeedback(null), 5000);
  };

  const handleToggleNotifications = () => {
    const next = !notifEnabled;
    setNotificationsEnabled(next);
    setNotifEnabled(next);
    if (next && notifPermission !== 'granted') {
      handleEnableNotifications();
    }
  };

  const handleSimulateRxScan = () => {
    setIsScanningRx(true);
    setScanStepRx('scanning');
    setTimeout(() => {
      setScanStepRx('success');
      setScannedRxData({
        title: 'Receta Digital - Amoxicilina 500mg',
        doctorName: 'Dra. Silvina Romero (Mat. 98124)',
        type: 'Receta Médica',
        medications: 'Amoxicilina / Clavulánico 500/125mg comp. c/8hs por 7 días',
        expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      });
    }, 1400);
  };

  const handleApplyScannedRx = () => {
    if (!scannedRxData) return;
    const targetMemberId = selectedMemberId === 'all' ? members[0]?.id : selectedMemberId;
    const newRx: PrescriptionRecord = {
      id: `rx-scan-${Date.now()}`,
      memberId: targetMemberId,
      title: scannedRxData.title,
      type: scannedRxData.type,
      doctorName: scannedRxData.doctorName,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: scannedRxData.expiryDate,
      status: 'Vigente',
      medicationsIncluded: [scannedRxData.medications],
      fileName: 'Receta_Firmada_Escaneada.pdf',
      notes: 'Escaneada con cámara OCR',
    };
    onUpdatePrescription(newRx);
    setIsScanningRx(false);
    setScanStepRx('idle');
    setScannedRxData(null);
  };

  const handleDirectRxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await readFileAsDataURL(file);
        const targetMemberId = selectedMemberId === 'all' ? members[0]?.id : selectedMemberId;
        const newRx: PrescriptionRecord = {
          id: `rx-file-${Date.now()}`,
          memberId: targetMemberId,
          title: file.name.replace(/\.[^/.]+$/, ''),
          type: file.name.toLowerCase().includes('estudio') ? 'Estudio / Laboratorio' : 'Receta Médica',
          doctorName: 'Médico Tratante',
          issueDate: new Date().toISOString().split('T')[0],
          status: 'Vigente',
          fileName: result.name,
          fileData: result.url,
        };
        onUpdatePrescription(newRx);
      } catch (err) {
        console.error('Error uploading rx doc:', err);
      }
    }
  };

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

  const handleShareAppointmentWhatsApp = (apt: MedicalAppointment) => {
    const member = members.find((m) => m.id === apt.memberId);
    const msg = `*RECORDATORIO DE TURNO MÉDICO - FAMILIAVITAL*
👤 Paciente: *${member ? member.name : 'Familiar'}*
🩺 Especialidad: *${apt.specialty}*
👨‍⚕️ Médico: ${apt.doctorName}
📅 Fecha y Hora: *${formatDateTime(apt.dateTime)}*
🏥 Lugar: ${apt.clinicAddress}
📝 Motivo: ${apt.reason}
${apt.preparationNotes ? `⚠️ Preparación: ${apt.preparationNotes}` : ''}
_Enviado desde FamiliaVital_`;

    shareViaWhatsApp(msg);
  };

  const handleSharePrescriptionWhatsApp = (rx: PrescriptionRecord) => {
    const member = members.find((m) => m.id === rx.memberId);
    const meds = rx.medicationsIncluded ? rx.medicationsIncluded.map(m => `• ${m}`).join('\n') : rx.notes;

    const msg = `*RECETA MÉDICA DIGITAL - FAMILIAVITAL*
👤 Paciente: *${member ? member.name : 'Familiar'}*
📄 Documento: *${rx.title}* (${rx.type})
👨‍⚕️ Profesional: ${rx.doctorName}
📅 Fecha de Emisión: ${formatDate(rx.issueDate)}
${rx.expiryDate ? `⏳ Vence para compra en farmacia: ${formatDate(rx.expiryDate)}` : ''}

💊 *INDICACIONES / MEDICACIÓN:*
${meds || 'Ver documento adjunto'}

_Compartido desde FamiliaVital_`;

    shareViaWhatsApp(msg);
  };

  const handleTogglePrescriptionStatus = (rx: PrescriptionRecord) => {
    const newStatus = rx.status === 'Vigente' ? 'Utilizada en farmacia' : 'Vigente';
    onUpdatePrescription({ ...rx, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-[#E9DCC4] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#3E3020]">
            Agenda Médica y Documentación Digital
          </h2>
          <p className="text-xs text-[#6E5F4D] mt-0.5">
            Turnos programados, recetas escaneadas (PDF/Fotos), farmacia y certificados de aptitud
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeSection === 'appointments' ? (
            <button
              onClick={onAddAppointment}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#E27D18] hover:bg-[#C66506] rounded-xl transition-colors whitespace-nowrap shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Agendar Turno</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSimulateRxScan}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#3E3020] bg-[#FFF9ED] border border-[#E9DCC4] hover:bg-[#FEEAA2]/50 rounded-xl transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
                title="Escanear receta física con cámara u OCR"
              >
                <Camera className="w-3.5 h-3.5 text-[#E27D18]" />
                <span>Escanear con Cámara / OCR</span>
              </button>

              <input
                ref={rxFileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleDirectRxUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => rxFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#3E3020] bg-white border border-[#E9DCC4] hover:bg-[#FFF9ED] rounded-xl transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#E27D18]" />
                <span>Subir Archivo / Foto</span>
              </button>

              <button
                type="button"
                onClick={onAddPrescription}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#E27D18] hover:bg-[#C66506] rounded-xl transition-colors whitespace-nowrap shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>Nueva Receta / PDF</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Segmented Switcher between Appointments & Prescriptions */}
      <div className="flex items-center gap-2 p-1 bg-[#FFF9ED] border border-[#E9DCC4] rounded-xl w-fit">
        <button
          onClick={() => setActiveSection('appointments')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSection === 'appointments'
              ? 'bg-white text-[#3E3020] shadow-xs'
              : 'text-[#6E5F4D] hover:text-[#3E3020]'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#E27D18]" />
          <span>Turnos Médicos ({filteredAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('prescriptions')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSection === 'prescriptions'
              ? 'bg-white text-[#3E3020] shadow-xs'
              : 'text-[#6E5F4D] hover:text-[#3E3020]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#E27D18]" />
          <span>Recetas & Escaneos ({filteredPrescriptions.length})</span>
        </button>
      </div>

      {/* Explanatory Banner for Prescription Image & PDF Utility */}
      {activeSection === 'prescriptions' && (
        <div className="p-4 rounded-xl bg-[#FFF9ED] border border-[#E9DCC4] flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FEEAA2] flex items-center justify-center shrink-0 text-[#E27D18]">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1 text-[#6E5F4D]">
            <div className="font-bold text-[#3E3020]">
              💡 ¿Qué utilidad tiene fotografiar o subir el PDF de la receta médica?
            </div>
            <p>
              Las farmacias y coberturas médicas exigen constatar la matrícula y firma del profesional. Al guardar el escaneo o foto en FamiliaVital, puedes comprar la medicación mostrando la pantalla o enviando el archivo por WhatsApp a la farmacia sin depender del papel físico que suele extraviarse.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: APPOINTMENTS */}
      {activeSection === 'appointments' && (
        <div className="space-y-6">
          {/* Notification Center Banner for Medical Appointments */}
          <div className="p-4 rounded-xl border border-[#E9DCC4] bg-[#FFF9ED] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FEEAA2] flex items-center justify-center shrink-0 text-[#E27D18] shadow-2xs">
                  <BellRing className="w-5 h-5 text-[#E27D18]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#3E3020]">
                      Notificaciones & Recordatorios de Turnos Médicos
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        notifPermission === 'granted' && notifEnabled
                          ? 'bg-[#EDF7F2] text-[#1E7E52] border-[#B8DDCB]'
                          : notifPermission === 'denied'
                          ? 'bg-[#FDF1F2] text-[#C21D30] border-[#F5B8BE]'
                          : 'bg-[#FFF5E5] text-[#9A5B00] border-[#FEEAA2]'
                      }`}
                    >
                      {notifPermission === 'granted' && notifEnabled
                        ? 'Alertas Activas ✅'
                        : notifPermission === 'denied'
                        ? 'Bloqueadas en navegador ❌'
                        : 'Alertas Disponibles 🔔'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6E5F4D] mt-0.5">
                    FamiliaVital emite alertas automáticas en tu dispositivo 72 horas y 24 horas antes de cada consulta agendada para evitar olvidos o cancelaciones de turnos.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {notifPermission !== 'granted' ? (
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#E27D18] hover:bg-[#C66506] rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-white" />
                    <span>Activar Alertas</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTestNotification()}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-[#3E3020] bg-white border border-[#E9DCC4] hover:bg-[#FFF9ED] rounded-lg transition-colors shadow-2xs cursor-pointer"
                      title="Lanza una notificación de prueba en pantalla ahora"
                    >
                      <BellRing className="w-3.5 h-3.5 text-[#E27D18]" />
                      <span>Probar Notificación</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleNotifications}
                      className={`px-2 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        notifEnabled
                          ? 'bg-white text-[#6E5F4D] border-[#E9DCC4] hover:bg-[#FDF1F2] hover:text-[#C21D30]'
                          : 'bg-[#E27D18] text-white border-transparent'
                      }`}
                    >
                      {notifEnabled ? 'Pausar' : 'Reanudar'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {notifFeedback && (
              <div className="p-2.5 rounded-lg bg-white border border-[#E9DCC4] text-xs font-semibold text-[#E27D18] flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#1E7E52] shrink-0" />
                <span>{notifFeedback}</span>
              </div>
            )}
          </div>

          {/* Scheduled Appointments Grid */}
          <div>
            <h3 className="text-xs font-bold text-[#3E3020] uppercase tracking-wider mb-3">
              Próximos Turnos Programados ({upcomingAppointments.length})
            </h3>

            {upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-[#E9DCC4] text-xs text-[#6E5F4D] space-y-2">
                <Calendar className="w-8 h-8 text-[#E26D14] mx-auto opacity-50" />
                <p className="font-semibold text-[#3E3020]">No hay turnos próximos programados</p>
                <p>Haz clic en "+ Agendar Turno" para registrar una nueva consulta.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingAppointments.map((apt) => {
                  const member = members.find((m) => m.id === apt.memberId);

                  return (
                    <div
                      key={apt.id}
                      className="p-5 rounded-xl border border-[#E9DCC4] bg-white hover:border-[#F3BA2F] transition-all flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        {/* Member & Specialty */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs px-2.5 py-0.5 bg-[#FFF9ED] border border-[#E9DCC4] text-[#3E3020] font-bold rounded-full">
                            {member ? member.name.split(' ')[0] : 'Familiar'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF9ED] text-[#E27D18] border border-[#E9DCC4]">
                              <Bell className="w-2.5 h-2.5 text-[#E27D18]" />
                              <span>Alerta Activa</span>
                            </span>
                            <span className="text-xs font-bold font-mono text-[#E26D14] flex items-center gap-1 bg-[#FFF9ED] px-2.5 py-0.5 rounded-md border border-[#E9DCC4]">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDateTime(apt.dateTime)}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-base font-bold text-[#3E3020]">
                          {apt.specialty}
                        </h4>

                        <div className="text-xs text-[#6E5F4D] mt-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#F3BA2F]" />
                            <span>{apt.doctorName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#F3BA2F]" />
                            <span>{apt.clinicAddress}</span>
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="mt-3 text-xs bg-[#FFF9ED] p-2.5 rounded-lg border border-[#E9DCC4] text-[#3E3020]">
                          <div className="font-semibold text-[#3E3020] mb-0.5">Motivo de consulta:</div>
                          {apt.reason}
                        </div>

                        {/* Preparation instructions */}
                        {apt.preparationNotes && (
                          <div className="text-[11px] text-[#9A5B00] bg-[#FFF5E5] p-2.5 rounded-lg border border-[#FEEAA2] mt-2 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-[#9A5B00] shrink-0 mt-0.5" />
                            <div>
                              <strong>Preparación previa:</strong> {apt.preparationNotes}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card actions */}
                      <div className="mt-4 pt-3 border-t border-[#E9DCC4] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => handleTestNotification(apt)}
                            className="flex items-center gap-1 text-xs font-semibold text-[#3E3020] hover:text-[#E27D18] bg-[#FFF9ED] hover:bg-[#FEEAA2]/60 border border-[#E9DCC4] px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
                            title="Lanza notificación de recordatorio en pantalla para este turno"
                          >
                            <BellRing className="w-3.5 h-3.5 text-[#E27D18]" />
                            <span>Notificar</span>
                          </button>

                          <a
                            href={generateGoogleCalendarUrl(apt, member ? member.name.split(' ')[0] : 'Familiar')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-semibold text-[#3E3020] hover:text-[#E27D18] bg-white hover:bg-[#FFF9ED] border border-[#E9DCC4] px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                            title="Guardar en Google Calendar con alarma de recordatorio automático"
                          >
                            <CalendarPlus className="w-3.5 h-3.5 text-[#E27D18]" />
                            <span>Google Cal</span>
                            <ExternalLink className="w-2.5 h-2.5 text-[#6E5F4D]" />
                          </a>

                          <button
                            onClick={() => handleExportICS(apt)}
                            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#6E5F4D] hover:text-[#3E3020] bg-white hover:bg-[#FFF9ED] border border-[#E9DCC4] px-2 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
                            title="Descargar archivo .ics"
                          >
                            <span>.ics</span>
                          </button>

                          <button
                            onClick={() => handleShareAppointmentWhatsApp(apt)}
                            className="flex items-center gap-1 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
                            title="Enviar recordatorio de turno por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleComplete(apt)}
                            className="flex items-center gap-1 text-xs font-bold text-[#1E7E52] bg-[#EDF7F2] hover:bg-[#DDF0E5] px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#B8DDCB] transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Realizado</span>
                          </button>
                          {onDeleteAppointment && (
                            <button
                              onClick={() => onDeleteAppointment(apt.id)}
                              className="p-1.5 text-[#6E5F4D] hover:text-[#C21D30] hover:bg-[#FDF1F2] rounded-lg transition-colors cursor-pointer"
                              title="Eliminar este turno"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Consultations */}
          {pastAppointments.length > 0 && (
            <div className="pt-4 border-t border-[#E9DCC4]">
              <h3 className="text-xs font-bold text-[#6E5F4D] uppercase tracking-wider mb-3">
                Historial de Consultas Médicas Realizadas
              </h3>
              <div className="bg-white rounded-xl border border-[#E9DCC4] divide-y divide-[#E9DCC4]/50 overflow-hidden">
                {pastAppointments.map((apt) => {
                  const member = members.find((m) => m.id === apt.memberId);
                  return (
                    <div key={apt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#1E7E52] shrink-0" />
                          <span className="font-bold text-[#3E3020]">{apt.specialty}</span>
                          <span className="text-[#6E5F4D]">· {apt.doctorName}</span>
                          {member && (
                            <span className="px-1.5 py-0.2 bg-[#FFF9ED] border border-[#E9DCC4] text-[#3E3020] rounded text-[10px] font-semibold">
                              {member.name.split(' ')[0]}
                            </span>
                          )}
                        </div>
                        <div className="text-[#6E5F4D] mt-1 pl-6">
                          {formatDateTime(apt.dateTime)} · Motivo: {apt.reason}
                        </div>
                        {apt.postVisitNotes && (
                          <div className="text-[#3E3020] bg-[#FFF9ED] p-2 rounded mt-2 ml-6 text-[11px] border border-[#E9DCC4]">
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

      {/* SECTION 2: PRESCRIPTIONS & SCANNED DOCUMENTS */}
      {activeSection === 'prescriptions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrescriptions.map((rx) => {
              const member = members.find((m) => m.id === rx.memberId);
              const isVigente = rx.status === 'Vigente';

              return (
                <div
                  key={rx.id}
                  className="p-5 rounded-xl border border-[#E9DCC4] bg-white hover:border-[#F3BA2F] transition-all flex flex-col justify-between shadow-xs"
                >
                  <div>
                    {/* Badge & Member */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isVigente
                            ? 'bg-[#EDF7F2] text-[#1E7E52] border border-[#B8DDCB]'
                            : 'bg-[#FFF9ED] text-[#6E5F4D] border border-[#E9DCC4]'
                        }`}
                      >
                        {rx.status}
                      </span>
                      {member && (
                        <span className="text-xs font-semibold text-[#6E5F4D]">
                          {member.name.split(' ')[0]}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-[#3E3020] leading-snug">
                      {rx.title}
                    </h4>
                    <div className="text-xs text-[#6E5F4D] mt-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#F3BA2F]" />
                      <span>{rx.doctorName}</span>
                    </div>

                    {/* Dates */}
                    <div className="mt-3 py-2 border-y border-[#E9DCC4] text-xs space-y-1">
                      <div className="flex justify-between text-[#6E5F4D]">
                        <span>Emisión:</span>
                        <span className="font-mono tabular-nums text-[#3E3020]">{formatDate(rx.issueDate)}</span>
                      </div>
                      {rx.expiryDate && (
                        <div className="flex justify-between text-[#6E5F4D]">
                          <span>Vence receta:</span>
                          <span className="font-mono tabular-nums font-semibold text-[#3E3020]">
                            {formatDate(rx.expiryDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Medications list */}
                    {rx.medicationsIncluded && rx.medicationsIncluded.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[11px] font-semibold text-[#3E3020] mb-1">
                          Medicamentos indicados:
                        </div>
                        <ul className="text-xs text-[#6E5F4D] list-disc list-inside space-y-0.5">
                          {rx.medicationsIncluded.map((med, i) => (
                            <li key={i}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {rx.notes && (
                      <div className="mt-2 text-[11px] text-[#6E5F4D] italic">
                        {rx.notes}
                      </div>
                    )}

                    {/* Attachment badge */}
                    {rx.fileName && (
                      <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFF9ED] border border-[#E9DCC4] text-[11px] text-[#E26D14] font-semibold">
                        <FileCheck className="w-3 h-3" />
                        <span className="truncate max-w-[170px]">{rx.fileName}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-[#E9DCC4] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTogglePrescriptionStatus(rx)}
                        className={`text-xs px-2.5 py-1 rounded-md transition-colors font-semibold ${
                          isVigente
                            ? 'bg-[#FFF9ED] text-[#3E3020] border border-[#E9DCC4] hover:bg-[#FEEAA2]/50'
                            : 'bg-[#EDF7F2] text-[#1E7E52] border border-[#B8DDCB]'
                        }`}
                      >
                        {isVigente ? 'Marcar Comprada' : 'Comprada'}
                      </button>

                      <button
                        onClick={() => handleSharePrescriptionWhatsApp(rx)}
                        className="p-1.5 text-white bg-[#25D366] hover:bg-[#1EBE5D] rounded-md transition-colors"
                        title="Enviar receta por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPrescription(rx)}
                        className="flex items-center gap-1 text-xs font-bold text-[#E27D18] hover:text-[#C66506] hover:underline cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Receta</span>
                      </button>
                      {onDeletePrescription && (
                        <button
                          onClick={() => onDeletePrescription(rx.id)}
                          className="p-1 text-[#6E5F4D] hover:text-[#C21D30] hover:bg-[#FDF1F2] rounded cursor-pointer"
                          title="Eliminar esta receta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Prescription Preview Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E9DCC4] shadow-2xl max-w-lg w-full flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E9DCC4] px-4 py-3 sm:px-6 sm:py-3.5 bg-[#3E3020] text-white shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#F3BA2F]" />
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {selectedPrescription.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="p-1 rounded-lg text-[#E9DCC4] hover:text-white hover:bg-white/10 transition-colors"
                title="Cerrar"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Medical Document Sheet - Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="bg-[#FFF9ED] p-5 sm:p-6 rounded-xl border border-[#E9DCC4] space-y-4">
                <div className="border-b border-[#E9DCC4] pb-3 flex justify-between items-start">
                  <div>
                    <div className="font-bold text-[#3E3020] text-sm">
                      {selectedPrescription.doctorName}
                    </div>
                    <div className="text-[#6E5F4D]">Médico Matriculado · Receta Oficial</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#6E5F4D] text-[10px]">FECHA DE EMISIÓN</div>
                    <div className="font-mono font-semibold text-[#3E3020] tabular-nums">
                      {formatDate(selectedPrescription.issueDate)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-[#E26D14] uppercase tracking-wider mb-1">
                    Rp. / Prescripción:
                  </div>
                  {selectedPrescription.medicationsIncluded ? (
                    <div className="space-y-1">
                      {selectedPrescription.medicationsIncluded.map((item, idx) => (
                        <div key={idx} className="font-semibold text-[#3E3020] pl-2 border-l-2 border-[#F3BA2F]">
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#3E3020]">{selectedPrescription.notes}</p>
                  )}
                </div>

                {selectedPrescription.expiryDate && (
                  <div className="text-[11px] text-[#6E5F4D] pt-2 border-t border-[#E9DCC4]">
                    Válido para compra en farmacias hasta el {formatDate(selectedPrescription.expiryDate)}.
                  </div>
                )}
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="bg-[#FFF9ED] px-4 py-3 sm:px-6 sm:py-3.5 border-t border-[#E9DCC4] flex items-center justify-between gap-2 shrink-0">
              <div className="text-xs text-[#6E5F4D] truncate">
                Archivo: {selectedPrescription.fileName || 'receta_oficial.pdf'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSharePrescriptionWhatsApp(selectedPrescription)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] rounded-lg transition-colors flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#E26D14] hover:bg-[#C55606] rounded-lg transition-colors shadow-xs whitespace-nowrap"
                >
                  Imprimir Documento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRESCRIPTION SCANNER MODAL */}
      {isScanningRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E9DCC4] shadow-2xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-[#E9DCC4] pb-3">
              <div className="flex items-center gap-2 text-[#3E3020] font-bold text-sm">
                <Camera className="w-4 h-4 text-[#E27D18]" />
                <span>Escáner OCR de Recetas Médicas</span>
              </div>
              <button
                onClick={() => {
                  setIsScanningRx(false);
                  setScanStepRx('idle');
                }}
                className="text-[#6E5F4D] hover:text-[#3E3020] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {scanStepRx === 'scanning' && (
              <div className="py-8 space-y-4">
                <div className="relative w-44 h-52 mx-auto border-2 border-dashed border-[#E27D18] rounded-xl flex items-center justify-center bg-[#FFF9ED] overflow-hidden shadow-inner">
                  <div className="absolute inset-x-0 h-1 bg-[#E27D18] shadow-md animate-bounce" />
                  <FileText className="w-14 h-14 text-[#E27D18] opacity-60" />
                </div>
                <p className="text-xs font-semibold text-[#3E3020] animate-pulse">
                  Extrayendo medicamentos, firma y matrícula médica...
                </p>
              </div>
            )}

            {scanStepRx === 'success' && scannedRxData && (
              <div className="space-y-4 text-left">
                <div className="p-3.5 bg-[#EDF7F2] border border-[#B8DDCB] rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E7E52]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Receta Reconocida con Éxito!</span>
                  </div>
                  <div className="text-xs text-[#3E3020] space-y-1 pt-1">
                    <div><strong>Título:</strong> {scannedRxData.title}</div>
                    <div><strong>Médico:</strong> {scannedRxData.doctorName}</div>
                    <div><strong>Indicación:</strong> {scannedRxData.medications}</div>
                    <div><strong>Vence para farmacia:</strong> {formatDate(scannedRxData.expiryDate)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsScanningRx(false);
                      setScanStepRx('idle');
                    }}
                    className="px-3 py-1.5 text-xs text-[#6E5F4D] hover:text-[#3E3020] cursor-pointer"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={handleApplyScannedRx}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#1E7E52] hover:bg-[#165E3D] rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar Receta en la Libreta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
