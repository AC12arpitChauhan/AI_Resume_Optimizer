const axios = require('axios');
const {
  OPTIMIZATION_SYSTEM_PROMPT,
  buildOptimizationPrompt,
  CHANGES_SUMMARY_SYSTEM_PROMPT,
  buildChangesSummaryPrompt,
} = require('./prompts');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

/**
 * Call Gemini API with retry and exponential backoff
 */
async function callGeminiAPI(systemPrompt, userPrompt, retries = 3) {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\n${userPrompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 seconds
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      }

      throw new Error('Invalid response structure from Gemini API');
    } catch (error) {
      const isRateLimit = error.response?.status === 429;
      const isLastAttempt = attempt === retries;

      if (isRateLimit && !isLastAttempt) {
        // Exponential backoff: 2^attempt seconds
        const waitTime = Math.pow(2, attempt) * 1000;
        console.warn(`Rate limited. Retrying in ${waitTime / 1000}s... (attempt ${attempt}/${retries})`);
        await delay(waitTime);
        continue;
      }

      if (isLastAttempt) {
        throw new Error(
          `Gemini API call failed after ${retries} attempts: ${error.message}`
        );
      }

      // For other errors, wait a bit before retry
      await delay(1000 * attempt);
    }
  }

  throw new Error('Gemini API call failed: max retries exceeded');
}

/**
 * Optimize resume using Gemini
 */
async function optimizeResume(jobDescription, baseResumeText) {
  try {
    const userPrompt = buildOptimizationPrompt(jobDescription, baseResumeText);
    const response = await callGeminiAPI(OPTIMIZATION_SYSTEM_PROMPT, userPrompt);

    // Extract optimized text between markers
    const startMarker = '---START_OPTIMIZED---';
    const endMarker = '---END_OPTIMIZED---';

    const startIndex = response.indexOf(startMarker);
    const endIndex = response.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1) {
      return response
        .substring(startIndex + startMarker.length, endIndex)
        .trim();
    }

    // Fallback: return the entire response if markers not found
    console.warn('Optimization markers not found in response, returning full text');
    return response.trim();
  } catch (error) {
    console.error('Error optimizing resume:', error);
    throw error;
  }
}

/**
 * Generate change summary using Gemini
 */
async function summarizeChanges(baseResumeText, optimizedResumeText) {
  try {
    const userPrompt = buildChangesSummaryPrompt(baseResumeText, optimizedResumeText);
    const response = await callGeminiAPI(CHANGES_SUMMARY_SYSTEM_PROMPT, userPrompt);

    // Try to parse JSON response
    try {
      // Find JSON in response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          headline: parsed.headline || 'Resume optimized for job requirements',
          summary: parsed.summary || 'Enhanced resume with relevant keywords and improved phrasing.',
          keywordsAdded: parsed.keywordsAdded || [],
        };
      }
    } catch (parseError) {
      console.warn('Could not parse JSON from changes summary, using fallback');
    }

    // Fallback response
    return {
      headline: 'Resume optimized for job requirements',
      summary: response.substring(0, 200),
      keywordsAdded: [],
    };
  } catch (error) {
    console.error('Error summarizing changes:', error);
    throw error;
  }
}

module.exports = {
  optimizeResume,
  summarizeChanges,
};
