import { Receiver } from '@upstash/qstash';

let cachedReceiver = null;

function getReceiver() {
  if (cachedReceiver) return cachedReceiver;
  cachedReceiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
  });
  return cachedReceiver;
}

export async function verifyQstashSignature(request, rawBody) {
  const signature = request.headers.get('upstash-signature');
  if (!signature) {
    throw new Error('Missing Upstash-Signature header');
  }
  if (!process.env.QSTASH_CURRENT_SIGNING_KEY || !process.env.QSTASH_NEXT_SIGNING_KEY) {
    throw new Error('Missing QStash signing keys');
  }

  const receiver = getReceiver();
  const ok = await receiver.verify({
    signature,
    body: rawBody,
    url: request.url,
    upstashRegion: request.headers.get('upstash-region') ?? undefined,
  });

  if (!ok) {
    throw new Error('Invalid QStash signature');
  }

  return true;
}
