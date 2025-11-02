import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { FormData } from '@/types/agreement.types';

export async function generateFormPDF(
  formData: FormData,
  organization: string = 'DearCare'
) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;
  const safeBottomMargin = pageHeight - 10;

  const addPageBorder = () => {
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(margin - 10, margin - 10, pageWidth - 2 * (margin - 10), pageHeight - 2 * (margin - 10));
  };

  addPageBorder();

  const addLogo = async () => {
    try {
      const loadImage = (url: string) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      };

      const logoUrl = organization === 'DearCare' ? '/dcTransparent.png' : '/TATA.png';
      const logo = await loadImage(logoUrl);
      const logoImg = logo as HTMLImageElement;
      const canvas = document.createElement('canvas');
      canvas.width = logoImg.width;
      canvas.height = logoImg.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(logoImg, 0, 0);
      }
      const logoDataURL = canvas.toDataURL('image/png');

      doc.addImage(logoDataURL, 'PNG', 10, 10, 45, 18);
    } catch (error) {
      console.error('Failed to load logo:', error);
    }
  };

  await addLogo();
  yPosition += 20;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  const title = 'NURSE ASSIGNMENT INFORMATION';
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
  yPosition += 8;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin + 10, yPosition, pageWidth - margin - 10, yPosition);
  yPosition += 15;

  const addField = (label: string, value: string | undefined, underlineLength: number = 60) => {
    if (yPosition > safeBottomMargin) {
      doc.addPage();
      addPageBorder();
      yPosition = margin;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(label, margin + 5, yPosition);
    
    const labelWidth = doc.getTextWidth(label);
    const valueX = margin + 5 + labelWidth + 2;
    
    if (value && value.trim()) {
      doc.setFont('helvetica', 'normal');
      doc.text(value, valueX, yPosition);
    } else {
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.3);
      doc.line(valueX, yPosition + 1, valueX + underlineLength, yPosition + 1);
    }
    
    yPosition += 12;
  };

  const addSectionHeader = (title: string) => {
    if (yPosition > safeBottomMargin) {
      doc.addPage();
      addPageBorder();
      yPosition = margin;
    }
    
    yPosition += 3;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(title, margin, yPosition);
    yPosition += 3;
    
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  };

  addSectionHeader('Basic Information');
  addField('Name: ', formData.name);
  addField('Type: ', formData.type);
  addField('State: ', formData.state);
  addField('District: ', formData.district);
  addField('City: ', formData.city);
  yPosition += 12;

  addSectionHeader('Client Requirements');
  addField('Patient Diagnosis: ', formData.patientDiagnosis, 100);
  
  if (formData.clientRequirement && formData.clientRequirement.length > 60) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Client Requirement: ', margin + 5, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(formData.clientRequirement, pageWidth - 2 * margin - 10);
    
    if (yPosition + (lines.length * 6) > safeBottomMargin) {
      doc.addPage();
      addPageBorder();
      yPosition = margin;
    }
    
    doc.text(lines, margin + 5, yPosition);
    yPosition += lines.length * 6 + 5;
  } else {
    addField('Client Requirement: ', formData.clientRequirement, 100);
  }
  yPosition += 12;

  addSectionHeader('Assignment Details');
  
  const formatDateForDisplay = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };
  
  addField('Start Date: ', formData.startDate ? formatDateForDisplay(formData.startDate) : undefined);
  addField('End Date: ', formData.endDate ? formatDateForDisplay(formData.endDate) : undefined);
  addField('Start Time: ', formData.startTime);
  addField('End Time: ', formData.endTime);
  addField('Job Role: ', formData.jobRoleOfStaff, 80);
  addField('Salary per Month: ', formData.salaryPerMonth ? `INR ${formData.salaryPerMonth}` : undefined);
  addField('Salary per Day: ', formData.salaryPerDay ? `INR ${formData.salaryPerDay}` : undefined);
  yPosition += 12;

  addSectionHeader('Patient Care Details');
  addField('Feeding Method: ', formData.feedingMethod);
  addField('Sleep Pattern: ', formData.sleepPattern);
  addField('Activity Level: ', formData.activity);
  addField('General Condition: ', formData.generalCondition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(70, 70, 70);
  doc.text('Elimination', margin + 5, yPosition);
  yPosition += 8;
  
  addField('  Urine: ', formData.eliminationUrine);
  if (formData.eliminationUrineOthers) {
    addField('  Urine (Others): ', formData.eliminationUrineOthers, 80);
  }
  addField('  Bowel: ', formData.eliminationBowel);
  if (formData.eliminationBowelOthers) {
    addField('  Bowel (Others): ', formData.eliminationBowelOthers, 80);
  }
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(70, 70, 70);
  doc.text('Bed Sore Assessment', margin + 5, yPosition);
  yPosition += 8;
  
  addField('  Stage: ', formData.bedSoreStage);
  addField('  Shape: ', formData.bedSoreShape);
  addField('  Size: ', formData.bedSoreSize);
  addField('  Site: ', formData.bedSoreSite);
  yPosition += 12;

  if (formData.specialCare && formData.specialCare.length > 60) {
    addSectionHeader('Special Care Instructions');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(formData.specialCare, pageWidth - 2 * margin - 10);
    
    if (yPosition + (lines.length * 6) > safeBottomMargin) {
      doc.addPage();
      addPageBorder();
      yPosition = margin;
    }
    
    doc.text(lines, margin + 5, yPosition);
    yPosition += lines.length * 6 + 8;
  } else {
    addField('Special Care: ', formData.specialCare, 100);
    yPosition += 12;
  }

  addSectionHeader('Terms of Service');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const terms = [
    'Perform all assigned tasks with honesty.',
    'Promise to notify the office two months prior to leaving the service.',
    "If you continue working at the same location without the office's permission after leaving the service, the office will take necessary action, and you will be liable to pay compensation.",
    "Don’t abandon your service at a working household without a valid reason.",
    'You are responsible for keeping your own valuables like money, clothing, jewelry, etc., under your own responsibility.',
    'If for any reason you discontinue the service within one month, you can collect the salary for the days worked only on the date you initially joined. Salary will not be paid at any other time during this period.',
    'You must inform the office about your experiences and work-related updates from your workplace at least once a month.',
    'In case of an emergency leave requirement, the reason must be communicated.',
    'Leave will only be granted after convincing the office to sanction the requested leave.',
    'Rejoin work on the exact date following the approved leave period. If leave needs to be extended, you must notify the office in advance. The salary payment date will change corresponding to the extension of the leave.',
    'If office authorities request you to return while you are working, you must report to the office immediately.',
    'Failure to report to the office will result in necessary action being taken, and salary will be withheld.',
    'You promise to obey and follow the instructions of the office authorities under all circumstances.',
    'Provide the patient with medicine and food at the scheduled times.',
    'Exercise care to ensure that no damages occur at the workplace due to your actions. If damages occur due to your negligence, you will be responsible for the losses.',
    'The costs for any legal proceedings will be recovered from the staff member.',
    'You must not engage in any kind of money transactions with the relatives or the family members of the household where you are employed.',
    'You may accept gifts if they are given voluntarily by the family members.',
    'The person in charge at the office is entitled to inspect your bag at any time during the period of service.'
  ];

  const bulletIndent = margin + 2;
  const termsTextWidth = (pageWidth - margin) - (bulletIndent + 6);

  terms.forEach(term => {
    const lines = doc.splitTextToSize(term, termsTextWidth);
    const textHeight = lines.length * 6;

    if (yPosition + textHeight > safeBottomMargin) {
      doc.addPage();
      addPageBorder();
      yPosition = margin;
    }
    
    doc.text('•', bulletIndent, yPosition);
    doc.text(lines, bulletIndent + 6, yPosition);
    yPosition += textHeight + 2;
  });
  yPosition += 10;

  if (yPosition > safeBottomMargin - 20) {
    doc.addPage();
    addPageBorder();
    yPosition = margin;
  }

  const signatureY = yPosition + 10;
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);

  doc.line(margin + 10, signatureY, margin + 60, signatureY);
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'italic');
  doc.text('Nurse Name With Signature', margin + 35, signatureY + 5, { align: 'center' });

  const rightSigX = pageWidth - margin - 60;
  doc.line(rightSigX, signatureY, rightSigX + 50, signatureY);
  doc.text('Authorized Signature', rightSigX + 25, signatureY + 5, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  const footerText = `Generated on ${format(new Date(), 'MMMM d, yyyy HH:mm')}`;
  const footerWidth = doc.getTextWidth(footerText);
  doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - margin + 12);

  doc.save(`assignment-form-${formData.name.replace(/\s+/g, '-')}.pdf`);
}