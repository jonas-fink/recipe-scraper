import type { Ingredient } from '../api/recipes';

// Zutaten, die in einem Kochschritt vorkommen (für den Kochmodus).
// Vergleicht Wortstämme: Wörter ab 4 Buchstaben, Endung (2 Zeichen) abgeschnitten,
// damit "passierte Tomaten" auch "passierten Tomaten" trifft.
// ponytail: naive Heuristik — Füllwörter im Namen ("frisch") können falsch treffen,
// kurze Namen ("Ei") nie. Bei Bedarf Zuordnung pro Schritt im Rezept speichern.
export const stepIngredients = (
    step: string,
    ingredients: Ingredient[],
): Ingredient[] => {
    const text = step.toLowerCase();
    return ingredients.filter((ing) =>
        ing.name
            .toLowerCase()
            .split(/[^\p{L}]+/u)
            .filter((w) => w.length >= 4)
            .some((w) => text.includes(w.slice(0, Math.max(4, w.length - 2)))),
    );
};
