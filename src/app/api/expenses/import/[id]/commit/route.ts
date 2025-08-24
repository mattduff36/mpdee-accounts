import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../../../lib/auth';
import { prisma } from '../../../../../../../lib/db';

interface CommitBody {
  selections: Array<{
    transaction_id: string;
    category: string;
    notes?: string;
  }>;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = (await request.json()) as CommitBody;
    if (!Array.isArray(body.selections) || body.selections.length === 0) {
      return NextResponse.json({ success: false, error: 'No selections' }, { status: 400 });
    }

    const txIds = body.selections.map((s) => s.transaction_id);
    const txs = await prisma.bankTransaction.findMany({ where: { id: { in: txIds }, import_id: id } });

    const expenseCreates = [] as Array<Parameters<typeof prisma.expense.create>[0]['data']>;

    for (const s of body.selections) {
      const source = txs.find((t) => t.id === s.transaction_id);
      if (!source) continue;
      expenseCreates.push({
        description: source.description,
        amount: Math.abs(source.amount),
        category: s.category,
        date: source.date,
        notes: s.notes ?? null,
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const e of expenseCreates) {
        await tx.expense.create({ data: e });
      }
      await tx.bankTransaction.updateMany({ where: { id: { in: txIds } }, data: { status: 'ADDED' } });
    });

    return NextResponse.json({ success: true, data: { added: expenseCreates.length } });
  } catch (error) {
    console.error('Commit transactions failed', error);
    return NextResponse.json({ success: false, error: 'Failed to commit transactions' }, { status: 500 });
  }
}


