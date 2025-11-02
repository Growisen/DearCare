import React from 'react';
import { FormData } from '@/types/agreement.types';

interface DietaryHabitsStepProps {
  formData: FormData;
  onFormChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  onNext: () => void;
  onBack: () => void;
}

export const DietaryHabitsStep: React.FC<DietaryHabitsStepProps> = ({
  formData,
  onFormChange,
  onNext,
  onBack,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Feeding Method</label>
        <input
          name="feedingMethod"
          type="text"
          value={formData.feedingMethod || ''}
          onChange={onFormChange}
          className="h-9 w-full rounded-md border border-slate-300 px-3 py-1"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Sleep Pattern</label>
        <input
          name="sleepPattern"
          type="text"
          value={formData.sleepPattern || ''}
          onChange={onFormChange}
          className="h-9 w-full rounded-md border border-slate-300 px-3 py-1"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Elimination Urine</label>
        <div className="flex flex-wrap gap-4">
          {['Bedpan', 'Closet', 'Foley Catheter', 'Condom Catheter'].map(option => (
            <label key={option} className="inline-flex items-center">
              <input
                type="radio"
                name="eliminationUrine"
                value={option}
                checked={formData.eliminationUrine === option}
                onChange={onFormChange}
                className="form-radio"
              />
              <span className="ml-2">{option}</span>
            </label>
          ))}
          <input
            name="eliminationUrineOthers"
            type="text"
            placeholder="Others"
            value={formData.eliminationUrineOthers || ''}
            onChange={onFormChange}
            className="ml-2 h-9 rounded-md border border-slate-300 px-3 py-1"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Elimination Bowel</label>
        <div className="flex flex-wrap gap-4">
          {['Bedpan', 'Commode Chair', 'Closet'].map(option => (
            <label key={option} className="inline-flex items-center">
              <input
                type="radio"
                name="eliminationBowel"
                value={option}
                checked={formData.eliminationBowel === option}
                onChange={onFormChange}
                className="form-radio"
              />
              <span className="ml-2">{option}</span>
            </label>
          ))}
          <input
            name="eliminationBowelOthers"
            type="text"
            placeholder="Others"
            value={formData.eliminationBowelOthers || ''}
            onChange={onFormChange}
            className="ml-2 h-9 rounded-md border border-slate-300 px-3 py-1"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Activity</label>
        <div className="flex flex-wrap gap-4">
          {['Bedridden', 'Can Sit', 'Not Out Of Bed', 'Can Walk With Assistance', 'Stable'].map(option => (
            <label key={option} className="inline-flex items-center">
              <input
                type="radio"
                name="activity"
                value={option}
                checked={formData.activity === option}
                onChange={onFormChange}
                className="form-radio"
              />
              <span className="ml-2">{option}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Bed Sore</label>
        <div className="flex flex-wrap gap-4 items-center">
          <span>Stage:</span>
          {['1', '2', '3', '4'].map(stage => (
            <label key={stage} className="inline-flex items-center">
              <input
                type="radio"
                name="bedSoreStage"
                value={stage}
                checked={formData.bedSoreStage === stage}
                onChange={onFormChange}
                className="form-radio"
              />
              <span className="ml-2">{stage}</span>
            </label>
          ))}
          <input
            name="bedSoreShape"
            type="text"
            placeholder="Shape"
            value={formData.bedSoreShape || ''}
            onChange={onFormChange}
            className="ml-2 h-9 rounded-md border border-slate-300 px-3 py-1"
          />
          <input
            name="bedSoreSize"
            type="text"
            placeholder="Size"
            value={formData.bedSoreSize || ''}
            onChange={onFormChange}
            className="ml-2 h-9 rounded-md border border-slate-300 px-3 py-1"
          />
          <input
            name="bedSoreSite"
            type="text"
            placeholder="Site"
            value={formData.bedSoreSite || ''}
            onChange={onFormChange}
            className="ml-2 h-9 rounded-md border border-slate-300 px-3 py-1"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Special Care</label>
        <div className="flex flex-wrap gap-4">
          {['Tracheostomy', 'Colostomy', 'Surgery Site', 'Stoma', 'None'].map(option => (
            <label key={option} className="inline-flex items-center">
              <input
                type="radio"
                name="specialCare"
                value={option}
                checked={formData.specialCare === option}
                onChange={onFormChange}
                className="form-radio"
              />
              <span className="ml-2">{option}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">General Condition</label>
        <div className="flex flex-wrap gap-4">
          {['Stable', 'Unstable'].map(option => (
            <label key={option} className="inline-flex items-center">
              <input
                type="radio"
                name="generalCondition"
                value={option}
                checked={formData.generalCondition === option}
                onChange={onFormChange}
                className="form-radio"
              />
              <span className="ml-2">{option}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        >
          Next
        </button>
      </div>
    </div>
  );
};