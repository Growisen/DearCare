import React from "react";

interface HourlySalaryCardProps {
  hourlySalary: number;
}

const HourlySalaryCard: React.FC<HourlySalaryCardProps> = ({ hourlySalary }) => {
  return (
    <div className="bg-white rounded border border-slate-200 p-5">
      <h3 className="text-base font-semibold text-gray-900">Hourly Salary</h3>
      <p className="text-2xl font-bold text-gray-800 mt-2">
        ₹ {hourlySalary.toLocaleString()}
      </p>
      <p className="text-xs text-gray-600 mt-2">
        Current hourly wage assigned to this nurse.
      </p>
    </div>
  );
};

export default HourlySalaryCard;