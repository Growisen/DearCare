export interface LineItem {
  id: string;
  fieldName: string;
  amount: number;
  gst?: number;
  amountWithGst?: number;
}

export interface EntryGroup {
  id: number;
  groupName: string;
  lineItems: LineItem[];
  dateAdded: string;
  notes?: string;
  showToClient: boolean;
  modeOfPayment?: string;
}

export interface FormLineItem {
  id: string;
  fieldName: string;
  amount: string;
  gst?: string;
}

export interface DynamicFieldTrackerProps {
  clientId: string;
}

export interface ApiLineItem {
  id: string;
  field_name: string;
  amount: number;
  gst?: number;
  amount_with_gst?: number;
}

export interface ApiEntryGroup {
  id: string;
  payment_group_name: string;
  lineItems: ApiLineItem[];
  date_added: string;
  notes?: string | null;
  show_to_client: boolean;
  mode_of_payment?: string | null;
}