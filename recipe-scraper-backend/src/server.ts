import { connectDB, validateEnv } from '#config';
import app from './app.ts';

validateEnv();

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
});
