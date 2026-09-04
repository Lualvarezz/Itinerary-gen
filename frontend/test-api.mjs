import { api } from './src/lib/api.js';

api.get('/v1/dashboard/summary').then(r => {
  console.log('Status:', r.status);
  console.log('Data:', JSON.stringify(r.data, null, 2));
}).catch(e => console.error('Error:', e.message));