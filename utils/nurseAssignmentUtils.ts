export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const calculateDaysBetween = (startDate: string, endDate?: string) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  return diffDays;
};

export const format12HourTime = (time: string | null) => {
  if (!time) return null;
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const calculatePeriodSalary = (startDate: string, endDate?: string, salaryPerDay?: number) => {
  if (!salaryPerDay) return null;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  const salary = salaryPerDay * diffDays;
  return Math.ceil(salary);
};

export function getAssignmentPeriodStatus(startDate: string, endDate: string) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  let daysCompleted = 0;

  if (today < start) {
    daysCompleted = 0;
  } else if (today > end) {
    daysCompleted = totalDays;
  } else {
    daysCompleted = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  const daysRemaining = Math.max(0, totalDays - daysCompleted);

  return { daysCompleted, daysRemaining, totalDays };
}