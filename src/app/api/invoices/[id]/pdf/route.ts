import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../../lib/auth';
import { generateInvoicePDF } from '../../../../../../lib/pdf';
import { prisma } from '../../../../../../lib/db';

// GET /api/invoices/[id]/pdf - Generate and download invoice PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    await requireAuth();

    const { id } = await params;

    // Fetch invoice with client and items
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Generate actual PDF ArrayBuffer
    const pdfArrayBuffer = await generateInvoicePDF({
      invoice,
      company: {
        name: process.env.COMPANY_NAME || 'MPDEE',
        email: process.env.COMPANY_EMAIL || 'matt.mpdee@gmail.com',
        phone: process.env.COMPANY_PHONE,
        address: '6 Brocklehurst Drive, Edwinstowe, Mansfield, Notts. NG21 9JW',
      },
    });

    // Return PDF file for direct download
    return new NextResponse(pdfArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
        'Content-Length': pdfArrayBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
} 