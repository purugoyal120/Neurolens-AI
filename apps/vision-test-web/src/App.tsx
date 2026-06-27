import { VisionTestProvider } from './context/VisionTestContext';
import { TestInterface } from './components/TestInterface';
import { ImpactDashboard } from './components/ImpactDashboard';

function App() {
  return (
    <div className="min-h-screen bg-[#f3eff9] text-[#1b1b22] font-['Plus_Jakarta_Sans'] flex flex-col items-center p-4 md:p-8 selection:bg-[#8a4cfc]/20 selection:text-[#702be2]">
      <div className="flex-1 w-full max-w-[1280px] flex items-center justify-center py-12">
        <VisionTestProvider>
          <TestInterface />
        </VisionTestProvider>
      </div>
      
      {/* Hackathon "Wow" Feature */}
      <ImpactDashboard />
    </div>
  );
}

export default App;
