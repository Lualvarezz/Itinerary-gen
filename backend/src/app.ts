import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import healthRoutes from './routes/health.routes.js';
import v1HealthRoutes from './routes/v1/health.routes.js';
import clientsRoutes from './routes/v1/clients.routes.js';
import catalogRoutes from './routes/v1/catalog.routes.js';
import hotelsRoutes from './routes/v1/hotels.routes.js';
import itinerariesRoutes from './routes/v1/itineraries.routes.js';
import dashboardRoutes from './routes/v1/dashboard.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/health', v1HealthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/clients', clientsRoutes);
app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/hotels', hotelsRoutes);
app.use('/api/v1/itineraries', itinerariesRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use(errorHandler);

export default app;
