import React from 'react';
import { TopNav } from '../../components/layout/TopNav';
import { ImpactDashboard } from '../../components/ImpactDashboard';
import { TestInterface } from '../../components/TestInterface';

export const OverviewPage: React.FC = () => {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <TopNav />

      {/* Header Greeting */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
          Good morning, purugoyal20
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Stay on top of your accessibility metrics, monitor live extension sync, and track status.
        </p>
      </div>

      {/* The telemetry dashboard */}
      <ImpactDashboard />

      {/* Quick Diagnostic Test */}
      <div className="mb-10 pb-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Quick Diagnostic</h2>
          <p className="text-slate-500 text-sm">Run a live accessibility check on any URL.</p>
        </div>
        <TestInterface />
      </div>
    </div>
  );
};
