import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { ApiResponse } from '../../../../lib/types';

// GET /api/expenses - Get paginated list of expenses
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: expenses,
      total,
      page,
      limit,
    });
  } catch (error: any) {
    if (error?.message === 'Authentication required') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

// POST /api/expenses - Create new expense
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { description, amount, category, date, receipt_url, notes } = body;

    if (!description || amount == null || !category || !date) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(String(amount)),
        category,
        date: new Date(date),
        receipt_url: receipt_url || null,

        notes: notes || null,
      },
    });

    const response: ApiResponse = { success: true, data: expense };
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    if (error?.message === 'Authentication required') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create expense' }, { status: 500 });
  }
}


