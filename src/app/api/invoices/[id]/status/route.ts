import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/db';
import { requireAuth } from '../../../../../../lib/auth';
import { sendPaymentReceivedEmail } from '../../../../../../lib/email';
import { ApiResponse, InvoiceStatus } from '../../../../../../lib/types';

// PATCH /api/invoices/[id]/status - Update invoice status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    await requireAuth();

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !Object.values(InvoiceStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status provided' },
        { status: 400 }
      );
    }

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Update the invoice status
    const updateData: any = {
      status,
    };

    // Set appropriate dates based on status
    if (status === InvoiceStatus.SENT && !existingInvoice.sent_date) {
      updateData.sent_date = new Date();
    }
    
    if (status === InvoiceStatus.PAID) {
      updateData.paid_date = new Date();
      // If not already sent, mark as sent too
      if (!existingInvoice.sent_date) {
        updateData.sent_date = new Date();
      }
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
    });

    // Send payment received email if status is changed to PAID
    if (status === InvoiceStatus.PAID && existingInvoice.status !== InvoiceStatus.PAID) {
      try {
        await sendPaymentReceivedEmail(id);
        console.log(`Payment received email sent for invoice ${id}`);
      } catch (error) {
        console.error(`Failed to send payment received email for invoice ${id}:`, error);
        // Don't fail the status update if email fails
      }
    }

    const response: ApiResponse<typeof updatedInvoice> = {
      success: true,
      data: updatedInvoice,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error updating invoice status:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update invoice status' },
      { status: 500 }
    );
  }
}
