import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

const OUT = path.join(process.cwd(), 'public', 'icons');
const PAPER = [0x14, 0x13, 0x11] as const;
const ACCENT = [0xd0, 0x8a, 0x3a] as const;
const INK = [0xf3, 0xee, 0xe6] as const;

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(size: number, pixels: Uint8Array): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y += 1) {
    const dest = y * (1 + size * 3);
    raw[dest] = 0;
    raw.set(pixels.subarray(y * size * 3, (y + 1) * size * 3), dest + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function fill(pixels: Uint8Array, color: readonly [number, number, number]) {
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = color[0];
    pixels[i + 1] = color[1];
    pixels[i + 2] = color[2];
  }
}

function setPixel(
  pixels: Uint8Array,
  size: number,
  x: number,
  y: number,
  color: readonly [number, number, number],
) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const i = (y * size + x) * 3;
  pixels[i] = color[0];
  pixels[i + 1] = color[1];
  pixels[i + 2] = color[2];
}

function fillCircle(
  pixels: Uint8Array,
  size: number,
  cx: number,
  cy: number,
  radius: number,
  color: readonly [number, number, number],
) {
  const r2 = radius * radius;
  const minX = Math.max(0, Math.floor(cx - radius));
  const maxX = Math.min(size - 1, Math.ceil(cx + radius));
  const minY = Math.max(0, Math.floor(cy - radius));
  const maxY = Math.min(size - 1, Math.ceil(cy + radius));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r2) setPixel(pixels, size, x, y, color);
    }
  }
}

function strokeCircle(
  pixels: Uint8Array,
  size: number,
  cx: number,
  cy: number,
  radius: number,
  width: number,
  color: readonly [number, number, number],
) {
  const outer = (radius + width / 2) ** 2;
  const inner = Math.max(0, radius - width / 2) ** 2;
  const minX = Math.max(0, Math.floor(cx - radius - width));
  const maxX = Math.min(size - 1, Math.ceil(cx + radius + width));
  const minY = Math.max(0, Math.floor(cy - radius - width));
  const maxY = Math.min(size - 1, Math.ceil(cy + radius + width));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 <= outer && d2 >= inner) setPixel(pixels, size, x, y, color);
    }
  }
}

function strokeRect(
  pixels: Uint8Array,
  size: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
  color: readonly [number, number, number],
) {
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const onEdge =
        x < x0 + width || x > x1 - width || y < y0 + width || y > y1 - width;
      if (onEdge) setPixel(pixels, size, x, y, color);
    }
  }
}

function drawIcon(size: number): Buffer {
  const pixels = new Uint8Array(size * size * 3);
  fill(pixels, PAPER);
  const inset = Math.round(size * 0.1);
  const stroke = Math.max(2, Math.round(size * 0.035));
  strokeRect(
    pixels,
    size,
    inset,
    inset,
    size - 1 - inset,
    size - 1 - inset,
    stroke,
    INK,
  );
  const cx = size / 2;
  const cy = size / 2;
  fillCircle(pixels, size, cx, cy, size * 0.22, ACCENT);
  strokeCircle(pixels, size, cx, cy, size * 0.3, stroke, ACCENT);
  strokeCircle(pixels, size, cx, cy, size * 0.38, Math.max(1, stroke - 1), INK);
  fillCircle(pixels, size, cx, cy, size * 0.07, PAPER);
  return encodePng(size, pixels);
}

function main() {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(path.join(OUT, 'icon-192.png'), drawIcon(192));
  writeFileSync(path.join(OUT, 'icon-512.png'), drawIcon(512));
  writeFileSync(path.join(OUT, 'apple-touch-icon.png'), drawIcon(180));
}

main();
