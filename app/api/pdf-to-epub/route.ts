import { NextRequest, NextResponse } from 'next/server';
import { spawnSync } from 'child_process';
import { randomBytes } from 'crypto';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';

function cleanup(...files: string[]) {
  for (const f of files) {
    try { if (existsSync(f)) unlinkSync(f); } catch {}
  }
}

export async function POST(request: NextRequest) {
  const id     = randomBytes(20).toString('hex');
  const mdFile = `/tmp/.${id}.md`;
  const epubFile = `/tmp/.${id}.epub`;
  const coverFile = `/tmp/.${id}.cover.png`;

  try {
    const { text, title, author, language, includeToc } = await request.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'No text content provided' }, { status: 400 });
    }

    // Build YAML front matter + markdown body
    const safeTitle  = (title  || 'Document').replace(/"/g, "'");
    const safeAuthor = (author || 'Unknown').replace(/"/g, "'");
    const safeLang   = language || 'en';

    // Convert extracted PDF text into structured markdown
    // Split by double newlines -> paragraphs
    const lines = text.split('\n');
    let markdown = '';
    let chapterCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) { markdown += '\n\n'; continue; }

      // Heuristic: ALL CAPS short lines or lines ending without punctuation
      // and surrounded by blank lines are likely headings
      const prevBlank = i === 0 || !lines[i-1]?.trim();
      const nextBlank = i === lines.length-1 || !lines[i+1]?.trim();
      const isShort   = line.length < 60;
      const isAllCaps = line === line.toUpperCase() && /[A-Z]/.test(line);
      const startsNum = /^(\d+\.?\s+[A-Z]|Chapter\s+\d+|CHAPTER\s+\d+|Section\s+\d+)/i.test(line);

      if ((prevBlank && nextBlank && isShort && (isAllCaps || startsNum)) || startsNum) {
        chapterCount++;
        if (chapterCount <= 2) {
          markdown += `# ${line}\n\n`;
        } else {
          markdown += `## ${line}\n\n`;
        }
      } else {
        markdown += line + '\n';
      }
    }

    // If no chapters detected, split into chunks of ~3000 chars
    if (chapterCount === 0) {
      const words = markdown.split(/\s+/);
      const chunkSize = 300;
      markdown = '';
      for (let i = 0; i < words.length; i += chunkSize) {
        if (i > 0) markdown += `\n\n## Part ${Math.ceil(i / chunkSize)}\n\n`;
        markdown += words.slice(i, i + chunkSize).join(' ') + '\n\n';
      }
    }

    const fullMd = `---
title: "${safeTitle}"
author: "${safeAuthor}"
lang: "${safeLang}"
---

# ${safeTitle}

${markdown}
`;

    writeFileSync(mdFile, fullMd, { mode: 0o600 });

    // Build pandoc args
    const args = [
      mdFile, '-o', epubFile,
      '--metadata', `title=${safeTitle}`,
      '--metadata', `author=${safeAuthor}`,
      '--metadata', `lang=${safeLang}`,
      '--epub-title-page=true',
    ];
    if (includeToc) args.push('--toc', '--toc-depth=2');

    const result = spawnSync('pandoc', args, {
      encoding: 'buffer',
      timeout: 60000,
      maxBuffer: 100 * 1024 * 1024,
    });

    if (!existsSync(epubFile)) {
      cleanup(mdFile, epubFile);
      return NextResponse.json({
        error: 'EPUB generation failed',
        details: result.stderr?.toString()?.slice(0, 300),
      }, { status: 500 });
    }

    const epubBuf = readFileSync(epubFile);

    // ⚡ Delete immediately — zero persistence
    cleanup(mdFile, epubFile, coverFile);

    return NextResponse.json({
      epubBase64: epubBuf.toString('base64'),
      size: epubBuf.length,
      chapters: chapterCount,
    });

  } catch (err: any) {
    cleanup(mdFile, epubFile, coverFile);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
