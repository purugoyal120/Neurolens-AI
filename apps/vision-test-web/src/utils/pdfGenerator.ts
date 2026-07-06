import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDFReport = async (elementId: string, filename: string = 'NeuroLens_Report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: true, // Turn on logging to debug
      allowTaint: true,
      onclone: (clonedDoc) => {
        // Ensure the cloned element is visible for html2canvas
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.position = 'relative';
          clonedElement.style.top = '0';
          clonedElement.style.left = '0';
        }
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    if (imgData === 'data:,') {
      throw new Error('Canvas is empty');
    }
    
    // A4 dimensions in mm
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    throw new Error(error.message || 'PDF Generation failed', { cause: error });
  }
};
