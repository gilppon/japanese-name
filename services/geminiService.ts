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
        description: 'A profound, poetic explanation in English. MUST include a breakdown of EACH Kanji character and how their combination creates a unique spiritual identity.',
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
            text: `Design an authentic, professional Japanese square seal (Hanko/Inkan) in traditional "Shubun" (朱文) style.
            
            Key visual attributes:
            - Content: ONLY the characters "${kanji}" in classic, thick "Tensho-tai" (Ancient Seal Script) calligraphy.
            - Layout: Square shape with a matching formal border.
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
    ? `For the "meaning" field, create a MAGNIFICENT NARRATIVE in Korean:
       - First, explicitly define the meaning of EACH Kanji character used (e.g., '光 (hikari) — 빛, 광채').
       - Include the On'yomi (Chinese reading) and Kun'yomi (Japanese reading) for each character in the format: '光 (kou) — On'yomi: コウ (kou) | Kun'yomi: ひかり (hikari)'.
       - Then, weave them into a poetic story in Korean that justifies why this specific combination matches the chosen style.
       - Use an evocative and premium tone (e.g., "마치 별빛이 내려앉듯...").`
    : `For the "meaning" field, create a MAGNIFICENT NARRATIVE in English:
       - First, explicitly define the meaning of EACH Kanji character used (e.g., '光 (hikari) — light, radiance').
       - Include the On'yomi (Chinese reading) and Kun'yomi (Japanese reading) for each character.
       - Then, weave them into a poetic story that justifies why this specific combination matches the chosen style.
       - The tone should be evocative and premium, making the user feel a deep connection to the name.`;

  const prompt = `
    Task: Create 4 unique Japanese Kanji name suggestions based on the English name "${englishName}" and the style "${style}".

    Context for Styles:
    - Pop: Vibrant, modern, and energetic Kanji. Often uses characters associated with light, stars, or current trends.
    - Minimal: Clean, sophisticated, and easy-to-read Kanji with fewer strokes. Minimalist elegance.
    - Feminine: Soft, graceful, and beautiful Kanji. Often related to flowers (Hana), seasons, or gentle emotions.
    - Traditional: Dignified, classic, and historic Kanji. Reflects deep cultural heritage and strong virtues.

    Constraints:
    1. The name must phonetically resemble "${englishName}".
    2. Use only Kanji with positive or beautiful meanings.
    3. Ensure the names sound natural as Japanese names.
    4. Provide exactly 4 diverse candidates.
    5. ${langInstruction}

    ===== CRITICAL SAFETY GUARDRAILS =====
    6. ONLY use Kanji from the official Jinmeiyō Kanji (人名用漢字) and Jōyō Kanji (常用漢字) lists — characters legally approved for Japanese names.
    7. ABSOLUTELY NEVER use Kanji associated with: death (死), suffering (苦), evil (悪/魔), illness (病), poverty (貧), decay (腐), destruction (壊/滅), demons (鬼), poison (毒), war casualties (屍), misfortune (災/厄), ugliness (醜), slavery (奴), or any other negative, vulgar, or ominous meaning.
    8. After generating each name, perform a SELF-CHECK: verify that the combined Kanji do NOT form any Japanese slang, vulgar expression, unfortunate homophone (同音異義語), or culturally inappropriate phrase. If any candidate fails this check, replace it with a safe alternative.
    9. Each Kanji character chosen must individually carry a beautiful, auspicious, or noble meaning (e.g., light 光, beauty 美, wisdom 智, flower 花, sky 空, harmony 和, truth 真).
    =====================================

    Return the output as a JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
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
