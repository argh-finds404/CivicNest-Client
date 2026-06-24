const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'components');

const replaceRules = [
  // Typography scale down
  // Base text -> Small text
  { rx: /\btext-base\b/g, replace: 'text-sm' },
  // Small text -> 13px (often used for secondary info)
  // We need to be careful not to double replace if we just replaced text-base to text-sm.
  // Actually, wait! If we do text-base -> text-sm, then the next rule text-sm -> text-[13px] will chain!
  // To avoid chaining, we use temporary tokens.
];

const chainedReplaceRules = [
  { rx: /\btext-sm\b/g, replace: '__TMP_TEXT_13__' },
  { rx: /\btext-base\b/g, replace: '__TMP_TEXT_SM__' },
  { rx: /\btext-lg\b/g, replace: '__TMP_TEXT_BASE__' },
  { rx: /\btext-xl\b/g, replace: '__TMP_TEXT_LG__' },
  
  // Refine Border Radii
  { rx: /\brounded-3xl\b/g, replace: '__TMP_ROUNDED_XL__' },
  { rx: /\brounded-2xl\b/g, replace: '__TMP_ROUNDED_LG__' },
];

const resolveTmpRules = [
  { rx: /__TMP_TEXT_13__/g, replace: 'text-[13px]' },
  { rx: /__TMP_TEXT_SM__/g, replace: 'text-sm' },
  { rx: /__TMP_TEXT_BASE__/g, replace: 'text-base' },
  { rx: /__TMP_TEXT_LG__/g, replace: 'text-lg tracking-tight' },
  { rx: /__TMP_ROUNDED_XL__/g, replace: 'rounded-xl' },
  { rx: /__TMP_ROUNDED_LG__/g, replace: 'rounded-lg' },
];

let modifiedFilesCount = 0;

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      // Apply chained replacements
      for (const rule of chainedReplaceRules) {
        content = content.replace(rule.rx, rule.replace);
      }
      
      // Resolve temp tokens
      for (const rule of resolveTmpRules) {
        content = content.replace(rule.rx, rule.replace);
      }

      // Ensure all large headings have tracking-tight
      content = content.replace(/\b(text-2xl|text-3xl|text-4xl|text-5xl)\b/g, (match) => {
        return `${match} tracking-tight`;
      });
      // Deduplicate tracking-tight
      content = content.replace(/tracking-tight(\s+tracking-tight)+/g, 'tracking-tight');

      // Add subtle ring to standard cards
      // Only replacing the most generic card backgrounds to ensure we don't break layouts
      content = content.replace(/bg-white dark:bg-\[#111c21\]/g, 'bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]');
      content = content.replace(/dark:bg-\[#111c21\]/g, 'dark:bg-[#0a120e]');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        modifiedFilesCount++;
        console.log(`Modified: ${fullPath.replace(__dirname, '')}`);
      }
    }
  }
}

console.log('Starting SaaS style upgrade...');
processDirectory(targetDir);
console.log(`\nCompleted! Modified ${modifiedFilesCount} files.`);
