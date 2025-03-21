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
    };
  };
  handleCheckboxChange: (id: string, checked: boolean) => void;
  handleEquipmentChange: (equipmentId: string, checked: boolean) => void;
}

export default function EnvironmentAndEquipment({ 
  formData, 
  handleCheckboxChange,
  handleEquipmentChange 
}: EnvironmentAndEquipmentProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Environment & Equipment</h3>
      
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Environment Assessment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isClean"
              checked={formData.isClean}
              onChange={(e) => handleCheckboxChange('isClean', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isClean" className="ml-2 block text-sm text-gray-700">
              Clean Environment
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isVentilated"
              checked={formData.isVentilated}
              onChange={(e) => handleCheckboxChange('isVentilated', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isVentilated" className="ml-2 block text-sm text-gray-700">
              Well Ventilated
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDry"
              checked={formData.isDry}
              onChange={(e) => handleCheckboxChange('isDry', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isDry" className="ml-2 block text-sm text-gray-700">
              Dry Environment
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasNatureView"
              checked={formData.hasNatureView}
              onChange={(e) => handleCheckboxChange('hasNatureView', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="hasNatureView" className="ml-2 block text-sm text-gray-700">
              Nature View
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasSocialInteraction"
              checked={formData.hasSocialInteraction}
              onChange={(e) => handleCheckboxChange('hasSocialInteraction', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="hasSocialInteraction" className="ml-2 block text-sm text-gray-700">
              Social Interaction
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasSupportiveEnv"
              checked={formData.hasSupportiveEnv}
              onChange={(e) => handleCheckboxChange('hasSupportiveEnv', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="hasSupportiveEnv" className="ml-2 block text-sm text-gray-700">
              Supportive Environment
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Required Equipment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hospitalBed"
              checked={formData.equipment.hospitalBed}
              onChange={(e) => handleEquipmentChange('hospitalBed', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="hospitalBed" className="ml-2 block text-sm text-gray-700">
              Hospital Bed
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="wheelChair"
              checked={formData.equipment.wheelChair}
              onChange={(e) => handleEquipmentChange('wheelChair', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="wheelChair" className="ml-2 block text-sm text-gray-700">
              Wheel Chair
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="adultDiaper"
              checked={formData.equipment.adultDiaper}
              onChange={(e) => handleEquipmentChange('adultDiaper', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="adultDiaper" className="ml-2 block text-sm text-gray-700">
              Adult Diaper
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="disposableUnderpad"
              checked={formData.equipment.disposableUnderpad}
              onChange={(e) => handleEquipmentChange('disposableUnderpad', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="disposableUnderpad" className="ml-2 block text-sm text-gray-700">
              Disposable Underpad
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="pillows"
              checked={formData.equipment.pillows}
              onChange={(e) => handleEquipmentChange('pillows', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="pillows" className="ml-2 block text-sm text-gray-700">
              Pillows
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="bedRidden"
              checked={formData.equipment.bedRidden}
              onChange={(e) => handleEquipmentChange('bedRidden', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="bedRidden" className="ml-2 block text-sm text-gray-700">
              Bed Ridden
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}