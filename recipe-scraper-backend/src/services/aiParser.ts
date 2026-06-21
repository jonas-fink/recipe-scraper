import { GoogleGenAI, Type } from '@google/genai';
import { recipeSchema, type Recipe } from '#schemas';

const MODEL = 'gemini-2.5-flash';

// Gemini-responseSchema: parallel zum Zod-recipeSchema gehalten (siehe KONVENTIONEN.md).
// Die Zod-Validierung unten bleibt die maßgebliche Quelle der Wahrheit.
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        ingredients: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.NUMBER, nullable: true },
                    unit: { type: Type.STRING, nullable: true },
                },
                required: ['name', 'amount', 'unit'],
            },
        },
        instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['title', 'ingredients', 'instructions'],
};

const PROMPT = `Du extrahierst aus dem folgenden Social-Media-Text ein Kochrezept.
Gib Mengen als Zahl in "amount" und die Einheit (g, ml, Stück, EL, …) in "unit" an;
wenn keine Menge/Einheit genannt wird, setze den Wert auf null. Übersetze nichts,
behalte die Originalsprache. Ignoriere Hashtags, Emojis und Werbung.

TEXT:
`;

let client: GoogleGenAI | null = null;
const getClient = (): GoogleGenAI => {
    if (!client) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY fehlt', { cause: { status: 500 } });
        }
        client = new GoogleGenAI({ apiKey });
    }
    return client;
};

export const parseRecipe = async (text: string): Promise<Recipe> => {
    let raw: string | undefined;
    try {
        const res = await getClient().models.generateContent({
            model: MODEL,
            contents: PROMPT + text,
            config: { responseMimeType: 'application/json', responseSchema },
        });
        raw = res.text;
    } catch (err) {
        throw new Error(`KI-Parsing fehlgeschlagen: ${String(err)}`, {
            cause: { status: 502 },
        });
    }

    if (!raw) {
        throw new Error('Leere KI-Antwort', { cause: { status: 502 } });
    }

    const parsed = recipeSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
        throw new Error('KI lieferte kein gültiges Rezept', {
            cause: { status: 422 },
        });
    }
    return parsed.data;
};
