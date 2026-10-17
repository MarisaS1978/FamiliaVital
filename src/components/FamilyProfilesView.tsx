import React, { useState, useRef, useEffect } from 'react';
import { FamilyMember, AllergyRecord, EmergencyContact, BloodType, FamilyRelationship } from '../types/health';
import { formatAge, shareViaWhatsApp, readFileAsDataURL } from '../utils/healthUtils';
import {
  Shield,
  AlertTriangle,
  Phone,
  Heart,
  Plus,
  Edit2,
  Trash2,
  FileText,
  MessageCircle,
  Upload,
  User,
  Dog,
  Cat,
  Baby,
  Smile,
  Check,
  X,
  Stethoscope,
  Sparkles,
  Info,
  UserPlus,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';

interface FamilyProfilesViewProps {
  members: FamilyMember[];
  allergies: AllergyRecord[];
  selectedMemberId: string | 'all';
  onUpdateMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
  onAddAllergy: () => void;
  onDeleteAllergy: (id: string) => void;
  onAddMember: () => void;
  onAddPet?: () => void;
}

export const FamilyProfilesView: React.FC<FamilyProfilesViewProps> = ({
  members,
  allergies,
  selectedMemberId,
  onUpdateMember,
  onDeleteMember,
  onAddAllergy,
  onDeleteAllergy,
  onAddMember,
  onAddPet,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'human' | 'pet'>('all');
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Ensure filter doesn't hide a specifically selected member
  useEffect(() => {
    if (selectedMemberId && selectedMemberId !== 'all') {
      const match = members.find((m) => m.id === selectedMemberId);
      if (match) {
        const isPet = match.isPet || match.relationship === 'Mascota';
        if (isPet && filterType === 'human') setFilterType('all');
        if (!isPet && filterType === 'pet') setFilterType('all');
      }
    }
  }, [selectedMemberId, members, filterType]);

  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Quick contact add state for inline card editing
  const [quickAddContactMemberId, setQuickAddContactMemberId] = useState<string | null>(null);
  const [quickContactName, setQuickContactName] = useState('');
  const [quickContactRelation, setQuickContactRelation] = useState('Familiar');
  const [quickContactPhone, setQuickContactPhone] = useState('');

  // Temporary state for editing emergency contacts in modal
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Familiar');
  const [newContactPhone, setNewContactPhone] = useState('');

  // Temporary state for editing chronic conditions
  const [newConditionInput, setNewConditionInput] = useState('');

  const handleQuickAddEmergencyContact = (member: FamilyMember) => {
    if (!quickContactName.trim() || !quickContactPhone.trim()) return;
    const newContact: EmergencyContact = {
      id: `c-${Date.now()}`,
      name: quickContactName.trim(),
      relation: quickContactRelation.trim() || 'Familiar',
      phone: quickContactPhone.trim(),
    };
    onUpdateMember({
      ...member,
      emergencyContacts: [...member.emergencyContacts, newContact],
    });
    setQuickContactName('');
    setQuickContactPhone('');
    setQuickAddContactMemberId(null);
  };

  const handleQuickRemoveContact = (member: FamilyMember, contactIdx: number) => {
    const updated = member.emergencyContacts.filter((_, idx) => idx !== contactIdx);
    onUpdateMember({
      ...member,
      emergencyContacts: updated,
    });
  };

  // Filter members based on selected ID and human/pet filter
  const displayedMembers = members.filter((m) => {
    if (selectedMemberId !== 'all' && m.id !== selectedMemberId) return false;
    const isPet = m.isPet || m.relationship === 'Mascota';
    if (filterType === 'human' && isPet) return false;
    if (filterType === 'pet' && !isPet) return false;
    return true;
  });

  const handleShareProfileWhatsApp = (member: FamilyMember) => {
    const isPet = member.isPet || member.relationship === 'Mascota';
    const memberAllergies = allergies.filter((a) => a.memberId === member.id);

    const allergyText =
      memberAllergies.length > 0
        ? memberAllergies.map((a) => `• ${a.allergen} (${a.severity})`).join('\n')
        : 'Sin alergias registradas';

    const contactsText = member.emergencyContacts
      .map((c) => `• ${c.name} (${c.relation}): ${c.phone}`)
      .join('\n');

    const msg = `*FICHA MÉDICA DE FAMILIAVITAL*
👤 *${member.name}* (${member.relationship})
• Edad: ${formatAge(member.birthDate)}
• ${isPet ? 'Microchip' : 'DNI'}: ${member.idNumber}
• Grupo Sanguíneo: ${member.bloodType}

🏥 *COBERTURA / PREPAGA:*
• ${member.medicalInsurance.provider} (Plan ${member.medicalInsurance.plan})
• N° Afiliado: ${member.medicalInsurance.affiliateNumber}
• Urgencias: ${member.medicalInsurance.emergencyPhone || '-'}

⚠️ *ALERGIAS:*
${allergyText}

🩺 *MÉDICO / VETERINARIO DE CABECERA:*
• ${member.primaryDoctor?.name || 'No especificado'} (${member.primaryDoctor?.phone || '-'})

📞 *CONTACTOS DE EMERGENCIA:*
${contactsText || 'Sin contactos especificados'}

Notas: ${member.vitalNotes || 'Ninguna'}
_Compartido desde FamiliaVital_`;

    shareViaWhatsApp(msg);
  };

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingMember) {
      try {
        const result = await readFileAsDataURL(file);
        setEditingMember({
          ...editingMember,
          avatarUrl: result.url,
          avatarType: 'image',
        });
      } catch (err) {
        console.error('Error reading avatar file:', err);
      }
    }
  };

  const handleSelectIconAvatar = (iconName: string) => {
    if (!editingMember) return;
    setEditingMember({
      ...editingMember,
      avatarType: 'icon',
      avatarIcon: iconName,
      avatarUrl: undefined,
    });
  };

  const handleAddEmergencyContact = () => {
    if (!editingMember || !newContactName.trim() || !newContactPhone.trim()) return;
    const newContact: EmergencyContact = {
      id: `c-${Date.now()}`,
      name: newContactName.trim(),
      relation: newContactRelation.trim() || 'Familiar',
      phone: newContactPhone.trim(),
    };
    setEditingMember({
      ...editingMember,
      emergencyContacts: [...editingMember.emergencyContacts, newContact],
    });
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleRemoveEmergencyContact = (idxToRemove: number) => {
    if (!editingMember) return;
    setEditingMember({
      ...editingMember,
      emergencyContacts: editingMember.emergencyContacts.filter((_, idx) => idx !== idxToRemove),
    });
  };

  const handleAddCondition = () => {
    if (!editingMember || !newConditionInput.trim()) return;
    setEditingMember({
      ...editingMember,
      chronicConditions: [...editingMember.chronicConditions, newConditionInput.trim()],
    });
    setNewConditionInput('');
  };

  const handleRemoveCondition = (idxToRemove: number) => {
    if (!editingMember) return;
    setEditingMember({
      ...editingMember,
      chronicConditions: editingMember.chronicConditions.filter((_, idx) => idx !== idxToRemove),
    });
  };

  const renderAvatarDisplay = (member: FamilyMember, sizeClass = 'w-16 h-16') => {
    if (member.avatarUrl) {
      return (
        <img
          src={member.avatarUrl}
          alt={member.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      );
    }

    if (member.avatarType === 'icon' || member.avatarIcon) {
      const emojiMap: Record<string, string> = {
        dog: '🐶',
        cat: '🐱',
        boy: '👦',
        girl: '👧',
        woman: '👩',
        man: '👨',
        baby: '👶',
        grandma: '👵',
        grandpa: '👴',
        rabbit: '🐰',
        bird: '🦜',
      };
      const emoji = member.avatarIcon ? emojiMap[member.avatarIcon] : null;
      if (emoji) {
        return (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-[#FEEAA2]/70 select-none">
            <span>{emoji}</span>
          </div>
        );
      }
    }

    if (member.isPet || member.relationship === 'Mascota') {
      if (member.petDetails?.species === 'Gato') {
        return (
          <div className="w-full h-full flex items-center justify-center bg-[#FEEAA2] text-[#E26D14]">
            <Cat className="w-8 h-8" />
          </div>
        );
      }
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#FEEAA2] text-[#E26D14]">
          <Dog className="w-8 h-8" />
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center font-bold text-xl text-[#E26D14] bg-[#FFF9ED]">
        {member.name.charAt(0)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-[#E9DCC4] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#3E3020]">
            Fichas Médicas Familiares y Mascotas
          </h2>
          <p className="text-xs text-[#6E5F4D] mt-0.5">
            Datos clínicos completos, contactos de emergencia editables, coberturas y protocolos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-[#FFF9ED] border border-[#E9DCC4] rounded-lg">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-white text-[#3E3020] shadow-xs'
                  : 'text-[#6E5F4D] hover:text-[#3E3020]'
              }`}
            >
              Todos ({members.length})
            </button>
            <button
              onClick={() => setFilterType('human')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'human'
                  ? 'bg-white text-[#3E3020] shadow-xs'
                  : 'text-[#6E5F4D] hover:text-[#3E3020]'
              }`}
            >
              Humanos ({members.filter((m) => !m.isPet && m.relationship !== 'Mascota').length})
            </button>
            <button
              onClick={() => setFilterType('pet')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'pet'
                  ? 'bg-[#E26D14] text-white shadow-xs'
                  : 'text-[#6E5F4D] hover:text-[#3E3020]'
              }`}
            >
              <span>🐾 Mascotas</span>
              <span>({members.filter((m) => m.isPet || m.relationship === 'Mascota').length})</span>
            </button>
          </div>

          <button
            onClick={onAddAllergy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#C21D30] bg-[#FDF1F2] border border-[#F5B8BE] rounded-lg hover:bg-[#FCE3E5] transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            title="Registrar alergia o intolerancia"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#C21D30]" />
            <span>Alergia</span>
          </button>

          <button
            onClick={onAddMember}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3E3020] bg-white border border-[#E9DCC4] hover:bg-[#FFF9ED] rounded-lg transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            title="Agregar familiar humano"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#E27D18]" />
            <span>Familiar</span>
          </button>

          <button
            onClick={onAddPet || onAddMember}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#E27D18] hover:bg-[#C66506] rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
            title="Agregar nueva mascota (Perro, Gato, etc.)"
          >
            <Dog className="w-3.5 h-3.5 text-white" />
            <span>Mascota</span>
          </button>
        </div>
      </div>

      {/* Explanatory banner for Image & Document Utility */}
      <div className="p-4 rounded-xl bg-[#FFF9ED] border border-[#E9DCC4] flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#FEEAA2] flex items-center justify-center shrink-0 text-[#E27D18]">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1 text-[#6E5F4D]">
          <div className="font-bold text-[#3E3020]">
            💡 ¿Qué utilidad tiene la foto o ícono en la ficha médica?
          </div>
          <p>
            • <strong>Identificación en guardias y urgencias:</strong> Permite que médicos, enfermeros y cuidadores (niñeras, abuelos, maestras) reconozcan al instante a quién pertenece la ficha sin confundir hermanos ni recetas.
          </p>
          <p>
            • <strong>Opcional y personalizable:</strong> Si prefieres no usar fotos reales, puedes elegir un ícono representativo (🐶, 🐱, 👦, 👧, 👩, 👨) o tus iniciales al hacer clic en "Editar Ficha".
          </p>
        </div>
      </div>

      {/* Members list */}
      <div className="space-y-6">
        {displayedMembers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-[#E9DCC4] space-y-3">
            <Smile className="w-8 h-8 text-[#E26D14] mx-auto" />
            <h3 className="font-bold text-base text-[#3E3020]">No hay fichas para el filtro seleccionado</h3>
            <p className="text-xs text-[#6E5F4D]">Puedes agregar un nuevo integrante o mascota arriba.</p>
          </div>
        ) : (
          displayedMembers.map((member) => {
            const isPet = member.isPet || member.relationship === 'Mascota';
            const memberAllergies = allergies.filter((a) => a.memberId === member.id);

            return (
              <div
                key={member.id}
                className="bg-white rounded-xl border border-[#E9DCC4] shadow-xs overflow-hidden"
              >
                {/* Profile Top Bar */}
                <div className="p-4 sm:p-6 border-b border-[#E9DCC4] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FFF9ED]/60">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white border border-[#E9DCC4] shrink-0 shadow-2xs">
                      {renderAvatarDisplay(member)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-[#3E3020] truncate">
                          {member.name}
                        </h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                          isPet
                            ? 'bg-[#FEEAA2] border-[#E9DCC4] text-[#E27D18]'
                            : 'bg-white border-[#E9DCC4] text-[#3E3020]'
                        }`}>
                          {isPet ? (member.petDetails?.species ? `Mascota · ${member.petDetails.species}` : 'Mascota') : member.relationship}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E5F4D] mt-1">
                        <span>{formatAge(member.birthDate)}</span>
                        <span aria-hidden="true">·</span>
                        <span>Nacimiento: {member.birthDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {isPet ? 'Microchip: ' : 'DNI: '}
                          {member.idNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Blood type / Microchip Badge */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto shrink-0">
                    {/* Blood type / Pet species badge */}
                    <div className="flex-1 sm:flex-initial flex items-center justify-between sm:justify-center px-3 py-1.5 bg-white rounded-lg border border-[#E9DCC4] shadow-2xs shrink-0">
                      <div className="text-[10px] text-[#6E5F4D] font-medium mr-2">
                        {isPet ? 'Tipo' : 'Grupo'}
                      </div>
                      <div className="text-sm font-bold font-mono text-[#D96B47] tabular-nums">
                        {isPet ? (member.petDetails?.species || 'Canino') : member.bloodType}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-end">
                      {/* WhatsApp Share Button */}
                      <button
                        onClick={() => handleShareProfileWhatsApp(member)}
                        className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
                        title="Compartir ficha médica completa por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Compartir</span>
                      </button>

                      {/* Edit Member Full Profile Button */}
                      <button
                        onClick={() => setEditingMember(member)}
                        className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#E27D18] hover:bg-[#C66506] rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0"
                        title="Editar toda la ficha, contactos de emergencia y médico"
                      >
                        <Edit2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Editar</span>
                      </button>

                      {/* Delete Member Button */}
                      <button
                        onClick={() => setMemberToDelete(member)}
                        className="inline-flex items-center justify-center p-1.5 sm:p-2 text-[#C21D30] bg-[#FDF1F2] border border-[#F5B8BE] hover:bg-[#FCE3E5] rounded-lg transition-colors cursor-pointer shrink-0"
                        title={`Eliminar ficha de ${member.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C21D30]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Profile Details Grid */}
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 1. Cobertura Médica / Veterinaria */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E3020] uppercase tracking-wider">
                      <Shield className="w-4 h-4 text-[#F3BA2F]" />
                      <span>{isPet ? 'Atención Veterinaria' : 'Cobertura de Salud'}</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] text-xs space-y-1.5">
                      <div className="font-semibold text-[#3E3020] text-sm">
                        {member.medicalInsurance.provider}
                      </div>
                      <div className="text-[#6E5F4D]">Plan: {member.medicalInsurance.plan}</div>
                      <div className="text-[#6E5F4D] font-mono">
                        N° Afiliado / Cuenta: {member.medicalInsurance.affiliateNumber}
                      </div>
                      {member.medicalInsurance.emergencyPhone && (
                        <div className="pt-1.5 border-t border-[#E9DCC4] flex items-center justify-between">
                          <span className="text-[#6E5F4D]">Guardia Urgencias:</span>
                          <a
                            href={`tel:${member.medicalInsurance.emergencyPhone}`}
                            className="font-bold text-[#C21D30] hover:underline font-mono"
                          >
                            {member.medicalInsurance.emergencyPhone}
                          </a>
                        </div>
                      )}

                      {member.medicalInsurance.address && (
                        <div className="pt-1.5 border-t border-[#E9DCC4] space-y-0.5">
                          <span className="text-[10px] font-bold text-[#6E5F4D] uppercase tracking-wider block">
                            {isPet ? 'Dirección Veterinaria / Guardia:' : 'Dirección Centro Médico / Guardia:'}
                          </span>
                          <div className="flex items-start gap-1 text-[#3E3020]">
                            <MapPin className="w-3.5 h-3.5 text-[#E26D14] shrink-0 mt-0.5" />
                            <span className="font-semibold text-xs leading-tight">
                              {member.medicalInsurance.address}
                            </span>
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              member.medicalInsurance.address
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E26D14] hover:underline pt-0.5"
                          >
                            <span>Ver en Google Maps</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Primary Doctor or Vet */}
                    {member.primaryDoctor && (
                      <div className="p-3.5 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] text-xs space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#E26D14] uppercase">
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>{isPet ? 'Veterinario de Cabecera' : 'Médico de Cabecera'}</span>
                        </div>
                        <div className="font-semibold text-[#3E3020]">
                          {member.primaryDoctor.name}
                        </div>
                        <div className="text-[#6E5F4D]">{member.primaryDoctor.specialty}</div>
                        <div className="text-[#6E5F4D]">{member.primaryDoctor.clinic}</div>
                        <div className="pt-1">
                          <a
                            href={`tel:${member.primaryDoctor.phone}`}
                            className="inline-flex items-center gap-1 text-[#E26D14] font-bold hover:underline"
                          >
                            <Phone className="w-3 h-3 text-[#E26D14]" />
                            <span>{member.primaryDoctor.phone}</span>
                          </a>
                        </div>

                        {(member.primaryDoctor.address || (isPet && member.petDetails?.vetAddress)) && (
                          <div className="pt-1.5 border-t border-[#E9DCC4] space-y-0.5">
                            <span className="text-[10px] font-bold text-[#6E5F4D] uppercase tracking-wider block">
                              Dirección Consultorio:
                            </span>
                            <div className="flex items-start gap-1 text-[#3E3020]">
                              <MapPin className="w-3.5 h-3.5 text-[#E26D14] shrink-0 mt-0.5" />
                              <span className="font-medium text-xs leading-tight">
                                {member.primaryDoctor.address || member.petDetails?.vetAddress}
                              </span>
                            </div>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                member.primaryDoctor.address || member.petDetails?.vetAddress || ''
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E26D14] hover:underline pt-0.5"
                            >
                              <span>Ver en Google Maps</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2. Historial de Alergias & Intolerancias */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E3020] uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-[#C21D30]" />
                        <span>Alergias ({memberAllergies.length})</span>
                      </div>
                    </div>

                    {memberAllergies.length === 0 ? (
                      <div className="p-4 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] text-xs text-[#6E5F4D] text-center">
                        Sin alergias registradas para este integrante.
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
                                  ? 'bg-[#FDF1F2] border-[#F5B8BE] text-[#3E3020]'
                                  : 'bg-[#FFF9ED] border-[#E9DCC4] text-[#3E3020]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <span className={`font-bold block ${isSevere ? 'text-[#C21D30]' : 'text-[#3E3020]'}`}>
                                    {allergy.allergen}
                                  </span>
                                  <span
                                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                                      isSevere ? 'text-[#C21D30]' : 'text-[#6E5F4D]'
                                    }`}
                                  >
                                    {allergy.type} · {allergy.severity}
                                  </span>
                                </div>
                                <button
                                  onClick={() => onDeleteAllergy(allergy.id)}
                                  className="text-[#6E5F4D] hover:text-[#C21D30] p-0.5 rounded cursor-pointer"
                                  title="Eliminar alergia"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <p className="text-[11px] text-[#6E5F4D] mt-1">
                                <strong className="text-[#3E3020]">Síntoma:</strong> {allergy.reactionDescription}
                              </p>
                              <p className="text-[11px] text-[#6E5F4D]">
                                <strong className="text-[#3E3020]">Protocolo:</strong> {allergy.emergencyProtocol}
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
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E3020] uppercase tracking-wider mb-2">
                        <FileText className="w-4 h-4 text-[#E26D14]" />
                        <span>Condiciones & Notas Vitales</span>
                      </div>
                      <div className="p-3.5 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] text-xs space-y-2">
                        {member.chronicConditions.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {member.chronicConditions.map((cond, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-white border border-[#E9DCC4] rounded text-[#3E3020] font-medium"
                              >
                                {cond}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[#6E5F4D]">Sin patologías crónicas declaradas.</div>
                        )}

                        {member.vitalNotes && (
                          <div className="pt-2 border-t border-[#E9DCC4] text-[#6E5F4D] italic">
                            "{member.vitalNotes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Emergency contacts list with direct call and delete button */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E3020] uppercase tracking-wider">
                          <Heart className="w-4 h-4 text-[#D96B47]" />
                          <span>Contactos de Emergencia ({member.emergencyContacts.length})</span>
                        </div>
                        <button
                          onClick={() => setQuickAddContactMemberId(quickAddContactMemberId === member.id ? null : member.id)}
                          className="text-[11px] font-bold text-[#E27D18] hover:underline flex items-center gap-1 cursor-pointer"
                          title="Añadir contacto de urgencia a esta ficha"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Contacto</span>
                        </button>
                      </div>

                      {/* Quick inline add contact form */}
                      {quickAddContactMemberId === member.id && (
                        <div className="p-3 rounded-lg bg-[#FFF5E5] border border-[#FEEAA2] space-y-2 mb-2">
                          <div className="text-[11px] font-bold text-[#E27D18]">
                            Añadir contacto de urgencia para {member.name}:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Nombre y Apellido *"
                              value={quickContactName}
                              onChange={(e) => setQuickContactName(e.target.value)}
                              className="px-2.5 py-1.5 bg-white border border-[#E9DCC4] rounded-lg text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Parentesco (Mamá, Tío)"
                              value={quickContactRelation}
                              onChange={(e) => setQuickContactRelation(e.target.value)}
                              className="px-2.5 py-1.5 bg-white border border-[#E9DCC4] rounded-lg text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Teléfono urgente *"
                              value={quickContactPhone}
                              onChange={(e) => setQuickContactPhone(e.target.value)}
                              className="px-2.5 py-1.5 bg-white border border-[#E9DCC4] rounded-lg text-xs font-mono"
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setQuickAddContactMemberId(null)}
                              className="px-2.5 py-1 text-xs text-[#6E5F4D] hover:text-[#3E3020]"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAddEmergencyContact(member)}
                              className="px-3.5 py-1.5 bg-[#E27D18] text-white font-bold rounded-lg text-xs hover:bg-[#C66506] transition-colors"
                            >
                              Guardar Contacto
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        {member.emergencyContacts.length === 0 ? (
                          <div className="p-3 bg-[#FFF9ED] border border-[#E9DCC4] rounded-lg text-xs text-[#6E5F4D]">
                            Sin contactos de emergencia. Haz clic en "+ Contacto" o "Editar Ficha" para agregar.
                          </div>
                        ) : (
                          member.emergencyContacts.map((contact, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] text-xs gap-2"
                            >
                              <div className="min-w-0 pr-1 flex-1">
                                <span className="font-semibold text-[#3E3020] block truncate">
                                  {contact.name}
                                </span>
                                <span className="text-[#6E5F4D] text-[10px]">
                                  {contact.relation}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <a
                                  href={`tel:${contact.phone}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#E9DCC4] font-bold font-mono text-[#E27D18] hover:bg-[#FFF9ED] text-xs"
                                  title="Llamar a este contacto"
                                >
                                  <Phone className="w-3 h-3 text-[#E27D18]" />
                                  <span>{contact.phone}</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleQuickRemoveContact(member, idx)}
                                  className="p-1 text-[#6E5F4D] hover:text-[#C21D30] hover:bg-[#FDF1F2] rounded cursor-pointer"
                                  title="Eliminar este contacto de emergencia"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FULL EDIT MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E9DCC4] shadow-2xl max-w-2xl w-full flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden">
            {/* Pinned Modal Header */}
            <div className="bg-[#3E3020] text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#F3BA2F]" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Editar Ficha Completa: {editingMember.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg text-[#E9DCC4] hover:text-white hover:bg-white/10 transition-colors"
                title="Cerrar ventana"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
              {/* 1. INFORMACIÓN BÁSICA & IDENTIFICACIÓN */}
              <div className="space-y-3 pb-4 border-b border-[#E9DCC4]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#E26D14]">
                  1. Identificación y Datos Personales
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#3E3020] mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={editingMember.name}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] focus:outline-none focus:ring-2 focus:ring-[#F3BA2F]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#3E3020] mb-1">Parentesco / Rol *</label>
                    <select
                      value={editingMember.relationship}
                      onChange={(e) => {
                        const val = e.target.value as FamilyRelationship;
                        setEditingMember({
                          ...editingMember,
                          relationship: val,
                          isPet: val === 'Mascota',
                        });
                      }}
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] focus:outline-none focus:ring-2 focus:ring-[#F3BA2F]"
                    >
                      <option value="Hijo/a">Hijo/a</option>
                      <option value="Madre">Madre</option>
                      <option value="Padre">Padre</option>
                      <option value="Abuelo/a">Abuelo/a</option>
                      <option value="Tutor/a">Tutor/a</option>
                      <option value="Mascota">🐾 Mascota (Perro/Gato)</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-[#3E3020] mb-1">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={editingMember.birthDate}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, birthDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] focus:outline-none focus:ring-2 focus:ring-[#F3BA2F]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#3E3020] mb-1">
                      {editingMember.relationship === 'Mascota' ? 'N° de Microchip / Registro' : 'DNI / Documento'}
                    </label>
                    <input
                      type="text"
                      value={editingMember.idNumber}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, idNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] font-mono focus:outline-none focus:ring-2 focus:ring-[#F3BA2F]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#3E3020] mb-1">Grupo Sanguíneo</label>
                    <select
                      value={editingMember.bloodType}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          bloodType: e.target.value as BloodType,
                        })
                      }
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] focus:outline-none focus:ring-2 focus:ring-[#F3BA2F]"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'N/A'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Si es Mascota, campos especiales */}
                {editingMember.relationship === 'Mascota' && (
                  <div className="p-3 bg-[#FEEAA2]/50 border border-[#E9DCC4] rounded-xl space-y-3">
                    <div className="font-bold text-[#E26D14] flex items-center gap-1.5">
                      <Dog className="w-4 h-4" />
                      <span>Ficha Veterinaria de la Mascota</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-[#3E3020] mb-1">Especie</label>
                        <select
                          value={editingMember.petDetails?.species || 'Perro'}
                          onChange={(e) =>
                            setEditingMember({
                              ...editingMember,
                              petDetails: {
                                ...editingMember.petDetails,
                                species: e.target.value as any,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-[#E9DCC4] bg-white rounded-lg text-[#3E3020]"
                        >
                          <option value="Perro">Perro 🐕</option>
                          <option value="Gato">Gato 🐈</option>
                          <option value="Ave">Ave 🦜</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#3E3020] mb-1">Raza</label>
                        <input
                          type="text"
                          placeholder="Ej: Golden Retriever, Mestizo"
                          value={editingMember.petDetails?.breed || ''}
                          onChange={(e) =>
                            setEditingMember({
                              ...editingMember,
                              petDetails: {
                                ...editingMember.petDetails,
                                species: editingMember.petDetails?.species || 'Perro',
                                breed: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-[#E9DCC4] bg-white rounded-lg text-[#3E3020]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#3E3020] mb-1">Última Desparasitación</label>
                        <input
                          type="date"
                          value={editingMember.petDetails?.lastDewormingDate || ''}
                          onChange={(e) =>
                            setEditingMember({
                              ...editingMember,
                              petDetails: {
                                ...editingMember.petDetails,
                                species: editingMember.petDetails?.species || 'Perro',
                                lastDewormingDate: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-[#E9DCC4] bg-white rounded-lg text-[#3E3020]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. UTILIDAD DE LA FOTO / AVATAR & SELECCIÓN */}
              <div className="space-y-3 pb-4 border-b border-[#E9DCC4]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#E26D14]">
                      2. Foto o Ícono de Identificación
                    </h4>
                    <p className="text-[11px] text-[#6E5F4D] mt-0.5">
                      <strong className="text-[#3E3020]">¿Qué utilidad tiene?</strong> Permite reconocer visualmente y al instante la ficha de cada familiar o mascota en guardias médicas, recetas y credenciales familiares sin confundir integrantes.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#FFF9ED] p-3 rounded-xl border border-[#E9DCC4]">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#E9DCC4] shrink-0 shadow-2xs">
                    {renderAvatarDisplay(editingMember)}
                  </div>

                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E9DCC4] text-[#3E3020] rounded-lg hover:bg-[#FFF9ED] text-xs font-semibold cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#E27D18]" />
                        <span>Subir desde mi dispositivo</span>
                      </button>

                      {editingMember.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setEditingMember({ ...editingMember, avatarUrl: undefined, avatarType: 'initials' })}
                          className="px-2.5 py-1.5 text-xs text-[#C21D30] hover:bg-[#FDF1F2] rounded-lg font-medium"
                        >
                          Quitar foto
                        </button>
                      )}
                    </div>

                    {/* Web URL Photo Input */}
                    <div className="pt-2 border-t border-[#E9DCC4]/60">
                      <label className="block text-[11px] font-semibold text-[#3E3020] mb-1">
                        O pegar enlace de foto (URL web):
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="url"
                          placeholder="https://ejemplo.com/foto-perfil.jpg"
                          value={editingMember.avatarUrl || ''}
                          onChange={(e) =>
                            setEditingMember({
                              ...editingMember,
                              avatarUrl: e.target.value.trim() || undefined,
                              avatarType: e.target.value.trim() ? 'image' : 'initials',
                            })
                          }
                          className="flex-1 px-2.5 py-1.5 text-xs border border-[#E9DCC4] bg-white rounded-lg text-[#3E3020] placeholder:text-[#796B59]/60"
                        />
                        {editingMember.avatarUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingMember({
                                ...editingMember,
                                avatarUrl: undefined,
                                avatarType: 'initials',
                              })
                            }
                            className="px-2.5 py-1.5 text-xs text-[#C21D30] bg-[#FDF1F2] border border-[#F5B8BE] rounded-lg hover:bg-[#FCE3E5]"
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Icon Selection */}
                    <div className="pt-2 border-t border-[#E9DCC4]/60">
                      <div className="text-[11px] font-semibold text-[#3E3020] mb-1.5">
                        O elegir ícono ilustrado:
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { id: 'boy', emoji: '👦', label: 'Niño' },
                          { id: 'girl', emoji: '👧', label: 'Niña' },
                          { id: 'woman', emoji: '👩', label: 'Mujer' },
                          { id: 'man', emoji: '👨', label: 'Hombre' },
                          { id: 'baby', emoji: '👶', label: 'Bebé' },
                          { id: 'grandma', emoji: '👵', label: 'Abuela' },
                          { id: 'grandpa', emoji: '👴', label: 'Abuelo' },
                          { id: 'dog', emoji: '🐶', label: 'Perro' },
                          { id: 'cat', emoji: '🐱', label: 'Gato' },
                          { id: 'rabbit', emoji: '🐰', label: 'Conejo' },
                          { id: 'bird', emoji: '🦜', label: 'Ave' },
                        ].map((icon) => {
                          const isSelected =
                            editingMember.avatarType === 'icon' &&
                            editingMember.avatarIcon === icon.id &&
                            !editingMember.avatarUrl;
                          return (
                            <button
                              key={icon.id}
                              type="button"
                              onClick={() => handleSelectIconAvatar(icon.id)}
                              className={`px-2 py-1 rounded text-sm transition-all border cursor-pointer ${
                                isSelected
                                  ? 'bg-[#FEEAA2] border-[#E27D18] ring-2 ring-[#E27D18]/50 shadow-xs scale-105'
                                  : 'bg-white border-[#E9DCC4] hover:border-[#E27D18] hover:bg-[#FFF9ED]'
                              }`}
                              title={icon.label}
                            >
                              <span>{icon.emoji}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. COBERTURA MÉDICA & MÉDICO DE CABECERA */}
              <div className="space-y-3 pb-4 border-b border-[#E9DCC4]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#E26D14]">
                  3. Cobertura de Salud y Profesional de Cabecera
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-[#3E3020] mb-1">Obra Social / Prepaga / Veterinaria</label>
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
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#3E3020] mb-1">Plan</label>
                    <input
                      type="text"
                      value={editingMember.medicalInsurance.plan}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          medicalInsurance: {
                            ...editingMember.medicalInsurance,
                            plan: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#3E3020] mb-1">N° de Afiliado</label>
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
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-[#3E3020] mb-1">Teléfono de Urgencias Prepaga</label>
                    <input
                      type="text"
                      value={editingMember.medicalInsurance.emergencyPhone || ''}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          medicalInsurance: {
                            ...editingMember.medicalInsurance,
                            emergencyPhone: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#3E3020] mb-1">
                      {editingMember.relationship === 'Mascota' ? 'Veterinario' : 'Médico de Cabecera'}
                    </label>
                    <input
                      type="text"
                      value={editingMember.primaryDoctor?.name || ''}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          primaryDoctor: {
                            name: e.target.value,
                            specialty: editingMember.primaryDoctor?.specialty || (editingMember.relationship === 'Mascota' ? 'Veterinaria' : 'Pediatría/Clínica'),
                            phone: editingMember.primaryDoctor?.phone || '',
                            clinic: editingMember.primaryDoctor?.clinic || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#3E3020] mb-1">Teléfono del Profesional</label>
                    <input
                      type="text"
                      value={editingMember.primaryDoctor?.phone || ''}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          primaryDoctor: {
                            name: editingMember.primaryDoctor?.name || '',
                            specialty: editingMember.primaryDoctor?.specialty || '',
                            phone: e.target.value,
                            clinic: editingMember.primaryDoctor?.clinic || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E9DCC4]/50">
                  <div>
                    <label className="block font-semibold text-[#3E3020] mb-1">
                      {editingMember.relationship === 'Mascota'
                        ? 'Dirección Veterinaria / Guardia'
                        : 'Dirección Centro Médico / Guardia'}
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Av. Cerviño 4720, Palermo, CABA"
                      value={editingMember.medicalInsurance.address || ''}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          medicalInsurance: {
                            ...editingMember.medicalInsurance,
                            address: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#3E3020] mb-1">
                      {editingMember.relationship === 'Mascota'
                        ? 'Dirección Consultorio Veterinario'
                        : 'Dirección Consultorio Médico'}
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Av. Cerviño 4720, Consultorio 312"
                      value={editingMember.primaryDoctor?.address || editingMember.petDetails?.vetAddress || ''}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          primaryDoctor: {
                            name: editingMember.primaryDoctor?.name || '',
                            specialty: editingMember.primaryDoctor?.specialty || '',
                            phone: editingMember.primaryDoctor?.phone || '',
                            clinic: editingMember.primaryDoctor?.clinic || '',
                            address: e.target.value,
                          },
                          petDetails: editingMember.petDetails
                            ? {
                                ...editingMember.petDetails,
                                vetAddress: e.target.value,
                              }
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. CONTACTOS DE EMERGENCIA (EDITABLE / ELIMINABLE / AGREGABLE) */}
              <div className="space-y-3 pb-4 border-b border-[#E9DCC4]">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#E26D14]">
                    4. Contactos Familiares de Emergencia ({editingMember.emergencyContacts.length})
                  </h4>
                  <span className="text-[11px] text-[#6E5F4D]">
                    Puedes modificar o sumar nuevos contactos aquí
                  </span>
                </div>

                {/* List of editable contacts */}
                <div className="space-y-2">
                  {editingMember.emergencyContacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={contact.name}
                          onChange={(e) => {
                            const updated = [...editingMember.emergencyContacts];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setEditingMember({ ...editingMember, emergencyContacts: updated });
                          }}
                          className="px-2.5 py-1.5 border border-[#E9DCC4] bg-white rounded text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Parentesco (Ej: Mamá, Tía)"
                          value={contact.relation}
                          onChange={(e) => {
                            const updated = [...editingMember.emergencyContacts];
                            updated[idx] = { ...updated[idx], relation: e.target.value };
                            setEditingMember({ ...editingMember, emergencyContacts: updated });
                          }}
                          className="px-2.5 py-1.5 border border-[#E9DCC4] bg-white rounded text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Teléfono"
                          value={contact.phone}
                          onChange={(e) => {
                            const updated = [...editingMember.emergencyContacts];
                            updated[idx] = { ...updated[idx], phone: e.target.value };
                            setEditingMember({ ...editingMember, emergencyContacts: updated });
                          }}
                          className="px-2.5 py-1.5 border border-[#E9DCC4] bg-white rounded text-xs font-mono"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveEmergencyContact(idx)}
                        className="p-1.5 text-[#C21D30] hover:bg-[#FDF1F2] border border-[#F5B8BE] rounded-lg transition-colors cursor-pointer shrink-0 self-end sm:self-center"
                        title="Eliminar contacto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new contact row */}
                <div className="p-3 bg-white border border-dashed border-[#E26D14] rounded-lg space-y-2">
                  <span className="font-bold text-[11px] text-[#E26D14] block">
                    + Agregar Nuevo Contacto de Emergencia:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Nombre del contacto"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="px-2.5 py-1.5 border border-[#E9DCC4] rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Parentesco / Rol"
                      value={newContactRelation}
                      onChange={(e) => setNewContactRelation(e.target.value)}
                      className="px-2.5 py-1.5 border border-[#E9DCC4] rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Teléfono urgencias"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="px-2.5 py-1.5 border border-[#E9DCC4] rounded text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddEmergencyContact}
                      className="px-3 py-1.5 bg-[#E26D14] text-white font-bold rounded text-xs hover:bg-[#C55606] transition-colors"
                    >
                      + Añadir Contacto
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. CONDICIONES CRÓNICAS & NOTAS VITALES */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#E26D14]">
                  5. Patologías Crónicas y Notas Vitales
                </h4>

                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">
                    Condiciones Crónicas / Diagnósticos:
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {editingMember.chronicConditions.map((cond, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFF9ED] border border-[#E9DCC4] text-[#3E3020] rounded-full text-xs"
                      >
                        <span>{cond}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(idx)}
                          className="text-[#C21D30] hover:font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ej: Hipotiroidismo, Asma leve, Celíaco..."
                      value={newConditionInput}
                      onChange={(e) => setNewConditionInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[#E9DCC4] rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCondition}
                      className="px-3 py-1.5 bg-[#3E3020] text-white rounded-lg text-xs font-semibold hover:bg-[#6E5F4D]"
                    >
                      + Añadir
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">
                    Notas Vitales / Cuidados Urgentes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej: Instrucciones de medicación diaria, cuidados especiales, prótesis o recomendaciones."
                    value={editingMember.vitalNotes || ''}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, vitalNotes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#3E3020]"
                  />
                </div>
              </div>
            </div>

            {/* Pinned Action Footer with Delete Option */}
            <div className="bg-[#FFF9ED] px-4 py-3 sm:px-6 sm:py-3.5 border-t border-[#E9DCC4] flex items-center justify-between gap-2.5 shrink-0 z-10 shadow-2xs">
              {/* Delete profile button */}
              <button
                type="button"
                onClick={() => setMemberToDelete(editingMember)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#C21D30] bg-[#FDF1F2] border border-[#F5B8BE] hover:bg-[#FCE3E5] rounded-lg transition-colors cursor-pointer"
                title="Eliminar este integrante o mascota del grupo familiar"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Integrante</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#6E5F4D] hover:text-[#3E3020] hover:bg-white rounded-lg border border-transparent hover:border-[#E9DCC4] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateMember(editingMember);
                    setEditingMember(null);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#E26D14] hover:bg-[#C55606] rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Ficha Completa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {memberToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#F5B8BE] shadow-2xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FDF1F2] text-[#C21D30] flex items-center justify-center mx-auto border border-[#F5B8BE]">
              <AlertTriangle className="w-6 h-6 text-[#C21D30]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#3E3020]">
                ¿Eliminar ficha de {memberToDelete.name}?
              </h3>
              <p className="text-xs text-[#6E5F4D] mt-1">
                Esta acción quitará a <strong>{memberToDelete.name}</strong> del grupo familiar, junto con sus datos médicos locales.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#6E5F4D] bg-[#FFF9ED] border border-[#E9DCC4] hover:bg-white rounded-lg transition-colors"
              >
                No, conservar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMember(memberToDelete.id);
                  setMemberToDelete(null);
                  setEditingMember(null);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#C21D30] hover:bg-[#9E1B28] rounded-lg transition-colors shadow-xs"
              >
                Sí, eliminar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
