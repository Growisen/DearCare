import React from 'react';
import { NurseReferenceData } from '@/types/staff.types';
import { Fields } from './FormComponents';

interface StepReferenceProps {
  data: NurseReferenceData;
  setData: React.Dispatch<React.SetStateAction<NurseReferenceData>>;
}

export const StepReference: React.FC<StepReferenceProps> = ({ data, setData }) => (
  <div className="space-y-8 text-gray-700">
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h4 className="text-base font-medium">Primary Reference</h4>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Fields.Input label="Full Name" placeholder="Enter name" value={data.reference_name} required={false} onChange={(e) => setData({ ...data, reference_name: e.target.value })} />
        <Fields.Input label="Relation" placeholder="Enter relation" value={data.reference_relation} required={false} onChange={(e) => setData({ ...data, reference_relation: e.target.value })} />
        <Fields.Input label="Phone Number" type="tel" placeholder="Enter phone number" value={data.reference_phone} required={false} onChange={(e) => setData({ ...data, reference_phone: e.target.value })} />
      </div>

      <Fields.TextArea
        label="Recommendation Details"
        placeholder="Please provide details about why they recommend this nurse..."
        rows={3}
        required={false}
        value={data.recommendation_details}
        onChange={(e) => setData({ ...data, recommendation_details: e.target.value })}
      />
    </div>

    <div className="space-y-4">
      <div className="border-b pb-2">
        <h4 className="text-base font-medium">Family References</h4>
      </div>

      {[0, 1].map(index => (
        <div key={index} className="space-y-2">
          <p className="text-sm text-gray-500">Reference {index + 1}</p>
          <div className="grid grid-cols-3 gap-4">
            <Fields.Input
              label="Full Name"
              required={false}
              placeholder="Enter name"
              value={data.family_references[index]?.name || ''}
              onChange={(e) => {
                const newRefs = [...data.family_references];
                newRefs[index] = { ...newRefs[index] || {}, name: e.target.value };
                setData({ ...data, family_references: newRefs });
              }}
            />
            <Fields.Input
              label="Relation"
              placeholder="Enter relation"
              value={data.family_references[index]?.relation || ''}
              required={false}
              onChange={(e) => {
                const newRefs = [...data.family_references];
                newRefs[index] = { ...newRefs[index] || {}, relation: e.target.value };
                setData({ ...data, family_references: newRefs });
              }}
            />
            <Fields.Input
              label="Phone Number"
              type="tel"
              placeholder="Enter phone number"
              value={data.family_references[index]?.phone || ''}
              required={false}
              onChange={(e) => {
                const newRefs = [...data.family_references];
                newRefs[index] = { ...newRefs[index] || {}, phone: e.target.value };
                setData({ ...data, family_references: newRefs });
              }}
            />
          </div>
        </div>
      ))}
    </div>

    <div className="space-y-4">
      <div className="border-b pb-2">
        <h4 className="text-base font-medium">Staff Reference</h4>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Fields.Input
          label="Full Name"
          placeholder="Enter name"
          value={data.staff_reference?.name || ''}
          required={false}
          onChange={(e) => setData({ 
            ...data, 
            staff_reference: { 
              name: e.target.value,
              relation: data.staff_reference?.relation ?? '',
              phone: data.staff_reference?.phone ?? '',
              recommendation_details: data.staff_reference?.recommendation_details ?? ''
            } 
          })}
        />
        <Fields.Input
          label="Relation"
          placeholder="Enter relation"
          value={data.staff_reference?.relation || ''}
          required={false}
          onChange={(e) => setData({ 
            ...data, 
            staff_reference: { 
              name: data.staff_reference?.name ?? '',
              relation: e.target.value,
              phone: data.staff_reference?.phone ?? '',
              recommendation_details: data.staff_reference?.recommendation_details ?? ''
            } 
          })}
        />
        <Fields.Input
          label="Phone Number"
          type="tel"
          placeholder="Enter phone number"
          value={data.staff_reference?.phone || ''}
          required={false}
          onChange={(e) => setData({ 
            ...data, 
            staff_reference: { 
              name: data.staff_reference?.name ?? '',
              relation: data.staff_reference?.relation ?? '',
              phone: e.target.value,
              recommendation_details: data.staff_reference?.recommendation_details ?? ''
            } 
          })}
        />
      </div>
      <Fields.TextArea
        label="Recommendation Details"
        placeholder="Please provide details about why this staff recommends the nurse..."
        rows={3}
        required={false}
        value={data.staff_reference?.recommendation_details || ''}
        onChange={(e) => setData({ 
          ...data, 
          staff_reference: { 
            name: data.staff_reference?.name ?? '',
            relation: data.staff_reference?.relation ?? '',
            phone: data.staff_reference?.phone ?? '',
            recommendation_details: e.target.value
          } 
        })}
      />
    </div>
  </div>
);