export const getServiceLabel = (serviceOptions: { value: string, label: string }[], value: string): string => {
  const option = serviceOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
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