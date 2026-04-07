import axios from 'axios';
import https from 'https';

// In development, corporate proxies often perform SSL inspection with a CA that
// Node.js doesn't trust. Use a permissive agent only when not in production.
const httpsAgent =
  process.env.NODE_ENV !== 'production'
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

const instance = axios.create({ httpsAgent });

export default instance;
