export interface LineItem {
  id: string;
  fieldName: string;
  amount: number;
  gst?: number;
  amountWithGst?: number;
  commission?: number;
}

export interface EntryGroup {
  id: number;
  groupName: string;
  lineItems: LineItem[];
  dateAdded: string;
  notes?: string;
  showToClient: boolean;
  modeOfPayment?: string;
  startDate?: string;
  endDate?: string;
  approved: boolean;
}

export interface FormLineItem {
  id: string;
  fieldName: string;
  amount: string;
  gst?: string;
  commission?: string;
}

export interface DynamicFieldTrackerProps {
  clientId: string;
  tenant: string;
}

export interface ApiLineItem {
  id: string;
  field_name: string;
  amount: number;
  gst?: number;
  amount_with_gst?: number;
  commission?: number;
}

export interface ApiEntryGroup {
  id: string;
  payment_group_name: string;
  lineItems: ApiLineItem[];
  date_added: string;
  notes?: string | null;
  show_to_client: boolean;
  mode_of_payment?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  approved: boolean;
}