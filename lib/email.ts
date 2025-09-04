// Email service with Resend integration
import { Resend } from 'resend';
import { EmailOptions } from './types';
import { prisma } from './db';
import { generateInvoicePDF, formatCurrency, formatDate } from './pdf';

// Function to determine predominant business area and return corresponding hex color
function getPredominantBusinessAreaHexColor(items: any[]): string {
  // Business area color mapping (hex colors for email templates)
  const businessAreaColors = {
    CREATIVE: '#074EBC',     // Deep Blue
    DEVELOPMENT: '#FBB711',  // Golden Yellow
    SUPPORT: '#C83135'       // Red
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

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const emailData: any = {
      from: 'MPDEE Admin <admin@mpdee.co.uk>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    // Add BCC if provided
    if (options.bcc) {
      emailData.bcc = options.bcc;
    }

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      emailData.attachments = options.attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      }));
    }

    const result = await resend.emails.send(emailData);
    console.log('Email sent successfully:', result.data?.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendInvoiceEmail(invoiceId: string): Promise<boolean> {
  try {
    // Fetch invoice with client and items
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
        items: true,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Generate PDF
    const pdfArrayBuffer = await generateInvoicePDF({
      invoice: invoice as any,
      company: {
        name: process.env.COMPANY_NAME || 'MPDEE',
        email: process.env.COMPANY_EMAIL || 'admin@mpdee.co.uk',
        phone: process.env.COMPANY_PHONE,
        address: '6 Brocklehurst Drive, Edwinstowe, Mansfield, Notts. NG21 9JW',
      },
    });

    // Convert ArrayBuffer to Buffer for email attachment
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    // Get dynamic color based on invoice items
    const dynamicColor = getPredominantBusinessAreaHexColor(invoice.items);

    // Create email content
    const emailSubject = `Invoice ${invoice.invoice_number} from ${process.env.COMPANY_NAME || 'MPDEE'}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${dynamicColor};">Invoice ${invoice.invoice_number}</h2>
        
        <p>Dear ${invoice.client.name},</p>
        
        <p>Thank you for your business! Please find your invoice attached to this email.</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Invoice Details:</h3>
          <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
          <p><strong>Date:</strong> ${formatDate(invoice.created_at)}</p>
          ${invoice.due_date ? `<p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>` : ''}
          <p><strong>Amount:</strong> ${formatCurrency(invoice.total_amount)}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <h4>Services:</h4>
          <ul>
            ${invoice.items.map((item: any) => 
              `<li>${item.description} - ${item.quantity} × ${formatCurrency(item.rate)} = ${formatCurrency(item.total)}</li>`
            ).join('')}
          </ul>
        </div>
        
        <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p>Kind regards,<br>
          MPDEE Admin<br>
          mpdee.co.uk</p>
        </div>
      </div>
    `;

    // Send email with PDF attachment
    const emailSent = await sendEmail({
      to: invoice.client.email,
      bcc: 'admin@mpdee.co.uk',
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          filename: `invoice-${invoice.invoice_number}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    if (emailSent) {
      // Update invoice status to SENT
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'SENT',
          sent_date: new Date(),
        },
      });
    }

    return emailSent;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return false;
  }
} 