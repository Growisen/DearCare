import { EntryGroup } from "@/types/paymentDetails.types";

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const calculateItemTotal = (item: { amount: number; gst?: number }) => {
  const amount = item.amount;
  const gst = typeof item.gst === 'number' ? item.gst : 0;
  const gstAmount = (amount * gst) / 100;
  const totalWithGst = amount + gstAmount;
  
  return { amount, gst, gstAmount, totalWithGst };
};

export const calculateGroupTotal = (group: EntryGroup): number => {
  return group.lineItems.reduce((sum, item) => {
    const { totalWithGst } = calculateItemTotal(item);
    return sum + totalWithGst;
  }, 0);
};

export const calculateTotalAmount = (entries: EntryGroup[]): number => {
  return entries.reduce((total, group) => {
    return total + calculateGroupTotal(group);
  }, 0);
};