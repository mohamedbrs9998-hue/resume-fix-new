import crypto from 'crypto';
import path from 'path';
import JSZip from 'jszip';

const EXECUTABLE_EXTENSIONS = new Set(['exe', 'dll', 'js', 'jse', 'vbs', 'vbe', 'bat', 'cmd', 'ps1', 'scr', 'com', 'jar', 'msi', 'sh']);
const DOCX_REQUIRED_ENTRIES = ['[Content_Types].xml', 'word/document.xml'];

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function hasPdfMagic(buffer) {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-';
}

function hasZipMagic(buffer) {
  return buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && [0x03, 0x05, 0x07].includes(buffer[2]) && [0x04, 0x06, 0x08].includes(buffer[3]);
}

function looksLikeUtf8Text(buffer) {
  if (!buffer.length) return false;
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  const text = sample.toString('utf8');
  let suspicious = 0;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code === 0xfffd || (code < 32 && ![9, 10, 13].includes(code))) suspicious += 1;
  }
  return suspicious / Math.max(text.length, 1) < 0.02;
}

async function inspectDocxArchive(buffer) {
  const zip = await JSZip.loadAsync(buffer, { checkCRC32: false });
  const entries = Object.keys(zip.files);

  for (const required of DOCX_REQUIRED_ENTRIES) {
    if (!entries.includes(required)) {
      throw new Error('Invalid DOCX structure: required Word document parts are missing');
    }
  }

  if (entries.length > Number(process.env.MAX_DOCX_ENTRIES || 250)) {
    throw new Error('DOCX file contains too many internal entries');
  }

  const suspiciousEntry = entries.find((entry) => {
    const ext = entry.split('.').pop()?.toLowerCase();
    return ext && EXECUTABLE_EXTENSIONS.has(ext);
  });
  if (suspiciousEntry) {
    throw new Error(`DOCX archive contains a forbidden embedded file: ${suspiciousEntry}`);
  }

  if (entries.some((entry) => /vbaProject\.bin$/i.test(entry))) {
    throw new Error('Macro-enabled Word files are not allowed');
  }

  const totalUncompressed = entries.reduce((sum, entry) => {
    const file = zip.files[entry];
    return sum + (file.dir ? 0 : Number(file._data?.uncompressedSize || 0));
  }, 0);

  if (totalUncompressed > Number(process.env.MAX_DOCX_UNCOMPRESSED_BYTES || 25 * 1024 * 1024)) {
    throw new Error('DOCX archive expands to an unsafe size');
  }

  return {
    kind: 'docx',
    detectedMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    entries: entries.length,
    totalUncompressed,
  };
}

function getExtension(filename) {
  return path.extname(filename || '').toLowerCase();
}

export async function inspectUploadedResume(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new Error('Resume file is required');
  }

  const maxBytes = Number(process.env.MAX_UPLOAD_BYTES || 8 * 1024 * 1024);
  if (file.size > maxBytes) {
    throw new Error(`Resume file is too large. Maximum allowed size is ${Math.round(maxBytes / (1024 * 1024))}MB`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = getExtension(file.name);
  const filename = file.name || 'resume';
  const declaredMime = file.type || '';

  let kind = null;
  let detectedMime = null;
  let details = {};

  if (hasPdfMagic(buffer)) {
    kind = 'pdf';
    detectedMime = 'application/pdf';
  } else if (hasZipMagic(buffer)) {
    details = await inspectDocxArchive(buffer);
    kind = details.kind;
    detectedMime = details.detectedMime;
  } else if (looksLikeUtf8Text(buffer)) {
    kind = 'txt';
    detectedMime = 'text/plain';
  } else {
    throw new Error('Uploaded file did not match an allowed PDF, DOCX, or TXT signature');
  }

  const allowedByExtension = {
    '.pdf': 'pdf',
    '.docx': 'docx',
    '.txt': 'txt',
  };
  const expectedKind = allowedByExtension[extension];

  if (!expectedKind) {
    throw new Error('Unsupported file extension. Please upload a PDF, DOCX, or TXT file');
  }

  if (expectedKind !== kind) {
    throw new Error(`File content does not match the .${expectedKind} upload type`);
  }

  const badFilenameExt = filename.split('.').pop()?.toLowerCase();
  if (badFilenameExt && EXECUTABLE_EXTENSIONS.has(badFilenameExt)) {
    throw new Error('Executable files are not allowed');
  }

  const textPreview = kind === 'txt' ? buffer.subarray(0, Math.min(buffer.length, 2000)).toString('utf8') : null;

  return {
    buffer,
    filename,
    extension,
    declaredMime,
    detectedMime,
    kind,
    size: buffer.length,
    sha256: sha256(buffer),
    scan: {
      status: 'passed',
      engine: 'builtin-signature-scan',
      detectedKind: kind,
      declaredMime,
      detectedMime,
      sha256: sha256(buffer),
      size: buffer.length,
      textPreview,
      ...details,
    },
  };
}
