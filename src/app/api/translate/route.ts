import { NextResponse } from 'next/server';
import { translateText } from '@/translation';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    text?: string;
    source?: string;
    target?: string;
  };

  if (!body.text || !body.source || !body.target) {
    return NextResponse.json(
      { error: 'text, source, and target are required' },
      { status: 400 },
    );
  }

  const result = await translateText({
    text: body.text,
    source: body.source,
    target: body.target,
  });

  return NextResponse.json(result);
}
