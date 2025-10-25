import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { FormattedAssignmentDetails } from '@/hooks/useAssignment';
import { formatName } from '@/utils/formatters';

export async function generateAssignmentPDF(
  assignmentDetails: FormattedAssignmentDetails,
  organization: string
) {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25;

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(margin - 10, margin - 10, pageWidth - 2 * (margin - 10), pageHeight - 2 * (margin - 10));
    
    let yPosition = margin;
    
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

      doc.addImage(logoDataURL, 'PNG', margin, yPosition, 50, 20);
      yPosition += 30;
    } catch (error) {
      console.error('Failed to load logo:', error);
      yPosition += 10;
    }

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    const title = 'ASSIGNMENT INFORMATION';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
    yPosition += 8;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin + 15, yPosition, pageWidth - margin - 15, yPosition);
    yPosition += 18;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Nurse Details', margin, yPosition);
    yPosition += 2;
    
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Name:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formatName(assignmentDetails.nurseDetails.name), margin + 25, yPosition);
    yPosition += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Reg No:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(assignmentDetails.nurseDetails.nurseRegNo || 'N/A', margin + 25, yPosition);
    yPosition += 7;
    
    const nurseOrg = assignmentDetails.nurseDetails.admittedType
      ? assignmentDetails.nurseDetails.admittedType.toUpperCase()
      : 'N/A';
    doc.setFont('helvetica', 'bold');
    doc.text('Organization:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(nurseOrg, margin + 35, yPosition);
    yPosition += 15;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Client Details', margin, yPosition);
    yPosition += 2;
    
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Name:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formatName(assignmentDetails.clientDetails.name), margin + 25, yPosition);
    yPosition += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Type:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(assignmentDetails.clientDetails.type, margin + 25, yPosition);
    yPosition += 15;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Assignment Period', margin, yPosition);
    yPosition += 2;
    
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    const startDateText = format(new Date(assignmentDetails.assignmentPeriod.startDate), 'MMMM d, yyyy');
    const endDateText = format(new Date(assignmentDetails.assignmentPeriod.endDate), 'MMMM d, yyyy');
    
    doc.setFont('helvetica', 'bold');
    doc.text('Start Date:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(startDateText, margin + 30, yPosition);
    yPosition += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('End Date:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(endDateText, margin + 30, yPosition);
    yPosition += 15;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80); 
    doc.text('Shift Details', margin, yPosition);
    yPosition += 2;
    
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Hours:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${assignmentDetails.shiftDetails.startTime} - ${assignmentDetails.shiftDetails.endTime}`, margin + 25, yPosition);
    yPosition += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Salary per Day:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    const salaryValue = assignmentDetails.shiftDetails.salaryPerDay ? `INR ${assignmentDetails.shiftDetails.salaryPerDay}` : 'N/A';
    doc.text(salaryValue, margin + 35, yPosition);
    yPosition += 20;

    const signatureY = pageHeight - margin - 30;
    const signatureX = pageWidth - margin - 60;
    
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(signatureX, signatureY, signatureX + 55, signatureY);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'italic');
    doc.text('Authorized Signature', signatureX + 27.5, signatureY + 6, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    const footerText = `Generated on ${format(new Date(), 'MMMM d, yyyy HH:mm')}`;
    const footerWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - margin + 5);
    
    doc.save('assignment-info.pdf');
};