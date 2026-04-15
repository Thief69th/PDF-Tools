import { NextRequest, NextResponse } from 'next/server';
import { spawnSync } from 'child_process';
import { randomBytes } from 'crypto';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';

// Security: All files deleted immediately after processing.
// Nothing is logged, stored, or persisted.

function cleanup(...files: string[]) {
  for (const f of files) {
    try { if (existsSync(f)) unlinkSync(f); } catch {}
  }
}

export async function POST(request: NextRequest) {
  const id   = randomBytes(24).toString('hex');
  const inF  = `/tmp/.${id}.pdf`;
  const outF = `/tmp/.${id}.out.pdf`;

  try {
    const { pdfBase64, userPassword, ownerPassword, restrictions } = await request.json();

    if (!pdfBase64 || !userPassword) {
      return NextResponse.json({ error: 'PDF and password required' }, { status: 400 });
    }

    // Decode PDF bytes
    const pdfBuf = Buffer.from(pdfBase64, 'base64');
    if (pdfBuf.length < 10) {
      return NextResponse.json({ error: 'Invalid PDF' }, { status: 400 });
    }

    // Write to temp (mode 0600 = only current user can read)
    writeFileSync(inF, pdfBuf, { mode: 0o600 });

    const ownerPass = ownerPassword || userPassword;

    // Build qpdf args
    const args: string[] = [
      '--encrypt', userPassword, ownerPass, '256',
    ];

    // Apply restrictions
    if (restrictions) {
      if (!restrictions.print)    args.push('--print=none');
      if (!restrictions.modify)   args.push('--modify=none');
      if (!restrictions.copy)     args.push('--extract=n');
      if (!restrictions.annotate) args.push('--annotate=n');
    }

    args.push('--', inF, outF);

    const result = spawnSync('qpdf', args, {
      encoding: 'buffer',
      timeout: 30000,
      maxBuffer: 200 * 1024 * 1024, // 200MB
    });

    // qpdf exit 0 = success, 3 = success with warnings — both are OK
    if (!existsSync(outF)) {
      cleanup(inF, outF);
      const stderr = result.stderr?.toString() || 'Unknown error';
      return NextResponse.json({ error: 'Encryption failed', details: stderr }, { status: 500 });
    }

    // Read encrypted PDF
    const encryptedBuf = readFileSync(outF);

    // ⚡ Immediately delete both files — zero persistence
    cleanup(inF, outF);

    return NextResponse.json({
      pdfBase64: encryptedBuf.toString('base64'),
      size: encryptedBuf.length,
      encryption: 'AES-256',
    });

  } catch (err: any) {
    cleanup(inF, outF);
    console.error('protect-pdf error:', err.message);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
