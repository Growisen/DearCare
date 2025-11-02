import React, { useMemo, useEffect } from 'react';
import { FormStepProps } from '@/types/agreement.types';

export const AssignmentDetailsStep: React.FC<FormStepProps> = ({
  formData,
  onFormChange,
  onNext,
  onBack,
}) => {

  const dateError = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return '';
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return start > end ? 'Start date cannot be after end date.' : '';
  }, [formData.startDate, formData.endDate]);

  const numDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (start > end) return 0;
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [formData.startDate, formData.endDate]);

  const salaryPerDay = useMemo(() => {
    const salaryMonth = parseFloat(formData.salaryPerMonth || '0');
    if (!salaryMonth || numDays <= 0) return '';
    return (salaryMonth / numDays).toFixed(2);
  }, [formData.salaryPerMonth, numDays]);

  useEffect(() => {
    if (salaryPerDay !== '' && formData.salaryPerDay !== salaryPerDay) {
      onFormChange({
        target: {
          name: 'salaryPerDay',
          value: salaryPerDay,
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [salaryPerDay, formData.salaryPerDay, onFormChange]);

const shiftPattern = useMemo(() => {
  const start = formData.startTime;
  const end = formData.endTime;
  if (!start || !end) return '';

  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  let duration = endMinutes - startMinutes;
  if (duration <= 0) duration += 24 * 60; 
  if (duration === 24 * 60) return '24 Hours';

const isDayTime = (h: number): boolean => h >= 6 && h < 18;
const isNightTime = (h: number): boolean => h >= 18 || h < 6; 

  if (isDayTime(startH) && isDayTime(endH)) return 'Day';

  if (isNightTime(startH) && isNightTime(endH)) return 'Night';


  if (isDayTime(startH)) return 'Day';
  if (isNightTime(startH)) return 'Night';

  return '';
}, [formData.startTime, formData.endTime]);


  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1 space-y-2">
          <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={onFormChange}
            className="h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-base shadow-sm outline-none md:text-sm
            focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20"
          />
        </div>
        <div className="flex-1 space-y-2">
          <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={onFormChange}
            className="h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-base shadow-sm outline-none 
            md:text-sm focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20"
          />
        </div>
      </div>
      {dateError && (
        <div className="text-red-500 text-sm mt-1">{dateError}</div>
      )}
      <div className="flex space-x-4">
        <div className="flex-1 space-y-2">
          <label htmlFor="startTime" className="block text-sm font-medium text-slate-700">
            Start Time <span className="text-red-500">*</span>
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={onFormChange}
            className="h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-base shadow-sm outline-none
             md:text-sm focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20"
          />
        </div>
        <div className="flex-1 space-y-2">
          <label htmlFor="endTime" className="block text-sm font-medium text-slate-700">
            End Time <span className="text-red-500">*</span>
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={onFormChange}
            className="h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-base shadow-sm outline-none md:text-sm
             focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1 space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Shift Pattern
          </label>
          <input
            type="text"
            value={shiftPattern}
            readOnly
            className="h-9 w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-1 text-base shadow-sm outline-none md:text-sm
              focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20"
          />
        </div>
        <div className="flex-1" />
      </div>
      <div className="flex space-x-4">
        <div className="flex-1 space-y-2">
          <label htmlFor="salaryPerMonth" className="block text-sm font-medium text-slate-700">
            Salary per Month <span className="text-red-500">*</span>
          </label>
          <input
            id="salaryPerMonth"
            name="salaryPerMonth"
            type="number"
            min="0"
            step="0.01"
            value={formData.salaryPerMonth || ''}
            onChange={onFormChange}
            placeholder="Enter monthly salary"
            className="h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-base shadow-sm outline-none md:text-sm
              focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20"
          />
        </div>
        <div className="flex-1 space-y-2">
          <label htmlFor="salaryPerDay" className="block text-sm font-medium text-slate-700">
            Salary per Day
          </label>
          <input
            id="salaryPerDay"
            name="salaryPerDay"
            type="text"
            value={salaryPerDay}
            readOnly
            className="h-9 w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-1 text-base shadow-sm outline-none md:text-sm
              focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Job Role Of Staff <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-6">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="jobRoleOfStaff"
              value="Patient Care Assistant"
              checked={formData.jobRoleOfStaff === 'Patient Care Assistant'}
              onChange={onFormChange}
              className="form-radio"
            />
            <span className="ml-2">Patient Care Assistant</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="jobRoleOfStaff"
              value="ANM"
              checked={formData.jobRoleOfStaff === 'ANM'}
              onChange={onFormChange}
              className="form-radio"
            />
            <span className="ml-2">ANM</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="jobRoleOfStaff"
              value="Registered Nurse"
              checked={formData.jobRoleOfStaff === 'Registered Nurse'}
              onChange={onFormChange}
              className="form-radio"
            />
            <span className="ml-2">Registered Nurse</span>
          </label>
        </div>
      </div>
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
				<button
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white
          shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
          disabled={!!dateError}
        >
          Next
        </button>
      </div>
    </div>
  );
};
