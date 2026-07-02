import React from 'react';
import { VisionTestProvider } from '../../context/VisionTestContext';
import { TestInterface } from '../../components/TestInterface';

export const DiagnosticTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center p-4 md:p-6 font-sans py-12">
      <VisionTestProvider>
        <TestInterface />
      </VisionTestProvider>
    </div>
  );
};

