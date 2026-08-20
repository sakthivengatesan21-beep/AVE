import { NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl, roomName } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    const result = await analyzeImage(imageUrl, roomName || 'General Room');
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Image analysis failed' }, { status: 500 });
  }
}
