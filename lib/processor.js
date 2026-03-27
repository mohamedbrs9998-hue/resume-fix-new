import { getOpenAI } from '@/lib/openai';
import { getPlan } from '@/lib/pricing';

function buildPrompt({ plan, resumeText, fullName, email, targetRole, targetCountry }) {
  const selectedPlan = getPlan(plan);
  return `You are an elite resume writer and ATS optimization assistant.

User details:
- Name: ${fullName}
- Email: ${email}
- Target role: ${targetRole}
- Target country/market: ${targetCountry}
- Selected package: ${selectedPlan?.name || plan}

Source CV text:
"""
${resumeText}
"""

Return strict JSON with these keys:
{
  "resume_title": string,
  "improved_resume": string,
  "cover_letter": string,
  "linkedin_summary": string,
  "ats_report": {
    "score": number,
    "issues": string[],
    "recommended_keywords": string[],
    "summary": string
  },
  "next_steps": string[]
}

Rules:
- Keep results professional and realistic.
- Do not invent degrees or jobs.
- Strengthen phrasing but stay faithful to the user's background.
- Make the resume ATS-friendly with clear headings.
- If some information is missing, improve structure without fabricating facts.
- If package is Basic, still return all keys but keep cover_letter and linkedin_summary concise.
- If package is Pro, give a strong cover letter and ATS report.
- If package is Premium, provide full strength outputs across all sections.
`;
}

function mockResult({ fullName, targetRole, targetCountry }) {
  return {
    resume_title: `${fullName} - ${targetRole}`,
    improved_resume: `PROFESSIONAL SUMMARY\nResults-driven candidate targeting ${targetRole} opportunities in ${targetCountry}. Demonstrates strong communication, organization, problem solving, and measurable contribution to team outcomes.\n\nEXPERIENCE\n- Rewrote role descriptions into action-driven bullet points\n- Improved keyword alignment for ATS screening\n- Clarified achievements and outcomes where possible\n\nSKILLS\nCommunication | Teamwork | Documentation | Time Management | Stakeholder Support`,
    cover_letter: `Dear Hiring Manager,\n\nI am applying for the ${targetRole} position. I bring relevant experience, a strong work ethic, and a clear commitment to delivering results. I would welcome the opportunity to contribute to your team in ${targetCountry}.\n\nSincerely,\n${fullName}`,
    linkedin_summary: `${fullName} is a motivated professional targeting ${targetRole} roles in ${targetCountry}, with a focus on delivering high-quality work, continuous improvement, and reliable execution.`,
    ats_report: {
      score: 82,
      issues: ['Add more quantified results', 'Tailor keywords to the job description', 'Keep formatting simple for ATS'],
      recommended_keywords: ['operations', 'coordination', 'analysis', 'customer service', 'compliance'],
      summary: 'The CV is now more focused, cleaner, and better aligned for ATS systems.'
    },
    next_steps: [
      'Match your CV title to the exact role you are applying for',
      'Customize keywords for each vacancy',
      'Keep the CV length to 1-2 pages where possible'
    ]
  };
}

export async function processResumeOrder(input) {
  const { plan, resumeText, fullName, email, targetRole, targetCountry } = input;

  if (process.env.MOCK_MODE === 'true') {
    return mockResult({ fullName, targetRole, targetCountry });
  }

  const openai = getOpenAI();
  const prompt = buildPrompt({ plan, resumeText, fullName, email, targetRole, targetCountry });

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5-mini',
    input: prompt,
  });

  const outputText = response.output_text;
  return JSON.parse(outputText);
}
