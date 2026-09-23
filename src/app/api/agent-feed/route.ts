import { NextResponse } from 'next/server';
import { AGENT_INTENTS, type AgentFeedPacket } from '@/agent-feed/types';

function webhookConfig() {
  const url = process.env.AGENT_FEED_WEBHOOK_URL?.trim();
  const secret = process.env.AGENT_FEED_WEBHOOK_SECRET?.trim();
  const header =
    process.env.AGENT_FEED_WEBHOOK_HEADER?.trim() || 'X-Agent-Feed-Secret';
  return { url, secret, header };
}

export async function GET() {
  const { url } = webhookConfig();
  return NextResponse.json({
    webhookEnabled: Boolean(url),
  });
}

export async function POST(request: Request) {
  const { url, secret, header } = webhookConfig();
  if (!url) {
    return NextResponse.json(
      {
        error:
          'AGENT_FEED_WEBHOOK_URL is not set. Copy or download the packet instead.',
      },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    packet?: AgentFeedPacket;
    markdown?: string;
  };

  if (!isPacket(body.packet) || typeof body.markdown !== 'string') {
    return NextResponse.json(
      { error: 'packet and markdown are required' },
      { status: 400 },
    );
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  if (secret) {
    headers.set(header, secret);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      packet: body.packet,
      markdown: body.markdown,
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `Webhook failed (${response.status})` },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

function isPacket(value: unknown): value is AgentFeedPacket {
  if (!value || typeof value !== 'object') return false;
  const packet = value as AgentFeedPacket;
  return (
    packet.source === 'world-audio-repository' &&
    packet.version === 1 &&
    AGENT_INTENTS.includes(packet.intent) &&
    typeof packet.title === 'string' &&
    typeof packet.url === 'string'
  );
}
