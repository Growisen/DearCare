export const getTodayDDMMYYYY = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const formatDateToDDMMYYYY = (isoDate: string) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const formatDateToISO = (ddmmyyyy: string) => {
  const [day, month, year] = ddmmyyyy.split('/');
  return `${year}-${month}-${day}`;
};

export function getExperienceFromJoiningDate(joiningDate: string) {
  if (!joiningDate) return 'N/A';

  let start: Date;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(joiningDate)) {
    const [day, month, year] = joiningDate.split('/').map(Number);
    start = new Date(year, month - 1, day);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(joiningDate)) {
    const [year, month, day] = joiningDate.split('-').map(Number);
    start = new Date(year, month - 1, day);
  } else {
    return 'Invalid date format';
  }

  const now = new Date();
  
  now.setDate(now.getDate() + 1);

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  let result = '';
  if (years > 0) result += `${years} year${years > 1 ? 's' : ''} `;
  if (months > 0) result += `${months} month${months > 1 ? 's' : ''} `;
  if (days > 0) result += `${days} day${days > 1 ? 's' : ''}`;
  
  return result.trim() || '0 days';
}

export const calculateAge = (dob?: string) => {
  console.log('Calculating age for DOB:', dob);
  if (!dob) return '';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : '';
};

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}