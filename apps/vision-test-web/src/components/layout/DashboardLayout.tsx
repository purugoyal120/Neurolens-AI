import React from 'react';
import { Sidebar } from './Sidebar';
import { AIAssistant } from '../AIAssistant';
import { CommandPalette } from '../CommandPalette';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isCaregiverMode, activeProfile } = useAuth();
  
  // If we are in Self Mode (Operator is color-blind), we apply the Daltonization filter to the entire dashboard!
  const shouldApplyFilter = !isCaregiverMode && activeProfile === 'Deuteranopia Mode';

  return (
    <div 
      className="flex h-screen bg-[#f4f6f8] overflow-hidden font-sans transition-all duration-500"
      style={shouldApplyFilter ? { filter: 'url(#global-fix-deuteranopia)' } : {}}
    >
      {/* Global SVG Filters for Accessibility Context */}
      <svg className="hidden">
        <defs>
          <filter id="global-fix-deuteranopia">
            <feColorMatrix type="matrix" values="1, 0, 0, 0, 0, 0, 1, 0.5, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0"/>
          </filter>
        </defs>
      </svg>

      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto px-10 pb-10">
          <div className="max-w-[1600px] mx-auto h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
      <AIAssistant />
      <CommandPalette />
    </div>
  );
};
