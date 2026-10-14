import React, { useState } from 'react';
import { MedicineItem, FamilyMember } from '../types/health';
import { getMedicineExpiryInfo, formatDate } from '../utils/healthUtils';
import {
  Pill,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  MapPin,
  Info,
  ShieldAlert,
  Search,
} from 'lucide-react';

interface MedicineCabinetProps {
  medicines: MedicineItem[];
  members: FamilyMember[];
  onUpdateMedicine: (med: MedicineItem) => void;
  onDeleteMedicine: (id: string) => void;
  onAddMedicine: () => void;
}

export const MedicineCabinet: React.FC<MedicineCabinetProps> = ({
  medicines,
  members,
  onUpdateMedicine,
  onDeleteMedicine,
  onAddMedicine,
}) => {
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'expired' | 'warning' | 'valid'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDisposalGuide, setShowDisposalGuide] = useState(false);

  // Expiration calculations
  const medicinesWithInfo = medicines.map((m) => ({
    ...m,
    expiryInfo: getMedicineExpiryInfo(m.expiryDate),
  }));

  const expiredItems = medicinesWithInfo.filter((m) => m.expiryInfo.status === 'expired');
  const expiringSoonItems = medicinesWithInfo.filter((m) => m.expiryInfo.status === 'expiring_soon');

  // Filter list
  const filteredList = medicinesWithInfo.filter((med) => {
    if (filterLocation !== 'all' && med.location !== filterLocation) return false;
    if (filterStatus === 'expired' && med.expiryInfo.status !== 'expired') return false;
    if (filterStatus === 'warning' && med.expiryInfo.status !== 'expiring_soon') return false;
    if (filterStatus === 'valid' && med.expiryInfo.status !== 'valid') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = med.name.toLowerCase().includes(q);
      const matchIngredient = med.activeIngredient.toLowerCase().includes(q);
      const matchDosage = med.dosageInstructions?.toLowerCase().includes(q);
      if (!matchName && !matchIngredient && !matchDosage) return false;
    }
    return true;
  });

  const handleStockChange = (med: MedicineItem, delta: number) => {
    const newStock = Math.max(0, med.stockQuantity + delta);
    onUpdateMedicine({ ...med, stockQuantity: newStock });
  };

  return (
    <div className="space-y-6">
      {/* Expiration Alert Banners */}
      {expiredItems.length > 0 && (
        <div className="p-4 rounded-xl bg-[#FDF1F2] border border-[#F5B8BE] text-[#493B2A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#B42332] shrink-0 border border-[#F5B8BE]">
              <AlertTriangle className="w-5 h-5 text-[#B42332]" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#B42332]">
                {expiredItems.length} {expiredItems.length === 1 ? 'medicamento vencido' : 'medicamentos vencidos'} en el botiquín
              </div>
              <p className="text-xs text-[#796B59] mt-0.5">
                {expiredItems.map((m) => m.name).join(', ')}. Por seguridad familiar, retíralos de inmediato.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDisposalGuide(!showDisposalGuide)}
            className="text-xs font-semibold px-3 py-1.5 bg-[#B42332] hover:bg-[#9E1B28] text-white rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
          >
            {showDisposalGuide ? 'Ocultar Guía' : '¿Cómo Descartar Seguro?'}
          </button>
        </div>
      )}

      {/* Disposal Guide Accordion (Amarillo Manteca destacado) */}
      {showDisposalGuide && (
        <div className="p-4 rounded-xl bg-[#F8E8A6]/50 border border-[#E9DCC4] text-xs text-[#493B2A] space-y-2 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-[#B87932] text-sm">
            <ShieldAlert className="w-4 h-4 text-[#B87932]" />
            <span>Guía Oficial de Descarte Responsable de Medicamentos</span>
          </div>
          <p className="text-[#796B59] leading-relaxed">
            • <strong className="text-[#493B2A]">Nunca tirar al inodoro o desagüe:</strong> Contaminan las fuentes de agua y aumentan la resistencia bacteriana en el ecosistema.
          </p>
          <p className="text-[#796B59] leading-relaxed">
            • <strong className="text-[#493B2A]">Puntos amarillos / Contenedores en farmacias:</strong> Lleva los blísteres y frascos vencidos al punto de recolección de medicamentos caducados de tu farmacia habitual (SIGRE / Puntos Verdes Farmacéuticos).
          </p>
          <p className="text-[#796B59] leading-relaxed">
            • <strong className="text-[#493B2A]">Inutilización domiciliaria:</strong> Si debes tirarlo a basura seca, retira los comprimidos del blíster, mézclalos con borra de café o arena para gatos en una bolsa sellada para que no sean consumibles accidentalmente por niños o mascotas.
          </p>
        </div>
      )}

      {expiringSoonItems.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[#FDF5E6] border border-[#F4DF9B] text-[#8A570A] flex items-center gap-3 text-xs">
          <Clock className="w-4 h-4 text-[#8A570A] shrink-0" />
          <div>
            <strong>Próximos a vencer (menos de 45 días):</strong>{' '}
            {expiringSoonItems.map((m) => `${m.name} (${m.expiryInfo.label})`).join(', ')}. Recuerda reponer antes de necesitarlos en urgencias.
          </div>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-[#E9DCC4] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#B87932]" />
            <h2 className="text-lg font-bold text-[#493B2A]">Botiquín Familiar Inteligente</h2>
          </div>
          <p className="text-xs text-[#796B59] mt-0.5">
            Inventario, control de fechas de caducidad, posología pediátrica y ubicación
          </p>
        </div>

        <button
          onClick={onAddMedicine}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#B87932] hover:bg-[#A06424] rounded-lg transition-colors whitespace-nowrap shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>Agregar Remedio</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#D9A441] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, droga o posología..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E9DCC4] rounded-lg text-[#493B2A] placeholder:text-[#796B59]/70 focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-[#FFF9ED] border border-[#E9DCC4] rounded-lg">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'all' ? 'bg-white text-[#493B2A] shadow-xs font-semibold' : 'text-[#796B59]'
            }`}
          >
            Todos ({medicines.length})
          </button>
          <button
            onClick={() => setFilterStatus('warning')}
            className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'warning' ? 'bg-white text-[#8A570A] shadow-xs font-semibold' : 'text-[#796B59]'
            }`}
          >
            Por vencer ({expiringSoonItems.length})
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'expired' ? 'bg-white text-[#B42332] shadow-xs font-semibold' : 'text-[#796B59]'
            }`}
          >
            Vencidos ({expiredItems.length})
          </button>
        </div>

        {/* Location Filter */}
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-[#E9DCC4] rounded-lg text-[#493B2A] focus:outline-none focus:ring-2 focus:ring-[#E9C46A]"
        >
          <option value="all">Todas las Ubicaciones</option>
          <option value="Botiquín Baño">Botiquín Baño</option>
          <option value="Heladera">Heladera (refrigerados)</option>
          <option value="Mochila Niños">Mochila Niños (inhaladores/alergias)</option>
          <option value="Mesa de Luz">Mesa de Luz</option>
          <option value="Auto / Viaje">Auto / Viaje</option>
        </select>
      </div>

      {/* Grid of Medicines */}
      {filteredList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-[#E9DCC4]">
          <Pill className="w-8 h-8 text-[#D9A441] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[#493B2A]">No se encontraron medicamentos</h3>
          <p className="text-xs text-[#796B59] mt-1">
            Prueba ajustando la búsqueda o los filtros de ubicación y estado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((med) => {
            const isExpired = med.expiryInfo.status === 'expired';
            const isWarning = med.expiryInfo.status === 'expiring_soon';

            return (
              <div
                key={med.id}
                className={`p-4 rounded-xl border transition-all bg-white flex flex-col justify-between ${
                  isExpired
                    ? 'border-[#F5B8BE] ring-1 ring-[#F5B8BE]'
                    : isWarning
                    ? 'border-[#F4DF9B] ring-1 ring-[#F4DF9B]/60'
                    : 'border-[#E9DCC4] hover:border-[#D9A441]'
                }`}
              >
                <div>
                  {/* Top Badges & Location */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] text-[#796B59] flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-[#D9A441]" />
                      {med.location}
                    </span>

                    {/* Expiry Status */}
                    {isExpired ? (
                      <span className="text-[11px] font-semibold text-[#B42332] bg-[#FDF1F2] border border-[#F5B8BE] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-[#B42332]" />
                        Vencido
                      </span>
                    ) : isWarning ? (
                      <span className="text-[11px] font-semibold text-[#8A570A] bg-[#FDF5E6] border border-[#F4DF9B] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8A570A]" />
                        {med.expiryInfo.label}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-[#287653] bg-[#EDF6F1] border border-[#B8DDCB] px-2 py-0.5 rounded-md">
                        Vigente ({formatDate(med.expiryDate)})
                      </span>
                    )}
                  </div>

                  {/* Medicine Title & Active Ingredient */}
                  <h3 className="font-bold text-sm text-[#493B2A] leading-snug">{med.name}</h3>
                  <div className="text-xs text-[#796B59] mt-0.5">
                    Droga: {med.activeIngredient} · {med.form}
                  </div>

                  {/* Dosage instructions (crucial for kids) */}
                  {med.dosageInstructions && (
                    <div className="mt-3 p-2.5 rounded-lg bg-[#FFF9ED] border border-[#E9DCC4] text-[11px] text-[#493B2A] leading-relaxed">
                      <div className="font-semibold text-[#B87932] mb-0.5 flex items-center gap-1">
                        <Info className="w-3 h-3 text-[#B87932]" />
                        <span>Posología / Indicación:</span>
                      </div>
                      {med.dosageInstructions}
                    </div>
                  )}

                  {/* Notes / opened date */}
                  {med.notes && (
                    <div className="mt-2 text-[11px] text-[#796B59] italic">
                      Nota: {med.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Stock & Actions */}
                <div className="mt-4 pt-3 border-t border-[#E9DCC4] flex items-center justify-between text-xs">
                  {/* Stock Counter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#796B59] text-[11px]">Stock:</span>
                    <div className="flex items-center border border-[#E9DCC4] rounded-md overflow-hidden bg-[#FFF9ED]">
                      <button
                        onClick={() => handleStockChange(med, -1)}
                        className="px-2 py-0.5 text-[#493B2A] hover:bg-[#F8E8A6]/50 transition-colors"
                        title="Restar unidad"
                      >
                        -
                      </button>
                      <span className="px-2 font-mono font-semibold tabular-nums text-[#493B2A]">
                        {med.stockQuantity}
                      </span>
                      <button
                        onClick={() => handleStockChange(med, 1)}
                        className="px-2 py-0.5 text-[#493B2A] hover:bg-[#F8E8A6]/50 transition-colors"
                        title="Sumar unidad"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[#796B59] text-[11px]">{med.unit}</span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteMedicine(med.id)}
                    className="p-1 text-[#796B59] hover:text-[#B42332] transition-colors rounded"
                    title="Eliminar del botiquín"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
