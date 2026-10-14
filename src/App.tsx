import React, { useState, useEffect } from 'react';
import {
  FamilyMember,
  VaccineRecord,
  MedicineItem,
  MedicalAppointment,
  AllergyRecord,
  PrescriptionRecord,
  CaregiverShareLink,
} from './types/health';
import {
  INITIAL_MEMBERS,
  INITIAL_VACCINES,
  INITIAL_MEDICINES,
  INITIAL_APPOINTMENTS,
  INITIAL_ALLERGIES,
  INITIAL_PRESCRIPTIONS,
  INITIAL_CAREGIVER_LINKS,
} from './data/initialData';
import { Header } from './components/Header';
import { MemberSelector } from './components/MemberSelector';
import { DashboardOverview } from './components/DashboardOverview';
import { VaccinationSchedule } from './components/VaccinationSchedule';
import { MedicineCabinet } from './components/MedicineCabinet';
import { AppointmentsAndPrescriptions } from './components/AppointmentsAndPrescriptions';
import { FamilyProfilesView } from './components/FamilyProfilesView';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { ShareCaregiverModal } from './components/ShareCaregiverModal';
import { AddRecordModal } from './components/AddRecordModal';

export default function App() {
  // Persistent state with localStorage fallbacks
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('sf_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [vaccines, setVaccines] = useState<VaccineRecord[]>(() => {
    const saved = localStorage.getItem('sf_vaccines');
    return saved ? JSON.parse(saved) : INITIAL_VACCINES;
  });

  const [medicines, setMedicines] = useState<MedicineItem[]>(() => {
    const saved = localStorage.getItem('sf_medicines');
    return saved ? JSON.parse(saved) : INITIAL_MEDICINES;
  });

  const [appointments, setAppointments] = useState<MedicalAppointment[]>(() => {
    const saved = localStorage.getItem('sf_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [allergies, setAllergies] = useState<AllergyRecord[]>(() => {
    const saved = localStorage.getItem('sf_allergies');
    return saved ? JSON.parse(saved) : INITIAL_ALLERGIES;
  });

  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>(() => {
    const saved = localStorage.getItem('sf_prescriptions');
    return saved ? JSON.parse(saved) : INITIAL_PRESCRIPTIONS;
  });

  const [shareLinks, setShareLinks] = useState<CaregiverShareLink[]>(() => {
    const saved = localStorage.getItem('sf_share_links');
    return saved ? JSON.parse(saved) : INITIAL_CAREGIVER_LINKS;
  });

  // UI Navigation states
  const [activeTab, setActiveTab] = useState<string>('resumen');
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');

  // Modals state
  const [isEmergencySOSOpen, setIsEmergencySOSOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialCategory, setAddModalInitialCategory] = useState<any>('appointment');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('sf_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('sf_vaccines', JSON.stringify(vaccines));
  }, [vaccines]);

  useEffect(() => {
    localStorage.setItem('sf_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('sf_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('sf_allergies', JSON.stringify(allergies));
  }, [allergies]);

  useEffect(() => {
    localStorage.setItem('sf_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('sf_share_links', JSON.stringify(shareLinks));
  }, [shareLinks]);

  // Handlers for updating records
  const handleUpdateVaccine = (updated: VaccineRecord) => {
    setVaccines((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleUpdateMedicine = (updated: MedicineItem) => {
    setMedicines((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateAppointment = (updated: MedicalAppointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleUpdatePrescription = (updated: PrescriptionRecord) => {
    setPrescriptions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleUpdateMember = (updated: FamilyMember) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleDeleteAllergy = (id: string) => {
    setAllergies((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddShareLink = (newLink: CaregiverShareLink) => {
    setShareLinks((prev) => [newLink, ...prev]);
  };

  const handleRevokeShareLink = (id: string) => {
    setShareLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restaurar los datos de demostración de la familia Rossi Gómez?')) {
      setMembers(INITIAL_MEMBERS);
      setVaccines(INITIAL_VACCINES);
      setMedicines(INITIAL_MEDICINES);
      setAppointments(INITIAL_APPOINTMENTS);
      setAllergies(INITIAL_ALLERGIES);
      setPrescriptions(INITIAL_PRESCRIPTIONS);
      setShareLinks(INITIAL_CAREGIVER_LINKS);
      setSelectedMemberId('all');
    }
  };

  const openAddCategory = (cat: 'appointment' | 'medicine' | 'vaccine' | 'allergy' | 'prescription' | 'member') => {
    setAddModalInitialCategory(cat);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col text-neutral-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickAdd={() => openAddCategory('appointment')}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenEmergencySOS={() => setIsEmergencySOSOpen(true)}
      />

      {/* Family Member Switcher Strip */}
      <MemberSelector
        members={members}
        selectedMemberId={selectedMemberId}
        onSelectMember={setSelectedMemberId}
        onAddNewMember={() => openAddCategory('member')}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'resumen' && (
          <DashboardOverview
            members={members}
            vaccines={vaccines}
            medicines={medicines}
            appointments={appointments}
            allergies={allergies}
            prescriptions={prescriptions}
            onSelectTab={setActiveTab}
            onSelectMember={setSelectedMemberId}
            onOpenEmergencySOS={() => setIsEmergencySOSOpen(true)}
            onOpenShare={() => setIsShareOpen(true)}
            onResetData={handleResetData}
          />
        )}

        {activeTab === 'vacunas' && (
          <VaccinationSchedule
            vaccines={vaccines}
            members={members}
            selectedMemberId={selectedMemberId}
            onUpdateVaccine={handleUpdateVaccine}
            onAddVaccine={() => openAddCategory('vaccine')}
          />
        )}

        {activeTab === 'botiquin' && (
          <MedicineCabinet
            medicines={medicines}
            members={members}
            onUpdateMedicine={handleUpdateMedicine}
            onDeleteMedicine={handleDeleteMedicine}
            onAddMedicine={() => openAddCategory('medicine')}
          />
        )}

        {activeTab === 'turnos-recetas' && (
          <AppointmentsAndPrescriptions
            appointments={appointments}
            prescriptions={prescriptions}
            members={members}
            selectedMemberId={selectedMemberId}
            onUpdateAppointment={handleUpdateAppointment}
            onUpdatePrescription={handleUpdatePrescription}
            onAddAppointment={() => openAddCategory('appointment')}
            onAddPrescription={() => openAddCategory('prescription')}
          />
        )}

        {activeTab === 'perfiles' && (
          <FamilyProfilesView
            members={members}
            allergies={allergies}
            selectedMemberId={selectedMemberId}
            onUpdateMember={handleUpdateMember}
            onAddAllergy={() => openAddCategory('allergy')}
            onDeleteAllergy={handleDeleteAllergy}
            onAddMember={() => openAddCategory('member')}
          />
        )}
      </main>

      {/* Quiet, unpretentious footer */}
      <footer className="no-print bg-white border-t border-neutral-200 py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-800">SaludFamiliar</span>
            <span>·</span>
            <span>Libreta Digital de Salud & Fichas Médicas Familiares</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>Privacidad protegida · Almacenamiento local</span>
            <span>·</span>
            <button
              onClick={() => setIsEmergencySOSOpen(true)}
              className="text-rose-600 hover:underline font-medium"
            >
              Ficha de Emergencia (SOS)
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <EmergencySOSModal
        isOpen={isEmergencySOSOpen}
        onClose={() => setIsEmergencySOSOpen(false)}
        members={members}
        allergies={allergies}
        activeMemberId={selectedMemberId}
      />

      <ShareCaregiverModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        members={members}
        shareLinks={shareLinks}
        onAddShareLink={handleAddShareLink}
        onRevokeShareLink={handleRevokeShareLink}
      />

      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        members={members}
        onAddAppointment={(apt) => setAppointments((prev) => [apt, ...prev])}
        onAddMedicine={(med) => setMedicines((prev) => [med, ...prev])}
        onAddVaccine={(vac) => setVaccines((prev) => [...prev, vac])}
        onAddAllergy={(alg) => setAllergies((prev) => [...prev, alg])}
        onAddPrescription={(rx) => setPrescriptions((prev) => [rx, ...prev])}
        onAddMember={(mem) => setMembers((prev) => [...prev, mem])}
        initialCategory={addModalInitialCategory}
      />
    </div>
  );
}
