const fs = require('fs');
const path = require('path');

const base = 'c:\\Users\\Puru Goyal\\Downloads\\neurolens-ai (3)\\neurolens-ai\\apps\\vision-test-web\\src';

// 1. Fix AuthContext
let authPath = path.join(base, 'context', 'AuthContext.tsx');
let authContent = fs.readFileSync(authPath, 'utf8');
authContent = authContent.replace(
  'addGlobalProfile: (profile: any) => void;',
  'addGlobalProfile: (profile: any) => void;\n  login: (email: string, name?: string) => void;'
);
authContent = authContent.replace(
  "addGlobalProfile: () => {}",
  "addGlobalProfile: () => {},\n  login: () => {}"
);
fs.writeFileSync(authPath, authContent);

// 2. Fix ThemeContext
let themePath = path.join(base, 'context', 'ThemeContext.tsx');
let themeContent = fs.readFileSync(themePath, 'utf8');
themeContent = themeContent.replace(
  "import React, { createContext, useContext, useState, ReactNode } from 'react';",
  "import React, { createContext, useContext, useState } from 'react';\nimport type { ReactNode } from 'react';"
);
fs.writeFileSync(themePath, themeContent);

// 3. Fix ToastContext
let toastPath = path.join(base, 'context', 'ToastContext.tsx');
let toastContent = fs.readFileSync(toastPath, 'utf8');
toastContent = toastContent.replace(
  "import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';",
  "import React, { createContext, useContext, useState, useCallback } from 'react';\nimport type { ReactNode } from 'react';"
);
fs.writeFileSync(toastPath, toastContent);

// 4. Fix LandingPage imports
let landingPath = path.join(base, 'pages', 'LandingPage.tsx');
let landingContent = fs.readFileSync(landingPath, 'utf8');
landingContent = landingContent.replace(/\.\.\/\.\.\/components\/landing\//g, '../components/landing/');
fs.writeFileSync(landingPath, landingContent);

// 5. Fix AIAssistant unused User
let aiPath = path.join(base, 'components', 'AIAssistant.tsx');
let aiContent = fs.readFileSync(aiPath, 'utf8');
aiContent = aiContent.replace('MessageSquare, Send, X, Bot, User, Sparkles', 'MessageSquare, Send, X, Bot, Sparkles');
fs.writeFileSync(aiPath, aiContent);

// 6. Fix CommandPalette unused Command
let cmdPath = path.join(base, 'components', 'CommandPalette.tsx');
let cmdContent = fs.readFileSync(cmdPath, 'utf8');
cmdContent = cmdContent.replace('Search, Eye, Settings, FileText, Users, Command, Monitor', 'Search, Eye, Settings, FileText, Users, Monitor');
fs.writeFileSync(cmdPath, cmdContent);

// 7. Fix ImpactDashboard unused useEffect and setStats
let impactPath = path.join(base, 'components', 'ImpactDashboard.tsx');
let impactContent = fs.readFileSync(impactPath, 'utf8');
impactContent = impactContent.replace("import React, { useState, useEffect } from 'react';", "import React, { useState } from 'react';");
impactContent = impactContent.replace("const [stats, setStats] = useState({", "const [stats] = useState({");
fs.writeFileSync(impactPath, impactContent);

console.log('Fixed TS errors.');
