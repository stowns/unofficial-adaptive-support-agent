import { readdirSync } from 'fs';
import { join } from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";
import { VectorSource } from './vector-source.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get all .ts files in current directory (excluding index.ts)
const files = readdirSync(__dirname)
  .filter(file => file.endsWith('.ts') && file !== 'index.ts' && file !== 'vector-source.ts');

const sources: { [id: string]: () => {} } = {}
// Dynamically import each file
for (const file of files) {
  const modulePath = join(__dirname, file);
  const module = await import(modulePath);
  const vs = module.default as VectorSource;
  // Access exports from the module
  sources[vs.id] = vs.load;
}

export default sources;