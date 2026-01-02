import React, { ChangeEvent } from 'react';
import { User } from 'lucide-react';
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

export default function PatientStatusSection({ formData, onChange, dynamicProps }: Props) {
  const fields = [
    { id: 'mentalStatus', label: 'Mental Status' },
    { id: 'hygiene', label: 'Hygiene' },
    { id: 'generalStatus', label: 'General Status' },
    { id: 'careStatus', label: 'Care Status' },
    { id: 'nursingDiagnosis', label: 'Nursing Diagnosis' },
    { id: 'followUpEvaluation', label: 'Follow up & Evaluation' }
  ];

  return (
    <section className="space-y-6">
      <h2 className="text-sm font-bold uppercase text-gray-800 border-b border-slate-200 pb-2 flex items-center gap-2">
        <User className="w-4 h-4 text-gray-500" />
        Patient Status Assessment
      </h2>
      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <label htmlFor={field.id} className="md:col-span-3 text-sm font-medium text-gray-600 pt-2">{field.label}</label>
            <div className="md:col-span-9">
              <textarea id={field.id} name={field.id} rows={1} value={formData[field.id as keyof FormData] as string} onChange={onChange} className="w-full border-b border-slate-200 px-0 py-1 focus:outline-none focus:border-slate-200 transition-colors resize-none bg-transparent placeholder-gray-300 text-gray-700 text-sm" placeholder="Enter details..." />
            </div>
          </div>
        ))}
        <div className="mt-4">
          <DynamicFieldSection fields={formData.dynamicFields.assessment} sectionKey="assessment" {...dynamicProps} />
        </div>
      </div>
    </section>
  );
}