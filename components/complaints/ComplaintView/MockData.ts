import { Complaint, Submitter } from "@/types/complaint.types";

// Mock submitter data
export const mockSubmitter: Submitter = {
  name: "Robert Williams",
  email: "robert.williams@example.com",
  phone: "123-456-7890",
  type: "Client"
};

// Mock complaints data with supporting media
export const mockComplaints: Complaint[] = [
  {
    id: "1",
    title: "Poor Communication from Nurse",
    description: "The assigned nurse rarely responds to messages and is often late.",
    status: "open",
    submissionDate: "2025-05-10",
    source: "client",
    lastUpdated: "2025-05-10",
    submitter: mockSubmitter,
    supportingMedia: [
      {
        id: "media1",
        type: "image",
        url: "https://picsum.photos/800/600",
        fileName: "screenshot_message.jpg",
        fileSize: "1.2 MB",
        contentType: "image/jpeg"
      },
      {
        id: "media2",
        type: "document",
        url: "/mock-files/schedule.pdf",
        fileName: "nurse_schedule.pdf",
        fileSize: "452 KB",
        contentType: "application/pdf"
      }
    ]
  },
  {
    id: "2",
    title: "Billing Discrepancy",
    description: "I was charged for services that weren't provided during last week's visit.",
    status: "open",
    submissionDate: "2025-05-10",
    source: "client",
    lastUpdated: "2025-05-10",
    submitter: mockSubmitter,
    supportingMedia: [
      {
        id: "media3",
        type: "document",
        url: "/mock-files/invoice.pdf",
        fileName: "Invoice_May_2025.pdf",
        fileSize: "320 KB",
        contentType: "application/pdf"
      },
      {
        id: "media4",
        type: "image",
        url: "https://picsum.photos/800/600?random=2",
        fileName: "receipt_screenshot.jpg",
        fileSize: "950 KB",
        contentType: "image/jpeg"
      }
    ]
  },
  {
    id: "3",
    title: "Unsafe Working Environment",
    description: "The client's home has several safety hazards that make providing care difficult.",
    status: "open",
    submissionDate: "2025-05-10",
    source: "client",
    lastUpdated: "2025-05-10",
    submitter: mockSubmitter,
    supportingMedia: [
      {
        id: "media5",
        type: "video",
        url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
        fileName: "hazard_video.mp4",
        fileSize: "2.4 MB",
        contentType: "video/mp4",
        thumbnailUrl: "https://picsum.photos/320/180?random=3"
      }
    ]
  },
  {
    id: "4",
    title: "Missed Appointments",
    description: "The client has missed three consecutive appointments without notice.",
    status: "open",
    submissionDate: "2025-05-10",
    source: "client",
    lastUpdated: "2025-05-10",
    submitter: mockSubmitter,
    supportingMedia: [
      {
        id: "media6",
        type: "audio",
        url: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
        fileName: "voicemail_recording.mp3",
        fileSize: "128 KB",
        contentType: "audio/mpeg"
      }
    ]
  },
  {
    id: "5",
    title: "Medication Administration Error",
    description: "The wrong dosage was administered during yesterday's visit.",
    status: "open",
    submissionDate: "2025-05-10",
    source: "client",
    lastUpdated: "2025-05-10",
    submitter: mockSubmitter,
  }
];