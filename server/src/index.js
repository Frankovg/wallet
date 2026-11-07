import { config } from './config.js';
import { app } from './app.js';

app.listen(config.port, () => {
  console.log(`API escuchando en http://localhost:${config.port}`);
});
