export type ComplaintStatus = "open" | "under_review" | "resolved";
export type ComplaintSource = "client" | "nurse"; 
export type ComplaintPriority = "low" | "medium" | "high" | "urgent";
export type ComplaintCategory = "Billing" | "Scheduling" | "Care Quality" | "Communication" | "Medical Care" | "Safety" | "Other";
export type ComplaintFilters = ComplaintStatus | "all";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  submitterName?: string;
  submissionDate: string;
  source: ComplaintSource;
  lastUpdated: string;

  adminComment?: string;
  resolution?: string;
  submitter?: Submitter;
  supportingMedia?: SupportingMedia[];
}

// export type Complaint = {
//   id: string;
//   title: string;
//   description: string;
//   status: ComplaintStatus;
//   submissionDate: string;
//   source: "client" | "nurse";
//   lastUpdated: string;
//   adminComment?: string;
//   resolution?: string;
//   submitter: Submitter;
//   supportingMedia?: SupportingMedia[];
// };

export type Submitter = {
  name: string;
  email: string;
  phone: string;
  type: string;
};

export type SupportingMedia = {
  id: string;
  type: "image" | "video" | "document" | "audio";
  url: string;
  fileName: string;
  fileSize?: string;
  contentType?: string;
  thumbnailUrl?: string;
};

export const statusOptions = [
  { value: "open", label: "Open", color: "bg-blue-100 text-blue-800" },
  { value: "under_review", label: "Under Review", color: "bg-yellow-100 text-yellow-800" },
  { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-800" },
];