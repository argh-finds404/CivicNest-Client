const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'components');

const replaceRules = [
  // 1. Brighten text contrast in dark mode
  { rx: /dark:text-\[#8da4b0\]/g, replace: 'dark:text-slate-300' },
  { rx: /dark:text-\[#e2e8f0\]/g, replace: 'dark:text-white' },

  // 2. Compact Fonts
  { rx: /\btext-lg\b/g, replace: 'text-base' },
  { rx: /\btext-base\b/g, replace: 'text-sm' },

  // 3. Compact Spacing
  { rx: /\bp-6\b/g, replace: 'p-4' },
  { rx: /\bp-8\b/g, replace: 'p-5' },
  { rx: /\bpy-16\b/g, replace: 'py-10' },
  { rx: /\bpy-20\b/g, replace: 'py-12' },
  { rx: /\bgap-6\b/g, replace: 'gap-4' },
  { rx: /\bgap-8\b/g, replace: 'gap-5' },

  // 4. Ensure headings have tight tracking
  // We'll target font-black, font-extrabold, font-bold combined with text-xl, 2xl, 3xl, etc.
  // Actually, we can just look for text-2xl/3xl/4xl without tracking-tight and add it.
  // A safer approach is to replace tracking-normal or tracking-wide with tracking-tight
  { rx: /\btracking-normal\b/g, replace: 'tracking-tight' },
  { rx: /\btracking-wide\b/g, replace: 'tracking-tight' }
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

      for (const rule of replaceRules) {
        content = content.replace(rule.rx, rule.replace);
      }

      // Special rule: if it's an <h1>, <h2>, <h3> tag, ensure tracking-tight is present
      // We will use a regex to inject tracking-tight if not present
      content = content.replace(/<(h[1-3])\s+className="([^"]+)"/g, (match, tag, classes) => {
        if (!classes.includes('tracking-')) {
          return `<${tag} className="${classes} tracking-tight"`;
        }
        return match;
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        modifiedFilesCount++;
        console.log(`Modified: ${fullPath.replace(__dirname, '')}`);
      }
    }
  }
}

console.log('Starting typography and spacing fix...');
processDirectory(targetDir);
console.log(`\nCompleted! Modified ${modifiedFilesCount} files.`);
