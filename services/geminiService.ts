
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

const API_KEY = process.env.API_KEY || '';

export const getGeminiResponse = async (prompt: string, base64Image?: string): Promise<string> => {
  if (!API_KEY) return "API Key not configured.";

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const parts: any[] = [{ text: prompt }];
    if (base64Image) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I had trouble connecting to my brain. Please try again.";
  }
};

export const verifyContainer = async (base64Image: string, expectedDesc: string): Promise<{ match: boolean; confidence: number; label: string }> => {
  if (!API_KEY) return { match: false, confidence: 0, label: "API offline" };

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Identify this medication container. Does it match this description: "${expectedDesc}"? Return JSON matching: { "match": boolean, "confidence": number, "label": string }`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            match: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            label: { type: Type.STRING }
          },
          required: ["match", "confidence", "label"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      match: result.match || false,
      confidence: result.confidence || 0,
      label: result.label || "Unknown"
    };
  } catch (error) {
    console.error("Verification Error:", error);
    return { match: false, confidence: 0, label: "Error" };
  }
};
