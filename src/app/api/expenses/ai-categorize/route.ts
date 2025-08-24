import { NextRequest, NextResponse } from 'next/server';

interface Transaction {
  id: string;
  description: string;
  amount: number;
}

interface CategorizationRequest {
  transactions: Transaction[];
  prompt: string;
  categories: string[];
}

interface CategorizationSuggestion {
  id: string;
  category: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CategorizationRequest = await request.json();
    const { transactions, prompt, categories } = body;

    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No transactions provided' },
        { status: 400 }
      );
    }

    // Create a comprehensive prompt for the AI
    const systemPrompt = `You are an AI assistant that categorizes business expenses. You need to analyze transaction descriptions and assign appropriate categories.

Available Categories: ${categories.join(', ')}

${prompt ? `Custom Instructions: ${prompt}` : ''}

For each transaction, analyze the description and amount to determine the most appropriate category from the available options.

Consider the following guidelines:
- Office Supplies: pens, paper, office furniture, etc.
- Travel: transportation, accommodation, meals while traveling
- Marketing: advertising, promotional materials, social media tools
- Equipment: computers, hardware, tools
- Software: software licenses, subscriptions, development tools
- Utilities: electricity, water, internet, phone bills
- Professional Services: legal, accounting, consulting fees
- Other: anything that doesn't fit the above categories

Return your response as a JSON array with objects containing: id and category.`;

    const userPrompt = `Please categorize these transactions:

${transactions.map(t => `- ${t.description} (£${t.amount.toFixed(2)})`).join('\n')}

Respond with a JSON array like this:
[
  {"id": "transaction_id", "category": "Software"},
  ...
]`;

         // For now, we'll implement a simple rule-based categorization
     // In a real implementation, you would call an AI service like OpenAI, Anthropic, etc.
     const suggestions: CategorizationSuggestion[] = transactions.map(transaction => {
       const description = transaction.description.toLowerCase();
       const amount = transaction.amount;

       // Simple rule-based categorization
       let category = 'Other';

       // Category detection
       if (description.includes('office') || description.includes('supplies') || description.includes('paper') || description.includes('pen')) {
         category = 'Office Supplies';
       } else if (description.includes('travel') || description.includes('hotel') || description.includes('train') || description.includes('flight')) {
         category = 'Travel';
       } else if (description.includes('marketing') || description.includes('advert') || description.includes('social')) {
         category = 'Marketing';
       } else if (description.includes('computer') || description.includes('hardware') || description.includes('equipment')) {
         category = 'Equipment';
       } else if (description.includes('software') || description.includes('license') || description.includes('subscription') || description.includes('cursor') || description.includes('github') || description.includes('figma')) {
         category = 'Software';
       } else if (description.includes('electricity') || description.includes('water') || description.includes('internet') || description.includes('phone')) {
         category = 'Utilities';
       } else if (description.includes('legal') || description.includes('accounting') || description.includes('consulting')) {
         category = 'Professional Services';
       }

       // Apply custom prompt rules if provided
       if (prompt) {
         const promptLower = prompt.toLowerCase();
         if (promptLower.includes('cursor') && description.includes('cursor')) {
           category = 'Software';
         }
         // Add more custom rules based on the prompt
       }

       return {
         id: transaction.id,
         category
       };
     });

    return NextResponse.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('AI categorization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to categorize transactions' },
      { status: 500 }
    );
  }
}
