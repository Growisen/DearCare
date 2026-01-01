import React, { ChangeEvent } from 'react';
import { AlertCircle } from 'lucide-react';
import { FormData, BedSoreStage } from '@/types/reassessment.types';
import DynamicFieldSection from './DynamicFieldSection';

type DynamicProps = {
  onAdd: (section: keyof FormData['dynamicFields']) => void;
  onRemove: (section: keyof FormData['dynamicFields'], index: number) => void;
  onUpdate: (section: keyof FormData['dynamicFields'], index: number, field: 'label' | 'value', value: string) => void;
};


interface Props {
  formData: FormData;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onStageChange: (stage: BedSoreStage) => void;
  dynamicProps: DynamicProps;
}

export default function BedSoreSection({ formData, onChange, onStageChange, dynamicProps }: Props) {
  const minimalInputClass = "w-full border-b border-slate-200 bg-transparent py-1 focus:outline-none focus:border-gray-500 transition-colors text-gray-700 placeholder-gray-400 text-sm";

  return (
    <section className="space-y-6">
      <h2 className="text-sm font-bold uppercase text-gray-800 border-b border-slate-200 pb-2 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-gray-500" />
        Bed Sore Assessment
      </h2>
      <div className="bg-gray-50/50 p-6 rounded-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Stage</label>
            <div className="flex items-center gap-3">
              {['1', '2', '3', '4'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStageChange(s as BedSoreStage)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2
                    ${formData.bedSore.stage === s 
                      ? 'bg-gray-800 border-gray-800 text-white shadow-none' 
                      : 'bg-white border-slate-200 text-gray-500 hover:border-slate-200'}
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
                <input type="text" id="shape" name="shape" value={formData.bedSore.shape} onChange={onChange} className={minimalInputClass} />
             </div>
             <div className="flex items-center gap-4">
                <label htmlFor="size" className="w-16 text-xs font-bold text-gray-500 uppercase">Size:</label>
                <input type="text" id="size" name="size" value={formData.bedSore.size} onChange={onChange} className={minimalInputClass} />
             </div>
             <div className="flex items-center gap-4">
                <label htmlFor="site" className="w-16 text-xs font-bold text-gray-500 uppercase">Site:</label>
                <input type="text" id="site" name="site" value={formData.bedSore.site} onChange={onChange} className={minimalInputClass} />
             </div>
          </div>
        </div>
        <div className="border-t border-slate-200 mt-6 pt-2">
          <DynamicFieldSection fields={formData.dynamicFields.bedSore} sectionKey="bedSore" {...dynamicProps} />
        </div>
      </div>
    </section>
  );
}