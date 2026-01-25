export interface LineItemInput {
  fieldName: string;
  amount: number;
  gst?: number;
  totalAmount?: number;
  commission?: number;
}

export interface SavePaymentGroupInput {
  clientId: string;
  groupName: string;
  lineItems: LineItemInput[];
  dateAdded: string;
  notes?: string;
  showToClient: boolean;
  modeOfPayment?: string;
  startDate?: string;
  endDate?: string;  
  paymentType?: string;
}