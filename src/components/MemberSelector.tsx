import React from 'react';
import { FamilyMember } from '../types/health';
import { formatAge } from '../utils/healthUtils';
import { Users, UserPlus, Droplets } from 'lucide-react';

interface MemberSelectorProps {
  members: FamilyMember[];
  selectedMemberId: string | 'all';
  onSelectMember: (id: string | 'all') => void;
  onAddNewMember: () => void;
}

export const MemberSelector: React.FC<MemberSelectorProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  onAddNewMember,
}) => {
  return (
    <div className="bg-white border-b border-neutral-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-2 shrink-0">
            {/* All family button */}
            <button
              onClick={() => onSelectMember('all')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedMemberId === 'all'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Toda la Familia</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                selectedMemberId === 'all' ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-600'
              }`}>
                {members.length}
              </span>
            </button>

            {/* Individual member buttons */}
            {members.map((member) => {
              const isSelected = selectedMemberId === member.id;
              const age = formatAge(member.birthDate);

              return (
                <button
                  key={member.id}
                  onClick={() => onSelectMember(member.id)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-left transition-all shrink-0 ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  {/* Avatar with fallback */}
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-xs font-bold text-neutral-700">
                        {member.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold whitespace-nowrap">{member.name.split(' ')[0]}</span>
                      <span className={`text-[10px] font-mono tabular-nums ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {member.bloodType}
                      </span>
                    </div>
                    <div className={`text-[10px] ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {member.relationship} · {age}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={onAddNewMember}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors shrink-0 border border-dashed border-neutral-300"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agregar Integrante</span>
          </button>
        </div>
      </div>
    </div>
  );
};
