import React, { useState, useRef } from 'react';
import { VaccineRecord, FamilyMember, VaccineStatus } from '../types/health';
import { formatDate, shareViaWhatsApp, readFileAsDataURL } from '../utils/healthUtils';
import {
  Syringe,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Check,
  Building2,
  Hash,
  Upload,
  FileText,
  Eye,
  MessageCircle,
  Printer,
  Download,
  X,
  Camera,
  FileCheck,
  Info,
} from 'lucide-react';

interface VaccinationScheduleProps {
  vaccines: VaccineRecord[];
  members: FamilyMember[];
  selectedMemberId: string | 'all';
  onUpdateVaccine: (vaccine: VaccineRecord) => void;
  onAddVaccine: () => void;
}

export const VaccinationSchedule: React.FC<VaccinationScheduleProps> = ({
  vaccines,
  members,
  selectedMemberId,
  onUpdateVaccine,
  onAddVaccine,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'applied'>('all');
  const [editingVaccine, setEditingVaccine] = useState<VaccineRecord | null>(null);
  const [viewingDocVaccine, setViewingDocVaccine] = useState<VaccineRecord | null>(null);
  const vacFileInputRef = useRef<HTMLInputElement>(null);

  // Scanner modal state for OCR extraction
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scannedData, setScannedData] = useState<any>(null);

  // Form inputs for applying vaccine
  const [applyDateInput, setApplyDateInput] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [lotInput, setLotInput] = useState<string>('');
  const [centerInput, setCenterInput] = useState<string>('');
  const [attachedDocName, setAttachedDocName] = useState<string>('');
  const [attachedDocUrl, setAttachedDocUrl] = useState<string>('');
  const [attachedDocType, setAttachedDocType] = useState<'pdf' | 'image'>('pdf');

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanStep('scanning');
    setTimeout(() => {
      setScanStep('success');
      setScannedData({
        vaccineName: 'Triple Viral (SRP) / Varicela',
        lotNumber: `LOT-MSAL-${Math.floor(10000 + Math.random() * 90000)}`,
        healthCenter: 'Vacunatorio Oficial Trinidad',
        date: new Date().toISOString().split('T')[0],
        doseNumber: 'Dosis Única',
      });
    }, 1400);
  };

  const handleApplyScannedVaccine = () => {
    if (!scannedData) return;
    const targetMemberId = selectedMemberId === 'all' ? members[0]?.id : selectedMemberId;
    const newVac: VaccineRecord = {
      id: `vac-scan-${Date.now()}`,
      memberId: targetMemberId,
      vaccineName: scannedData.vaccineName,
      diseaseTarget: 'Sarampión, Rubéola, Paperas y Varicela',
      doseNumber: scannedData.doseNumber,
      recommendedAge: 'Esquema Nacional',
      recommendedAgeMonths: 15,
      status: 'applied',
      applicationDate: scannedData.date,
      lotNumber: scannedData.lotNumber,
      healthCenter: scannedData.healthCenter,
      isNationalCalendar: true,
      documentName: 'Carnet_Oficial_Escaneado.pdf',
      documentType: 'pdf',
    };
    onUpdateVaccine(newVac);
    setIsScanning(false);
    setScanStep('idle');
    setScannedData(null);
  };

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await readFileAsDataURL(file);
        const targetMemberId = selectedMemberId === 'all' ? members[0]?.id : selectedMemberId;
        const newVac: VaccineRecord = {
          id: `vac-file-${Date.now()}`,
          memberId: targetMemberId,
          vaccineName: file.name.replace(/\.[^/.]+$/, ''),
          diseaseTarget: 'Certificado de Vacunación Adjunto',
          doseNumber: 'Comprobante',
          recommendedAge: 'Al día',
          recommendedAgeMonths: 0,
          status: 'applied',
          applicationDate: new Date().toISOString().split('T')[0],
          healthCenter: 'Vacunatorio Oficial',
          isNationalCalendar: false,
          documentUrl: result.url,
          documentName: result.name,
          documentType: result.type,
        };
        onUpdateVaccine(newVac);
      } catch (err) {
        console.error('Error uploading vaccine doc:', err);
      }
    }
  };

  // Filter vaccines by member
  const memberVaccines = vaccines.filter(
    (v) => selectedMemberId === 'all' || v.memberId === selectedMemberId
  );

  // Filter by status
  const filteredVaccines = memberVaccines.filter((v) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'applied') return v.status === 'applied';
    if (statusFilter === 'pending') return v.status === 'due' || v.status === 'overdue' || v.status === 'upcoming';
    return true;
  });

  // Calculate statistics
  const totalCount = memberVaccines.length;
  const appliedCount = memberVaccines.filter((v) => v.status === 'applied').length;
  const pendingCount = memberVaccines.filter((v) => v.status === 'due' || v.status === 'overdue').length;
  const overdueCount = memberVaccines.filter((v) => v.status === 'overdue').length;
  const percentage = totalCount > 0 ? Math.round((appliedCount / totalCount) * 100) : 0;

  const currentMember = members.find((m) => m.id === selectedMemberId);

  const handleOpenMarkApplied = (vac: VaccineRecord) => {
    setEditingVaccine(vac);
    setApplyDateInput(vac.applicationDate || new Date().toISOString().split('T')[0]);
    setLotInput(vac.lotNumber || '');
    setCenterInput(vac.healthCenter || 'Vacunatorio Oficial');
    setAttachedDocName(vac.documentName || '');
    setAttachedDocUrl(vac.documentUrl || '');
    setAttachedDocType(vac.documentType || 'pdf');
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await readFileAsDataURL(file);
        setAttachedDocName(result.name);
        setAttachedDocUrl(result.url);
        setAttachedDocType(result.type);
      } catch (err) {
        console.error('Error reading vaccine document:', err);
      }
    }
  };

  const handleSaveApplied = () => {
    if (!editingVaccine) return;
    const updated: VaccineRecord = {
      ...editingVaccine,
      status: 'applied',
      applicationDate: applyDateInput,
      lotNumber: lotInput.trim() || undefined,
      healthCenter: centerInput.trim() || undefined,
      documentName: attachedDocName || undefined,
      documentUrl: attachedDocUrl || undefined,
      documentType: attachedDocType,
    };
    onUpdateVaccine(updated);
    setEditingVaccine(null);
  };

  const handleShareVaccinesWhatsApp = () => {
    const targetName = currentMember ? currentMember.name : 'la Familia';
    const appliedList = memberVaccines
      .filter((v) => v.status === 'applied')
      .map((v) => `✅ ${v.vaccineName} (${v.doseNumber}) - ${formatDate(v.applicationDate || '')}`)
      .join('\n');

    const pendingList = memberVaccines
      .filter((v) => v.status === 'due' || v.status === 'overdue')
      .map((v) => `⏳ ${v.vaccineName} (${v.doseNumber}) - ${v.recommendedAge}`)
      .join('\n');

    const msg = `*CALENDARIO DE VACUNACIÓN - FAMILIAVITAL*
👤 Esquema de: *${targetName}*
Progreso: ${percentage}% (${appliedCount}/${totalCount} aplicadas)

💉 *DOSIS APLICADAS:*
${appliedList || 'Ninguna registrada aún'}

⚠️ *PENDIENTES / EN FECHA:*
${pendingList || '¡Esquema al día!'}

_Enviado desde FamiliaVital_`;

    shareViaWhatsApp(msg);
  };

  const getStatusBadge = (status: VaccineStatus) => {
    switch (status) {
      case 'applied':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E7E52] bg-[#EDF7F2] px-2.5 py-0.5 rounded-full border border-[#B8DDCB]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1E7E52]" />
            Aplicada
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#C21D30] bg-[#FDF1F2] px-2.5 py-0.5 rounded-full border border-[#F5B8BE]">
            <AlertCircle className="w-3.5 h-3.5 text-[#C21D30]" />
            Atrasada / Urgente
          </span>
        );
      case 'due':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#9A5B00] bg-[#FFF5E5] px-2.5 py-0.5 rounded-full border border-[#FEEAA2]">
            <Clock className="w-3.5 h-3.5 text-[#9A5B00]" />
            En fecha
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#6E5F4D] bg-[#FFF9ED] border border-[#E9DCC4] px-2.5 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-[#F3BA2F]" />
            Próxima por edad
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-[#E9DCC4] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-[#E26D14]" />
            <h2 className="text-lg font-bold text-[#3E3020]">
              Calendario Oficial de Vacunación
            </h2>
          </div>
          <p className="text-xs text-[#6E5F4D] mt-0.5">
            Dosis aplicadas, certificados oficiales escaneados (PDF/Fotos) y control de vencimientos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Progress badge */}
          <div className="flex items-center gap-3 text-xs font-mono tabular-nums bg-[#FFF9ED] px-3.5 py-2 rounded-xl border border-[#E9DCC4]">
            <div className="text-right">
              <span className="text-[#6E5F4D] block text-[10px] font-sans">Progreso</span>
              <span className="font-bold text-[#3E3020] text-sm">{percentage}%</span>
            </div>
            <div className="w-20 bg-white border border-[#E9DCC4] h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-[#1E7E52] h-full rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-right pl-2 border-l border-[#E9DCC4]">
              <span className="text-[#6E5F4D] block text-[10px] font-sans">Aplicadas</span>
              <span className="font-bold text-[#1E7E52] text-sm">
                {appliedCount}/{totalCount}
              </span>
            </div>
          </div>

          {/* Direct Document Scan & Upload Actions */}
          <button
            type="button"
            onClick={handleSimulateScan}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#3E3020] bg-[#FFF9ED] border border-[#E9DCC4] hover:bg-[#FEEAA2]/50 rounded-xl transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
            title="Escanear carnet de vacunas con la cámara u OCR inteligente"
          >
            <Camera className="w-3.5 h-3.5 text-[#E27D18]" />
            <span>Escanear Carnet / OCR</span>
          </button>

          <input
            ref={vacFileInputRef}
            type="file"
            accept=".pdf,image/*"
            onChange={handleDirectFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => vacFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#3E3020] bg-white border border-[#E9DCC4] hover:bg-[#FFF9ED] rounded-xl transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#E27D18]" />
            <span>Subir PDF / Foto</span>
          </button>

          {/* WhatsApp share */}
          <button
            type="button"
            onClick={handleShareVaccinesWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] rounded-xl transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
            title="Compartir esquema por WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          {/* Add vaccine button */}
          <button
            type="button"
            onClick={onAddVaccine}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#E27D18] hover:bg-[#C66506] rounded-xl transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Vacuna / Carnet</span>
          </button>
        </div>
      </div>

      {/* Explanatory Banner on Image and PDF Utility */}
      <div className="p-4 rounded-xl bg-[#FFF9ED] border border-[#E9DCC4] flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#FEEAA2] flex items-center justify-center shrink-0 text-[#E27D18]">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1 text-[#6E5F4D]">
          <div className="font-bold text-[#3E3020]">
            💡 ¿Qué utilidad tiene guardar la foto o PDF del carnet de vacunas?
          </div>
          <p>
            El cartón físico suele extraviarse o ensuciarse. Guardar la foto o PDF con el <strong>sello oficial, fecha y número de lote</strong> te garantiza comprobante válido e instantáneo ante colegios, guarderías, clubes deportivos y viajes internacionales.
          </p>
        </div>
      </div>

      {/* Filter and View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E9DCC4]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#E26D14] text-white shadow-xs'
                : 'text-[#6E5F4D] hover:bg-[#FFF9ED] hover:text-[#3E3020]'
            }`}
          >
            Todas ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'pending'
                ? 'bg-[#E26D14] text-white shadow-xs'
                : 'text-[#6E5F4D] hover:bg-[#FFF9ED] hover:text-[#3E3020]'
            }`}
          >
            Pendientes / Urgentes ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('applied')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'applied'
                ? 'bg-[#E26D14] text-white shadow-xs'
                : 'text-[#6E5F4D] hover:bg-[#FFF9ED] hover:text-[#3E3020]'
            }`}
          >
            Aplicadas ({appliedCount})
          </button>
        </div>

        {overdueCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#C21D30] bg-[#FDF1F2] px-3 py-1 rounded-lg border border-[#F5B8BE]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{overdueCount} dosis atrasada(s)</span>
          </div>
        )}
      </div>

      {/* Vaccination Table */}
      {filteredVaccines.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E9DCC4]">
          <Syringe className="w-8 h-8 text-[#E26D14] mx-auto mb-2 opacity-50" />
          <h3 className="font-bold text-sm text-[#3E3020]">No hay vacunas en esta vista</h3>
          <p className="text-xs text-[#6E5F4D] mt-1">Prueba cambiando los filtros o agregando una nueva vacuna arriba.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E9DCC4] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#3E3020]">
              <thead className="bg-[#FFF9ED] text-[#6E5F4D] font-bold border-b border-[#E9DCC4] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Vacuna</th>
                  <th className="py-3 px-4">Familiar</th>
                  <th className="py-3 px-4">Edad / Etapa</th>
                  <th className="py-3 px-4">Dosis</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Aplicación / Carnet</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DCC4]/60">
                {filteredVaccines.map((vac) => {
                  const member = members.find((m) => m.id === vac.memberId);
                  const isApplied = vac.status === 'applied';

                  return (
                    <tr
                      key={vac.id}
                      className={`hover:bg-[#FFF9ED]/40 transition-colors ${
                        vac.status === 'overdue' ? 'bg-[#FDF1F2]/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#3E3020] text-sm font-bold">
                            {vac.vaccineName}
                          </span>
                          {vac.isPetVaccine && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-[#FEEAA2] text-[#E26D14] rounded font-bold">
                              🐾 Mascota
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#6E5F4D] mt-0.5">
                          Protege contra: {vac.diseaseTarget}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-[#3E3020]">
                          {member ? member.name.split(' ')[0] : 'General'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-[#6E5F4D]">
                        {vac.recommendedAge}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-[#6E5F4D] font-medium">
                        {vac.doseNumber}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(vac.status)}
                      </td>

                      <td className="py-3.5 px-4 text-[#6E5F4D]">
                        {isApplied ? (
                          <div className="space-y-1">
                            <div className="font-mono tabular-nums text-[#3E3020] font-bold">
                              {formatDate(vac.applicationDate || '')}
                            </div>
                            <div className="text-[11px] text-[#6E5F4D] flex flex-wrap items-center gap-1.5">
                              {vac.lotNumber && (
                                <span className="flex items-center gap-0.5 font-mono bg-[#FFF9ED] px-1.5 py-0.2 rounded border border-[#E9DCC4]">
                                  <Hash className="w-3 h-3 text-[#E26D14]" />
                                  {vac.lotNumber}
                                </span>
                              )}
                              {vac.healthCenter && (
                                <span className="flex items-center gap-0.5 truncate max-w-[140px]">
                                  <Building2 className="w-3 h-3 text-[#F3BA2F]" />
                                  {vac.healthCenter}
                                </span>
                              )}
                            </div>

                            {/* Scanned Document Badge if attached */}
                            {(vac.documentName || vac.documentUrl) && (
                              <button
                                onClick={() => setViewingDocVaccine(vac)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E26D14] bg-[#FFF9ED] hover:bg-[#FEEAA2] px-2 py-0.5 rounded border border-[#E9DCC4] transition-colors cursor-pointer mt-1"
                                title="Ver comprobante escaneado o carnet oficial"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Ver Carnet / PDF</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-[#6E5F4D]/70 italic text-[11px]">
                            {vac.notes || 'Pendiente de aplicación'}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isApplied ? (
                          <button
                            onClick={() => handleOpenMarkApplied(vac)}
                            className="text-xs text-[#E26D14] hover:text-[#C55606] font-bold px-2.5 py-1 rounded-md hover:bg-[#FFF9ED] border border-transparent hover:border-[#E9DCC4] transition-colors cursor-pointer"
                          >
                            Editar / Adjuntar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenMarkApplied(vac)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#1E7E52] hover:bg-[#165E3D] px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Marcar Aplicada</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MARK APPLIED & ATTACH SCAN MODAL */}
      {editingVaccine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E9DCC4] shadow-2xl max-w-lg w-full flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="bg-[#3E3020] text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Registrar Aplicación de Vacuna
                </h3>
                <p className="text-xs text-[#E9DCC4] mt-0.5">
                  {editingVaccine.vaccineName} ({editingVaccine.doseNumber})
                </p>
              </div>
              <button
                onClick={() => setEditingVaccine(null)}
                className="p-1 rounded-lg text-[#E9DCC4] hover:text-white hover:bg-white/10 transition-colors"
                title="Cerrar ventana"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#3E3020] mb-1">
                  Fecha de Aplicación *
                </label>
                <input
                  type="date"
                  required
                  value={applyDateInput}
                  onChange={(e) => setApplyDateInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9DCC4] rounded-lg text-[#3E3020] bg-[#FFF9ED]/30 focus:outline-none focus:ring-2 focus:ring-[#F3BA2F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">
                    Número de Lote (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: VAC-2026-X8"
                    value={lotInput}
                    onChange={(e) => setLotInput(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] rounded-lg text-[#3E3020] bg-[#FFF9ED]/30 focus:outline-none focus:ring-2 focus:ring-[#F3BA2F] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#3E3020] mb-1">
                    Centro de Salud / Vacunatorio
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Sanatorio Trinidad / Hospital"
                    value={centerInput}
                    onChange={(e) => setCenterInput(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9DCC4] rounded-lg text-[#3E3020] bg-[#FFF9ED]/30 focus:outline-none focus:ring-2 focus:ring-[#F3BA2F]"
                  />
                </div>
              </div>

              {/* DOCUMENT SCAN / PDF UPLOAD SECTION */}
              <div className="p-3.5 bg-[#FFF9ED] border border-[#E9DCC4] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[#E26D14]">
                    <Upload className="w-4 h-4" />
                    <span>Adjuntar Comprobante o Carnet (PDF / Foto)</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#6E5F4D]">
                  Escanea o sube una fotografía del carnet de vacunación sellado o el PDF oficial.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E9DCC4] text-[#3E3020] rounded-lg hover:bg-[#FFF9ED] text-xs font-semibold cursor-pointer shadow-2xs">
                    <Camera className="w-3.5 h-3.5 text-[#E26D14]" />
                    <span>Seleccionar PDF o Foto</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                  </label>

                  {attachedDocName && (
                    <div className="flex items-center gap-1.5 text-xs text-[#1E7E52] font-semibold bg-[#EDF7F2] px-2.5 py-1.5 rounded-lg border border-[#B8DDCB]">
                      <FileCheck className="w-4 h-4" />
                      <span className="truncate max-w-[180px]">{attachedDocName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachedDocName('');
                          setAttachedDocUrl('');
                        }}
                        className="text-[#C21D30] hover:font-bold ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="bg-[#FFF9ED] px-4 py-3 sm:px-6 sm:py-3.5 border-t border-[#E9DCC4] flex items-center justify-end gap-2.5 shrink-0 z-10 shadow-2xs">
              <button
                onClick={() => setEditingVaccine(null)}
                className="px-4 py-2 text-xs font-semibold text-[#6E5F4D] hover:text-[#3E3020] hover:bg-white rounded-lg border border-transparent hover:border-[#E9DCC4] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveApplied}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1E7E52] hover:bg-[#165E3D] rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar en Libreta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW CERTIFICATE / CARNET MODAL */}
      {viewingDocVaccine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E9DCC4] shadow-2xl max-w-lg w-full flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden">
            <div className="bg-[#3E3020] text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#F3BA2F]" />
                <h3 className="text-sm font-bold text-white truncate">
                  Comprobante: {viewingDocVaccine.vaccineName}
                </h3>
              </div>
              <button
                onClick={() => setViewingDocVaccine(null)}
                className="p-1 rounded-lg text-[#E9DCC4] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="p-4 bg-[#FFF9ED] border border-[#E9DCC4] rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#E9DCC4] pb-2">
                  <div>
                    <span className="font-bold text-sm text-[#3E3020]">
                      {viewingDocVaccine.vaccineName}
                    </span>
                    <div className="text-[#6E5F4D] text-[11px]">{viewingDocVaccine.doseNumber}</div>
                  </div>
                  <span className="font-mono text-[#1E7E52] font-bold text-xs">
                    {formatDate(viewingDocVaccine.applicationDate || '')}
                  </span>
                </div>

                <div className="space-y-1 text-[#6E5F4D]">
                  <div>Centro: <strong>{viewingDocVaccine.healthCenter || 'Vacunatorio Oficial'}</strong></div>
                  <div>Lote: <strong>{viewingDocVaccine.lotNumber || 'N/D'}</strong></div>
                  <div>Archivo adjunto: <strong>{viewingDocVaccine.documentName || 'Certificado.pdf'}</strong></div>
                </div>

                {viewingDocVaccine.documentUrl && viewingDocVaccine.documentType === 'image' ? (
                  <div className="rounded-lg overflow-hidden border border-[#E9DCC4] max-h-64 bg-black/5">
                    <img
                      src={viewingDocVaccine.documentUrl}
                      alt="Carnet escaneado"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white rounded-lg border border-[#E9DCC4] space-y-2">
                    <FileText className="w-10 h-10 text-[#E26D14] mx-auto" />
                    <div className="font-bold text-[#3E3020]">Documento Oficial Escaneado</div>
                    <div className="text-[#6E5F4D] font-mono text-[11px]">
                      {viewingDocVaccine.documentName || 'Certificado_Vacunacion.pdf'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#FFF9ED] px-4 py-3 sm:px-6 sm:py-3.5 border-t border-[#E9DCC4] flex items-center justify-between gap-2 shrink-0">
              <span className="text-[11px] text-[#6E5F4D]">Comprobante válido</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingDocVaccine(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#6E5F4D] hover:bg-white rounded-lg"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#E26D14] hover:bg-[#C55606] rounded-lg transition-colors shadow-xs"
                >
                  Imprimir Carnet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCANNER MODAL */}
      {isScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E9DCC4] shadow-2xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-[#E9DCC4] pb-3">
              <div className="flex items-center gap-2 text-[#3E3020] font-bold text-sm">
                <Camera className="w-4 h-4 text-[#E27D18]" />
                <span>Escáner Inteligente de Carnet de Vacunas</span>
              </div>
              <button
                onClick={() => {
                  setIsScanning(false);
                  setScanStep('idle');
                }}
                className="text-[#6E5F4D] hover:text-[#3E3020] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {scanStep === 'scanning' && (
              <div className="py-8 space-y-4">
                <div className="relative w-44 h-52 mx-auto border-2 border-dashed border-[#E27D18] rounded-xl flex items-center justify-center bg-[#FFF9ED] overflow-hidden shadow-inner">
                  <div className="absolute inset-x-0 h-1 bg-[#E27D18] shadow-md animate-bounce" />
                  <FileText className="w-14 h-14 text-[#E27D18] opacity-60" />
                </div>
                <p className="text-xs font-semibold text-[#3E3020] animate-pulse">
                  Detectando carnet oficial, sello y número de lote...
                </p>
              </div>
            )}

            {scanStep === 'success' && scannedData && (
              <div className="space-y-4 text-left">
                <div className="p-3.5 bg-[#EDF7F2] border border-[#B8DDCB] rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E7E52]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Carnet Oficial Reconocido!</span>
                  </div>
                  <div className="text-xs text-[#3E3020] space-y-1 pt-1">
                    <div><strong>Vacuna detectada:</strong> {scannedData.vaccineName}</div>
                    <div><strong>Dosis:</strong> {scannedData.doseNumber}</div>
                    <div><strong>Lote Oficial:</strong> <span className="font-mono text-[#1E7E52]">{scannedData.lotNumber}</span></div>
                    <div><strong>Vacunatorio:</strong> {scannedData.healthCenter}</div>
                    <div><strong>Fecha:</strong> {formatDate(scannedData.date)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsScanning(false);
                      setScanStep('idle');
                    }}
                    className="px-3 py-1.5 text-xs text-[#6E5F4D] hover:text-[#3E3020] cursor-pointer"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={handleApplyScannedVaccine}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#1E7E52] hover:bg-[#165E3D] rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar Dosis en Libreta</span>
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
