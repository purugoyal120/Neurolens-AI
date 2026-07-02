import React from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Globe, Activity, ShieldCheck, Clock } from 'lucide-react';

const historyData = [
  {
    id: 1,
    type: 'excel',
    action: 'Document Processed',
    details: 'Q3_Financials.xlsx - Applied Deuteranopia Color Shift',
    timestamp: 'Just now',
    user: 'admin_puru',
    status: 'Safe'
  },
  {
    id: 2,
    type: 'extension',
    action: 'Web Transformation',
    details: 'salesforce.com - Live DOM color mutation active',
    timestamp: '5 mins ago',
    user: 'sales_team_1',
    status: 'Active'
  },
  {
    id: 3,
    type: 'system',
    action: 'Profile Synced',
    details: 'New Vision Profile synced to Core Backend',
    timestamp: '12 mins ago',
    user: 'admin_puru',
    status: 'Completed'
  },
  {
    id: 4,
    type: 'excel',
    action: 'Document Processed',
    details: 'Employee_Roster_2026.csv - High Contrast Mode',
    timestamp: '1 hour ago',
    user: 'hr_dept',
    status: 'Safe'
  }
];

const getIcon = (type: string) => {
  switch (type) {
    case 'excel': return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    case 'extension': return <Globe className="w-5 h-5 text-blue-500" />;
    case 'system': return <Activity className="w-5 h-5 text-purple-500" />;
    default: return <Clock className="w-5 h-5 text-slate-500" />;
  }
};

const getIconBg = (type: string) => {
  switch (type) {
    case 'excel': return 'bg-emerald-500/10 border-emerald-500/20';
    case 'extension': return 'bg-blue-500/10 border-blue-500/20';
    case 'system': return 'bg-purple-500/10 border-purple-500/20';
    default: return 'bg-slate-500/10 border-slate-500/20';
  }
};

export const HistoryPage: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-8 relative">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-400/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-10"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
            Admin Audit Log <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </h1>
          <p className="text-slate-500 font-medium">Real-time tracking of document processing and system events to ensure data safety.</p>
        </div>
        
        <button className="premium-btn px-6 py-3 text-sm flex items-center gap-2">
          Export Security Log
        </button>
      </motion.div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="p-6 border-b border-slate-200/50 bg-white/40">
          <h3 className="font-bold text-slate-800">Recent Activity</h3>
        </div>
        
        <div className="p-2">
          {historyData.map((item, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={item.id}
              className="flex items-center gap-6 p-4 hover:bg-white/60 rounded-2xl transition-colors border border-transparent hover:border-slate-100"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getIconBg(item.type)}`}>
                {getIcon(item.type)}
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-lg">{item.action}</h4>
                <p className="text-slate-500 text-sm font-medium">{item.details}</p>
              </div>
              
              <div className="hidden md:flex flex-col items-end px-6 border-r border-slate-200">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">User</span>
                <span className="text-sm font-bold text-slate-700">{item.user}</span>
              </div>
              
              <div className="flex flex-col items-end w-32">
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-1 border border-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {item.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">{item.timestamp}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
