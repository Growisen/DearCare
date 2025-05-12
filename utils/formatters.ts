export const getServiceLabel = (serviceOptions: { value: string, label: string }[], value: string): string => {
  const option = serviceOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};