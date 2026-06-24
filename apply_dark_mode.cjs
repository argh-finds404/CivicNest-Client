const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'components');

const replaceRules = [
  // Remove existing dark classes that we will replace
  { rx: /dark:bg-slate-[0-9]{3}/g, replace: '' },
  { rx: /dark:bg-gray-[0-9]{3}/g, replace: '' },
  { rx: /dark:text-slate-[0-9]{3}/g, replace: '' },
  { rx: /dark:text-gray-[0-9]{3}/g, replace: '' },
  { rx: /dark:border-slate-[0-9]{3}/g, replace: '' },
  { rx: /dark:border-gray-[0-9]{3}/g, replace: '' },
  { rx: /dark:text-white/g, replace: '' },
  
  // Backgrounds
  { rx: /\bbg-white\b/g, replace: 'bg-white dark:bg-[#111c21]' },
  { rx: /\bbg-slate-50\b/g, replace: 'bg-slate-50 dark:bg-[#0b1215]' },
  { rx: /\bbg-gray-50\b/g, replace: 'bg-gray-50 dark:bg-[#0b1215]' },
  { rx: /\bbg-slate-100\b/g, replace: 'bg-slate-100 dark:bg-[#1e3040]' },
  
  // Text
  { rx: /\btext-slate-900\b/g, replace: 'text-slate-900 dark:text-[#e2e8f0]' },
  { rx: /\btext-gray-900\b/g, replace: 'text-gray-900 dark:text-[#e2e8f0]' },
  { rx: /\btext-slate-800\b/g, replace: 'text-slate-800 dark:text-[#e2e8f0]' },
  { rx: /\btext-gray-800\b/g, replace: 'text-gray-800 dark:text-[#e2e8f0]' },
  
  { rx: /\btext-slate-700\b/g, replace: 'text-slate-700 dark:text-[#cbd5e1]' },
  { rx: /\btext-gray-700\b/g, replace: 'text-gray-700 dark:text-[#cbd5e1]' },
  
  { rx: /\btext-slate-600\b/g, replace: 'text-slate-600 dark:text-[#8da4b0]' },
  { rx: /\btext-gray-600\b/g, replace: 'text-gray-600 dark:text-[#8da4b0]' },
  { rx: /\btext-slate-500\b/g, replace: 'text-slate-500 dark:text-[#8da4b0]' },
  { rx: /\btext-gray-500\b/g, replace: 'text-gray-500 dark:text-[#8da4b0]' },
  
  // Borders
  { rx: /\bborder-slate-200\b/g, replace: 'border-slate-200 dark:border-[#1e3040]' },
  { rx: /\bborder-gray-200\b/g, replace: 'border-gray-200 dark:border-[#1e3040]' },
  { rx: /\bborder-slate-300\b/g, replace: 'border-slate-300 dark:border-[#1e3040]' },
  { rx: /\bborder-gray-300\b/g, replace: 'border-gray-300 dark:border-[#1e3040]' },
  
  // Dividers
  { rx: /\bdivide-slate-200\b/g, replace: 'divide-slate-200 dark:divide-[#1e3040]' },
  { rx: /\bdivide-gray-200\b/g, replace: 'divide-gray-200 dark:divide-[#1e3040]' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Clean up excess spaces first to normalize
      content = content.replace(/\s+/g, (match) => {
        if (match.includes('\n')) return match;
        return ' ';
      });

      // Apply removals first
      let newContent = content;
      for (let i = 0; i < 7; i++) {
        newContent = newContent.replace(replaceRules[i].rx, replaceRules[i].replace);
      }
      
      // Clean up multiple spaces that might have been created by removals
      newContent = newContent.replace(/ +/g, ' ');

      // Apply additions
      for (let i = 7; i < replaceRules.length; i++) {
        newContent = newContent.replace(replaceRules[i].rx, replaceRules[i].replace);
      }

      // Final cleanup of spaces around quotes inside classNames
      newContent = newContent.replace(/"\s+/g, '"').replace(/\s+"/g, '"');
      newContent = newContent.replace(/'\s+/g, "'").replace(/\s+'/g, "'");
      newContent = newContent.replace(/`\s+/g, "`").replace(/\s+`/g, "`");

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDir(srcDir);
console.log('Done!');
