import 'dotenv/config';
import sources from '../store/sources/index.js';

const args = process.argv.slice(2);
const source = args[0];
console.log(source);

if (source) {
    sources[source]();
} else {
    Object.values(sources).forEach(s => s());
}