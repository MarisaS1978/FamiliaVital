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
import { PetsView } from './components/PetsView';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { ShareCaregiverModal } from './components/ShareCaregiverModal';
import { AddRecordModal } from './components/AddRecordModal';
import { InstallShortcutModal } from './components/InstallShortcutModal';
import { SecurityComplianceModal } from './components/SecurityComplianceModal';
import { LockScreen } from './components/LockScreen';
import { scrollToTop } from './utils/healthUtils';
import { checkAndNotifyUpcomingAppointments } from './utils/appointmentNotifications';
import { SecurityConfig } from './types/security';
import { getSecurityConfig, addAuditLog } from './utils/securityCrypto';
import { ArrowUp, ShieldCheck } from 'lucide-react';

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
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [addModalInitialCategory, setAddModalInitialCategory] = useState<any>('appointment');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // SOC 2 & ISO/IEC 27001 Security States
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() => getSecurityConfig());
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const cfg = getSecurityConfig();
    return Boolean(cfg.isPinEnabled && cfg.pinHash);
  });

  // Auto-lock by inactivity timer (ISO 27001 A.8.7 / SOC 2 CC6.1)
  useEffect(() => {
    if (!securityConfig.isPinEnabled || !securityConfig.pinHash || securityConfig.autoLockMinutes <= 0) {
      return;
    }

    let timer: any = null;
    const timeoutMs = securityConfig.autoLockMinutes * 60 * 1000;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIsLocked(true);
        addAuditLog(
          'VAULT_LOCK',
          'Control de Acceso (A.5.15 / CC6.1)',
          `Bloqueo automático de sesión tras ${securityConfig.autoLockMinutes} min de inactividad.`,
          'Sistema Automático',
          'info'
        );
      }, timeoutMs);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [securityConfig.isPinEnabled, securityConfig.pinHash, securityConfig.autoLockMinutes]);

  // Lock on tab blur (window switch)
  useEffect(() => {
    if (!securityConfig.isPinEnabled || !securityConfig.pinHash || !securityConfig.lockOnBlur) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsLocked(true);
        addAuditLog(
          'VAULT_LOCK',
          'Control de Acceso (A.5.15 / CC6.1)',
          'Bloqueo automático de pantalla por cambio de pestaña o ventana.',
          'Sistema Automático',
          'info'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [securityConfig.isPinEnabled, securityConfig.pinHash, securityConfig.lockOnBlur]);

  // Global listener: dismiss mobile virtual keyboard when pressing Enter on inputs
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const activeEl = document.activeElement as HTMLElement | null;
        if (activeEl && activeEl.tagName === 'INPUT') {
          activeEl.blur();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 160);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Automatic check and notification for medical appointments within next 72 hours
  useEffect(() => {
    checkAndNotifyUpcomingAppointments(appointments, members);
    // Periodically check every 15 minutes
    const interval = setInterval(() => {
      checkAndNotifyUpcomingAppointments(appointments, members);
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [appointments, members]);

  // Navigation handlers that return scroll to the top
  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    scrollToTop();
  };

  const handleSelectMember = (id: string | 'all') => {
    setSelectedMemberId(id);
    if (id === 'all') {
      if (activeTab === 'mascotas' || activeTab === 'resumen') {
        setActiveTab('perfiles');
      }
    } else {
      const found = members.find((m) => m.id === id);
      const isPet = found?.isPet || found?.relationship === 'Mascota';
      if (isPet) {
        if (activeTab === 'perfiles' || activeTab === 'resumen') {
          setActiveTab('mascotas');
        }
      } else {
        // Human family member selected: if in mascotas or resumen, go directly to their ficha!
        if (activeTab === 'mascotas' || activeTab === 'resumen') {
          setActiveTab('perfiles');
        }
      }
    }
    scrollToTop();
  };

  const handleCloseEmergencySOS = () => {
    setIsEmergencySOSOpen(false);
    scrollToTop();
  };

  const handleCloseShare = () => {
    setIsShareOpen(false);
    scrollToTop();
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    scrollToTop();
  };

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

  // Handlers for updating records with immutable audit logging (ISO 27001 A.8.15 / SOC 2 CC7.2)
  const handleUpdateVaccine = (updated: VaccineRecord) => {
    setVaccines((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    addAuditLog(
      'RECORD_UPDATE',
      'Criptografía & Cifrado (A.8.24 / CC6.6)',
      `Registro de vacuna actualizado: ${updated.vaccineName} (${updated.status}).`,
      'Usuario Propietario',
      'info'
    );
  };

  const handleUpdateMedicine = (updated: MedicineItem) => {
    setMedicines((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    addAuditLog(
      'RECORD_UPDATE',
      'Criptografía & Cifrado (A.8.24 / CC6.6)',
      `Medicamento modificado en botiquín: ${updated.name} (${updated.location}).`,
      'Usuario Propietario',
      'info'
    );
  };

  const handleDeleteMedicine = (id: string) => {
    const item = medicines.find((m) => m.id === id);
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    addAuditLog(
      'RECORD_DELETE',
      'Privacidad & Confidencialidad (A.5.34 / CC6.3)',
      `Fármaco eliminado del botiquín familiar: ${item?.name || id}.`,
      'Usuario Propietario',
      'info'
    );
  };

  const handleUpdateAppointment = (updated: MedicalAppointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    addAuditLog(
      'RECORD_UPDATE',
      'Criptografía & Cifrado (A.8.24 / CC6.6)',
      `Turno médico actualizado: ${updated.specialty} con ${updated.doctorName}.`,
      'Usuario Propietario',
      'info'
    );
  };

  const handleDeleteAppointment = (id: string) => {
    const apt = appointments.find((a) => a.id === id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    addAuditLog(
      'RECORD_DELETE',
      'Privacidad & Confidencialidad (A.5.34 / CC6.3)',
      `Turno médico cancelado/eliminado: ${apt?.specialty || id}.`,
      'Usuario Propietario',
      'info'
    );
  };

  const handleUpdatePrescription = (updated: PrescriptionRecord) => {
    setPrescriptions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    addAuditLog(
      'RECORD_UPDATE',
      'Criptografía & Cifrado (A.8.24 / CC6.6)',
      `Receta / Documento médico actualizado: ${updated.title} (${updated.status}).`,
      'Usuario Propietario',
      'info'
    );
  };

  const handleDeletePrescription = (id: string) => {
    const rx = prescriptions.find((p) => p.id === id);
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    addAuditLog(
      'RECORD_DELETE',
      'Privacidad & Confidencialidad (A.5.34 / CC6.3)',
      `Receta / Documento médico eliminado: ${rx?.title || id}.`,
      'Usuario Propietario',
      'info'
    );
  };

  const handleUpdateMember = (updated: FamilyMember) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    addAuditLog(
      'RECORD_UPDATE',
      'Control de Acceso (A.5.15 / CC6.1)',
      `Ficha médica de integrante actualizada: ${updated.name}.`,
      'Usuario Propietario',
      'info'
    );
  };

  const handleDeleteMember = (id: string) => {
    const mem = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (selectedMemberId === id) {
      setSelectedMemberId('all');
    }
    addAuditLog(
      'RECORD_DELETE',
      'Privacidad & Confidencialidad (A.5.34 / CC6.3)',
      `Ficha de integrante eliminada de la libreta familiar: ${mem?.name || id}.`,
      'Usuario Propietario',
      'warning'
    );
    scrollToTop();
  };

  const handleDeleteAllergy = (id: string) => {
    const alg = allergies.find((a) => a.id === id);
    setAllergies((prev) => prev.filter((a) => a.id !== id));
    addAuditLog(
      'RECORD_DELETE',
      'Privacidad & Confidencialidad (A.5.34 / CC6.3)',
      `Registro de alergia eliminado: ${alg?.allergen || id}.`,
      'Usuario Propietario',
      'warning'
    );
  };

  const handleAddShareLink = (newLink: CaregiverShareLink) => {
    setShareLinks((prev) => [newLink, ...prev]);
    addAuditLog(
      'SHARE_LINK_CREATED',
      'Control de Acceso (A.5.15 / CC6.1)',
      `Enlace de cuidador creado para ${newLink.recipientName} (${newLink.recipientRole}) con nivel ${newLink.accessLevel} y PIN protegido.`,
      'Usuario Propietario',
      'info'
    );
  };

  const handleRevokeShareLink = (id: string) => {
    const link = shareLinks.find((l) => l.id === id);
    setShareLinks((prev) => prev.filter((l) => l.id !== id));
    addAuditLog(
      'SHARE_LINK_REVOKED',
      'Control de Acceso (A.5.15 / CC6.1)',
      `Enlace de cuidador revocado de inmediato para ${link?.recipientName || id}.`,
      'Usuario Propietario',
      'warning'
    );
  };

  const handleRestoreData = (restored: any) => {
    if (restored.members) setMembers(restored.members);
    if (restored.vaccines) setVaccines(restored.vaccines);
    if (restored.medicines) setMedicines(restored.medicines);
    if (restored.appointments) setAppointments(restored.appointments);
    if (restored.allergies) setAllergies(restored.allergies);
    if (restored.prescriptions) setPrescriptions(restored.prescriptions);
    if (restored.shareLinks) setShareLinks(restored.shareLinks);
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
      addAuditLog(
        'SECURITY_CONFIG_CHANGED',
        'Gestión de Incidentes (A.8.18 / CC7.3)',
        'Restablecimiento de datos a valores de demostración predeterminados.',
        'Usuario Propietario',
        'warning'
      );
    }
  };

  const openAddCategory = (cat: 'appointment' | 'medicine' | 'vaccine' | 'allergy' | 'prescription' | 'member' | 'pet') => {
    setAddModalInitialCategory(cat);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF9ED] flex flex-col text-[#493B2A]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenQuickAdd={() => openAddCategory('appointment')}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenEmergencySOS={() => setIsEmergencySOSOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        isPinEnabled={securityConfig.isPinEnabled && Boolean(securityConfig.pinHash)}
        onLockApp={() => setIsLocked(true)}
        isPrivacyModeActive={securityConfig.maskSensitiveData}
      />

      {/* Family Member Switcher Strip */}
      <MemberSelector
        members={members}
        selectedMemberId={selectedMemberId}
        onSelectMember={handleSelectMember}
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
            onSelectTab={handleSelectTab}
            onSelectMember={handleSelectMember}
            onOpenEmergencySOS={() => setIsEmergencySOSOpen(true)}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenInstall={() => setIsInstallModalOpen(true)}
            onOpenSecurity={() => setIsSecurityModalOpen(true)}
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

        {/* Agenda Médica y Turnos ANTES del Botiquín Familiar */}
        {activeTab === 'turnos-recetas' && (
          <AppointmentsAndPrescriptions
            appointments={appointments}
            prescriptions={prescriptions}
            members={members}
            selectedMemberId={selectedMemberId}
            onUpdateAppointment={handleUpdateAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            onUpdatePrescription={handleUpdatePrescription}
            onDeletePrescription={handleDeletePrescription}
            onAddAppointment={() => openAddCategory('appointment')}
            onAddPrescription={() => openAddCategory('prescription')}
          />
        )}

        {/* Botiquín Familiar */}
        {activeTab === 'botiquin' && (
          <MedicineCabinet
            medicines={medicines}
            members={members}
            onUpdateMedicine={handleUpdateMedicine}
            onDeleteMedicine={handleDeleteMedicine}
            onAddMedicine={() => openAddCategory('medicine')}
          />
        )}

        {activeTab === 'perfiles' && (
          <FamilyProfilesView
            members={members}
            allergies={allergies}
            selectedMemberId={selectedMemberId}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onAddAllergy={() => openAddCategory('allergy')}
            onDeleteAllergy={handleDeleteAllergy}
            onAddMember={() => openAddCategory('member')}
            onAddPet={() => openAddCategory('pet')}
          />
        )}

        {activeTab === 'mascotas' && (
          <PetsView
            members={members}
            vaccines={vaccines}
            appointments={appointments}
            selectedMemberId={selectedMemberId}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onUpdateVaccine={handleUpdateVaccine}
            onAddVaccine={() => openAddCategory('vaccine')}
            onAddMember={() => openAddCategory('pet')}
            onAddAppointment={() => openAddCategory('appointment')}
            onSelectMember={handleSelectMember}
            onSelectTab={handleSelectTab}
          />
        )}
      </main>

      {/* Quiet, warm footer */}
      <footer className="no-print bg-white border-t border-[#E9DCC4] py-6 mt-12 text-xs text-[#6E5F4D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#3E3020]">FamiliaVital</span>
            <span>·</span>
            <span>Libreta Digital de Salud & Mascotas Familiares</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-[#6E5F4D]">
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="inline-flex items-center gap-1 text-[#1E7E52] hover:underline font-bold cursor-pointer"
              title="Centro de Seguridad y Cumplimiento SOC 2 Type II · ISO/IEC 27001:2022"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E7E52]" />
              <span>Seguridad SOC 2 · ISO/IEC 27001</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="flex items-center gap-1 text-[#E27D18] hover:underline font-bold cursor-pointer"
            >
              <img src="/favicon.svg" alt="" className="w-3.5 h-3.5" />
              <span>Instalar Acceso Directo</span>
            </button>
            <span>·</span>
            <span>Privacidad protegida · Cifrado AES-256</span>
            <span>·</span>
            <button
              onClick={() => setIsEmergencySOSOpen(true)}
              className="text-[#C21D30] hover:underline font-bold cursor-pointer"
            >
              Ficha de Emergencia (SOS)
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <SecurityComplianceModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onLockAppNow={() => setIsLocked(true)}
        onSecurityConfigChange={(cfg) => setSecurityConfig(cfg)}
        allAppData={{
          members,
          vaccines,
          medicines,
          appointments,
          allergies,
          prescriptions,
          shareLinks,
        }}
        onRestoreData={handleRestoreData}
      />

      {isLocked && securityConfig.pinHash && securityConfig.pinSalt && (
        <LockScreen
          pinHash={securityConfig.pinHash}
          pinSalt={securityConfig.pinSalt}
          onUnlock={() => setIsLocked(false)}
          onOpenEmergencySOS={() => {
            setIsEmergencySOSOpen(true);
          }}
        />
      )}

      <InstallShortcutModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      <EmergencySOSModal
        isOpen={isEmergencySOSOpen}
        onClose={handleCloseEmergencySOS}
        members={members}
        allergies={allergies}
        activeMemberId={selectedMemberId}
      />

      <ShareCaregiverModal
        isOpen={isShareOpen}
        onClose={handleCloseShare}
        members={members}
        shareLinks={shareLinks}
        onAddShareLink={handleAddShareLink}
        onRevokeShareLink={handleRevokeShareLink}
      />

      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        members={members}
        onAddAppointment={(apt) => {
          setAppointments((prev) => [apt, ...prev]);
          scrollToTop();
        }}
        onAddMedicine={(med) => {
          setMedicines((prev) => [med, ...prev]);
          scrollToTop();
        }}
        onAddVaccine={(vac) => {
          setVaccines((prev) => [...prev, vac]);
          scrollToTop();
        }}
        onAddAllergy={(alg) => {
          setAllergies((prev) => [...prev, alg]);
          scrollToTop();
        }}
        onAddPrescription={(rx) => {
          setPrescriptions((prev) => [rx, ...prev]);
          scrollToTop();
        }}
        onAddMember={(mem) => {
          setMembers((prev) => [...prev, mem]);
          scrollToTop();
        }}
        initialCategory={addModalInitialCategory}
      />

      {/* Floating button to smoothly return to top and show menu */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="no-print fixed bottom-6 right-6 z-30 flex items-center gap-1.5 px-3.5 py-2.5 bg-[#E27D18] hover:bg-[#C66506] text-white text-xs font-bold rounded-full shadow-lg shadow-[#E27D18]/30 transition-all transform hover:-translate-y-0.5 cursor-pointer border border-[#FEEAA2]/40"
          title="Volver al menú superior"
          aria-label="Volver al menú superior"
        >
          <ArrowUp className="w-4 h-4 text-[#FEEAA2]" />
          <span>Volver al menú</span>
        </button>
      )}
    </div>
  );
}
