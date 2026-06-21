import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler, validateBody, validateQuery } from '#middlewares';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);

export default app;
