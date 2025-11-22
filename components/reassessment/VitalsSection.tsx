import React, { ChangeEvent } from 'react';
import { Clock } from 'lucide-react';
import { FormData } from '@/types/reassessment.types';
import DynamicFieldSection from './DynamicFieldSection';

type DynamicProps = {
  onAdd: (section: keyof FormData['dynamicFields']) => void;
  onRemove: (section: keyof FormData['dynamicFields'], index: number) => void;
  onUpdate: (section: keyof FormData['dynamicFields'], index: number, field: 'label' | 'value', value: string) => void;
};

interface Props {
  formData: FormData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  dynamicProps: DynamicProps;
}

export default function VitalsSection({ formData, onChange, dynamicProps }: Props) {
  const minimalInputClass = "w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-gray-500 transition-colors text-gray-700 placeholder-gray-400 text-sm";

  return (
    <section className="space-y-6">
      <h2 className="text-sm font-bold uppercase text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-500" />
        Vital Signs
      </h2>
      <div className="bg-gray-50/50 p-6 rounded-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Time</label>
            <input type="time" name="time" value={formData.vitals.time} onChange={onChange} className={minimalInputClass} />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Heart Rate</label>
            <input type="text" name="heartRate" placeholder="bpm" value={formData.vitals.heartRate} onChange={onChange} className={minimalInputClass} />
          </div>
          <div className="space-y-1 col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">BP (mmHg)</label>
            <div className="flex items-center gap-2">
              <input type="text" name="bpSystolic" placeholder="Sys" value={formData.vitals.bpSystolic} onChange={onChange} className={`${minimalInputClass} w-20 text-center`} />
              <span className="text-gray-300">/</span>
              <input type="text" name="bpDiastolic" placeholder="Dia" value={formData.vitals.bpDiastolic} onChange={onChange} className={`${minimalInputClass} w-20 text-center`} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">BP Position</label>
            <select name="bpPosition" value={formData.vitals.bpPosition} onChange={onChange} className={minimalInputClass}>
              <option value="" className="text-gray-400">Select...</option>
              <option value="Sitting" className="text-gray-700">Sitting</option>
              <option value="Supine" className="text-gray-700">Supine</option>
              <option value="Standing" className="text-gray-700">Standing</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Temp</label>
            <input type="text" name="temperature" placeholder="°F / °C" value={formData.vitals.temperature} onChange={onChange} className={minimalInputClass} />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Resp. Rate</label>
            <input type="text" name="respiratoryRate" placeholder="/min" value={formData.vitals.respiratoryRate} onChange={onChange} className={minimalInputClass} />
          </div>
        </div>
        <div className="border-t border-gray-200 mt-4 pt-2">
          <DynamicFieldSection fields={formData.dynamicFields.vitals} sectionKey="vitals" {...dynamicProps} />
        </div>
      </div>
    </section>
  );
}