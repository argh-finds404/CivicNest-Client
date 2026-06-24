const fs = require('fs');
const path = require('path');

const targetFiles = [
  'Animals/AnimalsBrowse.jsx',
  'Animals/AnimalDetails.jsx',
  'Animals/AddAnimal.jsx',
  'Animals/MyAnimals.jsx',
  'Animals/FeedingDrives.jsx',
  'LostFound/LostFoundBrowse.jsx',
  'LostFound/LostFoundDetails.jsx',
  'LostFound/AddLostFound.jsx',
  'LostFound/MyLostFound.jsx'
];

const basePath = path.join(__dirname, 'src', 'components');

for (const rel of targetFiles) {
  const fullPath = path.join(basePath, rel);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // The user requested #0a1410 instead of #0b1215 for the page background in these sections.
    // Replace all dark:bg-[#0b1215] with dark:bg-[#0a1410]
    content = content.replace(/dark:bg-\[#0b1215\]/g, 'dark:bg-[#0a1410]');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated: ${fullPath}`);
  }
}
console.log('Done fixing green tints!');
