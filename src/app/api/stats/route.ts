import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';
import { ApiResponse } from '../../../../lib/types';

interface DashboardStats {
  totalClients: number;
  totalInvoices: number;
  outstandingAmount: number;
  outstandingClients: Array<{
    id: string;
    name: string;
    image_url: string | null;
  }>;
}

// GET /api/stats - Get dashboard statistics
export async function GET() {
  try {
    // Check authentication
    await requireAuth();

    // Get total clients count
    const totalClients = await prisma.client.count();

    // Get total invoices count
    const totalInvoices = await prisma.invoice.count();

    // Get outstanding amount and client info (invoices that are SENT or OVERDUE)
    const outstandingInvoices = await prisma.invoice.findMany({
      where: {
        status: {
          in: ['SENT', 'OVERDUE']
        }
      },
      select: {
        total_amount: true,
        client: {
          select: {
            id: true,
            name: true,
            image_url: true
          }
        }
      }
    });

    const outstandingAmount = outstandingInvoices.reduce(
      (sum, invoice) => sum + invoice.total_amount, 
      0
    );

    // Get unique clients with outstanding invoices
    const outstandingClients = outstandingInvoices
      .map(invoice => invoice.client)
      .filter((client, index, self) => 
        index === self.findIndex(c => c.id === client.id)
      );

    const stats: DashboardStats = {
      totalClients,
      totalInvoices,
      outstandingAmount,
      outstandingClients,
    };

    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}