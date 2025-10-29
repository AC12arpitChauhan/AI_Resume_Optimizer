/**
 * Gemini AI Prompts for Resume Optimization
 * 
 * These prompts are used to optimize resumes and generate change summaries.
 * Maintainers can tune these prompts to adjust optimization behavior.
 */

const OPTIMIZATION_SYSTEM_PROMPT = `You are a professional resume optimization assistant. Produce a polished, job-targeted version of the candidate resume that increases relevance to the job description, keeps facts intact, improves action verbs, quantifies achievements where possible, and adds relevant keywords from the job description. Keep the length similar to the original unless the job requires shorter format.`;

const buildOptimizationPrompt = (jobDescription, baseResumeText) => {
  return `Job Description:
${jobDescription}

Candidate base resume:
${baseResumeText}

Instructions:
1. Tailor the resume to the job description above. Use keywords and phrases present in the job description naturally in bullet points and summary.
2. Keep the candidate's facts and timeline the same. Do not invent experience or dates.
3. Replace weak verbs with strong action verbs. Add metrics where the text already implies metrics; if no metrics exist do not fabricate numbers.
4. Provide the output as:
---START_OPTIMIZED---
[optimized resume text here]
---END_OPTIMIZED---`;
};

const CHANGES_SUMMARY_SYSTEM_PROMPT = `You are a resume change summarizer.`;

const buildChangesSummaryPrompt = (baseResumeText, optimizedResumeText) => {
  return `Given the original resume and the optimized resume, produce:
1) A short 8-12 word headline of the main change (e.g., "Added Excel and data analysis keywords")
2) A 2-3 sentence summary of what changed and why it helps for the job.
3) A bulleted list of added keywords or phrases (5-12 items).

Original:
${baseResumeText}

Optimized:
${optimizedResumeText}

Provide your response in this exact JSON format:
{
  "headline": "your headline here",
  "summary": "your 2-3 sentence summary here",
  "keywordsAdded": ["keyword1", "keyword2", "keyword3", "..."]
}`;
};

module.exports = {
  OPTIMIZATION_SYSTEM_PROMPT,
  buildOptimizationPrompt,
  CHANGES_SUMMARY_SYSTEM_PROMPT,
  buildChangesSummaryPrompt,
};
