export interface StaffSalary {
  id: number;
  name: string;
  regNo: string;
  hours: number | string;
  salary: number;
  missingFields?: Array<{ field: string; date: string }>;
  salaryCalculated?: boolean;
  salaryStatus?: 'none' | 'partial' | 'full';
  paidPeriods?: Array<{ start: string; end: string }>;
}