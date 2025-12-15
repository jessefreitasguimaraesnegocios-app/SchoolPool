import { GoogleGenAI } from "@google/genai";
import { Vehicle, Language } from "../types";

// Robust environment check for API Key
const getApiKey = (): string | undefined => {
  try {
    // Check if process exists before accessing env
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
    return undefined;
  } catch (e) {
    console.warn("Environment variable access failed:", e);
    return undefined;
  }
};

export const generateFleetReport = async (vehicles: Vehicle[], language: Language = 'en'): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return language === 'pt' 
      ? "Chave de API não configurada. Não é possível gerar insights." 
      : "API Key not configured. Unable to generate AI insights.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const langInstruction = language === 'pt' 
    ? "Reply in Portuguese (Brazil)." 
    : "Reply in English.";

  const prompt = `
    You are an intelligent fleet management assistant for a school transportation system.
    Analyze the following vehicle data and provide a concise, professional summary report for the School Director.
    Focus on delays, efficiency, and safety.
    
    ${langInstruction}
    
    Data: ${JSON.stringify(vehicles.map(v => ({
      driver: v.driverName,
      status: v.status,
      passengers: `${v.currentPassengers}/${v.capacity}`,
      etaToNext: v.nextStopEta
    })))}

    Format:
    - **Overall Status**: [Brief Summary]
    - **Critical Alerts**: [List any delays or full capacity issues]
    - **Optimization Tip**: [One suggestion for improvement]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || (language === 'pt' ? "Nenhum insight gerado." : "No insights generated.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'pt' 
      ? "Não foi possível gerar o relatório devido a um erro no serviço." 
      : "Unable to generate report due to a service error.";
  }
};