import { GoogleGenAI, Type } from "@google/genai";
import { AiPlanResponse } from '../types';

// NOTE: We do NOT initialize the client globally here.
// Doing so causes the app to crash immediately if the API key is missing.

export const generateEventPlan = async (
  eventType: string, 
  budget: string, 
  preferences: string
): Promise<AiPlanResponse> => {
  try {
    // 1. Access the key inside the function scope
    const apiKey = process.env.API_KEY;

    // 2. Check if key exists
    if (!apiKey) {
      console.warn("Gemini API Key is missing. Switching to offline fallback mode.");
      throw new Error("API Key is missing");
    }

    // 3. Initialize the client only when needed
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Act as an expert event planner for "Tirupalappa Events".
      Create a brief event plan for a ${eventType}.
      Budget Level: ${budget}.
      Preferences: ${preferences}.
      
      Provide a creative theme name, a list of 4 specific decoration/activity suggestions, and an estimated budget range in INR.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            suggestions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            estimatedBudgetRange: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as AiPlanResponse;
    }
    throw new Error("No response from AI");

  } catch (error) {
    console.error("AI Planning Error:", error);
    // Return fallback data so the user still sees a result
    return {
      theme: "Classic Celebration (Offline Mode)",
      suggestions: ["Standard Floral Decor", "Buffet Setup", "Welcome Drinks", "Light Music"],
      estimatedBudgetRange: "Consult for price"
    };
  }
};
