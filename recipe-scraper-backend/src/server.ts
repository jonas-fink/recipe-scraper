import { connectDB } from '#config';
import app from './app.ts';

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
});
