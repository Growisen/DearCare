import React from 'react';
import { NurseHealthData } from '@/types/staff.types';
import { Fields, FormLayout } from './FormComponents';
import { FORM_CONFIG } from './Config';

interface StepHealthProps {
  data: NurseHealthData;
  setData: React.Dispatch<React.SetStateAction<NurseHealthData>>;
}

export const StepHealth: React.FC<StepHealthProps> = ({ data, setData }) => (
  <FormLayout>
    <Fields.TextArea label="Current Health Status" required={false} placeholder="Enter current health status" value={data.health_status} onChange={(e) => setData({ ...data, health_status: e.target.value })} />
    <Fields.TextArea label="Disability Details" required={false} placeholder="Enter disability details if any" value={data.disability} onChange={(e) => setData({ ...data, disability: e.target.value })} />
    <Fields.Select label="Source of Information" required={true} options={FORM_CONFIG.options.sourceOfInformation} value={data.source} onChange={(e) => setData({ ...data, source: e.target.value })} />
  </FormLayout>
);