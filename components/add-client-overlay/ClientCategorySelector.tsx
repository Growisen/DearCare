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

  return (
    <div>
      <div className="grid grid-cols-1 gap-3">
        <button
          key={orgLabel}
          onClick={() => onCategoryChange(orgLabel as ClientCategory)}
          className={`p-3 rounded-lg border ${
            selectedCategory === orgLabel
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-900 font-medium'
          } transition-colors duration-200`}
        >
          {orgLabel}
        </button>
      </div>
    </div>
  );
};