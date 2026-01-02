import React from 'react';

interface EnvironmentAndEquipmentProps {
  formData: {
    isClean: boolean;
    isVentilated: boolean;
    isDry: boolean;
    hasNatureView: boolean;
    hasSocialInteraction: boolean;
    hasSupportiveEnv: boolean;
    equipment: {
      hospitalBed: boolean;
      wheelChair: boolean;
      adultDiaper: boolean;
      disposableUnderpad: boolean;
      pillows: boolean;
      bedRidden: boolean;
      semiBedridden: boolean;
      bedWedges: boolean;
      bedsideCommode: boolean;
      patientLift: boolean;
      bedsideHandRail: boolean;
      examinationGloves: boolean;
      noRinseCleanser: boolean;
      bathingWipes: boolean;
      bpMeasuringApparatus: boolean;
      electricBackLifter: boolean;
      o2Concentrator: boolean;
      overBedTable: boolean;
      suctionMachine: boolean;
      ivStand: boolean;
      bedPan: boolean;
      decubitusMatress: boolean;
      airMatress: boolean;
      bpMonitor: boolean;
      bedLift: boolean;
      bedRail: boolean;
      cane: boolean;
      walkers: boolean;
      crutches: boolean;
    };
  };
  handleCheckboxChange: (id: string, checked: boolean) => void;
  handleEquipmentChange: (equipmentId: string, checked: boolean) => void;
}

// Reusable checkbox component
const Checkbox = ({ 
  id, 
  checked, 
  onChange, 
  label 
}: { 
  id: string; 
  checked: boolean; 
  onChange: (id: string, checked: boolean) => void; 
  label: string;
}) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(id, e.target.checked)}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-200 rounded"
    />
    <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
      {label}
    </label>
  </div>
);

export default function EnvironmentAndEquipment({ 
  formData, 
  handleCheckboxChange,
  handleEquipmentChange
}: EnvironmentAndEquipmentProps) {

  const environmentOptions = [
    { id: 'isClean', label: 'Clean Environment' },
    { id: 'isVentilated', label: 'Well Ventilated' },
    { id: 'isDry', label: 'Dry Environment' },
    { id: 'hasNatureView', label: 'Nature View' },
    { id: 'hasSocialInteraction', label: 'Social Interaction' },
    { id: 'hasSupportiveEnv', label: 'Supportive Environment' }
  ];

  // Equipment options categorized by type
  const equipmentCategories = {
    bedriddenEquipment: [
      { id: 'hospitalBed', label: 'Hospital Bed' },
      { id: 'adultDiaper', label: 'Adult Diaper' },
      { id: 'disposableUnderpad', label: 'Disposable Underpad' },
      { id: 'pillows', label: 'Pillows' },
      { id: 'bedWedges', label: 'Bed Wedges' },
      { id: 'bedsideCommode', label: 'Bedside Commode' },
      { id: 'patientLift', label: 'Patient Lift' },
      { id: 'bedsideHandRail', label: 'Bedside Hand Rail' },
      { id: 'bedPan', label: 'Bed Pan' },
      { id: 'decubitusMatress', label: 'Decubitus Matress' },
      { id: 'airMatress', label: 'Air Matress' },
      { id: 'bedLift', label: 'Bed Lift' },
      { id: 'bedRail', label: 'Bed Rail' },
      { id: 'overBedTable', label: 'Over Bed Table' },
    ],
    mobilityEquipment: [
      { id: 'wheelChair', label: 'Wheel Chair' },
      { id: 'cane', label: 'Cane' },
      { id: 'walkers', label: 'Walkers' },
      { id: 'crutches', label: 'Crutches' },
      { id: 'electricBackLifter', label: 'Electric Back Lifter' },
    ],
    medicalEquipment: [
      { id: 'examinationGloves', label: 'Examination Gloves' },
      { id: 'noRinseCleanser', label: 'No Rinse Cleanser' },
      { id: 'bathingWipes', label: 'Bathing Wipes' },
      { id: 'bpMeasuringApparatus', label: 'BP Measuring Apparatus' },
      { id: 'bpMonitor', label: 'BP Monitor' },
      { id: 'o2Concentrator', label: 'O2 Concentrator' },
      { id: 'suctionMachine', label: 'Suction Machine' },
      { id: 'ivStand', label: 'IV Stand' },
    ]
  };

  return (
    <div className="bg-white border border-slate-200 p-4 rounded-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Environment & Equipment</h3>
      
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Environment Assessment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {environmentOptions.map((option) => (
            <Checkbox
              key={option.id}
              id={option.id}
              checked={Boolean(formData[option.id as keyof typeof formData])}
              onChange={handleCheckboxChange}
              label={option.label}
            />
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Bed-related Equipment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {equipmentCategories.bedriddenEquipment.map((option) => (
            <Checkbox
              key={option.id}
              id={option.id}
              checked={Boolean(formData.equipment[option.id as keyof typeof formData.equipment])}
              onChange={handleEquipmentChange}
              label={option.label}
            />
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Mobility Equipment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {equipmentCategories.mobilityEquipment.map((option) => (
            <Checkbox
              key={option.id}
              id={option.id}
              checked={Boolean(formData.equipment[option.id as keyof typeof formData.equipment])}
              onChange={handleEquipmentChange}
              label={option.label}
            />
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Medical Equipment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {equipmentCategories.medicalEquipment.map((option) => (
            <Checkbox
              key={option.id}
              id={option.id}
              checked={Boolean(formData.equipment[option.id as keyof typeof formData.equipment])}
              onChange={handleEquipmentChange}
              label={option.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}