/**
 * AI-Powered Room Measurement from Photos
 * Uses GPT-4o Vision to estimate room dimensions
 */

import { getOpenAIClient } from '../api/openai';
import { logCost, isDailyCostLimitReached } from './cost-tracker';
import { sanitizeForAI, validateImageUri } from './validation';

export interface MeasurementResult {
  length: number;
  width: number;
  squareMeters: number;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
  referenceObjectDetected?: string;
}

/**
 * Analyze a room photo and estimate dimensions
 * @param imageUri - Local URI or base64 of the room photo
 * @param referenceInfo - Optional reference object info (e.g., "standard door visible")
 */
export async function measureRoomFromPhoto(
  imageUri: string,
  referenceInfo?: string
): Promise<MeasurementResult> {
  // Validate image URI
  const imageValidation = validateImageUri(imageUri);
  if (!imageValidation.isValid) {
    throw new Error(imageValidation.error || 'Invalid image');
  }

  // Sanitize reference info to prevent prompt injection
  const sanitizedReferenceInfo = referenceInfo ? sanitizeForAI(referenceInfo, 200) : undefined;

  // Check daily cost limit ($5 default)
  const limitReached = await isDailyCostLimitReached(5);
  if (limitReached) {
    throw new Error('Daily AI measurement limit reached. Please try again tomorrow or enter measurements manually.');
  }

  const systemPrompt = `You are an expert at estimating room dimensions from photos. 

Your task:
1. Analyze the room photo carefully
2. Look for reference objects like doors (standard 2m height, 0.8m width), windows, furniture
3. Estimate the room's length and width in meters
4. Calculate square meters (length × width)
5. Provide confidence level (high/medium/low) based on:
   - high: Clear reference objects visible, good angle
   - medium: Some references but unclear angle/lighting
   - low: Poor angle, no clear references

Standard reference measurements:
- Standard door: 2.0m height, 0.8m width
- Standard window: 1.2m height, 1.0m width
- Standard ceiling: 2.4m height (modern), 2.7m (Victorian)
- Average sofa: 2m length
- Average bed: 2m length (double), 1.9m (single)

Return ONLY valid JSON in this exact format:
{
  "length": 4.5,
  "width": 3.2,
  "squareMeters": 14.4,
  "confidence": "high",
  "explanation": "Estimated based on standard door (2m) visible in frame. Room appears to be 2.5 door-widths long and 2 door-widths wide.",
  "referenceObjectDetected": "standard door"
}`;

  const userPrompt = sanitizedReferenceInfo
    ? `Analyze this room photo. Reference info: ${sanitizedReferenceInfo}. Provide room measurements in JSON format.`
    : 'Analyze this room photo and estimate its dimensions. Provide measurements in JSON format.';

  try {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: imageUri } }
          ] as any
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '';

    // Log the cost
    await logCost('AI_ROOM_MEASUREMENT', {
      details: `Room measurement ${referenceInfo ? 'with reference' : ''}`,
    });

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result: MeasurementResult = JSON.parse(jsonMatch[0]);

    // Validate result
    if (!result.length || !result.width || !result.squareMeters) {
      throw new Error('Invalid measurement result');
    }

    // Sanity check: rooms should be between 2-20 sqm typically
    if (result.squareMeters < 2 || result.squareMeters > 100) {
      result.confidence = 'low';
      result.explanation += ' Warning: Measurement outside typical range.';
    }

    return result;
  } catch (error) {
    console.error('AI measurement error:', error);
    throw new Error('Failed to measure room from photo. Please try manual entry.');
  }
}

/**
 * Batch measure multiple room photos
 */
export async function measureMultipleRooms(
  imageUris: string[]
): Promise<MeasurementResult[]> {
  const results: MeasurementResult[] = [];

  for (const uri of imageUris) {
    try {
      const result = await measureRoomFromPhoto(uri);
      results.push(result);
    } catch (error) {
      console.error(`Failed to measure room from ${uri}:`, error);
      // Continue with other photos
    }
  }

  return results;
}

/**
 * Get user-friendly tips for better photo measurements
 */
export function getPhotoTips(): string[] {
  return [
    '📸 Stand in a corner to capture the full room',
    '🚪 Include a door or window for scale reference',
    '💡 Use good lighting - avoid shadows',
    '📐 Take photo at eye level, not tilted',
    '🛋️ Include furniture for size context',
    '✨ Clear photo - avoid blurriness',
  ];
}

/**
 * Validate if an image is suitable for measurement
 */
export async function validatePhotoQuality(imageUri: string): Promise<{
  suitable: boolean;
  issues: string[];
  suggestions: string[];
}> {
  const systemPrompt = `You are a photo quality validator for room measurement. Analyze if the photo is suitable for estimating room dimensions.

Check for:
1. Lighting quality
2. Image clarity/blur
3. Viewing angle (corner view is best)
4. Reference objects visible (doors, windows, furniture)
5. Room coverage (can you see most of the room?)

Return ONLY valid JSON:
{
  "suitable": true/false,
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

  try {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Is this photo suitable for room measurement?' },
            { type: 'image_url', image_url: { url: imageUri } }
          ] as any
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '';

    // Log the cost
    await logCost('AI_PHOTO_VALIDATION', {
      details: 'Photo quality check',
    });

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in validation response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Photo validation error:', error);
    // Default to allowing the photo
    return {
      suitable: true,
      issues: [],
      suggestions: ['Ensure good lighting and include reference objects like doors'],
    };
  }
}
