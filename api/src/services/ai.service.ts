import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY
});

const SYSTEM_PROMPT = `You are an AI assistant for TelePod, a village and community connection network. 

Your role is to:
1. Understand user needs and requests in natural language
2. Extract key information: what they need, skills required, location preferences
3. Help match villages/users who have needs with those who can provide help
4. Analyze user facts (skills, capabilities, resources) to find the best matches

When given a query, extract:
- The primary need or request
- Key skills or resources needed
- Location information if relevant
- Any other important context

Respond in a helpful, concise way that focuses on connecting communities and facilitating resource sharing.`;

export interface AIMatchRequest {
  query: string;
  userName?: string;
  context?: string;
}

export interface AIMatchResponse {
  interpretation: string;
  keywords: string[];
  location?: string;
  needCategory?: string;
}

export async function interpretQuery(
  request: AIMatchRequest
): Promise<AIMatchResponse> {
  try {
    const userMessage = request.userName
      ? `User "${request.userName}" asks: ${request.query}`
      : request.query;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', 
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    const keywords = extractKeywords(request.query);

    return {
      interpretation: aiResponse,
      keywords,
      location: extractLocation(request.query),
      needCategory: categorizeNeed(request.query)
    };
  } catch (error) {
    console.error('AI interpretation error:', error);
    return {
      interpretation: 'Using basic matching...',
      keywords: extractKeywords(request.query)
    };
  }
}

export async function generateMatchRecommendations(
  query: string,
  matches: any[]
): Promise<string> {
  try {
    const matchSummary = matches
      .slice(0, 5)
      .map(
        (m, i) =>
          `${i + 1}. ${m.name} (${m.location || 'Location unknown'}) - Score: ${m.matchScore}, Capabilities: ${m.relevantCapabilities.join(', ')}`
      )
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `A user needs: "${query}"\n\nTop matches found:\n${matchSummary}\n\nProvide a brief, helpful recommendation explaining why these matches are good and how they can help.`
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return completion.choices[0]?.message?.content || 'Matches found above.';
  } catch (error) {
    console.error('AI recommendation error:', error);
    return 'Here are the best matches based on your query.';
  }
}

function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    'a',
    'an',
    'the',
    'is',
    'are',
    'was',
    'were',
    'need',
    'needs',
    'want',
    'wants',
    'help',
    'with',
    'for',
    'to',
    'from',
    'in',
    'at',
    'on'
  ]);

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function extractLocation(query: string): string | undefined {
  const locationPattern =
    /\b(in|near|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  const match = locationPattern.exec(query);
  return match ? match[2] : undefined;
}

function categorizeNeed(query: string): string | undefined {
  const categories = {
    medical: ['medical', 'health', 'doctor', 'medicine', 'supplies'],
    farming: ['farm', 'agriculture', 'crop', 'harvest', 'equipment'],
    education: ['education', 'school', 'teaching', 'learning', 'training'],
    technology: ['tech', 'software', 'computer', 'internet', 'digital'],
    infrastructure: ['water', 'electricity', 'solar', 'power', 'energy']
  };

  const lowerQuery = query.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
      return category;
    }
  }
  return undefined;
}

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the provided text to ${targetLanguage}. Only return the translated text, nothing else.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Translation failed');
  }
}
