import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DynamicField, FormData } from '@/types/reassessment.types';

interface DynamicFieldSectionProps {
  fields: DynamicField[];
  sectionKey: keyof FormData['dynamicFields'];
  onAdd: (section: keyof FormData['dynamicFields']) => void;
  onRemove: (section: keyof FormData['dynamicFields'], index: number) => void;
  onUpdate: (section: keyof FormData['dynamicFields'], index: number, field: 'label' | 'value', value: string) => void;
}

export default function DynamicFieldSection({ fields, sectionKey, onAdd, onRemove, onUpdate }: DynamicFieldSectionProps) {
  const minimalInputClass = "w-full border-b border-slate-200 bg-transparent py-1 focus:outline-none focus:border-gray-500 transition-colors text-gray-700 placeholder-gray-400 text-sm";

  return (
    <div className="space-y-3 mt-4 pt-2">
      {fields.map((field, index) => (
        <div key={index} className="flex items-end gap-4 group">
          <div className="w-1/3">
            <input
              type="text"
              placeholder="Label"
              value={field.label}
              onChange={(e) => onUpdate(sectionKey, index, 'label', e.target.value)}
              className="w-full border-b border-slate-200 bg-gray-50/50 px-2 py-1 text-xs font-bold text-gray-600 focus:outline-none focus:border-slate-200 transition-colors placeholder-gray-300 uppercase tracking-wide"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Value"
              value={field.value}
              onChange={(e) => onUpdate(sectionKey, index, 'value', e.target.value)}
              className={minimalInputClass}
            />
          </div>
          <button
            type="button"
            onClick={() => onRemove(sectionKey, index)}
            className="text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
            title="Remove field"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => onAdd(sectionKey)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium mt-2"
      >
        <Plus className="w-3 h-3" />
        Add Custom Field
      </button>
    </div>
  );
}