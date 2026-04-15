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
  const id   = randomBytes(24).toString('hex');
  const inF  = `/tmp/.${id}.pdf`;
  const outF = `/tmp/.${id}.out.pdf`;

  try {
    const { pdfBase64, password } = await request.json();

    if (!pdfBase64) {
      return NextResponse.json({ error: 'PDF required' }, { status: 400 });
    }

    const pdfBuf = Buffer.from(pdfBase64, 'base64');
    writeFileSync(inF, pdfBuf, { mode: 0o600 });

    const args = [
      '--decrypt',
      ...(password ? [`--password=${password}`] : []),
      inF,
      outF,
    ];

    const result = spawnSync('qpdf', args, {
      encoding: 'buffer',
      timeout: 30000,
      maxBuffer: 200 * 1024 * 1024,
    });

    const stderr = result.stderr?.toString() || '';

    if (!existsSync(outF)) {
      cleanup(inF, outF);
      // Detect wrong password error
      if (stderr.includes('invalid password') || stderr.includes('password')) {
        return NextResponse.json({ error: 'wrong_password' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Decryption failed', details: stderr }, { status: 500 });
    }

    const decryptedBuf = readFileSync(outF);

    // ⚡ Delete immediately — zero persistence
    cleanup(inF, outF);

    return NextResponse.json({
      pdfBase64: decryptedBuf.toString('base64'),
      size: decryptedBuf.length,
    });

  } catch (err: any) {
    cleanup(inF, outF);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
