import React, { useState } from 'react';
import { TopNav } from '../../components/layout/TopNav';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Trash2, FileText, Calendar, ShieldCheck, Search, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFReportTemplate } from '../../components/dashboard/PDFReportTemplate';
import { generatePDFReport } from '../../utils/pdfGenerator';

export const MyReportsPage: React.FC = () => {
  const { savedReports, deleteReport } = useAuth();
  const { addToast } = useToast();
  const [activePdfReport, setActivePdfReport] = useState<any>(null);

  const handleDelete = (id: string) => {
    deleteReport(id);
    addToast('Report deleted successfully', 'success');
  };

  const handleDownloadPDF = async (report: any) => {
    addToast('Generating Clinical PDF Report...', 'info');
    setActivePdfReport(report);
    
    // Give React a tick to render the hidden template
    setTimeout(async () => {
      try {
        await generatePDFReport('pdf-report-container', `Neurolens_Report_${report.id}.pdf`);
        addToast('Report downloaded successfully!', 'success');
      } catch (err: any) {
        addToast(`Failed to generate PDF: ${err.message}`, 'error');
      } finally {
        setActivePdfReport(null);
      }
    }, 150);
  };

  return (
    <div className="flex flex-col min-h-full relative">
      <TopNav />
      
      {/* Hidden PDF Template rendered only when downloading */}
      {activePdfReport && <PDFReportTemplate report={activePdfReport} />}
      
      <div className="px-6 max-w-6xl mx-auto w-full pb-12">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" /> My Diagnostic Reports
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              View and manage your past vision diagnostic tests.
            </p>
          </div>
        </div>

        {savedReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Reports Found</h3>
            <p className="text-slate-500 max-w-sm">You haven't taken any diagnostic tests yet. When you do, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {savedReports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow relative"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(report.date).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'long', day: 'numeric', 
                          hour: '2-digit', minute: '2-digit' 
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleDownloadPDF(report)}
                          className="text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 p-2 rounded-full transition-colors flex items-center gap-1 text-xs font-bold"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(report.id)}
                          className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-full transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-2xl font-extrabold text-emerald-600 mb-2">{report.profile}</h3>
                    
                    <div className="flex gap-2 mb-6">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${report.severity === 'None' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>
                        Severity: {report.severity || 'Unknown'}
                      </span>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                        Accuracy: {report.accuracy !== undefined ? report.accuracy : 100}%
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Action Plan
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
