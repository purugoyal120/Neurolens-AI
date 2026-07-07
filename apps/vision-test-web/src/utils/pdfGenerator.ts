import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

export const generatePDFReport = async (elementId: string, filename: string = 'NeuroLens_Report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    const imgData = await toPng(element, { pixelRatio: 2 });
    if (imgData === 'data:,') {
      throw new Error('Canvas is empty');
    }
    
    // A4 dimensions in mm
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    throw new Error(error.message || 'PDF Generation failed', { cause: error });
  }
};
