import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, path, userId } = body;

    // In a real app, you would save this to Supabase
    console.log(`Tracking event: ${event} on ${path} for user ${userId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
