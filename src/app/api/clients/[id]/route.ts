import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { requireAuth } from '../../../../../lib/auth';
import { ClientFormData, ApiResponse, Client } from '../../../../../lib/types';

// GET /api/clients/[id] - Get a specific client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    await requireAuth();

    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse<Client> = {
      success: true,
      data: client,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching client:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Update a specific client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    await requireAuth();

    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, billing_address, notes, image_url }: ClientFormData = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if another client with this email exists (excluding current client)
    const emailConflict = await prisma.client.findFirst({
      where: {
        email,
        id: { not: id },
      },
    });

    if (emailConflict) {
      return NextResponse.json(
        { success: false, error: 'A client with this email already exists' },
        { status: 409 }
      );
    }

    // Update the client
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone: phone || null,
        billing_address: billing_address || null,
        notes: notes || null,
        image_url: image_url || null,
      },
    });

    const response: ApiResponse<Client> = {
      success: true,
      data: updatedClient,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error updating client:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a specific client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    await requireAuth();

    const { id } = await params;

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if client has any invoices
    const invoiceCount = await prisma.invoice.count({
      where: { client_id: id },
    });

    if (invoiceCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete client with existing invoices' },
        { status: 409 }
      );
    }

    // Delete the client
    await prisma.client.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error deleting client:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    );
  }
} 