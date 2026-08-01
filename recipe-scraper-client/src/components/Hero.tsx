import { Pill } from './hero/Pill';

const Hero = () => {
    return (
        <div className="flex flex-col gap-8  pt-8">
            <div className="flex items-center justify-center">
                <Pill>Paste · Parse · Cook</Pill>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center max-w-3xl">
                <h1 className="text-5xl text-center">
                    Verwandle jedes Reel in ein Rezept dass du{' '}
                    <span className="bg-linear-to-br from-mint to-azure bg-clip-text text-transparent">
                        wirklich kochen{' '}
                    </span>
                    kannst
                </h1>
                <p className="font-sans text-text-muted font-semibold text-md text-center">
                    Füge einen Link von Insta, Facebook oder TikTok ein. Wir
                    extrahieren die Zutaten und Kochschritte und transformieren
                    es in ein speicherbares Rezept.
                </p>
            </div>
        </div>
    );
};

export default Hero;
