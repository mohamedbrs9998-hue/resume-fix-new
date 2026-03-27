import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractTextFromBuffer(fileName, buffer) {
  const name = fileName || 'upload';
  const ext = path.extname(name).toLowerCase();

  if (ext === '.txt') return buffer.toString('utf8');
  if (ext === '.pdf') {
    const result = await pdf(buffer);
    return result.text;
  }
  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString('utf8');
}

export async function extractTextFromFile(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return extractTextFromBuffer(file.name || 'upload', buffer);
}
