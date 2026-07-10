import { db } from '@foodmart/database';
import { env } from '../config/env';

/**
 * Background job to analyze a complaint using Google Gemini API.
 * Called fire-and-forget after a complaint is saved to the database.
 * Uses fetch directly — no SDK dependency needed.
 */
export async function analyzeComplaint(complaintId: string): Promise<void> {
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn(`[Gemini] GEMINI_API_KEY not set. Skipping analysis for complaint: ${complaintId}`);
    return;
  }

  try {
    // Fetch the complaint from DB
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      console.error(`[Gemini] Complaint not found: ${complaintId}`);
      return;
    }

    if (complaint.isAnalyzed) {
      console.log(`[Gemini] Complaint already analyzed: ${complaintId}`);
      return;
    }

    const prompt = `You are a restaurant complaint analysis system. Analyze the following customer complaint and return a JSON object with these fields:

- "category": One of: FOOD_QUALITY, SERVICE, WAIT_TIME, BILLING, CLEANLINESS, STAFF_BEHAVIOR, ORDER_ACCURACY, OTHER
- "sentiment": One of: POSITIVE, NEGATIVE, NEUTRAL
- "language": The detected language (e.g., "English", "Hindi", "Gujarati")
- "summary": A brief English summary of the complaint (max 100 words)
- "keywords": An array of 3-5 relevant keywords
- "urgency": One of: LOW, MEDIUM, HIGH, CRITICAL

Customer complaint text:
"""
${complaint.rawText}
"""

${complaint.rating ? `Customer rating: ${complaint.rating}/5` : ''}

Return ONLY valid JSON, no markdown fences, no explanation.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Gemini] API error (${response.status}): ${errorText}`);
      return;
    }

    const geminiResponse = await response.json();

    // Extract the generated text
    const generatedText = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error(`[Gemini] No generated text in response for complaint: ${complaintId}`);
      return;
    }

    // Parse the JSON response
    let analysis: any;
    try {
      // Clean up any markdown fences if present
      const cleanText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error(`[Gemini] Failed to parse response JSON for complaint ${complaintId}:`, generatedText);
      return;
    }

    // Validate and map fields
    const validCategories = ['FOOD_QUALITY', 'SERVICE', 'WAIT_TIME', 'BILLING', 'CLEANLINESS', 'STAFF_BEHAVIOR', 'ORDER_ACCURACY', 'OTHER'];
    const validSentiments = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'];
    const validUrgencies = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    const category = validCategories.includes(analysis.category) ? analysis.category : 'OTHER';
    const sentiment = validSentiments.includes(analysis.sentiment) ? analysis.sentiment : 'NEUTRAL';
    const urgency = validUrgencies.includes(analysis.urgency) ? analysis.urgency : 'MEDIUM';
    const language = typeof analysis.language === 'string' ? analysis.language : 'Unknown';
    const summary = typeof analysis.summary === 'string' ? analysis.summary.slice(0, 500) : '';
    const keywords = Array.isArray(analysis.keywords)
      ? analysis.keywords.filter((k: any) => typeof k === 'string').slice(0, 10)
      : [];

    // Update complaint record in DB
    await db.complaint.update({
      where: { id: complaintId },
      data: {
        category,
        sentiment,
        urgency,
        language,
        summary,
        keywords,
        isAnalyzed: true,
      },
    });

    console.log(`[Gemini] Successfully analyzed complaint ${complaintId}: category=${category}, sentiment=${sentiment}, urgency=${urgency}`);
  } catch (err) {
    console.error(`[Gemini] Unhandled error analyzing complaint ${complaintId}:`, err);
    // Leave isAnalyzed = false so it can be retried or manually reviewed
  }
}
