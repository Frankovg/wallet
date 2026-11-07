import { config } from './config.ts';
import { app } from './app.ts';

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
