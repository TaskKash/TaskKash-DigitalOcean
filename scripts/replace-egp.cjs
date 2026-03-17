const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../client/src');
const EXCLUDE_DIRS = ['contexts', 'lib', 'hooks'];

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        findFiles(path.join(dir, file), fileList);
      }
    } else if (file.endsWith('.tsx') && !file.endsWith('.test.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

function processFiles() {
  const files = findFiles(SRC_DIR);
  let changedFilesCount = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('EGP') && !content.includes('ج.م')) continue;

    // We have EGP, we need to modify this file.
    console.log(`Processing: ${path.relative(SRC_DIR, file)}`);
    
    // 1. Add import
    if (!content.includes('useCurrency')) {
      // Find the last import
      const importMatches = [...content.matchAll(/^import .* from .*$/gm)];
      if (importMatches.length > 0) {
        const lastImport = importMatches[importMatches.length - 1];
        const insertPos = lastImport.index + lastImport[0].length;
        content = content.slice(0, insertPos) + '\nimport { useCurrency } from "@/contexts/CurrencyContext";' + content.slice(insertPos);
      } else {
        content = 'import { useCurrency } from "@/contexts/CurrencyContext";\n' + content;
      }
    }

    // 2. Add hook to component
    // Find "export default function Component" or "export function Component"
    const compRegex = /(export(?:\s+default)?\s+function\s+[A-Z][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{)/;
    const match = content.match(compRegex);
    if (match) {
      if (!content.includes('const { currency, symbol, formatAmount }')) {
        const insertPos = match.index + match[0].length;
        content = content.slice(0, insertPos) + '\n  const { currency, symbol, formatAmount } = useCurrency();' + content.slice(insertPos);
      }
    }

    // 3. Simple text replacements
    // " EGP" -> " {symbol}" (using symbol for display instead of 'EGP' or {currency})
    // "(EGP)" -> "({symbol})"
    content = content.replace(/ EGP/g, " {symbol}");
    content = content.replace(/\(EGP\)/g, "({currency})");
    content = content.replace(/'EGP'/g, "currency");
    content = content.replace(/"EGP"/g, "currency");
    content = content.replace(/`([^`]*?)EGP([^`]*?)`/g, "`$1${symbol}$2`");
    
    // Arabic replacements
    content = content.replace(/ ج\.م/g, " {symbol}");
    content = content.replace(/'ج\.م'/g, "symbol");
    content = content.replace(/"ج\.م"/g, "symbol");
    content = content.replace(/`([^`]*?)ج\.م([^`]*?)`/g, "`$1${symbol}$2`");

    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
  }
  console.log(`Updated ${changedFilesCount} files.`);
}

processFiles();
