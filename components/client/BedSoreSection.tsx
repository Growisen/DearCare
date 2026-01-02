import React from 'react';
import { PatientAssessmentFormData } from '@/hooks/usePatientAssessment';
import { BedSoreStage } from '@/types/reassessment.types';

interface BedSoreSectionProps {
  bedSore: PatientAssessmentFormData['bedSore'];
  isEditable?: boolean;
  handleBedSoreChange: (field: keyof PatientAssessmentFormData['bedSore'], value: string) => void;
  handleBedSoreStageChange: (stage: BedSoreStage) => void;
}

const stages = ['1', '2', '3', '4'] as BedSoreStage[];

const BedSoreSection: React.FC<BedSoreSectionProps> = ({
  bedSore,
  isEditable = true,
  handleBedSoreChange,
  handleBedSoreStageChange,
}) => {
  const minimalInputClass =
    "w-full border-b border-slate-200 bg-transparent py-1 focus:outline-none focus:border-gray-500 transition-colors text-gray-700 placeholder-gray-400 text-sm";

  return (
    <section className="space-y-6">
      <h2 className="text-sm font-bold uppercase text-gray-800 border-b border-slate-200 pb-2">
        Bed Sore Assessment
      </h2>
      <div className="bg-gray-50/50 p-6 rounded-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Stage</label>
            <div className="flex items-center gap-3">
              {stages.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={!isEditable}
                  onClick={() => handleBedSoreStageChange(s)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2
                    ${bedSore.stage === s 
                      ? 'bg-gray-800 border-gray-800 text-white shadow-none' 
                      : 'bg-white border-slate-200 text-gray-500 hover:border-slate-200'}
                    ${!isEditable ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="shape" className="w-16 text-xs font-bold text-gray-500 uppercase">Shape:</label>
              <input
                type="text"
                id="shape"
                name="shape"
                value={bedSore.shape}
                onChange={e => handleBedSoreChange('shape', e.target.value)}
                className={minimalInputClass}
                disabled={!isEditable}
              />
            </div>
            <div className="flex items-center gap-4">
              <label htmlFor="size" className="w-16 text-xs font-bold text-gray-500 uppercase">Size:</label>
              <input
                type="text"
                id="size"
                name="size"
                value={bedSore.size}
                onChange={e => handleBedSoreChange('size', e.target.value)}
                className={minimalInputClass}
                disabled={!isEditable}
              />
            </div>
            <div className="flex items-center gap-4">
              <label htmlFor="site" className="w-16 text-xs font-bold text-gray-500 uppercase">Site:</label>
              <input
                type="text"
                id="site"
                name="site"
                value={bedSore.site}
                onChange={e => handleBedSoreChange('site', e.target.value)}
                className={minimalInputClass}
                disabled={!isEditable}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BedSoreSection;