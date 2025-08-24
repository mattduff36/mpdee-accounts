import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';
import { ClientFormData, ApiResponse, PaginatedResponse, Client } from '../../../../lib/types';

// GET /api/clients - List all clients with optional search and pagination
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await prisma.client.count({ where });

    // Get clients with pagination
    const clients = await prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    const response: PaginatedResponse<Client> = {
      success: true,
      data: clients,
      total,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

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

    // Check if client with this email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email },
    });

    if (existingClient) {
      return NextResponse.json(
        { success: false, error: 'A client with this email already exists' },
        { status: 409 }
      );
    }

    // Create the client
    const client = await prisma.client.create({
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
      data: client,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    );
  }
} 