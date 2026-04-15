import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { pages, fileName } = await request.json();

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: 'No pages provided' }, { status: 400 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured. Add ANTHROPIC_API_KEY to environment variables.' }, { status: 500 });
    }

    const imageContent = pages.slice(0, 10).map((base64: string, i: number) => ([
      {
        type: 'text',
        text: `Page ${i + 1}:`
      },
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: base64,
        }
      }
    ])).flat();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 8000,
        messages: [
          {
            role: 'user',
            content: [
              ...imageContent,
              {
                type: 'text',
                text: `You are a PDF to Excel converter. Extract ALL tabular data and structured content from these PDF page images.

Return ONLY a valid JSON object — no explanation, no markdown, just raw JSON:

{
  "sheets": [
    {
      "name": "Sheet name (use table title or Page 1, Page 2, etc.)",
      "headers": ["Column1", "Column2", "Column3"],
      "rows": [
        ["row1col1", "row1col2", "row1col3"],
        ["row2col1", "row2col2", "row2col3"]
      ]
    }
  ]
}

Rules:
- Create one sheet per distinct table found
- If no clear tables, extract all key-value pairs and text data into rows
- Headers must be the first row / column headers
- All cell values must be strings or numbers
- Sheet names max 31 chars
- If page has only text (no tables), create a sheet called "Text Content" with columns: ["Line", "Content"]
- Numbers should be actual numbers (no quotes), text should be strings
- Return at least 1 sheet always
`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return NextResponse.json({ error: 'AI processing failed', details: err }, { status: 500 });
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse AI response as JSON' }, { status: 500 });
    }

    let sheetsData;
    try {
      sheetsData = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 });
    }

    return NextResponse.json({ sheets: sheetsData.sheets, pages: pages.length });

  } catch (error: any) {
    console.error('PDF to Excel error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
