import { GoogleGenAI, Type } from "@google/genai";
import type { NameCandidate, Style } from '../types';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      kanji: {
        type: Type.STRING,
        description: 'The generated Kanji name (usually 2-4 characters).',
      },
      hiragana: {
        type: Type.STRING,
        description: 'The Hiragana reading of the name.',
      },
      meaning: {
        type: Type.STRING,
        description: 'A concise 1-sentence summary of the combined Kanji meaning (e.g., "Light of the Azure Sky").',
      },
    },
    required: ['kanji', 'hiragana', 'meaning'],
  },
};

export const generateHanko = async (kanji: string, font: string, meaning: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            text: `Design an authentic, professional Japanese CIRCULAR seal (Hanko/Inkan) in traditional "Shubun" (朱文) style.
            
            CRITICAL LAYOUT INSTRUCTION:
            The outer boundary must be a SINGLE ROUND CIRCLE (a thick, solid red circular ring). The Kanji characters must be composed to fill the space INSIDE this circle directly, expanding to meet the circular edges. 
            ABSOLUTELY NO square frames or internal boxes. Do NOT draw a square stamp inside a circle. The ONLY border is the outer circular edge itself.
            
            Key visual attributes:
            - Content: ONLY the characters "${kanji}" in classic, thick "Tensho-tai" (Ancient Seal Script) calligraphy, elegantly stretched and arranged to fit the circular shape (known as Maruin or Jitsuin style).
            - Texture: Realistic, grainy vermilion ink impression. It must look like it was hand-carved from stone or wood and stamped onto paper, with subtle ink bleed and organic, imperfect edges.
            - Colors: Deep vermilion red ink (#D50500) on a pure white background.
            - Perspective: Straight top-down view.
            
            Do NOT provide a digital-looking badge or flat icon. It must look like a high-quality physical stamp impression.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
         // Return raw base64 (sharp processing will happen in server.ts)
         return part.inlineData.data;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating Hanko image:", error);
    throw error;
  }
};

export const generateKamon = async (meaning: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview', // Pro does not support image generation natively yet
      contents: {
        parts: [
          {
            text: `Design an ORIGINAL family crest (Kamon) inspired by the Sengoku period aesthetic, representing this concept: ${meaning}.

CRITICAL RULES:
- DO NOT copy or replicate any real historical Japanese family crest (e.g., Tokugawa Aoi, Oda Mokko, Toyotomi Kiri, Takeda Hishi). This must be a completely NEW and UNIQUE design.
- Use traditional geometric motifs (chrysanthemum petals, bamboo joints, ocean waves, crane silhouettes, maple leaves, mountain peaks) as building blocks, but REINTERPRET them into a never-before-seen composition.
- The crest must symbolically reflect the meaning provided above in a creative, abstract way.
- Style: Minimalist stark black and white stencil art, precise vector-like aesthetic, circular frame, elegant and dignified.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating Kamon:", error);
    throw error;
  }
};

export const generateLore = async (
  kanji: string,
  meaning: string,
  birthday: string,
  personality: string[],
  gender: string,
  locale: string = 'en'
): Promise<string> => {
  const birthDate = new Date(birthday);
  const month = birthDate.getMonth() + 1;
  const season = month <= 2 || month === 12 ? '冬 (Winter)' :
                 month <= 5 ? '春 (Spring)' :
                 month <= 8 ? '夏 (Summer)' : '秋 (Autumn)';

  const langInstruction = locale === 'ko'
    ? `Write in Korean with occasional Japanese terms in parentheses for cultural flavor.
       Example season tie: "겨울에 태어난 자는 역경 속에서도 빛을 잃지 않는다."
       Use 200-250 Korean characters max.`
    : `Write in evocative English with occasional Japanese terms (romaji + kanji in parentheses) for cultural flavor.
       Example season tie: "Those born in winter never lose their light, even amidst the fiercest storms."
       Use 150-200 English words max.`;

  const prompt = `
You are a master Japanese historian and storyteller specializing in the Sengoku period (1467-1615).

INPUTS:
- Kanji Name: ${kanji}
- Name Meaning: ${meaning}
- Birth Season: ${season} (born ${birthday})
- Core Traits: ${personality.join(', ')}
- Gender: ${gender}

TASK:
Write a deeply personalized, evocative narrative (家門叙事 / Family Lore) that:

1. Opens with a specific year and setting from the Sengoku period (1467-1615).
2. Connects the NAME's MEANING to a legendary (but fictional) warrior lineage that embodies the user's personality traits.
3. Weaves the BIRTH SEASON into destiny.
4. References the user's chosen personality traits as the spiritual pillars of this fictional clan.
5. Ends with a poetic sentence linking all elements to the Kamon (family crest) they are about to receive.

LANGUAGE & FORMAT:
${langInstruction}

CRITICAL RULES:
- Do NOT reference any real historical figures (no Tokugawa, Oda, Toyotomi, etc.).
- Create a FICTIONAL but believable clan lineage.
- Tone: Majestic, poetic, deeply personal. The reader should feel this was written exclusively for them.
- Keep it concise but powerful — every sentence must carry emotional weight.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating Lore:", error);
    throw error;
  }
};

export const generateNames = async (englishName: string, style: Style, locale: string = 'en'): Promise<NameCandidate[]> => {
  const langInstruction = locale === 'ko'
    ? `For the "meaning" field: Write a single concise Korean sentence (15 words max) that poetically captures the combined meaning of the Kanji characters. Example: "새벽 하늘에 빛나는 고귀한 별". Do NOT include readings or character breakdowns.`
    : `For the "meaning" field: Write a single concise English sentence (12 words max) that poetically captures the combined meaning of the Kanji characters. Example: "Radiant star shining upon the noble dawn". Do NOT include readings or character breakdowns.`;

  const prompt = `
    Create 4 unique Japanese Kanji name suggestions for "${englishName}" in "${style}" style.
    Styles: Pop=modern/energetic, Minimal=clean/elegant, Feminine=soft/graceful, Traditional=dignified/classic.

    Rules:
    1. Phonetically resemble "${englishName}". Use positive Kanji only. Sound natural.
    2. ${langInstruction}
    3. Use ONLY Jinmeiyō/Jōyō Kanji. NEVER use negative Kanji (死苦悪病貧鬼毒etc).
    4. Self-check: no slang, vulgar homophones, or inappropriate phrases.

    Return JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (!Array.isArray(result)) {
        throw new Error("API response is not an array.");
    }

    return result as NameCandidate[];
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate names. Please check your connection.");
  }
};

// --- Client Side Wrappers (Call the local Express API) ---

export const clientGenerateHanko = async (kanji: string, font: string, meaning: string): Promise<string> => {
  const response = await fetch('/api/generate-hanko', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kanji, font, meaning }),
  });
  if (!response.ok) throw new Error('Failed to generate hanko');
  const data = await response.json();
  return data.hankoData;
};

export const clientGenerateLore = async (
  kanji: string,
  meaning: string,
  birthday: string,
  personality: string[],
  gender: string,
  locale: string
): Promise<string> => {
  const response = await fetch('/api/generate-lore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kanji, meaning, birthday, personality, gender, locale }),
  });
  if (!response.ok) throw new Error('Failed to generate lore');
  const data = await response.json();
  return data.loreText;
};

export const clientGenerateKamon = async (meaning: string): Promise<string> => {
  const response = await fetch('/api/generate-kamon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ meaning }),
  });
  if (!response.ok) throw new Error('Failed to generate kamon');
  const data = await response.json();
  return data.kamonData;
};

export const generateKamonExplanation = async (kamonBase64: string, meaning: string, locale: string = 'en'): Promise<string> => {
  const langInstruction = locale === 'ko'
    ? `한국어로 문양의 상징적 의미를 깊이 있게 해설해 주세요 (2~3문장). 철학적이고 우아한 어조를 유지하세요.`
    : `Write an elegant and poetic explanation in English (2-3 sentences) detailing how the visual elements in this crest symbolize the meaning.`;

  const prompt = `This family crest (Kamon) was just generated based on the meaning: "${meaning}".
  Observe the visual elements in the newly created crest image provided.
  Explain how these shapes and elements represent the meaning and spirit of the clan.
  
  ${langInstruction}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/png", data: kamonBase64 } }
          ],
        }
      ],
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating Kamon explanation:", error);
    throw error;
  }
};

export const clientGenerateKamonExplanation = async (kamonBase64: string, meaning: string, locale: string): Promise<string> => {
  const response = await fetch('/api/generate-kamon-explanation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kamonBase64, meaning, locale }),
  });
  if (!response.ok) throw new Error('Failed to generate kamon explanation');
  const data = await response.json();
  return data.explanation;
};
