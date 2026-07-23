import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/app.config.js';
import errorMiddleware from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import tagsRoutes from './routes/tags.routes.js';
import usersRoutes from './routes/users.routes.js';
import roomsRoutes from './routes/rooms.routes.js';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/rooms', roomsRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use(errorMiddleware);

export default app;
