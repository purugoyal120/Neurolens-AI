
import { VisionTestProvider } from './context/VisionTestContext';
import { TestInterface } from './components/TestInterface';
import { ImpactDashboard } from './components/ImpactDashboard';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col items-center p-4 selection:bg-blue-500/30">
      <div className="flex-1 w-full flex items-center justify-center py-12">
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
