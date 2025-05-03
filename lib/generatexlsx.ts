import * as XLSX from 'xlsx';

interface ExcelNurseData {
  'Nurse ID': number;
  'First Name': string;
  'Last Name': string;
  'Email': string;
  'Phone Number': string;
  'Gender': string;
  'Date of Birth': string;
  'Age': string;
  'Address': string;
  'City': string;
  'Taluk': string;
  'State': string;
  'PIN Code': string | number;
  'Languages': string;
  'Experience (Years)': number;
  'Service Type': string;
  'Shift Pattern': string;
  'Category': string;
  'Status': string;
  'Marital Status': string;
  'Religion': string;
  'Mother Tongue': string;
  'NOC Status': string;
  'Created Date': string;
  'Health Status': string;
  'Disability': string;
  'Source of Information': string;
  'Reference Name': string;
  'Reference Phone': string;
  'Reference Relation': string;
  'Recommendation Details': string;
  'Family References': string;
}

export function generateNurseExcel(data: ExcelNurseData[]): Blob {
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const columnWidths = [
    { wch: 10 },  // Nurse ID
    { wch: 15 },  // First Name
    { wch: 15 },  // Last Name
    { wch: 25 },  // Email
    { wch: 15 },  // Phone Number
    { wch: 10 },  // Gender
    { wch: 12 },  // Date of Birth
    { wch: 8 },   // Age
    { wch: 30 },  // Address
    { wch: 15 },  // City
    { wch: 15 },  // Taluk
    { wch: 15 },  // State
    { wch: 10 },  // PIN Code
    { wch: 20 },  // Languages
    { wch: 15 },  // Experience
    { wch: 15 },  // Service Type
    { wch: 15 },  // Shift Pattern
    { wch: 15 },  // Category
    { wch: 12 },  // Status
    { wch: 15 },  // Marital Status
    { wch: 15 },  // Religion
    { wch: 15 },  // Mother Tongue
    { wch: 12 },  // NOC Status
    { wch: 12 },  // Created Date
    { wch: 30 },  // Health Status
    { wch: 30 },  // Disability
    { wch: 20 },  // Source
    { wch: 20 },  // Reference Name
    { wch: 15 },  // Reference Phone
    { wch: 15 },  // Reference Relation
    { wch: 30 },  // Recommendation
    { wch: 50 }   // Family References
  ];

  worksheet['!cols'] = columnWidths;

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nurses');

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}