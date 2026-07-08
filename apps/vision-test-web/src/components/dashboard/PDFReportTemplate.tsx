import React from 'react';
import { ShieldCheck, Calendar, Activity, AlertCircle } from 'lucide-react';
import { calculateColorMatrix } from '../../utils/visionCore';

interface PDFReportTemplateProps {
  report: any;
}

export const PDFReportTemplate: React.FC<PDFReportTemplateProps> = ({ report }) => {
  if (!report) return null;

  let matrixLines = ["1,0,0,0,0 0,1,0,0,0 0,0,1,0,0 0,0,0,1,0"];
  try {
    const matrix = calculateColorMatrix(report.rawProfile || report);
    matrixLines = matrix.split(',  ').map(line => line.trim());
  } catch(e) {
    console.error("PDF matrix error:", e);
  }

  return (
    <div className="fixed top-0 pointer-events-none w-[210mm]" style={{ left: '-9999px', opacity: 1 }}>
      {/* A4 Size Container */}
      <div 
        id="pdf-report-container" 
        className="bg-white p-10 flex flex-col"
        style={{ width: '210mm', minHeight: '297mm', color: '#1e293b' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-8">
          <div>
            <div className="text-3xl font-extrabold text-blue-600 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-8 h-8" />
              Neurolens AI
            </div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
              Clinical Vision Report
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-800">Generated On</div>
            <div className="text-slate-500 text-sm flex items-center gap-1 justify-end mt-1">
              <Calendar className="w-4 h-4" />
              {new Date(report.date).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              })}
            </div>
          </div>
        </div>

        {/* Patient / Profile Info */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Patient Profile</div>
            <div className="text-xl font-bold text-slate-800">Guest User</div>
            <div className="text-sm font-medium text-slate-500 mt-1">ID: NL-{report.id?.substring(0, 8) || 'N/A'}</div>
          </div>
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
            <div className="text-xs font-bold text-blue-600/70 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Activity className="w-4 h-4" /> Primary Diagnosis
            </div>
            <div className="text-xl font-bold text-blue-800">{report.profile}</div>
            <div className="flex gap-3 mt-2">
              <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-700 shadow-sm">
                Severity: {report.severity}
              </span>
              <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-700 shadow-sm">
                Accuracy: {report.accuracy !== undefined ? report.accuracy : 100}%
              </span>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">AI Vision Analysis</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            {report.description}
          </p>
        </div>

        {/* Technical Specs: Daltonization Matrix */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Calculated Daltonization Matrix</h3>
          <div className="bg-slate-900 rounded-2xl p-6 text-blue-400 font-mono text-sm shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full pointer-events-none"></div>
            <div className="mb-2 text-slate-400 text-xs">// SVG feColorMatrix Values</div>
            {matrixLines.map((line, idx) => (
              <div key={idx} className="mb-1">{line}</div>
            ))}
          </div>
        </div>

        {/* Details & Recommendation */}
        {report.rawProfile?.perception_scores && (
          <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Perception Scores</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(report.rawProfile.perception_scores).map(([color, score]: any) => (
                <div key={color} className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                  <div className="capitalize text-slate-500 font-bold text-xs mb-1">{color}</div>
                  <div className="text-2xl font-extrabold text-slate-800">{score}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-600 text-sm font-bold mb-2">
            <AlertCircle className="w-4 h-4" /> Confidential Medical Report
          </div>
          <p className="text-slate-400 text-xs font-medium">
            This report was dynamically generated by Neurolens AI. Do not share unless authorized. <br/>
            &copy; {new Date().getFullYear()} Neurolens Diagnostics.
          </p>
        </div>
      </div>
    </div>
  );
};
