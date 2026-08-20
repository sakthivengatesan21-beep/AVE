import { NextResponse } from 'next/server';
import { compareImages } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { moveInUrl, moveOutUrl, roomName } = body;

    if (!moveInUrl || !moveOutUrl) {
      return NextResponse.json({ error: 'Both moveInUrl and moveOutUrl are required' }, { status: 400 });
    }

    const result = await compareImages(moveInUrl, moveOutUrl, roomName || 'General Room');
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Image comparison failed' }, { status: 500 });
  }
}
