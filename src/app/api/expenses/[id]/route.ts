import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/db';

// GET /api/expenses/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: expense });
  } catch (error: any) {
    if (error?.message === 'Authentication required') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch expense' }, { status: 500 });
  }
}

// PUT /api/expenses/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { description, amount, category, date, receipt_url, notes } = body;
    if (!description || amount == null || !category || !date) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        description,
        amount: parseFloat(String(amount)),
        category,
        date: new Date(date),
        receipt_url: receipt_url || null,

        notes: notes || null,
      },
    });
    return NextResponse.json({ success: true, data: expense });
  } catch (error: any) {
    if (error?.message === 'Authentication required') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update expense' }, { status: 500 });
  }
}

// DELETE /api/expenses/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message === 'Authentication required') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete expense' }, { status: 500 });
  }
}


