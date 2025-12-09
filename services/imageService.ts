
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const generateMedicationImage = async (name: string, description: string): Promise<string | null> => {
  if (!API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const prompt = `A professional, clinical studio photograph of a ${description}. The bottle has a clean white pharmacy label with the word "${name}" printed clearly and legibly in bold, professional black font. Soft neutral background, medical quality lighting, high resolution.`;
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};
