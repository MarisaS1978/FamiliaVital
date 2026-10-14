import React, { useState } from 'react';
import { MedicineItem, FamilyMember, MedicineLocation, MedicineCategory } from '../types/health';
import { getMedicineExpiryInfo, formatDate } from '../utils/healthUtils';
import {
  Pill,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  MapPin,
  Info,
  Thermometer,
  ShieldAlert,
  Search,
  CheckCircle2,
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
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-700 shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="font-bold text-sm text-red-900">
                {expiredItems.length} {expiredItems.length === 1 ? 'medicamento vencido' : 'medicamentos vencidos'} en el botiquín
              </div>
              <p className="text-xs text-red-700 mt-0.5">
                {expiredItems.map((m) => m.name).join(', ')}. Por seguridad familiar, retíralos de inmediato.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDisposalGuide(!showDisposalGuide)}
            className="text-xs font-semibold px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {showDisposalGuide ? 'Ocultar Guía' : '¿Cómo Descartar Seguro?'}
          </button>
        </div>
      )}

      {/* Disposal Guide Accordion */}
      {showDisposalGuide && (
        <div className="p-4 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-700 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Guía Oficial de Descarte Responsable de Medicamentos</span>
          </div>
          <p>
            • <strong>Nunca tirar al inodoro o desagüe:</strong> Contaminan las fuentes de agua y aumentan la resistencia bacteriana en el ecosistema.
          </p>
          <p>
            • <strong>Puntos amarillos / Contenedores en farmacias:</strong> Lleva los blísteres y frascos vencidos al punto de recolección de medicamentos caducados de tu farmacia habitual (SIGRE / Puntos Verdes Farmacéuticos).
          </p>
          <p>
            • <strong>Inutilización domiciliaria:</strong> Si debes tirarlo a basura seca, retira los comprimidos del blíster, mézclalos con borra de café o arena para gatos en una bolsa sellada para que no sean consumibles accidentalmente por niños o mascotas.
          </p>
        </div>
      )}

      {expiringSoonItems.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-xs">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <strong>Próximos a vencer (menos de 45 días):</strong>{' '}
            {expiringSoonItems.map((m) => `${m.name} (${m.expiryInfo.label})`).join(', ')}. Recuerda reponer antes de necesitarlos en urgencias.
          </div>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-neutral-900">Botiquín Familiar Inteligente</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Inventario, control de fechas de caducidad, posología pediátrica y ubicación
          </p>
        </div>

        <button
          onClick={onAddMedicine}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Remedio</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, droga o posología..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Todos ({medicines.length})
          </button>
          <button
            onClick={() => setFilterStatus('warning')}
            className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'warning' ? 'bg-white text-amber-700 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Por vencer ({expiringSoonItems.length})
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'expired' ? 'bg-white text-rose-700 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Vencidos ({expiredItems.length})
          </button>
        </div>

        {/* Location Filter */}
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
        <div className="p-8 text-center bg-white rounded-xl border border-neutral-200">
          <Pill className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-neutral-800">No se encontraron medicamentos</h3>
          <p className="text-xs text-neutral-500 mt-1">
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
                    ? 'border-red-300 ring-1 ring-red-400/30'
                    : isWarning
                    ? 'border-amber-300'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div>
                  {/* Top Badges & Location */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-400" />
                      {med.location}
                    </span>

                    {/* Expiry Status */}
                    {isExpired ? (
                      <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        Vencido
                      </span>
                    ) : isWarning ? (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {med.expiryInfo.label}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                        Vigente ({formatDate(med.expiryDate)})
                      </span>
                    )}
                  </div>

                  {/* Medicine Title & Active Ingredient */}
                  <h3 className="font-bold text-sm text-neutral-900 leading-snug">{med.name}</h3>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Droga: {med.activeIngredient} · {med.form}
                  </div>

                  {/* Dosage instructions (crucial for kids) */}
                  {med.dosageInstructions && (
                    <div className="mt-3 p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 text-[11px] text-neutral-700 leading-relaxed">
                      <div className="font-semibold text-neutral-900 mb-0.5 flex items-center gap-1">
                        <Info className="w-3 h-3 text-emerald-600" />
                        <span>Posología / Indicación:</span>
                      </div>
                      {med.dosageInstructions}
                    </div>
                  )}

                  {/* Notes / opened date */}
                  {med.notes && (
                    <div className="mt-2 text-[11px] text-neutral-500 italic">
                      Nota: {med.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Stock & Actions */}
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  {/* Stock Counter */}
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 text-[11px]">Stock:</span>
                    <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden bg-neutral-50">
                      <button
                        onClick={() => handleStockChange(med, -1)}
                        className="px-2 py-0.5 text-neutral-700 hover:bg-neutral-200 transition-colors"
                        title="Restar unidad"
                      >
                        -
                      </button>
                      <span className="px-2 font-mono font-semibold tabular-nums text-neutral-900">
                        {med.stockQuantity}
                      </span>
                      <button
                        onClick={() => handleStockChange(med, 1)}
                        className="px-2 py-0.5 text-neutral-700 hover:bg-neutral-200 transition-colors"
                        title="Sumar unidad"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-neutral-400 text-[11px]">{med.unit}</span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteMedicine(med.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 transition-colors rounded"
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
