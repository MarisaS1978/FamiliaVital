export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'N/A';

export type FamilyRelationship = 'Hijo/a' | 'Madre' | 'Padre' | 'Abuelo/a' | 'Tutor/a' | 'Mascota' | 'Otro';

export interface EmergencyContact {
  id?: string;
  name: string;
  relation: string;
  phone: string;
  isPrimary?: boolean;
}

export interface PetDetails {
  species: 'Perro' | 'Gato' | 'Ave' | 'Otro';
  breed?: string;
  microchipNumber?: string;
  vetName?: string;
  vetPhone?: string;
  vetClinic?: string;
  vetAddress?: string; // Dirección de la clínica veterinaria / guardia
  lastDewormingDate?: string;
  isNeutered?: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: FamilyRelationship;
  birthDate: string; // YYYY-MM-DD
  bloodType: BloodType;
  idNumber: string; // DNI / Cédula / Microchip
  medicalInsurance: {
    provider: string; // e.g. OSDE, Swiss Medical, PAMI, Hospital Veterinario, etc.
    plan: string;
    affiliateNumber: string;
    emergencyPhone?: string;
    address?: string; // Dirección de la clínica / guardia médica
  };
  primaryDoctor?: {
    name: string;
    specialty: string;
    phone: string;
    clinic: string;
    address?: string; // Dirección del consultorio / centro médico
  };
  emergencyContacts: EmergencyContact[];
  chronicConditions: string[];
  vitalNotes?: string;
  avatarUrl?: string;
  avatarType?: 'image' | 'initials' | 'icon';
  avatarIcon?: string; // e.g. 'dog', 'cat', 'boy', 'girl', 'woman', 'man', 'senior'
  avatarColor?: string; // hex color code
  isPet?: boolean;
  petDetails?: PetDetails;
}

export type VaccineStatus = 'applied' | 'due' | 'overdue' | 'upcoming';

export interface VaccineRecord {
  id: string;
  memberId: string;
  vaccineName: string;
  diseaseTarget: string;
  doseNumber: string; // e.g., '1ª Dosis', 'Refuerzo', 'Única'
  recommendedAge: string; // e.g., 'Recién nacido', '2 meses', '5 años', '11 años', 'Adultos', 'Cachorro'
  recommendedAgeMonths: number;
  status: VaccineStatus;
  applicationDate?: string;
  lotNumber?: string;
  healthCenter?: string;
  notes?: string;
  isNationalCalendar: boolean;
  documentUrl?: string; // Data URL or scanned document
  documentName?: string;
  documentType?: 'pdf' | 'image';
  isPetVaccine?: boolean;
}

export type MedicineCategory = 'Analgésico / Antitérmico' | 'Antibiótico' | 'Antialérgico' | 'Respiratorio' | 'Digestivo' | 'Primeros Auxilios' | 'Crónico / Prescripción' | 'Otro';
export type MedicineForm = 'Comprimidos' | 'Jarabe / Suspensión' | 'Gotas' | 'Pomada / Crema' | 'Inhalador' | 'Inyectable' | 'Material de curación';
export type MedicineLocation = 'Botiquín Baño' | 'Heladera' | 'Mochila Niños' | 'Mesa de Luz' | 'Auto / Viaje';

export interface MedicineItem {
  id: string;
  name: string;
  activeIngredient: string;
  category: MedicineCategory;
  form: MedicineForm;
  stockQuantity: number;
  unit: string; // 'comp.', 'ml', 'frasco', 'ampollas', 'unid.'
  expiryDate: string; // YYYY-MM-DD
  location: MedicineLocation;
  assignedMemberIds: string[]; // member ids or empty for general family
  dosageInstructions?: string;
  notes?: string;
  requiresPrescription: boolean;
  openedDate?: string; // some syrups/drops expire 1-3 months after opening
  photoUrl?: string; // Foto de la caja, envase o prospecto
  photoName?: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface MedicalAppointment {
  id: string;
  memberId: string;
  specialty: string;
  doctorName: string;
  clinicAddress: string;
  dateTime: string; // YYYY-MM-DDTHH:mm
  status: AppointmentStatus;
  reason: string;
  preparationNotes?: string;
  postVisitNotes?: string;
  telemedicineUrl?: string;
}

export type AllergyType = 'Medicamento' | 'Alimento' | 'Ambiental / Polen' | 'Picadura de Insectos' | 'Contacto / Látex' | 'Otro';
export type AllergySeverity = 'Leve' | 'Moderada' | 'Severa (Riesgo de anafilaxia)';

export interface AllergyRecord {
  id: string;
  memberId: string;
  allergen: string;
  type: AllergyType;
  severity: AllergySeverity;
  reactionDescription: string;
  emergencyProtocol: string;
  diagnosedYear?: number;
}

export type PrescriptionType = 'Receta Médica' | 'Estudio / Laboratorio' | 'Certificado de Aptitud' | 'Indicación Pediátrica';
export type PrescriptionStatus = 'Vigente' | 'Utilizada en farmacia' | 'Vencida';

export interface PrescriptionRecord {
  id: string;
  memberId: string;
  title: string;
  type: PrescriptionType;
  doctorName: string;
  issueDate: string;
  expiryDate?: string;
  status: PrescriptionStatus;
  fileName?: string;
  fileData?: string; // Data URL or mock preview
  notes?: string;
  medicationsIncluded?: string[];
}

export type CaregiverAccessLevel = 'emergency_only' | 'pediatric_caregiver' | 'full_access';

export interface CaregiverShareLink {
  id: string;
  recipientName: string;
  recipientRole: string; // 'Niñera', 'Pediatra', 'Abuelos', 'Colegio / Club'
  memberIds: string[]; // empty means all family
  accessLevel: CaregiverAccessLevel;
  pinCode: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}
