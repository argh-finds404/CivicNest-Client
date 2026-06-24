const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'components');

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

      // We want to find any div with min-h-screen and strip out any bg- classes from it
      // Since parsing JSX properly is hard with regex, we can match min-h-screen and a bg class
      // A safer way is to just find `className="... min-h-screen ..."`
      // and remove `bg-[#F8FAFC]`, `bg-[#f0fdf4]`, `bg-slate-50`, `dark:bg-[#0b1215]`, `dark:bg-[#0b1215]/50`, `dark:bg-slate-900`, `bg-[#ecf7f4]`
      
      const backgroundsToRemove = [
        'bg-[#F8FAFC]',
        'bg-[#f0fdf4]',
        'bg-slate-50',
        'bg-gray-50',
        'bg-[#ecf7f4]',
        'dark:bg-[#0b1215]',
        'dark:bg-[#0b1215]/50',
        'dark:bg-slate-900',
        'bg-background'
      ];

      // We only want to remove them if the line contains 'min-h-screen' to ensure we only target page wrappers
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('min-h-screen')) {
          backgroundsToRemove.forEach(bg => {
            // Regex to match the exact class word
            const regex = new RegExp(`\\b${bg.replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\//g, '\\/')}\\b`, 'g');
            lines[i] = lines[i].replace(regex, '');
          });
        }
      }
      content = lines.join('\n');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        modifiedFilesCount++;
        console.log(`Modified: ${fullPath.replace(__dirname, '')}`);
      }
    }
  }
}

console.log('Starting background cleanup...');
processDirectory(targetDir);
console.log(`\nCompleted! Modified ${modifiedFilesCount} files.`);
