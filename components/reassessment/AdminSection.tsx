import React, { ChangeEvent } from 'react';
import { FormData } from '@/types/reassessment.types';
import DynamicFieldSection from './DynamicFieldSection';

type DynamicProps = {
  onAdd: (section: keyof FormData['dynamicFields']) => void;
  onRemove: (section: keyof FormData['dynamicFields'], index: number) => void;
  onUpdate: (section: keyof FormData['dynamicFields'], index: number, field: 'label' | 'value', value: string) => void;
};

interface Props {
  formData: FormData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  dynamicProps: DynamicProps;
}

export default function AdminSection({ formData, onChange, dynamicProps }: Props) {
  const minimalInputClass = "w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-gray-500 transition-colors text-gray-700 placeholder-gray-400 text-sm";

  return (
    <section className="bg-gray-50 p-6 rounded-sm border border-gray-100 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-400 uppercase">Outdoor Hours</label>
          <input type="text" name="outdoorHours" value={formData.outdoorHours} onChange={onChange} className={minimalInputClass} />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-400 uppercase">Assignment Done By</label>
          <input type="text" name="assignmentDoneBy" value={formData.assignmentDoneBy} onChange={onChange} className={minimalInputClass} />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-400 uppercase">Allotted Staff Name</label>
          <input type="text" name="allottedStaffName" value={formData.allottedStaffName} onChange={onChange} className={minimalInputClass} />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-400 uppercase">Assigning Period</label>
          <input type="text" name="assigningPeriod" value={formData.assigningPeriod} onChange={onChange} className={minimalInputClass} />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-400 uppercase">Previous Visited Date</label>
          <input type="date" name="previousVisitedDate" value={formData.previousVisitedDate} onChange={onChange} className={minimalInputClass} />
        </div>
      </div>
      <div className="mt-6 border-t border-gray-200 pt-2">
        <DynamicFieldSection fields={formData.dynamicFields.admin} sectionKey="admin" {...dynamicProps} />
      </div>
    </section>
  );
}