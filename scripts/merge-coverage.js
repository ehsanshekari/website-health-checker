const fs = require('fs');
const path = require('path');
const { createCoverageMap } = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function fileExists(p) {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

const root = path.resolve(__dirname, '..');

function findCoverageJsonFiles(searchRoot) {
  const results = [];
  const excludeDirs = new Set(['node_modules', '.git', '.pnpm']);
  const rootCoverageDir = path.join(searchRoot, 'coverage');

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (excludeDirs.has(entry.name)) continue;
        walk(fullPath);
      } else if (
        entry.name === 'coverage-final.json' &&
        path.basename(path.dirname(fullPath)) === 'coverage' &&
        path.dirname(fullPath) !== rootCoverageDir
      ) {
        results.push(fullPath);
      }
    }
  }

  walk(searchRoot);
  // Deduplicate
  return Array.from(new Set(results)).filter(fileExists);
}

const inputs = findCoverageJsonFiles(root);

if (inputs.length === 0) {
  console.error('No coverage JSON files found to merge.');
  process.exit(1);
}

const coverageMap = createCoverageMap({});
for (const input of inputs) {
  const data = readJson(input);
  coverageMap.merge(data);
}

const outDir = path.join(root, 'coverage');
fs.mkdirSync(outDir, { recursive: true });

const context = libReport.createContext({ dir: outDir, coverageMap });
const html = reports.create('html');
html.execute(context);

console.log('Merged sources:', inputs.map(p => path.relative(root, p)));
console.log('Merged HTML coverage generated at', path.join(outDir, 'index.html'));
