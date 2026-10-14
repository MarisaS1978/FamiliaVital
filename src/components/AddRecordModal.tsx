import React, { useState } from 'react';
import {
  FamilyMember,
  MedicalAppointment,
  MedicineItem,
  VaccineRecord,
  AllergyRecord,
  PrescriptionRecord,
  BloodType,
  FamilyRelationship,
} from '../types/health';
import {
  Calendar,
  Pill,
  Syringe,
  AlertTriangle,
  FileText,
  UserPlus,
  X,
} from 'lucide-react';

type RecordCategory = 'appointment' | 'medicine' | 'vaccine' | 'allergy' | 'prescription' | 'member';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onAddAppointment: (apt: MedicalAppointment) => void;
  onAddMedicine: (med: MedicineItem) => void;
  onAddVaccine: (vac: VaccineRecord) => void;
  onAddAllergy: (alg: AllergyRecord) => void;
  onAddPrescription: (rx: PrescriptionRecord) => void;
  onAddMember: (member: FamilyMember) => void;
  initialCategory?: RecordCategory;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddAppointment,
  onAddMedicine,
  onAddVaccine,
  onAddAllergy,
  onAddPrescription,
  onAddMember,
  initialCategory = 'appointment',
}) => {
  const [category, setCategory] = useState<RecordCategory>(initialCategory);

  // Common member ID state
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');

  // Form states for Appointment
  const [aptDoctor, setAptDoctor] = useState('');
  const [aptSpecialty, setAptSpecialty] = useState('Pediatría de Control');
  const [aptClinic, setAptClinic] = useState('Sanatorio de la Trinidad');
  const [aptDateTime, setAptDateTime] = useState('');
  const [aptReason, setAptReason] = useState('');
  const [aptPrep, setAptPrep] = useState('');

  // Form states for Medicine
  const [medName, setMedName] = useState('');
  const [medIngredient, setMedIngredient] = useState('');
  const [medForm, setMedForm] = useState<any>('Comprimidos');
  const [medLocation, setMedLocation] = useState<any>('Botiquín Baño');
  const [medQuantity, setMedQuantity] = useState(1);
  const [medUnit, setMedUnit] = useState('frasco');
  const [medExpiry, setMedExpiry] = useState('');
  const [medDosage, setMedDosage] = useState('');

  // Form states for Vaccine
  const [vacName, setVacName] = useState('');
  const [vacDisease, setVacDisease] = useState('');
  const [vacDose, setVacDose] = useState('Dosis Única');
  const [vacAge, setVacAge] = useState('Control anual');
  const [vacStatus, setVacStatus] = useState<any>('due');
  const [vacDate, setVacDate] = useState('');
  const [vacLot, setVacLot] = useState('');
  const [vacCenter, setVacCenter] = useState('');

  // Form states for Allergy
  const [algName, setAlgName] = useState('');
  const [algType, setAlgType] = useState<any>('Medicamento');
  const [algSeverity, setAlgSeverity] = useState<any>('Moderada');
  const [algSymptoms, setAlgSymptoms] = useState('');
  const [algProtocol, setAlgProtocol] = useState('');

  // Form states for Prescription
  const [rxTitle, setRxTitle] = useState('');
  const [rxType, setRxType] = useState<any>('Receta Médica');
  const [rxDoctor, setRxDoctor] = useState('');
  const [rxExpiry, setRxExpiry] = useState('');
  const [rxMeds, setRxMeds] = useState('');

  // Form states for Member
  const [memName, setMemName] = useState('');
  const [memRelation, setMemRelation] = useState<FamilyRelationship>('Hijo/a');
  const [memBirth, setMemBirth] = useState('');
  const [memBlood, setMemBlood] = useState<BloodType>('O+');
  const [memDNI, setMemDNI] = useState('');
  const [memInsurance, setMemInsurance] = useState('OSDE 310');
  const [memAffiliate, setMemAffiliate] = useState('');
  const [memEmergencyPhone, setMemEmergencyPhone] = useState('0810-888-7788');
  const [memDocName, setMemDocName] = useState('');
  const [memDocPhone, setMemDocPhone] = useState('');
  const [memVitalNotes, setMemVitalNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (category === 'appointment') {
      const newApt: MedicalAppointment = {
        id: `apt-${Date.now()}`,
        memberId: selectedMemberId,
        specialty: aptSpecialty,
        doctorName: aptDoctor || 'Especialista',
        clinicAddress: aptClinic,
        dateTime: aptDateTime || new Date().toISOString().slice(0, 16),
        status: 'scheduled',
        reason: aptReason || 'Control rutinario',
        preparationNotes: aptPrep || undefined,
      };
      onAddAppointment(newApt);
    } else if (category === 'medicine') {
      const newMed: MedicineItem = {
        id: `med-${Date.now()}`,
        name: medName,
        activeIngredient: medIngredient || medName,
        category: 'Primeros Auxilios',
        form: medForm,
        stockQuantity: Number(medQuantity) || 1,
        unit: medUnit,
        expiryDate: medExpiry || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
        location: medLocation,
        assignedMemberIds: selectedMemberId ? [selectedMemberId] : [],
        dosageInstructions: medDosage || undefined,
        requiresPrescription: false,
      };
      onAddMedicine(newMed);
    } else if (category === 'vaccine') {
      const newVac: VaccineRecord = {
        id: `vac-${Date.now()}`,
        memberId: selectedMemberId,
        vaccineName: vacName,
        diseaseTarget: vacDisease || vacName,
        doseNumber: vacDose,
        recommendedAge: vacAge,
        recommendedAgeMonths: 0,
        status: vacStatus,
        applicationDate: vacDate || (vacStatus === 'applied' ? new Date().toISOString().split('T')[0] : undefined),
        lotNumber: vacLot || undefined,
        healthCenter: vacCenter || undefined,
        isNationalCalendar: false,
      };
      onAddVaccine(newVac);
    } else if (category === 'allergy') {
      const newAlg: AllergyRecord = {
        id: `alg-${Date.now()}`,
        memberId: selectedMemberId,
        allergen: algName,
        type: algType,
        severity: algSeverity,
        reactionDescription: algSymptoms || 'Reacción adversa',
        emergencyProtocol: algProtocol || 'Contactar al médico tratante y acudir a guardia',
        diagnosedYear: new Date().getFullYear(),
      };
      onAddAllergy(newAlg);
    } else if (category === 'prescription') {
      const newRx: PrescriptionRecord = {
        id: `rx-${Date.now()}`,
        memberId: selectedMemberId,
        title: rxTitle,
        type: rxType,
        doctorName: rxDoctor || 'Médico Tratante',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: rxExpiry || undefined,
        status: 'Vigente',
        medicationsIncluded: rxMeds ? rxMeds.split(',').map((s) => s.trim()) : undefined,
      };
      onAddPrescription(newRx);
    } else if (category === 'member') {
      const newMem: FamilyMember = {
        id: `member-${Date.now()}`,
        name: memName,
        relationship: memRelation,
        birthDate: memBirth || '2020-01-01',
        bloodType: memBlood,
        idNumber: memDNI || '11.222.333',
        medicalInsurance: {
          provider: memInsurance,
          plan: 'Estándar',
          affiliateNumber: memAffiliate || '990011-01',
          emergencyPhone: memEmergencyPhone,
        },
        primaryDoctor: memDocName
          ? {
              name: memDocName,
              specialty: 'Cabecera',
              phone: memDocPhone || '-',
              clinic: 'Centro Médico',
            }
          : undefined,
        emergencyContacts: [
          { name: 'Contacto Familiar', relation: 'Familiar', phone: '+54 11 0000-0000', isPrimary: true },
        ],
        chronicConditions: [],
        vitalNotes: memVitalNotes || undefined,
      };
      onAddMember(newMem);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E9DCC4] shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#493B2A] text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">Nuevo Registro en FamiliaVital</h2>
            <p className="text-xs text-[#E9DCC4]">
              Selecciona el tipo de registro médico que deseas incorporar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#E9DCC4] hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar ventana"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div className="bg-[#FFF9ED] p-1.5 sm:p-2 border-b border-[#E9DCC4] grid grid-cols-3 sm:grid-cols-6 gap-1 text-center shrink-0">
          {[
            { id: 'appointment', label: 'Turno', icon: Calendar },
            { id: 'medicine', label: 'Remedio', icon: Pill },
            { id: 'vaccine', label: 'Vacuna', icon: Syringe },
            { id: 'allergy', label: 'Alergia', icon: AlertTriangle },
            { id: 'prescription', label: 'Receta', icon: FileText },
            { id: 'member', label: 'Integrante', icon: UserPlus },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = category === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setCategory(item.id as RecordCategory)}
                className={`py-1.5 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-white text-[#493B2A] shadow-xs'
                    : 'text-[#796B59] hover:text-[#493B2A]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#B87932]' : 'text-[#D9A441]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Container with Pinned Actions */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
            {/* Member selector for all non-member types */}
            {category !== 'member' && (
            <div>
              <label className="block font-semibold text-[#493B2A] mb-1">
                ¿A qué integrante familiar corresponde? *
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship} - {m.bloodType})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* CATEGORY: APPOINTMENT */}
          {category === 'appointment' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Especialidad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Pediatría, Oftalmología, Dentista..."
                    value={aptSpecialty}
                    onChange={(e) => setAptSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Médico / Profesional</label>
                  <input
                    type="text"
                    placeholder="Ej: Dra. Silvina Romero"
                    value={aptDoctor}
                    onChange={(e) => setAptDoctor(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Fecha y Hora *</label>
                  <input
                    type="datetime-local"
                    required
                    value={aptDateTime}
                    onChange={(e) => setAptDateTime(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Centro Médico / Dirección</label>
                  <input
                    type="text"
                    placeholder="Ej: Cerviño 4720 4° piso"
                    value={aptClinic}
                    onChange={(e) => setAptClinic(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#493B2A] mb-1">Motivo de Consulta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Control de crecimiento, dolor de oído, chequeo anual..."
                  value={aptReason}
                  onChange={(e) => setAptReason(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#493B2A] mb-1">Instrucciones de Preparación</label>
                <input
                  type="text"
                  placeholder="Ej: Ayuno de 8 horas, llevar libreta de vacunas, llevar radiografía..."
                  value={aptPrep}
                  onChange={(e) => setAptPrep(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                />
              </div>
            </>
          )}

          {/* CATEGORY: MEDICINE */}
          {category === 'medicine' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Nombre Comercial *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Ibuprofeno 4%, Paracetamol, Salbutamol..."
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Droga / Principio Activo</label>
                  <input
                    type="text"
                    placeholder="Ej: Ibuprofeno 40mg/ml"
                    value={medIngredient}
                    onChange={(e) => setMedIngredient(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Formato</label>
                  <select
                    value={medForm}
                    onChange={(e) => setMedForm(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  >
                    <option value="Comprimidos">Comprimidos</option>
                    <option value="Jarabe / Suspensión">Jarabe / Suspensión</option>
                    <option value="Gotas">Gotas</option>
                    <option value="Pomada / Crema">Pomada / Crema</option>
                    <option value="Inhalador">Inhalador</option>
                    <option value="Material de curación">Material de curación</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Ubicación *</label>
                  <select
                    value={medLocation}
                    onChange={(e) => setMedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  >
                    <option value="Botiquín Baño">Botiquín Baño</option>
                    <option value="Heladera">Heladera</option>
                    <option value="Mochila Niños">Mochila Niños</option>
                    <option value="Mesa de Luz">Mesa de Luz</option>
                    <option value="Auto / Viaje">Auto / Viaje</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Vencimiento *</label>
                  <input
                    type="date"
                    required
                    value={medExpiry}
                    onChange={(e) => setMedExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#493B2A] mb-1">Posología / Dosis indicadas</label>
                <textarea
                  rows={2}
                  placeholder="Ej: Sofía: 3ml cada 8 horas con fiebre > 38°C según peso actual."
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                />
              </div>
            </>
          )}

          {/* CATEGORY: VACCINE */}
          {category === 'vaccine' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Nombre de la Vacuna *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Meningococo B (Bexsero), Antigripal 2026, Dengue..."
                    value={vacName}
                    onChange={(e) => setVacName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Protege Contra</label>
                  <input
                    type="text"
                    placeholder="Ej: Meningitis por meningococo grupo B"
                    value={vacDisease}
                    onChange={(e) => setVacDisease(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Dosis</label>
                  <input
                    type="text"
                    placeholder="Ej: 1ª Dosis, Refuerzo..."
                    value={vacDose}
                    onChange={(e) => setVacDose(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Edad Sugerida</label>
                  <input
                    type="text"
                    placeholder="Ej: 2 años, Ingreso escolar..."
                    value={vacAge}
                    onChange={(e) => setVacAge(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Estado</label>
                  <select
                    value={vacStatus}
                    onChange={(e) => setVacStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  >
                    <option value="due">Pendiente / En fecha</option>
                    <option value="applied">Aplicada</option>
                    <option value="upcoming">Próxima por edad</option>
                    <option value="overdue">Atrasada</option>
                  </select>
                </div>
              </div>

              {vacStatus === 'applied' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block font-semibold text-[#493B2A] mb-1">Fecha de Aplicación</label>
                    <input
                      type="date"
                      value={vacDate}
                      onChange={(e) => setVacDate(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#493B2A] mb-1">N° de Lote</label>
                    <input
                      type="text"
                      placeholder="Lote de vacuna"
                      value={vacLot}
                      onChange={(e) => setVacLot(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] font-mono focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#493B2A] mb-1">Vacunatorio / Centro</label>
                    <input
                      type="text"
                      placeholder="Sanatorio / Hospital"
                      value={vacCenter}
                      onChange={(e) => setVacCenter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* CATEGORY: ALLERGY */}
          {category === 'allergy' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Alérgeno / Sustancia *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Penicilina, Nueces, Picadura de abeja, Látex..."
                    value={algName}
                    onChange={(e) => setAlgName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Tipo de Alergia</label>
                  <select
                    value={algType}
                    onChange={(e) => setAlgType(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  >
                    <option value="Medicamento">Medicamento</option>
                    <option value="Alimento">Alimento</option>
                    <option value="Ambiental / Polen">Ambiental / Polen</option>
                    <option value="Picadura de Insectos">Picadura de Insectos</option>
                    <option value="Contacto / Látex">Contacto / Látex</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#493B2A] mb-1">Severidad *</label>
                <select
                  value={algSeverity}
                  onChange={(e) => setAlgSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg font-semibold text-[#B42332] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                >
                  <option value="Leve">Leve (prurito, estornudos leves)</option>
                  <option value="Moderada">Moderada (inflamación local, edema, vómito)</option>
                  <option value="Severa (Riesgo de anafilaxia)">Severa (Riesgo de anafilaxia / Cierre de glotis)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#493B2A] mb-1">Síntomas Típicos</label>
                <input
                  type="text"
                  placeholder="Ej: Urticaria difusa, dificultad para respirar, hinchazón..."
                  value={algSymptoms}
                  onChange={(e) => setAlgSymptoms(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#493B2A] mb-1">Protocolo de Emergencia *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ej: PROHIBIDO ADMINISTRAR. En caso de ingesta accidental, aplicar antihistamínico y trasladar urgente a guardia."
                  value={algProtocol}
                  onChange={(e) => setAlgProtocol(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                />
              </div>
            </>
          )}

          {/* CATEGORY: PRESCRIPTION */}
          {category === 'prescription' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Título del Documento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Receta Amoxicilina, Certificado Apto Físico..."
                    value={rxTitle}
                    onChange={(e) => setRxTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Tipo de Documento</label>
                  <select
                    value={rxType}
                    onChange={(e) => setRxType(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  >
                    <option value="Receta Médica">Receta Médica</option>
                    <option value="Estudio / Laboratorio">Estudio / Laboratorio</option>
                    <option value="Certificado de Aptitud">Certificado de Aptitud</option>
                    <option value="Indicación Pediátrica">Indicación Pediátrica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Médico Emisor</label>
                  <input
                    type="text"
                    placeholder="Ej: Dra. Silvina Romero"
                    value={rxDoctor}
                    onChange={(e) => setRxDoctor(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Fecha de Vencimiento de Receta</label>
                  <input
                    type="date"
                    value={rxExpiry}
                    onChange={(e) => setRxExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#493B2A] mb-1">Medicamentos Incluidos (separados por coma)</label>
                <input
                  type="text"
                  placeholder="Ej: Ibuprofeno 4% jarabe, Gotas óticas..."
                  value={rxMeds}
                  onChange={(e) => setRxMeds(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                />
              </div>
            </>
          )}

          {/* CATEGORY: MEMBER */}
          {category === 'member' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Lucas Rossi"
                    value={memName}
                    onChange={(e) => setMemName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Parentesco</label>
                  <select
                    value={memRelation}
                    onChange={(e) => setMemRelation(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  >
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Madre">Madre</option>
                    <option value="Padre">Padre</option>
                    <option value="Abuelo/a">Abuelo/a</option>
                    <option value="Tutor/a">Tutor/a</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    required
                    value={memBirth}
                    onChange={(e) => setMemBirth(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Grupo Sanguíneo</label>
                  <select
                    value={memBlood}
                    onChange={(e) => setMemBlood(e.target.value as any)}
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
                    placeholder="Ej: 45.100.222"
                    value={memDNI}
                    onChange={(e) => setMemDNI(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] font-mono focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">Obra Social / Prepaga</label>
                  <input
                    type="text"
                    placeholder="Ej: OSDE, Swiss Medical, Galeno"
                    value={memInsurance}
                    onChange={(e) => setMemInsurance(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#493B2A] mb-1">N° de Afiliado</label>
                  <input
                    type="text"
                    placeholder="Ej: 448920-04"
                    value={memAffiliate}
                    onChange={(e) => setMemAffiliate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] font-mono focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
                  />
                </div>
              </div>
            </>
          )}

          </div>

          {/* Form Actions - ALWAYS PINNED AND FULLY VISIBLE */}
          <div className="bg-[#FFF9ED] px-4 py-3 sm:px-6 sm:py-3.5 border-t border-[#E9DCC4] flex items-center justify-end gap-2.5 shrink-0 z-10 shadow-2xs">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#796B59] hover:text-[#493B2A] hover:bg-white rounded-lg border border-transparent hover:border-[#E9DCC4] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#B87932] hover:bg-[#A06424] rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              Guardar en Libreta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
