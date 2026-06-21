import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from '#middlewares';
import { recipeRouter } from '#routes';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(express.json());
app.use(cookieParser());

app.use('/api/recipes', recipeRouter);

// errorHandler muss NACH allen Routen stehen, sonst fängt er nichts.
app.use(errorHandler);

export default app;
