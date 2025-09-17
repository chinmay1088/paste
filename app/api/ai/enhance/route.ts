import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, prompt } = await request.json();

    if (!text || !prompt) {
      return NextResponse.json({ error: 'Text and prompt are required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are a text enhancement AI. Your job is to improve the given text based on the user's request. 

STRICT RULES:
1. ONLY return the enhanced text, nothing else
2. Do not add any explanations, comments, or additional text
3. If the request violates guidelines or is inappropriate, return the original text unchanged
4. Maintain the original meaning and intent
5. Keep the same format and structure unless specifically asked to change it
6. Do not add quotes around the response

User request: ${prompt}
Original text: ${text}

Enhanced text:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      throw new Error(`Gemini API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      // If blocked by safety filters or no candidates, return original text
      return NextResponse.json({ enhancedText: text });
    }

    const enhancedText = data.candidates[0].content.parts[0].text.trim();
    
    // If the response is empty or just whitespace, return original
    if (!enhancedText || enhancedText.length === 0) {
      return NextResponse.json({ enhancedText: text });
    }

    return NextResponse.json({ enhancedText });

  } catch (error) {
    console.error('AI Enhancement error:', error);
    
    // Return more specific error messages
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message.includes('API key') ? 'Invalid API key' : error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Failed to enhance text' }, { status: 500 });
  }
}
