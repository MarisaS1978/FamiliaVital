import React, { useState } from 'react';
import { CaregiverShareLink, FamilyMember, CaregiverAccessLevel } from '../types/health';
import {
  Share2,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
  Lock,
  UserCheck,
  ExternalLink,
  Plus,
  Trash2,
  X,
  Phone,
  AlertTriangle,
  Pill,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Compartir Fichas Familiares Seguras</h2>
              <p className="text-xs text-neutral-400">
                Otorga acceso protegido por PIN a niñeras, abuelos, escuelas o médicos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="bg-neutral-100 px-6 py-2.5 border-b border-neutral-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'active'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Accesos Activos ({shareLinks.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'create'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generar Nuevo Enlace</span>
          </button>
          {previewingLink && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'preview'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Vista de Cuidador</span>
            </button>
          )}
        </div>

        {/* TAB 1: ACTIVE SHARE LINKS */}
        {activeTab === 'active' && (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {shareLinks.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                No tienes enlaces compartidos activos. Genera uno nuevo arriba.
              </div>
            ) : (
              shareLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 text-sm">
                        {link.recipientName}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded font-medium">
                        {link.recipientRole}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span className="flex items-center gap-1 font-mono font-semibold text-neutral-800 bg-white px-2 py-0.5 rounded border border-neutral-200">
                        <Lock className="w-3 h-3 text-emerald-600" />
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
                      className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                    >
                      Ver como Cuidador
                    </button>

                    <button
                      onClick={() => handleCopyLink(link)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors shadow-2xs"
                    >
                      {copiedId === link.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Copiar Acceso</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onRevokeShareLink(link.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors rounded"
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
          <form onSubmit={handleCreateLink} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nombre del Destinatario *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Mariana López, Escuela Belgrano, Dra. Romero..."
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Rol o Relación
              </label>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Niñera / Cuidador">Niñera / Cuidador</option>
                <option value="Médico / Especialista">Médico / Especialista</option>
                <option value="Abuelos / Familiares">Abuelos / Familiares</option>
                <option value="Colegio / Club Deportivo">Colegio / Club Deportivo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nivel de Permisos
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAccessLevel('emergency_only')}
                  className={`p-3 text-left rounded-lg border text-xs transition-all ${
                    accessLevel === 'emergency_only'
                      ? 'border-emerald-600 bg-emerald-50/50 text-neutral-900 ring-1 ring-emerald-500'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <div className="font-bold">Solo Emergencias</div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Grupo sanguíneo, alergias severas y teléfonos de urgencia.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessLevel('pediatric_caregiver')}
                  className={`p-3 text-left rounded-lg border text-xs transition-all ${
                    accessLevel === 'pediatric_caregiver'
                      ? 'border-emerald-600 bg-emerald-50/50 text-neutral-900 ring-1 ring-emerald-500'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <div className="font-bold">Cuidador / Niñera</div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Ficha SOS + Botiquín pediátrico, dosis de remedios y alergias.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessLevel('full_access')}
                  className={`p-3 text-left rounded-lg border text-xs transition-all ${
                    accessLevel === 'full_access'
                      ? 'border-emerald-600 bg-emerald-50/50 text-neutral-900 ring-1 ring-emerald-500'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <div className="font-bold">Médico Completo</div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Historial vacunas, recetas vigentes y estudios.
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
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
                      className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                        isChecked
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {m.name.split(' ')[0]} ({m.relationship})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
              >
                Generar Enlace con PIN
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: SIMULATED CAREGIVER VIEW */}
        {activeTab === 'preview' && previewingLink && (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto bg-neutral-100/70">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  Simulación de vista para <strong>{previewingLink.recipientName}</strong> (PIN {previewingLink.pinCode})
                </span>
              </div>
              <span className="font-semibold text-emerald-800">Modo Solo Lectura</span>
            </div>

            {/* Caregiver Mobile Card Frame */}
            <div className="bg-white rounded-xl border border-neutral-300 p-5 shadow-sm space-y-4 max-w-md mx-auto">
              <div className="text-center pb-3 border-b border-neutral-200">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-neutral-900">SaludFamiliar · Ficha de Cuidador</h3>
                <p className="text-xs text-neutral-500">
                  Acceso habilitado para {previewingLink.recipientName}
                </p>
              </div>

              {members
                .filter((m) => previewingLink.memberIds.includes(m.id))
                .map((m) => (
                  <div key={m.id} className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-neutral-900">{m.name}</div>
                        <div className="text-xs text-neutral-500">
                          {m.relationship} · {m.bloodType}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-neutral-700 bg-white px-2 py-0.5 rounded border border-neutral-200">
                        DNI {m.idNumber}
                      </span>
                    </div>

                    {/* Pediatrician quick call */}
                    {m.primaryDoctor && (
                      <div className="text-xs pt-1">
                        <div className="text-neutral-500 text-[11px]">Pediatra / Médico:</div>
                        <a
                          href={`tel:${m.primaryDoctor.phone}`}
                          className="font-semibold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          {m.primaryDoctor.name} ({m.primaryDoctor.phone})
                        </a>
                      </div>
                    )}

                    {/* Emergency Contacts */}
                    <div className="text-xs pt-1 border-t border-neutral-200">
                      <div className="text-neutral-500 text-[11px] mb-1">Padres / Contactos urgentes:</div>
                      {m.emergencyContacts.map((c, i) => (
                        <div key={i} className="flex justify-between items-center py-0.5">
                          <span className="text-neutral-800">{c.name}:</span>
                          <a
                            href={`tel:${c.phone}`}
                            className="font-mono font-bold text-emerald-700 hover:underline"
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
                  className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold"
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
