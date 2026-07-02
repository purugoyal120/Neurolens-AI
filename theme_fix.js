const fs = require('fs');
const path = require('path');

const directoryPath = 'c:\\Users\\Puru Goyal\\Downloads\\neurolens-ai (3)\\neurolens-ai\\apps\\vision-test-web\\src\\components';
const filesToProcess = ['QuestionCard.tsx', 'ResultScreen.tsx', 'ProgressBar.tsx'];

const replacements = {
  '#8a4cfc': '#10b981', // emerald-500
  'glass-panel': 'dashboard-card',
  'text-gradient-primary': 'text-slate-900',
  'premium-btn-primary': '',
  '#eaddff': '#d1fae5', // emerald-100
  '#25005a': '#064e3b', // emerald-900
  '#fcf8ff': '#ffffff', // white (was slate-50, white is cleaner for cards)
  '#ccc3d8': '#e2e8f0', // slate-200
  '#1b1b22': '#0f172a', // slate-900
  '#4a4455': '#64748b', // slate-500
  '#702be2': '#047857', // emerald-700
  '#7b7487': '#94a3b8', // slate-400
  '#f6f2fc': '#f8fafc'  // slate-50
};

filesToProcess.forEach(file => {
  const filePath = path.join(directoryPath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [key, value] of Object.entries(replacements)) {
      content = content.split(key).join(value);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
