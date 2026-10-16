import React from 'react';
import { FamilyMember } from '../types/health';
import { formatAge } from '../utils/healthUtils';
import { Users, UserPlus } from 'lucide-react';

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
    <div className="bg-white border-b border-[#E9DCC4] py-2 sm:py-3 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar overscroll-x-contain py-0.5">
          {/* All family button */}
          <button
            onClick={() => onSelectMember('all')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
              selectedMemberId === 'all'
                ? 'bg-[#E27D18] text-white shadow-xs'
                : 'bg-[#FFF9ED] text-[#3E3020] border border-[#E9DCC4] hover:bg-[#FEEAA2]/50'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${selectedMemberId === 'all' ? 'text-white' : 'text-[#E27D18]'}`} />
            <span className="hidden sm:inline">Toda la Familia</span>
            <span className="sm:hidden">Todos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
              selectedMemberId === 'all' ? 'bg-[#C66506] text-white' : 'bg-[#E9DCC4] text-[#6E5F4D]'
            }`}>
              {members.length}
            </span>
          </button>

          {/* Individual member buttons */}
          {members.map((member) => {
            const isSelected = selectedMemberId === member.id;
            const age = formatAge(member.birthDate);
            const isPet = member.isPet || member.relationship === 'Mascota';

            return (
              <button
                key={member.id}
                onClick={() => onSelectMember(member.id)}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-left transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'border-[#E27D18] bg-[#E27D18] text-white shadow-xs'
                    : 'border-[#E9DCC4] bg-white text-[#3E3020] hover:border-[#E27D18] hover:bg-[#FFF9ED]'
                }`}
              >
                {/* Avatar with reliable fallback */}
                <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-[#FFF9ED] flex items-center justify-center shrink-0 border border-[#E9DCC4]">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.fallback-initial');
                        if (fallback) (fallback as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`fallback-initial w-full h-full ${member.avatarUrl ? 'hidden' : 'flex'} items-center justify-center`}>
                    {isPet ? (
                      <span className="text-xs">
                        {member.petDetails?.species === 'Gato' ? '🐱' : '🐶'}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#E27D18]">
                        {member.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold whitespace-nowrap">{member.name.split(' ')[0]}</span>
                    <span className={`text-[10px] font-mono tabular-nums ${isSelected ? 'text-[#FEEAA2]' : 'text-[#6E5F4D]'}`}>
                      {isPet ? (member.petDetails?.species || 'Mascota') : member.bloodType}
                    </span>
                  </div>
                  <div className={`text-[10px] ${isSelected ? 'text-white/90' : 'text-[#6E5F4D]'}`}>
                    {member.relationship} · {age}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Add member button in the direct flow of the list */}
          <button
            onClick={onAddNewMember}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#3E3020] hover:bg-[#FFF9ED] bg-white rounded-lg transition-colors shrink-0 border border-dashed border-[#E27D18] shadow-2xs cursor-pointer"
            title="Agregar nuevo familiar o mascota"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#E27D18]" />
            <span>Integrante</span>
          </button>
        </div>
      </div>
    </div>
  );
};
