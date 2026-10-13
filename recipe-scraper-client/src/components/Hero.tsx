const Hero = () => {
    return (
        <div className="flex max-w-3xl flex-col gap-4 pt-8">
            <span className="font-mono text-xs tracking-widest text-primary">
                PASTE → PARSE → COOK
            </span>
            <h1 className="text-4xl leading-[1.05] font-bold tracking-tight md:text-6xl">
                Verwandle jedes Reel in ein Rezept, das du{' '}
                <span className="text-primary">wirklich kochen</span> kannst.
            </h1>
            <p className="max-w-2xl text-text-muted md:text-lg">
                Füge einen Link von Insta, Facebook, TikTok oder z.B. Chefkoch
                ein. Wir extrahieren die Zutaten und Kochschritte und
                transformieren es in ein speicherbares Rezept.
            </p>
        </div>
    );
};

export default Hero;
