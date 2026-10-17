import React, { useState, useRef, useEffect } from 'react';
import { FamilyMember, VaccineRecord, MedicalAppointment } from '../types/health';
import { formatAge, formatDate, shareViaWhatsApp, readFileAsDataURL } from '../utils/healthUtils';
import {
  Dog,
  Cat,
  Shield,
  AlertTriangle,
  Phone,
  Plus,
  Edit2,
  Trash2,
  FileText,
  MessageCircle,
  Upload,
  Check,
  X,
  Stethoscope,
  Camera,
  Calendar,
  Syringe,
  Info,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Download,
  Eye,
  Heart,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';

interface PetsViewProps {
  members: FamilyMember[];
  vaccines: VaccineRecord[];
  appointments: MedicalAppointment[];
  selectedMemberId?: string | 'all';
  onUpdateMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
  onUpdateVaccine: (vaccine: VaccineRecord) => void;
  onAddVaccine: () => void;
  onAddMember: () => void;
  onAddAppointment: () => void;
}

export const PetsView: React.FC<PetsViewProps> = ({
  members,
  vaccines,
  appointments,
  selectedMemberId,
  onUpdateMember,
  onDeleteMember,
  onUpdateVaccine,
  onAddVaccine,
  onAddMember,
  onAddAppointment,
}) => {
  const pets = members.filter((m) => m.isPet || m.relationship === 'Mascota');

  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || '');
  const [editingPet, setEditingPet] = useState<FamilyMember | null>(null);

  // Sync selectedPetId when selectedMemberId changes from parent
  useEffect(() => {
    if (selectedMemberId && selectedMemberId !== 'all') {
      const match = pets.find((p) => p.id === selectedMemberId);
      if (match) setSelectedPetId(match.id);
    }
  }, [selectedMemberId, pets]);
  const [petToDelete, setPetToDelete] = useState<FamilyMember | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{ url: string; name: string; type: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scanner modal state for pet vaccines/documents
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scannedData, setScannedData] = useState<any>(null);

  // Active pet
  const activePet = pets.find((p) => p.id === selectedPetId) || pets[0];

  // Pet vaccines
  const petVaccines = activePet ? vaccines.filter((v) => v.memberId === activePet.id) : [];

  // Pet appointments
  const petAppointments = activePet ? appointments.filter((a) => a.memberId === activePet.id) : [];

  const handleSharePetWhatsApp = (pet: FamilyMember) => {
    const petVacs = vaccines.filter((v) => v.memberId === pet.id);
    const appliedVacs = petVacs
      .filter((v) => v.status === 'applied')
      .map((v) => `✅ ${v.vaccineName} (${formatDate(v.applicationDate || '')})`)
      .join('\n');

    const pendingVacs = petVacs
      .filter((v) => v.status !== 'applied')
      .map((v) => `⏳ ${v.vaccineName} (${v.recommendedAge})`)
      .join('\n');

    const msg = `🐾 *FICHA VETERINARIA OFICIAL - FAMILIAVITAL*
🐕 Mascota: *${pet.name}* (${pet.petDetails?.species || 'Mascota'} - ${pet.petDetails?.breed || 'Raza mestiza'})
• Edad: ${formatAge(pet.birthDate)}
• Microchip / ID: ${pet.idNumber || pet.petDetails?.microchipNumber || 'Sin chip'}
• Castrado/a: ${pet.petDetails?.isNeutered ? 'Sí' : 'No'}
• Última Desparasitación: ${pet.petDetails?.lastDewormingDate ? formatDate(pet.petDetails.lastDewormingDate) : 'No registrada'}

🏥 *VETERINARIA & EMERGENCIAS 24HS:*
• Clínica: ${pet.medicalInsurance.provider || 'Hospital Veterinario'}
• Veterinario: ${pet.primaryDoctor?.name || 'Dr. Veterinario'} (${pet.primaryDoctor?.phone || '-'})
• Guardia 24hs: ${pet.medicalInsurance.emergencyPhone || '-'}

💉 *ESQUEMA DE VACUNACIÓN:*
${appliedVacs || 'Sin vacunas registradas aún'}
${pendingVacs ? `\n⚠️ *PENDIENTES:*\n${pendingVacs}` : ''}

📞 *CONTACTOS DE LOS DUEÑOS:*
${pet.emergencyContacts.map((c) => `• ${c.name} (${c.relation}): ${c.phone}`).join('\n')}

📝 *NOTAS Y CUIDADOS:*
${pet.vitalNotes || 'Sin indicaciones especiales'}
_Compartido desde FamiliaVital_`;

    shareViaWhatsApp(msg);
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanStep('scanning');
    setTimeout(() => {
      setScanStep('success');
      setScannedData({
        vaccineName: 'Séxtuple Canina / Antirrábica Oficial',
        lotNumber: `VET-${Math.floor(1000 + Math.random() * 9000)}-OK`,
        healthCenter: 'Hospital Veterinario Central',
        date: new Date().toISOString().split('T')[0],
      });
    }, 1400);
  };

  const handleApplyScannedVaccine = () => {
    if (!activePet || !scannedData) return;
    const newVac: VaccineRecord = {
      id: `vac-pet-${Date.now()}`,
      memberId: activePet.id,
      vaccineName: scannedData.vaccineName,
      diseaseTarget: 'Rabia, Parvovirus y Moquillo',
      doseNumber: 'Refuerzo Anual',
      recommendedAge: 'Anual',
      recommendedAgeMonths: 12,
      status: 'applied',
      applicationDate: scannedData.date,
      lotNumber: scannedData.lotNumber,
      healthCenter: scannedData.healthCenter,
      isNationalCalendar: true,
      isPetVaccine: true,
      documentName: `Carnet_Veterinario_${activePet.name.split(' ')[0]}.pdf`,
      documentType: 'pdf',
    };
    onUpdateVaccine(newVac);
    setIsScanning(false);
    setScanStep('idle');
    setScannedData(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activePet) {
      try {
        const result = await readFileAsDataURL(file);
        const newVac: VaccineRecord = {
          id: `vac-doc-${Date.now()}`,
          memberId: activePet.id,
          vaccineName: file.name.replace(/\.[^/.]+$/, ''),
          diseaseTarget: 'Comprobante Veterinario / Carnet',
          doseNumber: 'Certificado',
          recommendedAge: 'Al día',
          recommendedAgeMonths: 0,
          status: 'applied',
          applicationDate: new Date().toISOString().split('T')[0],
          healthCenter: activePet.medicalInsurance.provider,
          isNationalCalendar: false,
          isPetVaccine: true,
          documentUrl: result.url,
          documentName: result.name,
          documentType: result.type,
        };
        onUpdateVaccine(newVac);
      } catch (err) {
        console.error('Error uploading pet doc:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Clear Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-[#E9DCC4] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <h2 className="text-lg font-bold text-[#3E3020]">
              Apartado Veterinario y Salud de Mascotas
            </h2>
          </div>
          <p className="text-xs text-[#6E5F4D] mt-0.5">
            Libreta sanitaria de perros y gatos: antiparasitarios, vacunas (Rabia, Séxtuple), veterinario de guardia y carnet escaneado
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleSimulateScan()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-[#3E3020] bg-[#FFF9ED] border border-[#E9DCC4] hover:bg-[#FEEAA2]/50 rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
            title="Escanear carnet de vacunas o libreta con la cámara"
          >
            <Camera className="w-3.5 h-3.5 text-[#E27D18]" />
            <span>Escanear Carnet / PDF</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#3E3020] bg-white border border-[#E9DCC4] hover:bg-[#FFF9ED] rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5 text-[#E27D18]" />
            <span>Subir Archivo / Foto</span>
          </button>

          <button
            type="button"
            onClick={onAddMember}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#E27D18] hover:bg-[#C66506] rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Agregar Mascota</span>
          </button>
        </div>
      </div>

      {/* Explanatory Info Card on the Utility of Pet Images/Avatars and Carnets */}
      <div className="p-4 rounded-xl bg-[#FFF9ED] border border-[#E9DCC4] flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#FEEAA2] flex items-center justify-center shrink-0 text-[#E27D18]">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1 text-[#6E5F4D]">
          <div className="font-bold text-[#3E3020]">
            ¿Qué utilidad tiene la foto y los documentos escaneados de tu mascota?
          </div>
          <p>
            • <strong>Foto de perfil:</strong> Identificación visual inmediata si la dejas en una guardería, paseador o si se extravía.
          </p>
          <p>
            • <strong>Carnets escaneados y PDFs:</strong> El certificado antirrábico sellado por el veterinario es un documento legal exigido para viajar, ingresar a parques o trámites municipales. Al escanearlo, siempre lo llevas en tu celular sin riesgo de perder el papel.
          </p>
        </div>
      </div>

      {/* Pet Selector Tabs (If multiple pets) */}
      {pets.length > 1 && (
        <div className="flex items-center gap-2 p-1 bg-white border border-[#E9DCC4] rounded-xl overflow-x-auto">
          {pets.map((pet) => {
            const isSelected = pet.id === activePet?.id;
            return (
              <button
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#E27D18] text-white shadow-xs'
                    : 'text-[#6E5F4D] hover:bg-[#FFF9ED] hover:text-[#3E3020]'
                }`}
              >
                <span>{pet.petDetails?.species === 'Gato' ? '🐱' : '🐶'}</span>
                <span>{pet.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#E9DCC4] text-[#6E5F4D]'}`}>
                  {pet.petDetails?.breed || 'Raza'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Pet Clinical Sheet */}
      {activePet ? (
        <div className="space-y-6">
          {/* Card Top Header */}
          <div className="bg-white rounded-xl border border-[#E9DCC4] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-[#E9DCC4] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FFF9ED]/60">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white border border-[#E9DCC4] shrink-0 shadow-2xs flex items-center justify-center">
                  {activePet.avatarUrl ? (
                    <img
                      src={activePet.avatarUrl}
                      alt={activePet.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : activePet.petDetails?.species === 'Gato' ? (
                    <Cat className="w-10 h-10 text-[#E27D18]" />
                  ) : (
                    <Dog className="w-10 h-10 text-[#E27D18]" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#3E3020]">
                      {activePet.name}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#FEEAA2] border border-[#E9DCC4] text-[#E27D18]">
                      🐾 {activePet.petDetails?.species || 'Mascota'} · {activePet.petDetails?.breed || 'Mestizo'}
                    </span>
                    {activePet.petDetails?.isNeutered && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-[#EDF7F2] border border-[#B8DDCB] text-[#1E7E52]">
                        ✓ Castrado/a
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E5F4D] mt-1.5">
                    <span>Edad: {formatAge(activePet.birthDate)}</span>
                    <span aria-hidden="true">·</span>
                    <span>Nacimiento: {activePet.birthDate}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono font-semibold text-[#3E3020]">
                      Chip: {activePet.idNumber || activePet.petDetails?.microchipNumber || 'No registrado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: WhatsApp & Edit */}
              <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto shrink-0 justify-end">
                <button
                  onClick={() => handleSharePetWhatsApp(activePet)}
                  className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
                  title="Enviar ficha de la mascota al paseador, veterinaria o guardería por WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => setEditingPet(activePet)}
                  className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#E27D18] hover:bg-[#C66506] rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0"
                  title="Editar ficha completa de la mascota"
                >
                  <Edit2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => setPetToDelete(activePet)}
                  className="inline-flex items-center justify-center p-1.5 sm:p-2 text-[#C21D30] bg-[#FDF1F2] border border-[#F5B8BE] hover:bg-[#FCE3E5] rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Eliminar mascota"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Veterinaria & Guardia 24hs */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E3020] uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4 text-[#E27D18]" />
                  <span>Atención Veterinaria</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] text-xs space-y-2">
                  <div className="font-semibold text-sm text-[#3E3020]">
                    {activePet.medicalInsurance.provider || 'Hospital Veterinario'}
                  </div>
                  <div className="text-[#6E5F4D]">
                    {activePet.primaryDoctor?.name || 'Veterinario de Cabecera'}
                  </div>
                  {activePet.primaryDoctor?.phone && (
                    <div>
                      <a
                        href={`tel:${activePet.primaryDoctor.phone}`}
                        className="inline-flex items-center gap-1 font-bold text-[#E27D18] hover:underline"
                      >
                        <Phone className="w-3 h-3 text-[#E27D18]" />
                        <span>{activePet.primaryDoctor.phone}</span>
                      </a>
                    </div>
                  )}

                  {activePet.medicalInsurance.emergencyPhone && (
                    <div className="pt-2 border-t border-[#E9DCC4] flex items-center justify-between">
                      <span className="text-[#6E5F4D]">Guardia 24hs:</span>
                      <a
                        href={`tel:${activePet.medicalInsurance.emergencyPhone}`}
                        className="font-bold text-[#C21D30] hover:underline font-mono"
                      >
                        {activePet.medicalInsurance.emergencyPhone}
                      </a>
                    </div>
                  )}

                  {(activePet.petDetails?.vetAddress || activePet.medicalInsurance.address) && (
                    <div className="pt-2 border-t border-[#E9DCC4] space-y-1">
                      <div className="text-[10px] uppercase font-bold text-[#6E5F4D] tracking-wider">
                        Dirección Veterinaria / Guardia:
                      </div>
                      <div className="flex items-start gap-1.5 text-[#3E3020]">
                        <MapPin className="w-3.5 h-3.5 text-[#E27D18] shrink-0 mt-0.5" />
                        <span className="font-semibold text-xs leading-tight">
                          {activePet.petDetails?.vetAddress || activePet.medicalInsurance.address}
                        </span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          activePet.petDetails?.vetAddress || activePet.medicalInsurance.address || ''
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E27D18] hover:underline pt-0.5"
                      >
                        <span>Ver en Google Maps</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Control de Parásitos y Desparasitación */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E3020] uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-[#1E7E52]" />
                  <span>Antiparasitarios & Pipetas</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E5F4D]">Última Desparasitación:</span>
                    <span className="font-bold text-[#3E3020]">
                      {activePet.petDetails?.lastDewormingDate
                        ? formatDate(activePet.petDetails.lastDewormingDate)
                        : 'No registrada'}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded border border-[#E9DCC4] text-[11px] text-[#6E5F4D]">
                    💡 <strong>Frecuencia recomendada:</strong> Interna cada 3 meses y pipeta/pastilla antipulgas mensual o trimestral (Bravecto/NexGard).
                  </div>

                  {activePet.vitalNotes && (
                    <div className="pt-1.5 border-t border-[#E9DCC4] text-[11px] text-[#3E3020] italic">
                      "{activePet.vitalNotes}"
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Dueños & Contactos de Urgencia */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E3020] uppercase tracking-wider">
                  <Heart className="w-4 h-4 text-[#D96B47]" />
                  <span>Dueños / Contactos</span>
                </div>

                <div className="space-y-2">
                  {activePet.emergencyContacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] text-xs"
                    >
                      <div>
                        <div className="font-semibold text-[#3E3020]">{contact.name}</div>
                        <div className="text-[10px] text-[#6E5F4D]">{contact.relation}</div>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#E9DCC4] font-bold text-[#E27D18] hover:bg-[#FFF9ED] text-xs font-mono"
                      >
                        <Phone className="w-3 h-3 text-[#E27D18]" />
                        <span>{contact.phone}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Pet Vaccines Section */}
          <div className="bg-white rounded-xl border border-[#E9DCC4] shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-[#E27D18]" />
                <h3 className="font-bold text-base text-[#3E3020]">
                  Calendario de Vacunación Canina / Felina de {activePet.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateScan()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#E27D18] bg-[#FFF9ED] border border-[#E9DCC4] hover:bg-[#FEEAA2]/50 rounded-lg transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#E27D18]" />
                  <span>Escanear Vacuna</span>
                </button>
                <button
                  onClick={onAddVaccine}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#E27D18] hover:bg-[#C66506] rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span>Registrar Dosis</span>
                </button>
              </div>
            </div>

            {petVaccines.length === 0 ? (
              <div className="p-8 text-center bg-[#FFF9ED] rounded-xl border border-[#E9DCC4] space-y-2">
                <Syringe className="w-8 h-8 text-[#E27D18] mx-auto opacity-70" />
                <p className="text-sm font-semibold text-[#3E3020]">
                  Sin vacunas registradas para {activePet.name}
                </p>
                <p className="text-xs text-[#6E5F4D]">
                  Puedes escanear la libreta sanitaria física o agregar la dosis manualmente arriba.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {petVaccines.map((vac) => {
                  const isApplied = vac.status === 'applied';
                  return (
                    <div
                      key={vac.id}
                      className="p-4 rounded-xl border border-[#E9DCC4] bg-[#FFF9ED]/40 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-[#3E3020]">
                              {vac.vaccineName}
                            </h4>
                            <p className="text-xs text-[#6E5F4D]">{vac.diseaseTarget}</p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                              isApplied
                                ? 'bg-[#EDF7F2] border-[#B8DDCB] text-[#1E7E52]'
                                : 'bg-[#FFF5E5] border-[#FEEAA2] text-[#9A5B00]'
                            }`}
                          >
                            {isApplied ? '✓ Aplicada' : '⏳ Pendiente'}
                          </span>
                        </div>

                        <div className="text-xs text-[#6E5F4D] space-y-0.5 pt-1">
                          <div>
                            <strong>Dosis:</strong> {vac.doseNumber} ({vac.recommendedAge})
                          </div>
                          {vac.applicationDate && (
                            <div>
                              <strong>Fecha:</strong> {formatDate(vac.applicationDate)}
                            </div>
                          )}
                          {vac.lotNumber && (
                            <div className="font-mono text-[11px]">
                              <strong>Lote:</strong> {vac.lotNumber}
                            </div>
                          )}
                          {vac.healthCenter && (
                            <div>
                              <strong>Lugar:</strong> {vac.healthCenter}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Scanned document attachment */}
                      <div className="pt-2 border-t border-[#E9DCC4] flex items-center justify-between">
                        {vac.documentName || vac.documentUrl ? (
                          <button
                            onClick={() =>
                              setViewingDoc({
                                url: vac.documentUrl || '',
                                name: vac.documentName || 'Carnet_Veterinario.pdf',
                                type: vac.documentType || 'pdf',
                              })
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E27D18] hover:underline cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-[#1E7E52]" />
                            <span>Ver Carnet Escaneado</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#6E5F4D] italic">
                            Sin comprobante digital
                          </span>
                        )}

                        {!isApplied && (
                          <button
                            onClick={() =>
                              onUpdateVaccine({
                                ...vac,
                                status: 'applied',
                                applicationDate: new Date().toISOString().split('T')[0],
                              })
                            }
                            className="px-2.5 py-1 text-xs font-bold text-white bg-[#1E7E52] hover:bg-[#15603D] rounded-lg transition-colors cursor-pointer"
                          >
                            Marcar Aplicada
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State if no pets */
        <div className="p-12 text-center bg-white rounded-xl border border-[#E9DCC4] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FFF9ED] border border-[#E9DCC4] flex items-center justify-center mx-auto text-3xl">
            🐕
          </div>
          <div>
            <h3 className="text-base font-bold text-[#3E3020]">
              No tienes mascotas registradas en la familia
            </h3>
            <p className="text-xs text-[#6E5F4D] max-w-md mx-auto mt-1">
              Centraliza el carnet de vacunas antirrábicas, desparasitaciones, chip y contactos del veterinario de tu perro o gato.
            </p>
          </div>
          <button
            onClick={onAddMember}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#E27D18] hover:bg-[#C66506] rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Registrar Mascota Ahora</span>
          </button>
        </div>
      )}

      {/* SCANNER MODAL */}
      {isScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E9DCC4] shadow-2xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-[#E9DCC4] pb-3">
              <div className="flex items-center gap-2 text-[#3E3020] font-bold text-sm">
                <Camera className="w-4 h-4 text-[#E27D18]" />
                <span>Escáner OCR de Carnet Veterinario</span>
              </div>
              <button
                onClick={() => {
                  setIsScanning(false);
                  setScanStep('idle');
                }}
                className="text-[#6E5F4D] hover:text-[#3E3020]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {scanStep === 'scanning' && (
              <div className="py-8 space-y-4">
                <div className="relative w-40 h-48 mx-auto border-2 border-dashed border-[#E27D18] rounded-xl flex items-center justify-center bg-[#FFF9ED] overflow-hidden">
                  <div className="absolute inset-x-0 h-1 bg-[#E27D18] shadow-md animate-bounce" />
                  <FileText className="w-12 h-12 text-[#E27D18] opacity-60" />
                </div>
                <p className="text-xs font-semibold text-[#3E3020] animate-pulse">
                  Analizando libreta sanitaria y código de barras...
                </p>
              </div>
            )}

            {scanStep === 'success' && scannedData && (
              <div className="space-y-4 text-left">
                <div className="p-3 bg-[#EDF7F2] border border-[#B8DDCB] rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E7E52]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Carnet Detectado con Éxito!</span>
                  </div>
                  <div className="text-xs text-[#3E3020] space-y-0.5 pt-1">
                    <div><strong>Vacuna:</strong> {scannedData.vaccineName}</div>
                    <div><strong>Lote Oficial:</strong> {scannedData.lotNumber}</div>
                    <div><strong>Centro:</strong> {scannedData.healthCenter}</div>
                    <div><strong>Fecha:</strong> {formatDate(scannedData.date)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsScanning(false);
                      setScanStep('idle');
                    }}
                    className="px-3 py-1.5 text-xs text-[#6E5F4D] hover:text-[#3E3020]"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={handleApplyScannedVaccine}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#1E7E52] hover:bg-[#15603D] rounded-lg transition-colors shadow-xs"
                  >
                    Guardar en la Libreta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E9DCC4] shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9DCC4] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#1E7E52]" />
                <h4 className="font-bold text-sm text-[#3E3020] truncate">
                  {viewingDoc.name}
                </h4>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="text-[#6E5F4D] hover:text-[#3E3020]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FFF9ED] p-4 rounded-xl border border-[#E9DCC4] text-center space-y-3">
              {viewingDoc.url ? (
                viewingDoc.type === 'image' ? (
                  <img
                    src={viewingDoc.url}
                    alt={viewingDoc.name}
                    className="max-h-64 mx-auto rounded-lg object-contain shadow-xs"
                  />
                ) : (
                  <iframe
                    src={viewingDoc.url}
                    title={viewingDoc.name}
                    className="w-full h-64 rounded-lg border border-[#E9DCC4]"
                  />
                )
              ) : (
                <div className="py-12 space-y-2">
                  <FileText className="w-12 h-12 text-[#E27D18] mx-auto opacity-70" />
                  <p className="text-xs font-semibold text-[#3E3020]">
                    Vista previa de documento oficial
                  </p>
                  <p className="text-[11px] text-[#6E5F4D]">
                    Certificado digital archivado en el dispositivo.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-[#6E5F4D] bg-[#FFF9ED] border border-[#E9DCC4] hover:bg-white rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL EDIT PET MODAL */}
      {editingPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E9DCC4] shadow-2xl max-w-xl w-full flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="bg-[#3E3020] text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#F3BA2F]" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Editar Ficha Veterinaria: {editingPet.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingPet(null)}
                className="p-1 rounded-lg text-[#E9DCC4] hover:text-white hover:bg-white/10 transition-colors"
                title="Cerrar ventana"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">Nombre de la Mascota *</label>
                  <input
                    type="text"
                    required
                    value={editingPet.name}
                    onChange={(e) => setEditingPet({ ...editingPet, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] focus:outline-none focus:ring-2 focus:ring-[#E27D18]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">Especie</label>
                  <select
                    value={editingPet.petDetails?.species || 'Perro'}
                    onChange={(e) =>
                      setEditingPet({
                        ...editingPet,
                        petDetails: {
                          ...editingPet.petDetails,
                          species: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] focus:outline-none focus:ring-2 focus:ring-[#E27D18]"
                  >
                    <option value="Perro">Perro 🐕</option>
                    <option value="Gato">Gato 🐈</option>
                    <option value="Ave">Ave 🦜</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">Raza</label>
                  <input
                    type="text"
                    value={editingPet.petDetails?.breed || ''}
                    onChange={(e) =>
                      setEditingPet({
                        ...editingPet,
                        petDetails: {
                          ...editingPet.petDetails,
                          species: editingPet.petDetails?.species || 'Perro',
                          breed: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] focus:outline-none focus:ring-2 focus:ring-[#E27D18]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">Nacimiento</label>
                  <input
                    type="date"
                    value={editingPet.birthDate}
                    onChange={(e) => setEditingPet({ ...editingPet, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] focus:outline-none focus:ring-2 focus:ring-[#E27D18]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">Microchip / ID</label>
                  <input
                    type="text"
                    value={editingPet.idNumber || editingPet.petDetails?.microchipNumber || ''}
                    onChange={(e) =>
                      setEditingPet({
                        ...editingPet,
                        idNumber: e.target.value,
                        petDetails: {
                          ...editingPet.petDetails,
                          species: editingPet.petDetails?.species || 'Perro',
                          microchipNumber: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] font-mono focus:outline-none focus:ring-2 focus:ring-[#E27D18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">Clínica Veterinaria / Guardia</label>
                  <input
                    type="text"
                    value={editingPet.medicalInsurance.provider || ''}
                    onChange={(e) =>
                      setEditingPet({
                        ...editingPet,
                        medicalInsurance: {
                          ...editingPet.medicalInsurance,
                          provider: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] focus:outline-none focus:ring-2 focus:ring-[#E27D18]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">Teléfono Urgencias / Guardia</label>
                  <input
                    type="text"
                    value={editingPet.medicalInsurance.emergencyPhone || ''}
                    onChange={(e) =>
                      setEditingPet({
                        ...editingPet,
                        medicalInsurance: {
                          ...editingPet.medicalInsurance,
                          emergencyPhone: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] font-mono focus:outline-none focus:ring-2 focus:ring-[#E27D18]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#3E3020] mb-1">
                  Dirección de la Veterinaria / Guardia 24hs
                </label>
                <input
                  type="text"
                  placeholder="Ej: Av. Cabildo 1250, Belgrano, CABA"
                  value={editingPet.petDetails?.vetAddress || editingPet.medicalInsurance.address || ''}
                  onChange={(e) =>
                    setEditingPet({
                      ...editingPet,
                      medicalInsurance: {
                        ...editingPet.medicalInsurance,
                        address: e.target.value,
                      },
                      petDetails: {
                        ...editingPet.petDetails,
                        species: editingPet.petDetails?.species || 'Perro',
                        vetAddress: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] focus:outline-none focus:ring-2 focus:ring-[#E27D18]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">Veterinario de Cabecera</label>
                  <input
                    type="text"
                    value={editingPet.primaryDoctor?.name || ''}
                    onChange={(e) =>
                      setEditingPet({
                        ...editingPet,
                        primaryDoctor: {
                          name: e.target.value,
                          specialty: 'Veterinaria',
                          phone: editingPet.primaryDoctor?.phone || '',
                          clinic: editingPet.medicalInsurance.provider || '',
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] focus:outline-none focus:ring-2 focus:ring-[#E27D18]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">Teléfono Veterinario</label>
                  <input
                    type="text"
                    value={editingPet.primaryDoctor?.phone || ''}
                    onChange={(e) =>
                      setEditingPet({
                        ...editingPet,
                        primaryDoctor: {
                          name: editingPet.primaryDoctor?.name || 'Veterinario',
                          specialty: 'Veterinaria',
                          phone: e.target.value,
                          clinic: editingPet.medicalInsurance.provider || '',
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] font-mono focus:outline-none focus:ring-2 focus:ring-[#E27D18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">Última Desparasitación</label>
                  <input
                    type="date"
                    value={editingPet.petDetails?.lastDewormingDate || ''}
                    onChange={(e) =>
                      setEditingPet({
                        ...editingPet,
                        petDetails: {
                          ...editingPet.petDetails,
                          species: editingPet.petDetails?.species || 'Perro',
                          lastDewormingDate: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] focus:outline-none focus:ring-2 focus:ring-[#E27D18]"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block font-semibold text-[#3E3020] mb-1">Estado de Esterilización</label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingPet({
                        ...editingPet,
                        petDetails: {
                          ...editingPet.petDetails,
                          species: editingPet.petDetails?.species || 'Perro',
                          isNeutered: !editingPet.petDetails?.isNeutered,
                        },
                      })
                    }
                    className={`w-full py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      editingPet.petDetails?.isNeutered
                        ? 'bg-[#1E7E52] text-white border-[#1E7E52]'
                        : 'bg-[#FFF9ED] text-[#6E5F4D] border-[#E9DCC4]'
                    }`}
                  >
                    {editingPet.petDetails?.isNeutered ? '✓ Castrado/a' : 'No castrado/a'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-[#FFF9ED] px-4 py-3 sm:px-6 border-t border-[#E9DCC4] flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPetToDelete(editingPet);
                  setEditingPet(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#C21D30] bg-[#FDF1F2] border border-[#F5B8BE] hover:bg-[#FCE3E5] rounded-lg cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Mascota</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPet(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#6E5F4D] hover:text-[#3E3020]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateMember(editingPet);
                    setEditingPet(null);
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#E27D18] hover:bg-[#C66506] rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {petToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#F5B8BE] shadow-2xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FDF1F2] text-[#C21D30] flex items-center justify-center mx-auto border border-[#F5B8BE]">
              <AlertTriangle className="w-6 h-6 text-[#C21D30]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#3E3020]">
                ¿Eliminar ficha de {petToDelete.name}?
              </h3>
              <p className="text-xs text-[#6E5F4D] mt-1">
                Esta acción quitará a la mascota de la libreta familiar.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPetToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#6E5F4D] bg-[#FFF9ED] border border-[#E9DCC4] hover:bg-white rounded-lg transition-colors"
              >
                No, conservar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMember(petToDelete.id);
                  setPetToDelete(null);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#C21D30] hover:bg-[#9E1B28] rounded-lg transition-colors shadow-xs"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
