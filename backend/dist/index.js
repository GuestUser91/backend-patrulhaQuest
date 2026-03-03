import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import authRoutes from './routes/auth';
import patrolRoutes from './routes/patrol';
import attendanceRoutes from './routes/attendance';
import dynamicRoutes from './routes/dynamic';
const app = express();
// Middleware
app.use(cors({
    origin: true, // allow dynamic origin; front-end should send credentials
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patrols', patrolRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dynamics', dynamicRoutes);
// Serve uploaded files
app.use('/uploads', express.static('uploads'));
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada',
    });
});
// Error handler
app.use((error, req, res) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
    });
});
// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📧 Environment: ${config.server.env}`);
});
export default app;
//# sourceMappingURL=index.js.map