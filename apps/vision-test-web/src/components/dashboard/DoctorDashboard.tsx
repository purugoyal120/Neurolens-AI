import React from 'react';
import { Users, Activity, FileText, Download } from 'lucide-react';
import { generatePDFReport } from '../../utils/pdfGenerator';

export const DoctorDashboard: React.FC = () => {
  // useAuth removed as it was unused
  
  // Dummy patients data for the prototype
  const patients = [
    { id: '1', name: 'John Doe', condition: 'Protanopia', lastTest: '2023-10-25', status: 'Requires Review' },
    { id: '2', name: 'Jane Smith', condition: 'Deuteranopia', lastTest: '2023-10-22', status: 'Stable' },
    { id: '3', name: 'Alex Johnson', condition: 'Tritanopia', lastTest: '2023-10-20', status: 'Stable' },
  ];

  const handleDownloadReport = () => {
    generatePDFReport('doctor-dashboard-report', 'Clinic_Patients_Report.pdf');
  };

  return (
    <div id="doctor-dashboard-report" className="space-y-6 bg-slate-50 p-6 rounded-2xl">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Patients</p>
              <h3 className="text-3xl font-bold text-slate-800">124</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Tests This Week</p>
              <h3 className="text-3xl font-bold text-slate-800">38</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Reports Generated</p>
              <h3 className="text-3xl font-bold text-slate-800">215</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800">Recent Patient Reports</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={handleDownloadReport}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <FileText className="w-4 h-4" /> Export Report
            </button>
            <button className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto text-center">
              Invite Patient
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Patient Name</th>
                <th className="px-6 py-4 font-semibold">Diagnosed Condition</th>
                <th className="px-6 py-4 font-semibold">Last Test Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{patient.name}</div>
                    <div className="text-sm text-slate-500">ID: PT-{patient.id.padStart(4, '0')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {patient.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {patient.lastTest}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      patient.status === 'Stable' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
