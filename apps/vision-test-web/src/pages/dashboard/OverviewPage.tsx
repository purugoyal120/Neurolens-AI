import React from 'react';
import { TopNav } from '../../components/layout/TopNav';
import { ImpactDashboard } from '../../components/ImpactDashboard';
import { DoctorDashboard } from '../../components/dashboard/DoctorDashboard';
import { useAuth } from '../../context/AuthContext';

export const OverviewPage: React.FC = () => {
  const { user, role } = useAuth();
  const userName = user?.name || 'User';

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <TopNav />

      {/* Header Greeting */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
          Good morning, {userName}
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          {role === 'doctor' 
            ? 'Monitor your patients, review diagnostic reports, and track clinic metrics.'
            : 'Stay on top of your accessibility metrics, monitor live extension sync, and track status.'}
        </p>
      </div>

      {/* The telemetry dashboard or doctor dashboard */}
      {role === 'doctor' ? <DoctorDashboard /> : <ImpactDashboard />}

    </div>
  );
};
