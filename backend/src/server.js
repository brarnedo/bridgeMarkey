import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { authRouter } from './routes/auth.routes.js';
import { catalogoRouter } from './routes/catalogo.routes.js';
import { ejecutarRouter } from './routes/ejecutar.routes.js';

const app = express();

app.use(cors({ origin: config.frontendUrl }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ success: true, data: { estado: 'ok', dataSource: config.dataSource } }));

app.use('/api/auth', authRouter);
app.use('/api/catalogo', catalogoRouter);
app.use('/api/ejecutar', ejecutarRouter);

// Manejador de errores centralizado — cualquier `next(err)` cae acá.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: { code: 'ERROR_SERVIDOR', message: 'Ocurrió un error inesperado.' } });
});

app.listen(config.port, () => {
  console.log(`Markey Connect backend escuchando en :${config.port} (dataSources=${config.dataSource})`);
});
