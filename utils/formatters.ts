export const getServiceLabel = (
  serviceOptions: { value: string, label: string }[],
  value: string
): string => {
  const option = serviceOptions.find(opt => opt.value === value);
  if (option) return option.label;

  return value
    .split('_')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const formatDate = (dateString: string, showTime?: boolean): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  if (showTime) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const timeStr = `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    return `${day}/${month}/${year}, ${timeStr}`;
  }

  return `${day}/${month}/${year}`;
};


export function getClientProfileUrl(clientId: string, clientType: string): string {
  switch (clientType.toLowerCase()) {
    case 'individual':
      return `/client-profile/${clientId}`;
    case 'organization':
      return `/client-profile/organization-client/${clientId}`;
    default:
      return `/clients/${clientId}`;
  }
}


export function format12HourTime(time24: string | null): string {
  if (!time24) return '';
  
  try {
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return '';
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';

    const hours12 = hours % 12 || 12;
  
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error converting time format:', error);
    return '';
  }
}

export const getRelationLabel = (
  relationOptions: { value: string, label: string }[],
  value: string
): string => {
  const option = relationOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};


export function formatName(fullName: string): string {
  if (!fullName) return "";

  fullName = fullName.trim().replace(/\s+/g, ' ').toLowerCase();

  fullName = fullName.replace(/([a-z]{2,})\.([a-z])/g, '$1. $2');
  fullName = fullName.replace(/([a-z])\.([a-z])/g, '$1. $2');
  fullName = fullName.replace(/([a-z])\.([a-z]{2,})/g, '$1. $2');

  const parts = fullName.split(' ');

  const formattedParts = [];

  for (const part of parts) {
    if (!part) continue;

    if (part.replace(/\./g, '').length === 1) {
      const letter = part.replace(/\./g, '').toUpperCase();
      formattedParts.push(letter + '.');
    } else {
      formattedParts.push(part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
    }
  }

  return formattedParts.join(' ');
}

export function formatOrganizationName(name: string) {
  if (!name) return '';
  return name
    .split(/[^a-zA-Z]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const getTenantKey = (tenant: string) => {
  if (tenant === "Tata HomeNursing") return "TATA_nursing";
  if (tenant === "DearCare LLP") return "Dearcare";
  return tenant;
};