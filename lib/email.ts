// Email service with Google SMTP integration
import nodemailer from 'nodemailer';
import { EmailOptions } from './types';
import { prisma } from './db';
import { generateInvoicePDF, formatCurrency, formatDate } from './pdf';

// Create SMTP transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
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
    const pdfBuffer = await generateInvoicePDF({
      invoice,
      company: {
        name: process.env.COMPANY_NAME || 'MPDEE Creative',
        email: process.env.COMPANY_EMAIL || 'matt.mpdee@gmail.com',
        phone: process.env.COMPANY_PHONE,
        address: process.env.COMPANY_ADDRESS,
      },
    });

    // Create email content
    const emailSubject = `Invoice ${invoice.invoice_number} from ${process.env.COMPANY_NAME || 'MPDEE Creative'}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Invoice ${invoice.invoice_number}</h2>
        
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
          <p>Best regards,<br>
          ${process.env.COMPANY_NAME || 'MPDEE Creative'}<br>
          ${process.env.COMPANY_EMAIL || 'matt.mpdee@gmail.com'}</p>
        </div>
      </div>
    `;

    // Send email with PDF attachment
    const emailSent = await sendEmail({
      to: invoice.client.email,
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          filename: `invoice-${invoice.invoice_number}.html`,
          content: pdfBuffer,
          contentType: 'text/html',
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