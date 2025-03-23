import React from 'react';

interface SettingToggleProps {
  title: string;
  description: string;
  enabled: boolean;
  isLoading: boolean;
  icon: {
    enabled: React.ReactNode;
    disabled: React.ReactNode;
  };
  onToggle: () => void;
}

export default function SettingToggle({ 
  title, 
  description, 
  enabled, 
  isLoading, 
  icon, 
  onToggle 
}: SettingToggleProps) {
  return (
    <div className={`flex items-center justify-between py-4 border-b ${enabled ? 'bg-green-50' : ''} rounded-md transition-colors duration-300`}>
      <div className="flex items-start space-x-3">
        <div className="mt-1">
          {enabled ? icon.enabled : icon.disabled}
        </div>
        <div>
          <h3 className="font-medium text-gray-700">{title}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
          <span className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full ${
            enabled 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
      <div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={onToggle}
            disabled={isLoading}
          />
          <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer ${
            enabled ? 'bg-green-600' : ''
          } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
            enabled ? 'after:translate-x-full' : ''
          } ${isLoading ? 'opacity-50' : ''}`}></div>
        </label>
        {isLoading && (
          <div className="mt-1 text-xs text-gray-500 text-center">
            Updating...
          </div>
        )}
      </div>
    </div>
  );
}