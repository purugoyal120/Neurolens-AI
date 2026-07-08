import React from 'react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">


      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
          <span className="text-white font-extrabold text-3xl">N</span>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Neurolens AI
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Personalized accessibility for the modern web.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
};
