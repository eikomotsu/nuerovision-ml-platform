import { GoogleGenAI, SchemaType } from "@google/genai";
import { DetectionResult } from "../types";

// Helper to remove data:image/jpeg;base64, prefix
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
};

export const detectObjectsInFrame = async (
  base64Image: string,
  targetClasses: string[]
): Promise<DetectionResult[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Detect the following objects in this image: ${targetClasses.join(', ')}. 
  If an object is found, return its bounding box in the format [ymin, xmin, ymax, xmax] where coordinates are normalized to 0-1000 scale.
  Only return objects from the list. If no objects are found, return an empty list.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64(base64Image),
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              label: { type: SchemaType.STRING },
              box_2d: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.NUMBER },
                description: "Bounding box [ymin, xmin, ymax, xmax] in 0-1000 scale",
              },
            },
            required: ["label", "box_2d"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as DetectionResult[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Detection Error:", error);
    return [];
  }
};

export const generateSyntheticDataPrompt = async (
  className: string
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return `A photo of a ${className}`;

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a high-quality stable diffusion prompt to generate a synthetic dataset image for object detection training. 
      The object is: "${className}". 
      Include varied lighting, backgrounds, and angles. Keep it under 50 words.`,
    });
    return response.text || `A photo of a ${className}`;
  } catch (e) {
    return `A photo of a ${className}`;
  }
};
