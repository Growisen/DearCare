import React from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface SettingsSectionProps {
  title: string;
  description: string;
  info?: string;
  onClick: () => void;
}

export default function SettingsSection({
  title,
  description,
  info,
  onClick,
}: SettingsSectionProps) {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer group hover:shadow-sm"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                {title}
              </h3>
              <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            
            <p className="text-gray-600 text-sm mb-2 leading-relaxed">
              {description}
            </p>
            
            {info && (
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                <p className="text-xs text-gray-500 font-medium">
                  {info}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom border for formal separation */}
      <div className="h-px bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>
    </div>
  );
}