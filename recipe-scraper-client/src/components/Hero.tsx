import { Pill } from './hero/Pill';

const Hero = () => {
    return (
        <div className="flex flex-col gap-8 pt-32">
            <div className="flex items-center justify-center">
                <Pill>Paste · Parse · Cook</Pill>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center max-w-3xl">
                <h1 className="text-5xl text-center">
                    Turn any food video into a recipe you can{' '}
                    <span className="bg-linear-to-br from-mint to-azure bg-clip-text text-transparent">
                        actually cook
                    </span>
                </h1>
                <p className="font-sans text-text-muted font-semibold text-md text-center">
                    Drop a link from Instagram, Facebook or TikTok. We pull the
                    ingredients and steps into a clean, saveable card.
                </p>
            </div>
        </div>
    );
};

export default Hero;
