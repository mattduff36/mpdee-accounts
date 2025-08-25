const { PrismaClient } = require('@prisma/client');

async function testAuth() {
  console.log('🔍 Testing authentication and environment variables...');
  
  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME ? 'SET' : 'NOT SET');
  console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? 'SET' : 'NOT SET');
  console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');
  console.log('POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL ? 'SET' : 'NOT SET');
  
  // Test database connection
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('\n✅ Database connection successful');
    
    // Test a simple query
    const clientCount = await prisma.client.count();
    console.log('📊 Client count:', clientCount);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message);
  }
}

testAuth().catch(console.error);
