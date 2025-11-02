import React from 'react';

interface FormContainerProps {
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
}

export const FormContainer: React.FC<FormContainerProps> = ({
  title,
  description,
  currentStep,
  totalSteps,
  children
}) => {
  return (
    <div className="bg-white text-slate-900 flex flex-col gap-6 rounded-xl border border-slate-200 py-6 shadow-sm">
      <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 pb-6 border-b border-slate-200">
        <div className="leading-none font-semibold text-xl">
          {title}
        </div>
        <div className="text-slate-500 text-sm">
          {description}
        </div>
        <div className="mt-2 text-xs text-slate-400">
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      <div className="px-6">
        {children}
      </div>
    </div>
  );
};