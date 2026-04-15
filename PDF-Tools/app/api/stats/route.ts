import { NextResponse } from 'next/server';

export async function GET() {
  // In a real app, you would fetch this from Supabase
  const stats = {
    activeUsers: 124,
    totalViews: 15420,
    toolsUsed: 842,
    topTools: [
      { name: 'JSON Formatter', count: 452 },
      { name: 'Image Compressor', count: 312 },
      { name: 'Unit Converter', count: 284 },
    ]
  };

  return NextResponse.json(stats);
}
