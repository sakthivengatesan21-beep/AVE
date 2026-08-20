import { NextResponse } from 'next/server';
import { attributeDamage } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { propertyId, moveInEvidence, moveOutEvidence, maintenanceEvents } = body;

    const result = await attributeDamage(
      propertyId || 'prop-greenwood-204',
      moveInEvidence || [],
      moveOutEvidence || [],
      maintenanceEvents || []
    );

    return NextResponse.json({ analyses: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Damage attribution analysis failed' }, { status: 500 });
  }
}
