// PDF generation utilities for invoices using jsPDF
import { jsPDF } from 'jspdf';
import { InvoicePDFData } from './types';
import fs from 'fs';
import path from 'path';

// Function to determine predominant business area and return corresponding color
function getPredominantBusinessAreaColor(items: any[]): readonly [number, number, number] {
  // Business area color mapping
  const businessAreaColors = {
    CREATIVE: [7, 78, 188] as const,     // #074EBC - Deep Blue
    DEVELOPMENT: [251, 183, 17] as const, // #FBB711 - Golden Yellow
    SUPPORT: [200, 49, 53] as const      // #C83135 - Red
  } as const;

  if (items.length === 0) {
    return businessAreaColors.CREATIVE; // Default fallback
  }

  // Count occurrences of each business area
  const areaCounts = items.reduce((counts, item) => {
    const area = item.business_area;
    counts[area] = (counts[area] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Find the business area with the highest count
  let maxCount = 0;
  let predominantArea = items[0].business_area; // Fallback to first item's area

  for (const [area, count] of Object.entries(areaCounts)) {
    if ((count as number) > maxCount) {
      maxCount = count as number;
      predominantArea = area;
    }
  }

  // If there's a tie, use the first item's business area
  const tieCount = Object.values(areaCounts).filter(count => count === maxCount).length;
  if (tieCount > 1) {
    predominantArea = items[0].business_area;
  }

  return businessAreaColors[predominantArea as keyof typeof businessAreaColors] || businessAreaColors.CREATIVE;
}

export async function generateInvoicePDF(data: InvoicePDFData): Promise<ArrayBuffer> {
  try {
    const { invoice, company } = data;

    // Create new PDF document
    const doc = new jsPDF();
    
    // Dynamic brand color based on predominant business area
    const brandColor = getPredominantBusinessAreaColor(invoice.items);
    const blackColor = [0, 0, 0] as const;
    const grayColor = [107, 114, 128] as const; // #6b7280

    let yPos = 25; // Start with more top margin

    // Header - Company logo (left side)
    let logoHeight = 0;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'images', 'Invoice-logo-new.png');
      if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath);
        const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
        
        // Set logo dimensions - increased size for better presence
        const logoWidth = 60;
        
        doc.addImage(logoBase64, 'PNG', 20, yPos, logoWidth, 0);
        logoHeight = 25; // Estimate logo height for spacing
      } else {
        // Fallback to text if logo not found
        doc.setFontSize(20);
        doc.setTextColor(...brandColor);
        doc.text(company.name, 20, yPos);
        logoHeight = 15;
      }
    } catch (error) {
      console.warn('Failed to load logo, using text fallback:', error);
      doc.setFontSize(20);
      doc.setTextColor(...brandColor);
      doc.text(company.name, 20, yPos);
      logoHeight = 15;
    }

    // Invoice title and number (right side) - positioned to align with logo
    const rightColumnX = 190;
    doc.setFontSize(28);
    doc.setTextColor(...brandColor);
    doc.text('INVOICE', rightColumnX, yPos + 5, { align: 'right' });
    
    doc.setFontSize(16);
    doc.setTextColor(...blackColor);
    doc.text(`${invoice.invoice_number}`, rightColumnX, yPos + 15, { align: 'right' });
    
    doc.setFontSize(11);
    doc.setTextColor(...grayColor);
    doc.text(`Date: ${formatDate(invoice.created_at)}`, rightColumnX, yPos + 25, { align: 'right' });
    
    if (invoice.due_date) {
      doc.text(`Due: ${formatDate(invoice.due_date)}`, rightColumnX, yPos + 32, { align: 'right' });
    }

    // Move to next section with proper spacing after logo
    yPos += logoHeight + 10;

    // Company address (hardcoded on single line)
    doc.setFontSize(9); // Smaller font for company address
    doc.setTextColor(...grayColor);
    doc.text('6 Brocklehurst Drive, Edwinstowe, Mansfield, Notts. NG21 9JW', 20, yPos);
    yPos += 4; // Single line spacing

    // Reduced spacing after company details
    yPos += 8;

    // Professional horizontal divider line
    doc.setDrawColor(...brandColor);
    doc.setLineWidth(0.8);
    doc.line(20, yPos, 190, yPos);
    yPos += 12; // Reduced spacing after divider

    // Bill To section with improved styling
    doc.setFontSize(13);
    doc.setTextColor(...brandColor);
    doc.text('BILL TO:', 20, yPos);
    yPos += 10;

    // Client name with emphasis
    doc.setFontSize(12);
    doc.setTextColor(...blackColor);
    doc.text(invoice.client.name, 20, yPos);
    yPos += 6;

    // Client address only (removed email and phone)
    if (invoice.client.billing_address) {
      doc.setFontSize(10);
      doc.setTextColor(...grayColor);
      const clientAddressLines = invoice.client.billing_address.split('\n');
      clientAddressLines.forEach((line) => {
        doc.text(line, 20, yPos);
        yPos += 4; // Reduced line spacing to less than 1.0 (was 6)
      });
    }

    yPos += 8; // Further reduced spacing before table

    // Professional items table header
    const tableHeaderHeight = 10;
    doc.setFillColor(...brandColor);
    doc.rect(20, yPos, 170, tableHeaderHeight, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Description', 25, yPos + 6.5);
    doc.text('Qty', 125, yPos + 6.5, { align: 'center' });
    doc.text('Rate', 150, yPos + 6.5, { align: 'center' });
    doc.text('Amount', 185, yPos + 6.5, { align: 'right' });
    yPos += tableHeaderHeight;

    // Items table rows with improved styling and word wrapping
    doc.setTextColor(...blackColor);
    const baseRowHeight = 8;
    const maxDescriptionWidth = 95; // Maximum width for description column
    
    invoice.items.forEach((item, index) => {
      // Prepare description with agency commission if applicable
      let fullDescription = item.description;
      if (item.agency_commission && item.agency_commission > 0) {
        // agency_commission is already stored as a percentage in the database
        const commissionPercent = item.agency_commission % 1 === 0 ? 
          item.agency_commission.toString() : 
          item.agency_commission.toFixed(1);
        fullDescription += `\n- minus ${commissionPercent}% Agency Commission`;
      }
      
      // Split description into lines that fit within the column width
      doc.setFontSize(10);
      const descriptionLines = doc.splitTextToSize(fullDescription, maxDescriptionWidth);
      const actualRowHeight = Math.max(baseRowHeight, descriptionLines.length * 4 + 4);
      
      // Alternating row colors for better readability
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252); // Very light blue-gray
        doc.rect(20, yPos, 170, actualRowHeight, 'F');
      }
      
      // Draw description with word wrapping
      doc.setTextColor(...blackColor);
      descriptionLines.forEach((line: string, lineIndex: number) => {
        if (lineIndex === 0) {
          doc.text(line, 25, yPos + 5.5);
        } else {
          // Agency commission line in dark gray
          if (line.includes('minus') && line.includes('Agency Commission')) {
            doc.setTextColor(...grayColor);
            doc.text(line, 25, yPos + 5.5 + (lineIndex * 4));
            doc.setTextColor(...blackColor);
          } else {
            doc.text(line, 25, yPos + 5.5 + (lineIndex * 4));
          }
        }
      });
      
      // Draw other columns (centered vertically in the row)
      const centerY = yPos + (actualRowHeight / 2) + 1;
      doc.text(item.quantity.toString(), 125, centerY, { align: 'center' });
      doc.text(formatCurrency(item.unit_price), 150, centerY, { align: 'center' });
      doc.text(formatCurrency(item.total_price), 185, centerY, { align: 'right' });
      
      yPos += actualRowHeight;
    });

    yPos += 15;

    // Professional total section with background
    const totalSectionY = yPos;
    const totalSectionHeight = 12;
    
    // Light background for total
    doc.setFillColor(249, 250, 251);
    doc.rect(120, totalSectionY - 2, 70, totalSectionHeight, 'F');
    
    // Total label and amount
    doc.setFontSize(13);
    doc.setTextColor(...brandColor);
    doc.text('TOTAL:', 155, yPos + 6, { align: 'right' });
    doc.setFontSize(16);
    doc.setTextColor(...blackColor);
    doc.text(formatCurrency(invoice.total_amount), 185, yPos + 6, { align: 'right' });

    yPos += 25;

    // Professional Payment Details Section
    doc.setFontSize(13);
    doc.setTextColor(...brandColor);
    doc.text('PAYMENT DETAILS:', 20, yPos);
    yPos += 15;

    // Payment details box with subtle border and small padding
    const paymentBoxY = yPos - 2;
    const paymentBoxHeight = 32; // Slightly increased for padding
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.rect(20, paymentBoxY, 170, paymentBoxHeight);
    
    // Payment details in two columns with tighter spacing and padding
    const leftColumnX = 25;
    const paymentRightColumnX = 115;
    let leftYPos = yPos + 2; // Add small top padding
    // let rightYPos = yPos + 2; // Add small top padding - unused variable

    // Left column - Beneficiary and account details
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('Beneficiary:', leftColumnX, leftYPos);
    leftYPos += 4;
    doc.setFontSize(10);
    doc.setTextColor(...blackColor);
    doc.text('Matthew Duffill trading as MPDEE Group', leftColumnX, leftYPos);
    leftYPos += 7;

    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('Sort Code:', leftColumnX, leftYPos);
    leftYPos += 4;
    doc.setFontSize(10);
    doc.setTextColor(...blackColor);
    doc.text('04-00-05', leftColumnX, leftYPos);
    leftYPos += 7;

    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('Account Number:', leftColumnX, leftYPos);
    leftYPos += 4;
    doc.setFontSize(10);
    doc.setTextColor(...blackColor);
    doc.text('88760521', leftColumnX, leftYPos);

    // Right column - Bank address (vertically centered and with 1.25 line spacing)
    const leftColumnStartY = yPos + 2;
    const leftColumnEndY = leftYPos; // Final position after all left column content
    const leftColumnTotalHeight = leftColumnEndY - leftColumnStartY;
    
    const bankLineSpacing = 5; // 1.25 line spacing (4 * 1.25 = 5)
    const bankContentHeight = 3 * bankLineSpacing; // 3 gaps between 4 lines
    
    // Center the bank address content within the left column height
    const bankStartY = leftColumnStartY + (leftColumnTotalHeight - bankContentHeight) / 2;
    
    let bankYPos = bankStartY;
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('Bank Address:', paymentRightColumnX, bankYPos);
    bankYPos += bankLineSpacing;
    doc.setFontSize(10);
    doc.setTextColor(...blackColor);
    doc.text('Revolut Ltd', paymentRightColumnX, bankYPos);
    bankYPos += bankLineSpacing;
    doc.text('7 Westferry Circus, E14 4HD', paymentRightColumnX, bankYPos);
    bankYPos += bankLineSpacing;
    doc.text('London, United Kingdom', paymentRightColumnX, bankYPos);

    yPos = paymentBoxY + paymentBoxHeight + 10;

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text('Thank you for your business!', 105, yPos, { align: 'center' });
    
    if (invoice.due_date && invoice.status === 'SENT') {
      yPos += 6;
      doc.text(`Payment is due by ${formatDate(invoice.due_date)}`, 105, yPos, { align: 'center' });
    }

    // Return ArrayBuffer directly for NextResponse compatibility
    return doc.output('arraybuffer');
  } catch (error) {
    console.error('Error in generateInvoicePDF:', error);
    throw error;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
} 