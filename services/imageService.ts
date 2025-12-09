
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const generateMedicationImage = async (name: string, description: string): Promise<string | null> => {
  if (!API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    // Specifically demanding high-contrast bold text for accessibility.
    const prompt = `A macro product photograph of a clinical medication bottle which is ${description}. The bottle has a high-contrast white label with the word "${name}" printed in massive, bold, ultra-legible black letters. The text "${name}" takes up 50% of the label space. Studio medical lighting, high fidelity, 4k.`;
    
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