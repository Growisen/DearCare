'use client';
import React, { useMemo } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Nurse, ShiftData } from '@/types/scheduleShift.types';


interface NurseShiftFormCardProps {
  nurse: Nurse;
  shift: ShiftData;
  onChange: (nurseId: string, field: keyof ShiftData, value: string) => void;
  minDate: string;
}

function NurseShiftFormCard({
  nurse,
  shift,
  onChange,
  minDate,
}: NurseShiftFormCardProps) {
  const estimatedSalary = useMemo(() => {
    if (shift.startDate && shift.endDate && shift.salaryPerDay) {
      const start = new Date(shift.startDate);
      const end = new Date(shift.endDate);
      const days =
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
      const salary = parseFloat(shift.salaryPerDay);
      if (!isNaN(days) && !isNaN(salary) && days > 0) {
        return `Estimated Salary: ₹${(days * salary).toFixed(2)} for ${days} day${
          days > 1 ? 's' : ''
        }`;
      }
    }
    return '';
  }, [shift.startDate, shift.endDate, shift.salaryPerDay]);

  const handleInputChange = (
    field: keyof ShiftData,
    value: string
  ) => {
    onChange(nurse._id, field, value);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <div className="flex items-center mb-5 justify-between">
        <div className="flex items-center">
          <div className="h-14 w-14 rounded-full bg-gray-200 mr-4 overflow-hidden relative border border-gray-300">
            {nurse.profileImage ? (
              <Image
                src={nurse.profileImage}
                alt={`${nurse.firstName} ${nurse.lastName}`}
                className="object-cover"
                fill={true}
                sizes="56px"
                priority={false}
              />
            ) : (
              <span className="text-gray-700 font-semibold text-lg flex items-center justify-center h-full">
                {nurse.firstName.charAt(0)}
                {nurse.lastName.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {nurse.firstName} {nurse.lastName}
            </h3>
            <p className="text-sm text-gray-600">
              {nurse.specialty} • {nurse.experience} years exp. • {nurse.rating}
              /5 rating
            </p>
          </div>
        </div>
        {estimatedSalary && (
          <div className="text-gray-700 text-sm font-semibold ml-4 whitespace-nowrap bg-white px-4 py-2 rounded-md border border-gray-300">
            {estimatedSalary}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 bg-white p-5 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date *
          </label>
          <Input
            type="date"
            value={shift.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:border-gray-400 text-gray-800 bg-white focus:outline-none"
            required
            min={minDate}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date *
          </label>
          <Input
            type="date"
            value={shift.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:border-gray-400 text-gray-800 bg-white focus:outline-none"
            required
            min={shift.startDate || minDate}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Shift Start Time *
          </label>
          <Input
            type="time"
            value={shift.shiftStart.substring(0, 5)}
            onChange={(e) => handleInputChange('shiftStart', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:border-gray-400 text-gray-800 bg-white focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Shift End Time *
          </label>
          <Input
            type="time"
            value={shift.shiftEnd.substring(0, 5)}
            onChange={(e) => handleInputChange('shiftEnd', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:border-gray-400 text-gray-800 bg-white focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Salary Per Day *
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={shift.salaryPerDay}
            onChange={(e) => handleInputChange('salaryPerDay', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:border-gray-400 text-gray-800 bg-white focus:outline-none"
            required
            placeholder="Enter salary amount"
          />
          {estimatedSalary && (
            <div className="text-gray-700 text-sm mt-2 font-medium">
              {estimatedSalary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NurseShiftFormCard;