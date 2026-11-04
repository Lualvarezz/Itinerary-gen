import app from './app.js';
import { env } from './config/env.js';
import { ensureScheduleCoverage } from './utils/scheduleGenerator.js';

app.listen(env.port, async () => {
  console.log(`API listening on port ${env.port}`);
  await ensureScheduleCoverage();
});
