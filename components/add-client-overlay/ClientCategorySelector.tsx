import { ClientCategory } from '@/types/client.types';
import React, { useEffect } from 'react';
import useOrgStore from '@/app/stores/UseOrgStore';

interface ClientCategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: ClientCategory) => void;
}

export const ClientCategorySelector = ({ selectedCategory, onCategoryChange }: ClientCategorySelectorProps) => {
  const { organization } = useOrgStore();

  const orgMap: Record<string, ClientCategory> = {
    TataHomeNursing: 'Tata HomeNursing',
    DearCare: 'DearCare LLP',
  };

  const orgLabel = organization ? orgMap[organization] : '';

  useEffect(() => {
    if (orgLabel && selectedCategory !== orgLabel) {
      onCategoryChange(orgLabel as ClientCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgLabel]);

  if (!orgLabel) return null;

  const labelStyles = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";
  const buttonBaseStyle = "w-full py-2 px-3 border rounded-sm text-sm font-medium transition-all duration-200 select-none flex items-center justify-center";
  const selectedStyle = "bg-blue-50 border-blue-200 text-blue-700";
  const unselectedStyle = "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50";

  return (
    <div className="mb-4">
      <label className={labelStyles}>Client Category</label>
      <div className="grid grid-cols-1">
        <button
          type="button"
          key={orgLabel}
          onClick={() => onCategoryChange(orgLabel as ClientCategory)}
          className={`${buttonBaseStyle} ${selectedCategory === orgLabel ? selectedStyle : unselectedStyle}`}
        >
          {orgLabel}
        </button>
      </div>
    </div>
  );
};