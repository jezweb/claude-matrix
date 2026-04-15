// Build script: reads content.yaml and generates content.json for the worker
import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'yaml';

const yaml = readFileSync('src/content.yaml', 'utf-8');
const content = parse(yaml);
writeFileSync('src/content.json', JSON.stringify(content, null, 2));
console.log('Generated src/content.json from src/content.yaml');
