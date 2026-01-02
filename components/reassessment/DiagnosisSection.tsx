import React, { ChangeEvent } from 'react';
import { Activity } from 'lucide-react';
import { FormData } from '@/types/reassessment.types';
import DynamicFieldSection from './DynamicFieldSection';

type DynamicProps = Pick<
  React.ComponentProps<typeof DynamicFieldSection>,
  'onAdd' | 'onRemove' | 'onUpdate'
>;

interface Props {
  formData: FormData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  dynamicProps: DynamicProps;
}

export default function DiagnosisSection({ formData, onChange, dynamicProps }: Props) {
  return (
    <section className="space-y-6">
      <h2 className="text-sm font-bold uppercase text-gray-800 border-b border-slate-200 pb-2 flex items-center gap-2">
        <Activity className="w-4 h-4 text-gray-500" />
        Clinical Diagnosis & Condition
      </h2>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-1">
          <label htmlFor="diagnosis" className="block text-xs font-medium text-gray-500 uppercase">Diagnosis</label>
          <textarea id="diagnosis" name="diagnosis" rows={2} value={formData.diagnosis} onChange={onChange} className="w-full border border-slate-200 rounded-sm px-3 py-2 focus:outline-none focus:border-slate-200 transition-colors bg-gray-50 focus:bg-white text-gray-700 placeholder-gray-400 text-sm resize-none" />
        </div>
        <div className="space-y-1">
          <label htmlFor="presentCondition" className="block text-xs font-medium text-gray-500 uppercase">Present Condition</label>
          <textarea id="presentCondition" name="presentCondition" rows={3} value={formData.presentCondition} onChange={onChange} className="w-full border border-slate-200 rounded-sm px-3 py-2 focus:outline-none focus:border-slate-200 transition-colors bg-gray-50 focus:bg-white text-gray-700 placeholder-gray-400 text-sm resize-none" />
        </div>
      </div>
      <DynamicFieldSection fields={formData.dynamicFields.diagnosis} sectionKey="diagnosis" {...dynamicProps} />
    </section>
  );
}