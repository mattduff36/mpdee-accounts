import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';
import { InvoiceFormData, ApiResponse, PaginatedResponse, InvoiceWithClient, InvoiceStatus } from '../../../../lib/types';

// Generate unique invoice number
async function generateInvoiceNumber(): Promise<string> {
  const prefix = process.env.INVOICE_PREFIX || 'INV';
  const year = new Date().getFullYear();
  
  // Get the count of invoices this year
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);
  
  const count = await prisma.invoice.count({
    where: {
      created_at: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
  });
  
  const nextNumber = (count + 1).toString().padStart(3, '0');
  return `${prefix}-${year}-${nextNumber}`;
}

// GET /api/invoices - List all invoices with optional filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as InvoiceStatus | null;
    const client_id = searchParams.get('client_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { invoice_number: { contains: search, mode: 'insensitive' as const } },
        { client: { name: { contains: search, mode: 'insensitive' as const } } },
        { client: { email: { contains: search, mode: 'insensitive' as const } } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (client_id) {
      where.client_id = client_id;
    }

    // Get total count for pagination
    const total = await prisma.invoice.count({ where });

    // Get invoices with client information
    const invoices = await prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        client: true,
      },
    });

    const response: PaginatedResponse<InvoiceWithClient> = {
      data: invoices,
      total,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const body = await request.json();
    const { client_id, due_date, items }: InvoiceFormData = body;

    // Normalize numeric fields that may arrive as empty strings from the UI
    const normalizedItems = (items || []).map((item) => {
      const quantity = typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity)) || 0;
      const rate = typeof item.rate === 'number' ? item.rate : parseFloat(String(item.rate)) || 0;
      const agency_commission = typeof item.agency_commission === 'number' ? item.agency_commission : parseFloat(String(item.agency_commission)) || 0;
      return { ...item, quantity, rate, agency_commission } as typeof item & { quantity: number; rate: number; agency_commission: number };
    });

    // Validate required fields
    if (!client_id || !normalizedItems || normalizedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Client and at least one item are required' },
        { status: 400 }
      );
    }

    // Validate client exists
    const client = await prisma.client.findUnique({
      where: { id: client_id },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Validate items
    for (const item of normalizedItems) {
      if (!item.description || item.quantity <= 0 || item.rate <= 0) {
        return NextResponse.json(
          { success: false, error: 'All items must have description, quantity > 0, and rate > 0' },
          { status: 400 }
        );
      }
    }

    // Generate invoice number
    const invoice_number = await generateInvoiceNumber();

    // Calculate total amount accounting for agency commission
    const total_amount = normalizedItems.reduce((sum, item) => {
      const baseTotal = item.quantity * item.rate;
      const commissionAmount = (baseTotal * (item.agency_commission || 0)) / 100;
      return sum + (baseTotal - commissionAmount);
    }, 0);

    // Create the invoice with items in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // Create the invoice
      const newInvoice = await tx.invoice.create({
        data: {
          client_id,
          invoice_number,
          status: InvoiceStatus.DRAFT,
          total_amount,
          due_date: due_date ? new Date(due_date) : null,
        },
      });

      // Create invoice items
        const invoiceItems = await Promise.all(
        normalizedItems.map((item) => {
          const baseTotal = item.quantity * item.rate;
          const commissionAmount = (baseTotal * (item.agency_commission || 0)) / 100;
          const total = baseTotal - commissionAmount;
          
          return tx.invoiceItem.create({
            data: {
              invoice_id: newInvoice.id,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              total,
              agency_commission: item.agency_commission || 0,
              business_area: (item as any).business_area || 'CREATIVE',
            },
          });
        })
      );

      return { ...newInvoice, items: invoiceItems };
    });

    // Fetch the complete invoice with client and items
    const completeInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        client: true,
        items: true,
      },
    });

    const response: ApiResponse<typeof completeInvoice> = {
      success: true,
      data: completeInvoice,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
} 