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

    // Build vision message with all pages
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
                text: `You are a PDF to Word converter. Extract ALL content from these PDF page images.

Return ONLY a valid HTML document with this exact structure — no explanation, no markdown, just raw HTML:

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; margin: 2cm; color: #000; }
  h1 { font-size: 18pt; font-weight: bold; margin: 12pt 0 6pt; }
  h2 { font-size: 14pt; font-weight: bold; margin: 10pt 0 4pt; }
  h3 { font-size: 12pt; font-weight: bold; margin: 8pt 0 4pt; }
  p  { margin: 4pt 0; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
  th, td { border: 1px solid #999; padding: 4pt 6pt; }
  th { background: #f0f0f0; font-weight: bold; }
  ul, ol { margin: 4pt 0; padding-left: 20pt; }
  .page-break { page-break-before: always; margin-top: 20pt; border-top: 1px dashed #ccc; padding-top: 10pt; }
</style>
</head>
<body>
[ALL CONTENT HERE - preserve headings, paragraphs, lists, tables, page breaks]
</body>
</html>

Rules:
- Detect and use h1/h2/h3 for headings based on font size and position
- Use <table> for any tabular data
- Use <ul>/<ol> for lists
- Add class="page-break" div between pages
- Preserve all text exactly as shown
- Keep formatting intent (bold, italic) using <strong> and <em>
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
    const htmlContent = data.content?.[0]?.text || '';

    // Extract just the HTML
    const htmlMatch = htmlContent.match(/<!DOCTYPE html>[\s\S]*/i) || htmlContent.match(/<html[\s\S]*/i);
    const cleanHtml = htmlMatch ? htmlMatch[0] : `<!DOCTYPE html><html><body>${htmlContent}</body></html>`;

    return NextResponse.json({ html: cleanHtml, pages: pages.length });

  } catch (error: any) {
    console.error('PDF to Word error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
