import { GoogleGenAI, Type } from "@google/genai";
import { AiPlanResponse } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEventPlan = async (
  eventType: string, 
  budget: string, 
  preferences: string
): Promise<AiPlanResponse> => {
  try {
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
    return {
      theme: "Classic Celebration",
      suggestions: ["Standard Floral Decor", "Buffet Setup", "Welcome Drinks", "Light Music"],
      estimatedBudgetRange: "Consult for price"
    };
  }
};