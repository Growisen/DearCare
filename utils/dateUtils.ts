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
  // Parse dd/mm/yyyy format
  const [day, month, year] = joiningDate.split('/').map(Number);
  const start = new Date(year, month - 1, day);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    // Get days in previous month
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