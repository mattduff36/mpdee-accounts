const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Acme Corporation',
      email: 'accounts@acme.com',
      phone: '+44 20 1234 5678',
      billing_address: '123 Business Street, London, SW1A 1AA',
      notes: 'Regular client with monthly retainer'
    }
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'TechStart Ltd',
      email: 'finance@techstart.co.uk',
      phone: '+44 161 987 6543',
      billing_address: '456 Innovation Drive, Manchester, M1 1AA',
      notes: 'Startup client, flexible payment terms'
    }
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Creative Agency XYZ',
      email: 'billing@creativexyz.com',
      phone: '+44 121 456 7890',
      billing_address: '789 Design Avenue, Birmingham, B1 1AA',
      notes: 'Agency client, project-based billing'
    }
  });

  console.log('Created clients:', { client1, client2, client3 });

  // Create sample invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      client_id: client1.id,
      invoice_number: 'INV-2025-001',
      status: 'SENT',
      total_amount: 2500.00,
      sent_date: new Date('2025-01-15'),
      due_date: new Date('2025-02-15'),
      items: {
        create: [
          {
            description: 'Radio Commercial Production - Q1 Campaign',
            quantity: 1,
            rate: 1500.00,
            total: 1500.00,
            agency_commission: 150.00,
            business_area: 'CREATIVE'
          },
          {
            description: 'Audio Imaging Package',
            quantity: 1,
            rate: 1000.00,
            total: 1000.00,
            agency_commission: 100.00,
            business_area: 'CREATIVE'
          }
        ]
      }
    }
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      client_id: client2.id,
      invoice_number: 'INV-2025-002',
      status: 'DRAFT',
      total_amount: 1800.00,
      items: {
        create: [
          {
            description: 'Website Development - Phase 1',
            quantity: 1,
            rate: 1800.00,
            total: 1800.00,
            agency_commission: 0.00,
            business_area: 'DEVELOPMENT'
          }
        ]
      }
    }
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      client_id: client3.id,
      invoice_number: 'INV-2025-003',
      status: 'PAID',
      total_amount: 3200.00,
      sent_date: new Date('2025-01-10'),
      due_date: new Date('2025-02-10'),
      paid_date: new Date('2025-01-25'),
      items: {
        create: [
          {
            description: 'Brand Identity Design',
            quantity: 1,
            rate: 2000.00,
            total: 2000.00,
            agency_commission: 200.00,
            business_area: 'CREATIVE'
          },
          {
            description: 'Marketing Materials Design',
            quantity: 1,
            rate: 1200.00,
            total: 1200.00,
            agency_commission: 120.00,
            business_area: 'CREATIVE'
          }
        ]
      }
    }
  });

  console.log('Created invoices:', { invoice1, invoice2, invoice3 });

  // Create sample expenses
  const expense1 = await prisma.expense.create({
    data: {
      description: 'Studio Equipment - Microphone',
      amount: 450.00,
      category: 'Equipment',
      date: new Date('2025-01-20'),
      business_area: 'CREATIVE',
      notes: 'Professional condenser microphone for voice recording'
    }
  });

  const expense2 = await prisma.expense.create({
    data: {
      description: 'Software License - Adobe Creative Suite',
      amount: 52.99,
      category: 'Software',
      date: new Date('2025-01-01'),
      business_area: 'CREATIVE',
      notes: 'Monthly subscription for design software'
    }
  });

  const expense3 = await prisma.expense.create({
    data: {
      description: 'Office Supplies',
      amount: 85.50,
      category: 'Office',
      date: new Date('2025-01-15'),
      business_area: 'SUPPORT',
      notes: 'Paper, ink, and other office supplies'
    }
  });

  const expense4 = await prisma.expense.create({
    data: {
      description: 'Travel - Client Meeting',
      amount: 120.00,
      category: 'Travel',
      date: new Date('2025-01-12'),
      business_area: 'CREATIVE',
      notes: 'Train fare and lunch for client meeting in London'
    }
  });

  console.log('Created expenses:', { expense1, expense2, expense3, expense4 });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
