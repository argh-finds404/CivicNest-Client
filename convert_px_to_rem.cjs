const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'src', 'components', 'Home', 'Home.css'),
  path.join(__dirname, 'src', 'components', 'RecentActivities', 'RecentActivities.css')
];

console.log('Starting px to rem conversion...');

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.warn(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Match any pixel value (e.g. 14px, -2px, 8.5px) that is NOT part of a media query min-width or max-width
  // We use lookbehind to avoid matches like min-width: 768px or max-width: 1024px
  content = content.replace(/(?<!min-width:\s{0,6}|max-width:\s{0,6})\b(-?\d+(?:\.\d+)?)px\b/g, (match, p1) => {
    const val = parseFloat(p1);
    
    // Skip 1px/2px borders/lines to ensure crisp rendering at any zoom
    if (Math.abs(val) < 3) {
      return match;
    }
    
    // Assume base font size of 16px (1rem = 16px) for conversion math
    const remVal = val / 16;
    
    // Format to a maximum of 4 decimal places for precision
    const formatted = parseFloat(remVal.toFixed(4));
    return `${formatted}rem`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Successfully converted: ${path.relative(__dirname, file)}`);
  } else {
    console.log(`No changes needed for: ${path.relative(__dirname, file)}`);
  }
});

console.log('Conversion complete!');
