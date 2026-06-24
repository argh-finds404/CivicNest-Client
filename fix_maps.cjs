const fs = require('fs');
const path = require('path');

const targetFiles = [
  'Map/CommunityMap.jsx',
  'Issues/EditIssue.jsx',
  'Issues/AddIssue.jsx',
  'CleanupEvents/OrganizeEventForm.jsx',
  'CleanupEvents/CleanupEventDetails.jsx',
  'Animals/AnimalsBrowse.jsx'
];

const basePath = path.join(__dirname, 'src', 'components');

const mapRegex = /url=["']https:\/\/{s}\.(basemaps\.cartocdn\.com\/rastertiles\/voyager|tile\.openstreetmap\.org)\/\{z\}\/\{x\}\/\{y\}(?:\{r\})?\.png["']/g;
const mapReplacement = 'url={isDark ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}';

for (const rel of targetFiles) {
  const fullPath = path.join(basePath, rel);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if useTheme is imported, if not add it
    if (!content.includes('useTheme')) {
        content = content.replace(/(import.*react.*;)/i, "$1\nimport { useTheme } from '../../hooks/useTheme';");
    }
    
    // Inject `const { isDark } = useTheme();` into the main component function if not exists
    if (!content.includes('const { isDark } = useTheme();') && !content.includes('isDark:')) {
        // We will just do a generic replace after the first `{` inside the component
        // This is a bit risky but we can rely on standard formatting
        const match = content.match(/const [A-Za-z0-9]+ = \([^\)]*\) => \{/);
        if (match) {
            content = content.replace(match[0], `${match[0]}\n  const { isDark } = useTheme();`);
        } else {
          const match2 = content.match(/export default function [A-Za-z0-9]+\([^\)]*\) \{/);
          if (match2) {
            content = content.replace(match2[0], `${match2[0]}\n  const { isDark } = useTheme();`);
          }
        }
    }
    
    content = content.replace(mapRegex, mapReplacement);
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated map in: ${fullPath}`);
  }
}
console.log('Done fixing maps!');
