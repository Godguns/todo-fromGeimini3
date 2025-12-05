import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const parseTaskFromText = async (text: string, referenceDate: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Parse this task request: "${text}". The current date is ${referenceDate}. Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The task description" },
            date: { type: Type.STRING, description: "YYYY-MM-DD format" },
            time: { type: Type.STRING, description: "HH:mm format (24h)" },
            hasAlarm: { type: Type.BOOLEAN }
          },
          required: ["title", "date", "hasAlarm"]
        }
      }
    });

    if (response.text) {
      // Clean up markdown code blocks if present (e.g. ```json ... ```)
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');
      }
      return JSON.parse(cleanText);
    }
    return null;
  } catch (error) {
    console.error("Gemini parse error:", error);
    return null;
  }
};