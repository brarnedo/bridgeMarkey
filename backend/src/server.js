import app from './app.js';
import { config } from './config.js';

app.listen(config.port, () => {
  console.log(`Markey Connect backend escuchando en :${config.port} (dataSource=${config.dataSource})`);
});