import { GoogleGenAI, Type } from '@google/genai';
import { recipeSchema, CATEGORIES, type Recipe } from '#schemas';

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
        category: { type: Type.STRING, nullable: true, enum: [...CATEGORIES] },
        cookTimeMinutes: { type: Type.NUMBER, nullable: true },
        servings: { type: Type.NUMBER, nullable: true },
    },
    required: [
        'title',
        'ingredients',
        'instructions',
        'category',
        'cookTimeMinutes',
        'servings',
    ],
};

const PROMPT = `Du extrahierst aus dem folgenden Social-Media-Text ein Kochrezept.
Gib Mengen als Zahl in "amount" und die Einheit (g, ml, Stück, EL, …) in "unit" an;
wenn keine Menge/Einheit genannt wird, setze den Wert auf null. Übersetze nichts,
behalte die Originalsprache. Ignoriere Hashtags, Emojis und Werbung.

Wähle "category" aus genau dieser Liste: ${CATEGORIES.join(', ')}.
Gib "cookTimeMinutes" als Gesamtzeit in Minuten (Zahl) und "servings" als Anzahl
Portionen (Zahl) an. Setze category, cookTimeMinutes oder servings auf null, wenn
die Information im Text nicht eindeutig genannt wird.

TEXT:
`;

// ponytail: Keys komma-getrennt aus einer env-Var; bei Quota (429) nächster Key.
// Kein Pool-Manager/Round-Robin — reihum-Retry reicht gegen Free-Tier-Limits.
let clients: GoogleGenAI[] | null = null;
const getClients = (): GoogleGenAI[] => {
    if (!clients) {
        const keys = (process.env.GEMINI_API_KEY ?? '')
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean);
        if (keys.length === 0) {
            throw new Error('GEMINI_API_KEY fehlt', { cause: { status: 500 } });
        }
        clients = keys.map((apiKey) => new GoogleGenAI({ apiKey }));
    }
    return clients;
};

const isQuotaError = (err: unknown): boolean => {
    const s = String(err);
    return s.includes('429') || s.includes('RESOURCE_EXHAUSTED');
};

export const parseRecipe = async (text: string): Promise<Recipe> => {
    let raw: string | undefined;
    let lastErr: unknown;
    for (const client of getClients()) {
        try {
            const res = await client.models.generateContent({
                model: MODEL,
                contents: PROMPT + text,
                config: { responseMimeType: 'application/json', responseSchema },
            });
            raw = res.text;
            break;
        } catch (err) {
            lastErr = err;
            if (isQuotaError(err)) continue; // nächster Key
            break; // echter Fehler -> nicht weiter probieren
        }
    }

    if (raw === undefined && lastErr !== undefined) {
        throw new Error(`KI-Parsing fehlgeschlagen: ${String(lastErr)}`, {
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
