function normalizeText(value) {
  return String(value || '').replace(/\r/g, '').trim();
}

export function buildDownloads(order) {
  if (!order?.result) return [];

  const outputs = [
    {
      key: 'resume',
      label: 'Improved CV',
      filename: `${order.fullName || 'resume'}-improved-cv.txt`,
      content: [
        order.result.resume_title || 'Improved CV',
        '',
        normalizeText(order.result.improved_resume),
      ].join('\n'),
    },
    {
      key: 'cover-letter',
      label: 'Cover Letter',
      filename: `${order.fullName || 'resume'}-cover-letter.txt`,
      content: normalizeText(order.result.cover_letter),
    },
    {
      key: 'linkedin-summary',
      label: 'LinkedIn Summary',
      filename: `${order.fullName || 'resume'}-linkedin-summary.txt`,
      content: normalizeText(order.result.linkedin_summary),
    },
    {
      key: 'ats-report',
      label: 'ATS Report',
      filename: `${order.fullName || 'resume'}-ats-report.json`,
      content: JSON.stringify(order.result.ats_report || {}, null, 2),
      contentType: 'application/json; charset=utf-8',
    },
    {
      key: 'full-package',
      label: 'Full Package',
      filename: `${order.fullName || 'resume'}-career-package.txt`,
      content: [
        order.result.resume_title || 'ResumeFix AI Result',
        '',
        '=== IMPROVED CV ===',
        normalizeText(order.result.improved_resume),
        '',
        '=== COVER LETTER ===',
        normalizeText(order.result.cover_letter),
        '',
        '=== LINKEDIN SUMMARY ===',
        normalizeText(order.result.linkedin_summary),
        '',
        '=== ATS REPORT ===',
        JSON.stringify(order.result.ats_report || {}, null, 2),
        '',
        '=== NEXT STEPS ===',
        ...(order.result.next_steps || []).map((step, index) => `${index + 1}. ${step}`),
      ].join('\n'),
    },
  ];

  return outputs.map((item) => ({
    ...item,
    contentType: item.contentType || 'text/plain; charset=utf-8',
  }));
}
