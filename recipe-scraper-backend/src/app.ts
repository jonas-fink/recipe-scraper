import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from '#middlewares';
import { recipeRouter, userRouter, authRouter } from '#routes';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);

app.use('/api/v1/recipes', recipeRouter);

// errorHandler muss NACH allen Routen stehen, sonst fängt er nichts.
app.use('*splat', (req, res) => res.status(404).json({ message: 'Not Found' }));
app.use(errorHandler);

export default app;
