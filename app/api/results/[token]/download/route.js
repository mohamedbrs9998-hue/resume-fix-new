import { getOrderByAccessToken } from '@/lib/orders';
import { downloadResultArtifact } from '@/lib/result-files';

export const runtime = 'nodejs';

const aliasMap = {
  resume: 'pdf',
  'cover-letter': 'docx',
  'linkedin-summary': 'txt',
  'full-package': 'pdf',
  ats: 'json',
};

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const order = await getOrderByAccessToken(resolvedParams.token);

  if (!order) {
    return new Response('Result not found', { status: 404 });
  }

  if (!order.result || !order.generatedFiles) {
    return new Response('Result not ready yet', { status: 409 });
  }

  const url = new URL(request.url);
  const rawKey = url.searchParams.get('file') || 'pdf';
  const fileKey = aliasMap[rawKey] || rawKey;
  const artifact = order.generatedFiles[fileKey];

  if (!artifact?.storagePath) {
    return new Response('Download file not found', { status: 404 });
  }

  const buffer = await downloadResultArtifact(artifact.storagePath);
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': artifact.contentType,
      'Content-Disposition': `attachment; filename="${artifact.filename}"`,
      'Cache-Control': 'private, max-age=60',
    },
  });
}
