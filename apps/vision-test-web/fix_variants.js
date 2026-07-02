const fs = require('fs');
const path = require('path');

const base = 'c:\\Users\\Puru Goyal\\Downloads\\neurolens-ai (3)\\neurolens-ai\\apps\\vision-test-web\\src';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix imports
  if (content.includes("import { motion } from 'framer-motion';")) {
    content = content.replace("import { motion } from 'framer-motion';", "import { motion, Variants } from 'framer-motion';");
  } else if (!content.includes("Variants } from 'framer-motion'")) {
    content = content.replace("import { motion } from 'framer-motion';", "import { motion, Variants } from 'framer-motion';");
  }
  
  // Fix variables
  content = content.replace("const containerVariants = {", "const containerVariants: Variants = {");
  content = content.replace("const itemVariants = {", "const itemVariants: Variants = {");
  
  fs.writeFileSync(filePath, content);
}

fixFile(path.join(base, 'components', 'ImpactDashboard.tsx'));
fixFile(path.join(base, 'pages', 'dashboard', 'SettingsPage.tsx'));

console.log('Fixed variants.');
