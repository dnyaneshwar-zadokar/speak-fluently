import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Current directory:', __dirname);
console.log('Files in current directory:', fs.readdirSync(__dirname));
console.log('Models directory exists:', fs.existsSync(join(__dirname, 'models')));
if (fs.existsSync(join(__dirname, 'models'))) {
  console.log('Files in models directory:', fs.readdirSync(join(__dirname, 'models')));
}