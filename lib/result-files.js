import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import { getSupabaseAdmin, getUploadsBucket } from '@/lib/supabase';
import { sanitizeFilenamePart } from '@/lib/validation';

function text(value) {
  return String(value || '').replace(/\r/g, '').trim();
}

function buildPackageText(order) {
  return [
    order.result?.resume_title || 'ResumeFix AI Result',
    '',
    '=== IMPROVED CV ===',
    text(order.result?.improved_resume),
    '',
    '=== COVER LETTER ===',
    text(order.result?.cover_letter),
    '',
    '=== LINKEDIN SUMMARY ===',
    text(order.result?.linkedin_summary),
    '',
    '=== ATS REPORT ===',
    JSON.stringify(order.result?.ats_report || {}, null, 2),
    '',
    '=== NEXT STEPS ===',
    ...((order.result?.next_steps || []).map((step, index) => `${index + 1}. ${step}`)),
  ].join('\n');
}

async function buildDocxBuffer(order) {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: order.result?.resume_title || 'ResumeFix AI Result', heading: HeadingLevel.TITLE }),
        new Paragraph({ text: 'Improved CV', heading: HeadingLevel.HEADING_1 }),
        ...text(order.result?.improved_resume).split('\n').map((line) => new Paragraph(line || ' ')),
        new Paragraph({ text: 'Cover Letter', heading: HeadingLevel.HEADING_1 }),
        ...text(order.result?.cover_letter).split('\n').map((line) => new Paragraph(line || ' ')),
        new Paragraph({ text: 'LinkedIn Summary', heading: HeadingLevel.HEADING_1 }),
        ...text(order.result?.linkedin_summary).split('\n').map((line) => new Paragraph(line || ' ')),
        new Paragraph({ text: 'ATS Report', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ children: [new TextRun(JSON.stringify(order.result?.ats_report || {}, null, 2))] }),
      ],
    }],
  });
  return Packer.toBuffer(doc);
}

async function buildPdfBuffer(order) {
  return await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text(order.result?.resume_title || 'ResumeFix AI Result');
    doc.moveDown();
    doc.fontSize(14).text('Improved CV');
    doc.fontSize(10).text(text(order.result?.improved_resume));
    doc.moveDown();
    doc.fontSize(14).text('Cover Letter');
    doc.fontSize(10).text(text(order.result?.cover_letter));
    doc.moveDown();
    doc.fontSize(14).text('LinkedIn Summary');
    doc.fontSize(10).text(text(order.result?.linkedin_summary));
    doc.moveDown();
    doc.fontSize(14).text('ATS Report');
    doc.fontSize(10).text(JSON.stringify(order.result?.ats_report || {}, null, 2));
    doc.end();
  });
}

async function uploadBuffer(bucket, filePath, buffer, contentType) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
    upsert: true,
    contentType,
  });
  if (error) throw error;
}

export async function createResultArtifacts(order) {
  if (!order?.result) {
    throw new Error('Cannot create result artifacts without generated result');
  }

  const bucket = getUploadsBucket();
  const safeBase = sanitizeFilenamePart(order.fullName || 'resume-package', 'resume-package');
  const basePath = `${order.id}/results`;

  const files = {
    txt: {
      storagePath: `${basePath}/${safeBase}-career-package.txt`,
      filename: `${safeBase}-career-package.txt`,
      contentType: 'text/plain; charset=utf-8',
      buffer: Buffer.from(buildPackageText(order), 'utf8'),
    },
    json: {
      storagePath: `${basePath}/${safeBase}-ats-report.json`,
      filename: `${safeBase}-ats-report.json`,
      contentType: 'application/json; charset=utf-8',
      buffer: Buffer.from(JSON.stringify(order.result?.ats_report || {}, null, 2), 'utf8'),
    },
    docx: {
      storagePath: `${basePath}/${safeBase}-career-package.docx`,
      filename: `${safeBase}-career-package.docx`,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: await buildDocxBuffer(order),
    },
    pdf: {
      storagePath: `${basePath}/${safeBase}-career-package.pdf`,
      filename: `${safeBase}-career-package.pdf`,
      contentType: 'application/pdf',
      buffer: await buildPdfBuffer(order),
    },
  };

  await Promise.all(
    Object.values(files).map((file) => uploadBuffer(bucket, file.storagePath, file.buffer, file.contentType))
  );

  return Object.fromEntries(
    Object.entries(files).map(([key, value]) => [key, {
      storagePath: value.storagePath,
      filename: value.filename,
      contentType: value.contentType,
    }])
  );
}

export async function downloadResultArtifact(storagePath) {
  const supabase = getSupabaseAdmin();
  const bucket = getUploadsBucket();
  const { data, error } = await supabase.storage.from(bucket).download(storagePath);
  if (error) throw error;
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
