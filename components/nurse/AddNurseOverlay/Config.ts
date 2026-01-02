export const FORM_CONFIG = {
  options: {
    locationsInKerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur", "Kottayam", "Malappuram"] as string[],
    languagesAvailable: ["English", "Malayalam", "Hindi", "Tamil", "Kannada", "Telugu"] as string[],
    maritalStatus: ["Single", "Married", "Widow", "Separated"] as string[],
    religions: ["Hindu", "Christian", "Muslim", "Other"] as string[],
    serviceTypes: ["Home Nurse", "Delivery Care", "Baby Care", "HM", "Ayurveda", "Panchakarma Therapist"] as string[],
    shiftingPatterns: ["24 Hour", "12 Hour", "8 Hour", "Hourly"] as string[],
    staffCategories: ["Permanent", "Trainee", "Temporary"] as string[],
    nocOptions: ["Yes", "No", "Applied", "Going To Apply"] as string[],
    admittedTypes: [
      { label: 'Tata Home Nursing', value: 'Tata_Homenursing' },
      { label: 'Dearcare LLP', value: 'Dearcare_Llp' }
    ] as { label: string, value: string }[],
    sourceOfInformation: [
      "Leads From Facebook",
      "Leads From Ivr",
      "Leads From WhatsApp",
      "Phone Landline",
      "Justdial",
      "Newspaper",
      "Client Reference",
      "Staff Reference",
      "Sulekha",
      "Direct Entry",
      "Lead From Csv"
    ] as string[]
  },
  steps: ["Personal Details", "Contact Information", "References", "Work Details", "Health & Additional Info", "Document Upload"],
  styles: {
    input: "w-full rounded-sm border border-slate-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition duration-200",
    label: "block text-sm font-medium text-gray-700 mb-1",
    button: "px-4 py-2 text-sm rounded-sm transition-colors duration-200",
    layout: "grid grid-cols-1 sm:grid-cols-2 gap-4"
  }
} as const;