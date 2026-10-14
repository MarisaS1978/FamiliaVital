import React, { useState } from 'react';
import { CaregiverShareLink, FamilyMember, CaregiverAccessLevel } from '../types/health';
import {
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  ExternalLink,
  Plus,
  Trash2,
  X,
  Phone,
  Heart,
} from 'lucide-react';

interface ShareCaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  shareLinks: CaregiverShareLink[];
  onAddShareLink: (link: CaregiverShareLink) => void;
  onRevokeShareLink: (id: string) => void;
}

export const ShareCaregiverModal: React.FC<ShareCaregiverModalProps> = ({
  isOpen,
  onClose,
  members,
  shareLinks,
  onAddShareLink,
  onRevokeShareLink,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'active' | 'preview'>('active');
  const [recipientName, setRecipientName] = useState('');
  const [recipientRole, setRecipientRole] = useState('Niñera / Cuidador');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    members.map((m) => m.id)
  );
  const [accessLevel, setAccessLevel] = useState<CaregiverAccessLevel>('pediatric_caregiver');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewingLink, setPreviewingLink] = useState<CaregiverShareLink | null>(
    shareLinks[0] || null
  );

  if (!isOpen) return null;

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) return;

    // Generate random 4-digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const newLink: CaregiverShareLink = {
      id: `share-${Date.now()}`,
      recipientName: recipientName.trim(),
      recipientRole,
      memberIds: selectedMemberIds,
      accessLevel,
      pinCode: pin,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: '2027-12-31',
      isActive: true,
    };

    onAddShareLink(newLink);
    setRecipientName('');
    setActiveTab('active');
  };

  const handleCopyLink = (link: CaregiverShareLink) => {
    const appUrl = window.location.origin;
    const shareText = `Hola ${link.recipientName}! Te comparto el acceso seguro a la Libreta de Salud Familiar (${link.recipientRole}).
🔗 Acceso: ${appUrl}/?caregiver=${link.id}
🔒 PIN de seguridad: ${link.pinCode}
(Permiso: ${link.accessLevel === 'emergency_only' ? 'Solo Emergencias' : link.accessLevel === 'pediatric_caregiver' ? 'Cuidador & Botiquín' : 'Historial Completo'})`;

    navigator.clipboard.writeText(shareText);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleMemberSelection = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length > 1) {
        setSelectedMemberIds(selectedMemberIds.filter((m) => m !== id));
      }
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E9DCC4] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        {/* Header */}
        <div className="bg-[#493B2A] text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#E9C46A]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Compartir Fichas Familiares Seguras</h2>
              <p className="text-xs text-[#E9DCC4]">
                Otorga acceso protegido por PIN a niñeras, abuelos, escuelas o médicos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#E9DCC4] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="bg-[#FFF9ED] px-4 py-2 sm:px-6 sm:py-2.5 border-b border-[#E9DCC4] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-white text-[#493B2A] shadow-xs'
                : 'text-[#796B59] hover:text-[#493B2A]'
            }`}
          >
            Accesos Activos ({shareLinks.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'create'
                ? 'bg-white text-[#493B2A] shadow-xs'
                : 'text-[#796B59] hover:text-[#493B2A]'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#B87932]" />
            <span>Generar Nuevo Enlace</span>
          </button>
          {previewingLink && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-[#B87932] text-white shadow-xs'
                  : 'text-[#B87932] hover:bg-[#F8E8A6]/40'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Vista de Cuidador</span>
            </button>
          )}
        </div>

        {/* TAB 1: ACTIVE SHARE LINKS */}
        {activeTab === 'active' && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
            {shareLinks.length === 0 ? (
              <div className="p-8 text-center text-[#796B59]">
                No tienes enlaces compartidos activos. Genera uno nuevo arriba.
              </div>
            ) : (
              shareLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-4 rounded-xl border border-[#E9DCC4] bg-[#FFF9ED]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#493B2A] text-sm">
                        {link.recipientName}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 bg-white border border-[#E9DCC4] text-[#796B59] rounded font-medium">
                        {link.recipientRole}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#796B59]">
                      <span className="flex items-center gap-1 font-mono font-bold text-[#493B2A] bg-white px-2 py-0.5 rounded border border-[#E9DCC4]">
                        <Lock className="w-3 h-3 text-[#B87932]" />
                        PIN: {link.pinCode}
                      </span>
                      <span>·</span>
                      <span>
                        Nivel:{' '}
                        {link.accessLevel === 'emergency_only'
                          ? 'Solo Emergencias'
                          : link.accessLevel === 'pediatric_caregiver'
                          ? 'Cuidador & Botiquín'
                          : 'Historial Completo'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setPreviewingLink(link);
                        setActiveTab('preview');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-[#B87932] bg-white hover:bg-[#F8E8A6]/40 rounded-lg transition-colors border border-[#E9DCC4]"
                    >
                      Ver como Cuidador
                    </button>

                    <button
                      onClick={() => handleCopyLink(link)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#B87932] hover:bg-[#A06424] rounded-lg transition-colors shadow-2xs"
                    >
                      {copiedId === link.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-white" />
                          <span>Copiar Acceso</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onRevokeShareLink(link.id)}
                      className="p-1.5 text-[#796B59] hover:text-[#B42332] transition-colors rounded"
                      title="Revocar acceso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: CREATE NEW LINK */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateLink} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#493B2A] mb-1">
                Nombre del Destinatario *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Mariana López, Escuela Belgrano, Dra. Romero..."
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#493B2A] mb-1">
                Rol o Relación
              </label>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E9DCC4] bg-[#FFF9ED]/30 rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
              >
                <option value="Niñera / Cuidador">Niñera / Cuidador</option>
                <option value="Médico / Especialista">Médico / Especialista</option>
                <option value="Abuelos / Familiares">Abuelos / Familiares</option>
                <option value="Colegio / Club Deportivo">Colegio / Club Deportivo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#493B2A] mb-1">
                Nivel de Permisos
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAccessLevel('emergency_only')}
                  className={`p-3 text-left rounded-lg border text-xs transition-all ${
                    accessLevel === 'emergency_only'
                      ? 'border-[#B87932] bg-[#F8E8A6]/40 text-[#493B2A] ring-1 ring-[#B87932]'
                      : 'border-[#E9DCC4] bg-white text-[#796B59] hover:bg-[#FFF9ED]'
                  }`}
                >
                  <div className="font-bold text-[#493B2A]">Solo Emergencias</div>
                  <div className="text-[11px] text-[#796B59] mt-1">
                    Grupo sanguíneo, alergias severas y teléfonos de urgencia.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessLevel('pediatric_caregiver')}
                  className={`p-3 text-left rounded-lg border text-xs transition-all ${
                    accessLevel === 'pediatric_caregiver'
                      ? 'border-[#B87932] bg-[#F8E8A6]/40 text-[#493B2A] ring-1 ring-[#B87932]'
                      : 'border-[#E9DCC4] bg-white text-[#796B59] hover:bg-[#FFF9ED]'
                  }`}
                >
                  <div className="font-bold text-[#493B2A]">Cuidador / Niñera</div>
                  <div className="text-[11px] text-[#796B59] mt-1">
                    Ficha SOS + Botiquín pediátrico, dosis de remedios y alergias.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessLevel('full_access')}
                  className={`p-3 text-left rounded-lg border text-xs transition-all ${
                    accessLevel === 'full_access'
                      ? 'border-[#B87932] bg-[#F8E8A6]/40 text-[#493B2A] ring-1 ring-[#B87932]'
                      : 'border-[#E9DCC4] bg-white text-[#796B59] hover:bg-[#FFF9ED]'
                  }`}
                >
                  <div className="font-bold text-[#493B2A]">Médico Completo</div>
                  <div className="text-[11px] text-[#796B59] mt-1">
                    Historial vacunas, recetas vigentes y estudios.
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#493B2A] mb-1">
                Integrantes que podrá ver
              </label>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => {
                  const isChecked = selectedMemberIds.includes(m.id);
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => toggleMemberSelection(m.id)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        isChecked
                          ? 'bg-[#B87932] text-white border-[#B87932] font-semibold'
                          : 'bg-white text-[#493B2A] border-[#E9DCC4] hover:bg-[#FFF9ED]'
                      }`}
                    >
                      {m.name.split(' ')[0]} ({m.relationship})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E9DCC4] flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className="px-3 py-1.5 text-xs font-medium text-[#796B59] hover:bg-[#FFF9ED] rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#B87932] hover:bg-[#A06424] rounded-lg transition-colors shadow-xs"
              >
                Generar Enlace con PIN
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: SIMULATED CAREGIVER VIEW */}
        {activeTab === 'preview' && previewingLink && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FFF9ED]/70">
            <div className="p-3 bg-[#F8E8A6] border border-[#E9DCC4] rounded-xl text-xs text-[#493B2A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B87932]" />
                <span>
                  Simulación de vista para <strong>{previewingLink.recipientName}</strong> (PIN {previewingLink.pinCode})
                </span>
              </div>
              <span className="font-bold text-[#B87932]">Modo Solo Lectura</span>
            </div>

            {/* Caregiver Mobile Card Frame */}
            <div className="bg-white rounded-xl border border-[#E9DCC4] p-5 shadow-sm space-y-4 max-w-md mx-auto">
              <div className="text-center pb-3 border-b border-[#E9DCC4]">
                <div className="w-12 h-12 rounded-full bg-[#FFF9ED] text-[#B87932] border border-[#E9DCC4] flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-[#C97759]" />
                </div>
                <h3 className="font-bold text-[#493B2A]">FamiliaVital · Ficha de Cuidador</h3>
                <p className="text-xs text-[#796B59]">
                  Acceso habilitado para {previewingLink.recipientName}
                </p>
              </div>

              {members
                .filter((m) => previewingLink.memberIds.includes(m.id))
                .map((m) => (
                  <div key={m.id} className="p-3.5 rounded-lg border border-[#E9DCC4] bg-[#FFF9ED]/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-[#493B2A]">{m.name}</div>
                        <div className="text-xs text-[#796B59]">
                          {m.relationship} · <span className="font-semibold text-[#C97759]">{m.bloodType}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#493B2A] bg-white px-2 py-0.5 rounded border border-[#E9DCC4]">
                        DNI {m.idNumber}
                      </span>
                    </div>

                    {/* Pediatrician quick call */}
                    {m.primaryDoctor && (
                      <div className="text-xs pt-1">
                        <div className="text-[#796B59] text-[11px]">Pediatra / Médico:</div>
                        <a
                          href={`tel:${m.primaryDoctor.phone}`}
                          className="font-semibold text-[#B87932] hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3 text-[#B87932]" />
                          {m.primaryDoctor.name} ({m.primaryDoctor.phone})
                        </a>
                      </div>
                    )}

                    {/* Emergency Contacts */}
                    <div className="text-xs pt-1 border-t border-[#E9DCC4]">
                      <div className="text-[#796B59] text-[11px] mb-1">Padres / Contactos urgentes:</div>
                      {m.emergencyContacts.map((c, i) => (
                        <div key={i} className="flex justify-between items-center py-0.5">
                          <span className="text-[#493B2A]">{c.name}:</span>
                          <a
                            href={`tel:${c.phone}`}
                            className="font-mono font-bold text-[#B87932] hover:underline"
                          >
                            {c.phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              <div className="text-center pt-2">
                <button
                  onClick={() => setActiveTab('active')}
                  className="text-xs text-[#796B59] hover:text-[#493B2A] font-semibold"
                >
                  Volver a Lista de Accesos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
